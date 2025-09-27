import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, Plus, UserPlus } from "lucide-react";
import { useAccessControl } from "../../hooks/useAccessControl";

const teamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
});

const memberSchema = z.object({
  userId: z.string().min(1, "User is required"),
  role: z.string().min(1, "Role is required"),
});

type TeamFormData = z.infer<typeof teamSchema>;
type MemberFormData = z.infer<typeof memberSchema>;

export default function TeamManagement() {
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("teams");
  const { canCreateTeams } = useAccessControl();

  const teamForm = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const memberForm = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      userId: "",
      role: "member",
    },
  });

  function onTeamSubmit(data: TeamFormData) {
    console.log(data);
  }

  function onMemberSubmit(data: MemberFormData) {
    console.log(data);
  }

  function openAddMemberDialog(team: any) {
    setSelectedTeam(team);
    setIsAddingMember(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">Manage your teams</p>
        </div>
        {canCreateTeams && (
          <Button onClick={() => setIsCreatingTeam(true)}>
            <Plus size={16} className="mr-2" />
            Create Team
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="members" disabled={!selectedTeam}>
            Members
          </TabsTrigger>
          <TabsTrigger value="social-accounts" disabled={!selectedTeam}>
            Social Accounts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4">
          <p className="text-muted-foreground">Coming soon...</p>
        </TabsContent>

        <TabsContent value="members">
          {selectedTeam && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{selectedTeam.name}</CardTitle>
                      <CardDescription>Team Members</CardDescription>
                    </div>
                    {canCreateTeams && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAddMemberDialog(selectedTeam)}
                      >
                        <UserPlus size={16} className="mr-2" />
                        Add Member
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Coming soon...</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="social-accounts">
          {selectedTeam && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{selectedTeam.name}</CardTitle>
                      <CardDescription>
                        Assigned Social Accounts
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Coming soon...</p>
                </CardContent>
              </Card>

              {/* Available Social Accounts to Assign */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Social Accounts</CardTitle>
                  <CardDescription>
                    Click to assign these accounts to the team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </CardContent>
              </Card>

              {/* No available accounts message */}
              <Alert>
                <AlertDescription>
                  No social accounts available in this organization. Connect
                  social accounts first to assign them to teams.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Team Dialog */}
      <Dialog open={isCreatingTeam} onOpenChange={setIsCreatingTeam}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>
              Create a new team to collaborate on social media content
            </DialogDescription>
          </DialogHeader>

          <Form {...teamForm}>
            <form
              onSubmit={teamForm.handleSubmit(onTeamSubmit)}
              className="space-y-4"
            >
              <FormField
                control={teamForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Marketing Team" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={teamForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Team's purpose and goals"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsCreatingTeam(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Create Team
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a user to the "{selectedTeam?.name}" team
            </DialogDescription>
          </DialogHeader>

          <Form {...memberForm}>
            <form
              onSubmit={memberForm.handleSubmit(onMemberSubmit)}
              className="space-y-4"
            >
              <FormField
                control={memberForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none" disabled>
                          Coming soon...
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={memberForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Defines what permissions the user will have in this team
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Add Member
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Team Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "Team"? This action cannot be
              undone. All team members will be removed from the team.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Delete Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
