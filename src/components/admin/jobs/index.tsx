import * as React from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  type JobHistoryItem,
  type JobsListFilters,
  type JobStatus,
  useJobsList,
} from "../../../hooks/useJobsList";
import { useJobDetail } from "../../../hooks/useJobDetail";
import { useJobStats } from "../../../hooks/useJobStats";
import { useAccessControl } from "../../../hooks/useAccessControl";
import { useToast } from "../../../hooks/use-toast";
import { retryJob, cancelJob, type JobActionResponse } from "../../../api/jobs";
import { formatDate, cn } from "../../../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../ui/sheet";
import { Separator } from "../../ui/separator";
import { ScrollArea } from "../../ui/scroll-area";
import {
  AlertCircle,
  CalendarClock,
  Clock,
  Database,
  History,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_OPTIONS: Array<{ label: string; value: JobStatus }> = [
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "Canceled", value: "canceled" },
];

const STATUS_BADGE_CLASS: Record<JobStatus, string> = {
  pending:
    "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  processing:
    "bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200",
  completed:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
  failed: "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200",
  canceled:
    "bg-slate-200 text-slate-900 dark:bg-slate-500/20 dark:text-slate-200",
};

const STATUS_TO_QUEUE_KEY: Record<JobStatus, string> = {
  pending: "waiting",
  processing: "active",
  failed: "failed",
  completed: "completed",
  canceled: "canceled",
};

const JOB_LIMIT_DEFAULT = 25;

const METRIC_KEYS: Array<{
  key: JobStatus;
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "pending", label: "Pending", icon: <Clock className="h-4 w-4" /> },
  {
    key: "processing",
    label: "Processing",
    icon: <RefreshCw className="h-4 w-4" />,
  },
  {
    key: "failed",
    label: "Failed",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  {
    key: "completed",
    label: "Completed",
    icon: <History className="h-4 w-4" />,
  },
];

const JOB_STATUS_SET = new Set<JobStatus>([
  "pending",
  "processing",
  "completed",
  "failed",
  "canceled",
]);

type DateFilterKey = "from" | "to";

function statusLabel(status: JobStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function safeStatus(value?: string | null): JobStatus | undefined {
  const normalized = String(value ?? "").toLowerCase() as JobStatus;
  return JOB_STATUS_SET.has(normalized) ? normalized : undefined;
}

const defaultFilters: JobsListFilters = {
  limit: JOB_LIMIT_DEFAULT,
};

const DEFAULT_DATE_STATE: Record<DateFilterKey, string> = {
  from: "",
  to: "",
};

const AdminJobsDashboard: React.FC = () => {
  const { canViewJobs, canManageJobs } = useAccessControl();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [filters, setFilters] = React.useState<JobsListFilters>(defaultFilters);
  const [dateInputs, setDateInputs] = React.useState(DEFAULT_DATE_STATE);
  const [cursorStack, setCursorStack] = React.useState<string[]>([]);
  const [selectedJobId, setSelectedJobId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [pendingRetryId, setPendingRetryId] = React.useState<string | null>(
    null
  );
  const [pendingCancelId, setPendingCancelId] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    // Reset pagination whenever filters change (except limit)
    setCursorStack([]);
  }, [
    filters.status,
    filters.queueName,
    filters.platform,
    filters.jobName,
    filters.jobId,
    filters.from,
    filters.to,
  ]);

  const currentCursor =
    cursorStack.length > 0 ? cursorStack[cursorStack.length - 1] : undefined;

  const jobsQuery = useJobsList(filters, currentCursor);
  const statsQuery = useJobStats(canViewJobs);

  const activeJob = React.useMemo(() => {
    if (!selectedJobId) return null;
    return (
      jobsQuery.data?.items.find((item) => item.id === selectedJobId) ?? null
    );
  }, [jobsQuery.data?.items, selectedJobId]);

  const jobDetailQuery = useJobDetail(
    detailOpen ? selectedJobId ?? undefined : undefined
  );

  const invalidateJobs = React.useCallback(
    () =>
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey?.[0];
          return typeof key === "string" && key.startsWith("/admin/jobs");
        },
      }),
    [queryClient]
  );

  const retryMutation = useMutation<JobActionResponse, unknown, string>({
    mutationFn: retryJob,
    onMutate: (jobId) => {
      setPendingRetryId(jobId);
      return jobId;
    },
    onSuccess: async (_data, jobId) => {
      toast({
        title: "Retry scheduled",
        description: "Job has been requeued.",
      });
      await invalidateJobs();
      if (jobId) {
        await queryClient.invalidateQueries({
          queryKey: [`/admin/jobs/${jobId}`],
        });
      }
    },
    onError: (error: any) => {
      const message = error?.message || "Unable to retry job";
      toast({
        title: "Retry failed",
        description: message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setPendingRetryId(null);
    },
  });

  const cancelMutation = useMutation<JobActionResponse, unknown, string>({
    mutationFn: cancelJob,
    onMutate: (jobId) => {
      setPendingCancelId(jobId);
      return jobId;
    },
    onSuccess: async (_data, jobId) => {
      toast({ title: "Job canceled", description: "Job has been removed." });
      await invalidateJobs();
      if (jobId) {
        await queryClient.invalidateQueries({
          queryKey: [`/admin/jobs/${jobId}`],
        });
      }
    },
    onError: (error: any) => {
      const message = error?.message || "Unable to cancel job";
      toast({
        title: "Cancel failed",
        description: message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setPendingCancelId(null);
    },
  });

  const handleStatusChange = React.useCallback((value: string) => {
    if (value === "all") {
      setFilters((prev) => ({
        ...prev,
        status: undefined,
      }));
      return;
    }
    const status = safeStatus(value);
    setFilters((prev) => ({
      ...prev,
      status,
    }));
  }, []);

  const handleInputChange = React.useCallback(
    (key: keyof JobsListFilters) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value.trim();
        setFilters((prev) => ({
          ...prev,
          [key]: raw || undefined,
        }));
      },
    []
  );

  const handleDateChange = React.useCallback(
    (key: DateFilterKey) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      setDateInputs((prev) => ({ ...prev, [key]: rawValue }));

      const iso = rawValue ? new Date(rawValue).toISOString() : undefined;
      setFilters((prev) => ({
        ...prev,
        [key === "from" ? "from" : "to"]: iso,
      }));
    },
    []
  );

  const resetFilters = React.useCallback(() => {
    setFilters({ ...defaultFilters });
    setDateInputs(DEFAULT_DATE_STATE);
    setCursorStack([]);
  }, []);

  const openDetail = React.useCallback((job: JobHistoryItem) => {
    setSelectedJobId(job.id);
    setDetailOpen(true);
  }, []);

  const goToNextPage = React.useCallback(() => {
    const nextCursor = jobsQuery.data?.nextCursor;
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
  }, [jobsQuery.data?.nextCursor]);

  const goToPreviousPage = React.useCallback(() => {
    setCursorStack((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      next.pop();
      return next;
    });
  }, []);

  React.useEffect(() => {
    if (!detailOpen) return;
    if (!selectedJobId) setDetailOpen(false);
  }, [detailOpen, selectedJobId]);

  if (!canViewJobs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job history unavailable</CardTitle>
          <CardDescription>
            Your current organization plan does not include access to the job
            history dashboard.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const rows = jobsQuery.data?.items ?? [];
  const isFirstPage = cursorStack.length === 0;
  const canGoNext = Boolean(jobsQuery.data?.nextCursor);
  const isLoadingPage = jobsQuery.isFetching;

  const detailJob = jobDetailQuery.data ?? activeJob;
  const retryPending = retryMutation.isPending;
  const cancelPending = cancelMutation.isPending;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-background via-background to-background/50 border border-border/50 p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/10" />
        <div className="relative flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <History className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                  Job History
                </h2>
                <p className="text-muted-foreground">
                  Inspect queue runs across scheduled posts, immediate publish,
                  and maintenance tasks.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void invalidateJobs();
              }}
              disabled={jobsQuery.isLoading || jobsQuery.isFetching}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
      </div>

      <StatsOverview loading={statsQuery.isLoading} stats={statsQuery.data} />

      <FiltersBar
        statusValue={filters.status ?? ""}
        queueValue={filters.queueName ?? ""}
        platformValue={filters.platform ?? ""}
        jobNameValue={filters.jobName ?? ""}
        jobIdValue={filters.jobId ?? ""}
        dateInputs={dateInputs}
        onStatusChange={handleStatusChange}
        onQueueChange={handleInputChange("queueName")}
        onPlatformChange={handleInputChange("platform")}
        onJobNameChange={handleInputChange("jobName")}
        onJobIdChange={handleInputChange("jobId")}
        onDateChange={handleDateChange}
        onReset={resetFilters}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>Jobs</CardTitle>
            <CardDescription>
              Showing {rows.length} jobs{canGoNext ? " (more available)" : ""}.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table stickyHeader>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead align="right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && !jobsQuery.isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No jobs found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : null}
              {rows.map((job) => {
                const retryingThisJob =
                  retryPending && pendingRetryId === job.id;
                const cancelingThisJob =
                  cancelPending && pendingCancelId === job.id;

                return (
                  <TableRow
                    key={job.id}
                    className="cursor-pointer"
                    onClick={() => openDetail(job)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {job.jobName || job.queueName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {job.jobId}
                        </span>
                        {job.lastError ? (
                          <span className="mt-1 text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {job.lastError}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "capitalize",
                          STATUS_BADGE_CLASS[job.status]
                        )}
                      >
                        {statusLabel(job.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="font-medium">
                          {job.platform || job.publishMode || "—"}
                        </span>
                        {job.socialAccountId ? (
                          <span className="text-xs text-muted-foreground">
                            Account: {job.socialAccountId}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        {job.scheduledFor ? (
                          <span>{formatDate(job.scheduledFor, "PPP p")}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(job.enqueuedAt, "PPP p")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {job.attemptsMade}
                        {typeof job.attempts === "number"
                          ? ` / ${job.attempts}`
                          : ""}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={
                            !canManageJobs ||
                            !job.operations.canRetry ||
                            retryPending
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            if (!canManageJobs) return;
                            retryMutation.mutate(job.id);
                          }}
                        >
                          {retryingThisJob ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          <span className="sr-only">Retry job</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          disabled={
                            !canManageJobs ||
                            !job.operations.canCancel ||
                            cancelPending
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            if (!canManageJobs) return;
                            cancelMutation.mutate(job.id);
                          }}
                        >
                          {cancelingThisJob ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span className="sr-only">Cancel job</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {jobsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
        <div className="flex items-center justify-between border-t px-6 py-3 text-sm">
          <span className="text-muted-foreground">
            Page{isFirstPage ? " 1" : ` ${cursorStack.length + 1}`}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={isFirstPage || isLoadingPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={!canGoNext || isLoadingPage}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-hidden">
          <SheetHeader>
            <SheetTitle>Job details</SheetTitle>
            <SheetDescription>
              Review the full payload, linked entities, and execution history.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-full pb-10 pr-4">
            {jobDetailQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : detailJob ? (
              <JobDetailView
                job={detailJob}
                canManage={canManageJobs}
                onRetry={() => detailJob && retryMutation.mutate(detailJob.id)}
                onCancel={() =>
                  detailJob && cancelMutation.mutate(detailJob.id)
                }
                retryLoading={retryPending && detailJob?.id === pendingRetryId}
                cancelLoading={
                  cancelPending && detailJob?.id === pendingCancelId
                }
              />
            ) : (
              <p className="text-sm text-muted-foreground py-6">
                Select a job from the table to see its full history.
              </p>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

type StatsOverviewProps = {
  loading: boolean;
  stats?: ReturnType<typeof useJobStats>["data"];
};

const StatsOverview: React.FC<StatsOverviewProps> = ({ loading, stats }) => {
  const statusCounts = stats?.statuses ?? {};
  const queueCounts = stats?.queue ?? {};

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {METRIC_KEYS.map(({ key, label, icon }) => {
        const value = statusCounts[key] ?? 0;
        const queueKey = STATUS_TO_QUEUE_KEY[key];
        const queueValue = queueCounts[queueKey] ?? 0;
        return (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {icon}
                {label}
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {loading ? "—" : value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Queue: {loading ? "—" : queueValue}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

type FiltersBarProps = {
  statusValue: string;
  queueValue: string;
  platformValue: string;
  jobNameValue: string;
  jobIdValue: string;
  dateInputs: Record<DateFilterKey, string>;
  onStatusChange: (value: string) => void;
  onQueueChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPlatformChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onJobNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onJobIdChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (
    key: DateFilterKey
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
};

const FiltersBar: React.FC<FiltersBarProps> = ({
  statusValue,
  queueValue,
  platformValue,
  jobNameValue,
  jobIdValue,
  dateInputs,
  onStatusChange,
  onQueueChange,
  onPlatformChange,
  onJobNameChange,
  onJobIdChange,
  onDateChange,
  onReset,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Filters</CardTitle>
        <CardDescription>Refine the job history timeline.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <Select value={statusValue || "all"} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TextFilterField
          label="Queue"
          placeholder="scheduled-posts"
          value={queueValue}
          onChange={onQueueChange}
        />

        <TextFilterField
          label="Platform"
          placeholder="facebook"
          value={platformValue}
          onChange={onPlatformChange}
        />

        <TextFilterField
          label="Job name"
          placeholder="publish"
          value={jobNameValue}
          onChange={onJobNameChange}
        />

        <TextFilterField
          label="Job ID"
          placeholder="BullMQ job id"
          value={jobIdValue}
          onChange={onJobIdChange}
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />

        <DateFilterField
          label="Created after"
          value={dateInputs.from}
          onChange={onDateChange("from")}
        />

        <DateFilterField
          label="Created before"
          value={dateInputs.to}
          onChange={onDateChange("to")}
        />

        <div className="flex items-end">
          <Button variant="ghost" onClick={onReset} className="w-full">
            Reset filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

type TextFilterFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
};

const TextFilterField: React.FC<TextFilterFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  icon,
}) => {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="absolute inset-y-0 left-2 flex items-center">
            {icon}
          </span>
        ) : null}
        <Input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={icon ? "pl-8" : undefined}
        />
      </div>
    </div>
  );
};

type DateFilterFieldProps = {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const DateFilterField: React.FC<DateFilterFieldProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Input type="datetime-local" value={value} onChange={onChange} />
    </div>
  );
};

type JobDetailViewProps = {
  job: JobHistoryItem;
  canManage: boolean;
  onRetry: () => void;
  onCancel: () => void;
  retryLoading: boolean;
  cancelLoading: boolean;
};

const JobDetailView: React.FC<JobDetailViewProps> = ({
  job,
  canManage,
  onRetry,
  onCancel,
  retryLoading,
  cancelLoading,
}) => {
  return (
    <div className="space-y-4 py-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {job.jobName || job.queueName}
              </CardTitle>
              <CardDescription>{job.jobId}</CardDescription>
            </div>
            <Badge className={cn("capitalize", STATUS_BADGE_CLASS[job.status])}>
              {statusLabel(job.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="h-4 w-4" />
            Enqueued {formatDate(job.enqueuedAt, "PPP p")}
          </div>
          {job.startedAt ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4" /> Started{" "}
              {formatDate(job.startedAt, "PPP p")}
            </div>
          ) : null}
          {job.finishedAt ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <History className="h-4 w-4" /> Finished{" "}
              {formatDate(job.finishedAt, "PPP p")}
            </div>
          ) : null}
          {job.lastError ? (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{job.lastError}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Search className="h-4 w-4" /> Attempts {job.attemptsMade}
            {typeof job.attempts === "number" ? ` of ${job.attempts}` : ""}
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canManage || !job.operations.canRetry || retryLoading}
              onClick={(event) => {
                event.stopPropagation();
                if (!canManage) return;
                onRetry();
              }}
            >
              {retryLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Retry
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={
                !canManage || !job.operations.canCancel || cancelLoading
              }
              onClick={(event) => {
                event.stopPropagation();
                if (!canManage) return;
                onCancel();
              }}
            >
              {cancelLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Linked entities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {job.scheduledPost ? (
            <div>
              <div className="font-medium">Scheduled post</div>
              <p className="text-muted-foreground">
                {job.scheduledPost.content?.slice(0, 120) || "Scheduled post"}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>Status: {job.scheduledPost.status}</span>
                <Link
                  to={`/dashboard/scheduled/${job.scheduledPost.id}`}
                  className="text-primary hover:underline"
                >
                  View scheduled post
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No scheduled post linked</p>
          )}
          <Separator />
          {job.socialPost ? (
            <div>
              <div className="font-medium">Social post</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {job.socialPost.platform || "unknown platform"}
                  {job.socialPost.status ? ` • ${job.socialPost.status}` : ""}
                </span>
                {job.socialPost.id ? (
                  <Link
                    to={`/dashboard/posts/${job.socialPost.id}`}
                    className="text-primary hover:underline"
                  >
                    View social post
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No social post linked</p>
          )}
          <Separator />
          {job.draft ? (
            <div>
              <div className="font-medium">Source draft</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {job.draft.title || "Untitled"}
                  {typeof job.draft.revision === "number"
                    ? ` • Revision ${job.draft.revision}`
                    : ""}
                </span>
                <Link
                  to={`/dashboard/drafts/${job.draft.id}`}
                  className="text-primary hover:underline"
                >
                  View draft
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No draft linked</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Queue snapshot</CardTitle>
          <CardDescription>Real-time state from BullMQ.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <DetailRow label="State" value={job.queue?.state || "Unknown"} />
          <DetailRow
            label="Attempts"
            value={`${job.queue?.attemptsMade ?? 0} of ${
              job.queue?.attempts ?? job.attempts ?? "?"
            }`}
          />
          <DetailRow
            label="Delay"
            value={
              typeof job.queue?.delay === "number"
                ? `${job.queue?.delay}ms`
                : "0"
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Payload snapshot</CardTitle>
          <CardDescription>Captured at enqueue time.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="rounded bg-muted/40 p-3 text-xs overflow-x-auto">
            {JSON.stringify(job.payload ?? {}, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

type DetailRowProps = {
  label: string;
  value: React.ReactNode;
};

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right break-all">{value}</span>
  </div>
);

export default AdminJobsDashboard;
