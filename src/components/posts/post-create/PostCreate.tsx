import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "../../../hooks/use-toast";
import { useAuth } from "../../../store/hooks";
import { cn } from "../../../lib/utils";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Input } from "../../ui/input";
import { Loader2, Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import socialApi from "../../../api/socialApi";
import {
  AccountSelection,
  getCollectionDisplay,
  InstagramMediaDropzone,
  MediaLinksInput,
  PostStatusControls,
  // UploadedMedia,
} from "./PostViews";
import Preview from "./Preview";
import { UploadedMedia } from "../../../types/media";

const postSchema = z.object({
  content: z.string().min(1, "Content is required"),
  media: z.array(z.string()).optional(),
  scheduleTime: z.date().optional(),
  status: z.enum(["scheduled", "published"]),
  collectionId: z.string().optional(),
  selectedAccount: z.string().min(1, "Select an account"),
  platform: z.string().min(1, "Select a platform"),
});

type PostFormData = z.infer<typeof postSchema>;

export default function PostCreate() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [mediaLinks, setMediaLinks] = useState<string[]>([]);
  const [newMediaLink, setNewMediaLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);

  // Get social accounts
  const { data: socialAccounts = [], isLoading: isFetchingAccounts } = useQuery(
    {
      queryKey: [`/social-accounts/${user?._id}`],
    }
  ) as { data: any[]; isLoading: boolean };

  // Get collections
  const {
    data: collections = { count: 0, data: [] },
    isLoading: isFetchingCollections,
  } = useQuery({
    queryKey: ["/collections"],
  }) as { data: { count: number; data: any[] } } & { isLoading: boolean };

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      media: [],
      status: "published",
      selectedAccount: "",
      platform: "",
    },
  });

  function addMediaLink() {
    if (newMediaLink && !mediaLinks.includes(newMediaLink)) {
      setMediaLinks([...mediaLinks, newMediaLink]);
      form.setValue("media", [...mediaLinks, newMediaLink]);
      setNewMediaLink("");
    }
  }

  function removeMediaLink(link: string) {
    const updatedLinks = mediaLinks.filter((item) => item !== link);
    setMediaLinks(updatedLinks);
    form.setValue("media", updatedLinks);
  }

  async function onSubmit(data: PostFormData) {
    const selectedAccount = socialAccounts.find(
      (acc: any) => acc._id === data.selectedAccount
    );

    if (!selectedAccount) {
      toast({
        title: "Error",
        description: "Selected account not found",
        variant: "destructive",
      });
    }

    if (data.status === "scheduled") {
      if (!data.scheduleTime) {
        toast({
          title: "Error",
          description: "Please select a schedule time",
          variant: "destructive",
        });
        return;
      }
      setLoading(true);
      const scheduledPost = {
        content: data.content,
        platforms: [
          {
            platform: selectedAccount.platform,
            platformId: selectedAccount.platformId,
            accountId: selectedAccount.accountId,
            accountName: selectedAccount.accountName,
            accountType: selectedAccount.accountType,
          },
        ],
        scheduledFor: data.scheduleTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        mediaType: "TEXT",
      };

      await socialApi.schedulePost(scheduledPost as any);
      toast({ title: "Success", description: "Post scheduled successfully!" });
    } else {
      const postData = {
        content: data.content,
        accountId: selectedAccount.accountId,
        media: mediaLinks,
        accountName: selectedAccount.accountName,
        accountType: selectedAccount.accountType,
        platform: selectedAccount.platform,
        platformId: selectedAccount.platformId,
      };
      setLoading(true);

      try {
        switch (selectedAccount.platform) {
          case "threads":
            await socialApi.postToThreads(selectedAccount._id, postData);
            toast({
              title: "Success",
              description: "Posted successfully to Threads!",
            });
            break;
          case "linkedin":
            await socialApi.postToLinkedIn(
              selectedAccount._id,
              postData.content
            );
            toast({
              title: "Success",
              description: "Posted successfully to LinkedIn!",
            });
            break;
          case "twitter":
            await socialApi.postToTwitter(selectedAccount._id, postData);
            toast({
              title: "Success",
              description: "Posted successfully to Twitter!",
            });
            break;
          case "instagram": {
            const igPostData = {
              caption: postData.content,
              media: uploadedMedia,
            };
            await socialApi.postToInstagram(selectedAccount._id, igPostData);
            toast({
              title: "Success",
              description: "Posted successfully to Instagram!",
            });
            break;
          }
          default:
            toast({
              title: "Error",
              description: `Posting to ${selectedAccount.platform} not supported`,
              variant: "destructive",
            });
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to post. Please try again.",
          variant: "destructive",
        });
      } finally {
        form.reset();
        setMediaLinks([]);
        setLoading(false);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    if (form.watch("selectedAccount")) {
      const account = socialAccounts.find(
        (account: any) => account._id === form.watch("selectedAccount")
      );
      if (account) {
        form.setValue("platform", account.platform);
      }
    }
  }, [form.watch("selectedAccount")]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Create New Post</h2>
          <p className="text-muted-foreground">
            Compose and schedule your content across multiple platforms
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="compose" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-6 pt-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What's on your mind?"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <MediaLinksInput
                mediaLinks={mediaLinks}
                newMediaLink={newMediaLink}
                setNewMediaLink={setNewMediaLink}
                addMediaLink={addMediaLink}
                removeMediaLink={removeMediaLink}
              />

              <InstagramMediaDropzone
                uploadedMedia={uploadedMedia}
                setUploadedMedia={setUploadedMedia}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="selectedAccount"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Select Accounts</FormLabel>
                        <div className="space-y-2">
                          <AccountSelection
                            socialAccounts={socialAccounts}
                            field={field}
                            isFetching={isFetchingAccounts}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <PostStatusControls field={field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="collectionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Collection (Optional)</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a collection" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getCollectionDisplay(
                              isFetchingCollections,
                              collections
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("status") === "scheduled" && (
                    <FormField
                      control={form.control}
                      name="scheduleTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Schedule Time (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP HH:mm")
                                  ) : (
                                    <span>Pick a date and time</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  if (date) {
                                    // Keep the time if already set, otherwise use current time
                                    const scheduleTime =
                                      field.value || new Date();
                                    scheduleTime.setFullYear(
                                      date.getFullYear()
                                    );
                                    scheduleTime.setMonth(date.getMonth());
                                    scheduleTime.setDate(date.getDate());
                                    field.onChange(scheduleTime);
                                  }
                                }}
                              />
                              <div className="p-3 border-t">
                                <div className="flex justify-between">
                                  <Input
                                    type="time"
                                    value={
                                      field.value
                                        ? format(field.value, "HH:mm")
                                        : ""
                                    }
                                    onChange={(e) => {
                                      if (e.target.value && field.value) {
                                        const [hours, minutes] =
                                          e.target.value.split(":");
                                        const newDate = new Date(field.value);
                                        newDate.setHours(parseInt(hours));
                                        newDate.setMinutes(parseInt(minutes));
                                        field.onChange(newDate);
                                      }
                                    }}
                                  />
                                  {field.value && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => field.onChange(undefined)}
                                    >
                                      <X size={16} className="mr-1" />
                                      Clear
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="pt-4">
              <Preview
                form={form}
                mediaLinks={mediaLinks}
                socialAccounts={socialAccounts}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getBtnText(form)}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

const getBtnText = (form: any) => {
  if (form.watch("status") === "scheduled") return "Scheduled Post";
  else return "Publish Now";
};
