// import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  // Building,
  Users,
  // Settings,
  Calendar,
  BarChart3,
  Shield,
} from "lucide-react";
// import {
//   useActiveOrganization,
//   useOrganizationPermissions,
// } from "../../store/organizationStore";
// import { organizationsApi } from "../../api/organizations";
// import { getInitials } from "../../lib/utils";
import { Link } from "react-router-dom";

export default function OrganizationDashboard() {
  // const activeOrganization = useActiveOrganization();
  // const permissions = useOrganizationPermissions();

  // Fetch organization details with stats
  // const { data: organizationDetails, isLoading } = useQuery({
  //   queryKey: ["organization", activeOrganization?._id],
  //   queryFn: () =>
  //     activeOrganization
  //       ? organizationsApi.getOrganization(activeOrganization._id)
  //       : null,
  //   enabled: !!activeOrganization,
  // });

  // console.log({ organizationDetails });

  // if (!activeOrganization) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="text-center">
  //         <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
  //         <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
  //           No Organization Selected
  //         </h3>
  //         <p className="text-gray-500 dark:text-gray-400 mt-2">
  //           Please select an organization to view the dashboard
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (isLoading) {
  //   return (
  //     <div className="space-y-6">
  //       <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
  //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  //         {[...Array(4)].map((_, i) => (
  //           <div
  //             key={i}
  //             className="h-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"
  //           />
  //         ))}
  //       </div>
  //     </div>
  //   );
  // }

  const stats = [
    {
      title: "Members",
      // value:
      //   organizationDetails?.members?.length || activeOrganization.memberCount,
      value: 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Teams",
      // value: organizationDetails?.teams?.length || 0,
      value: 0,
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Social Accounts",
      // value: organizationDetails?.socialAccounts?.length || 0,
      value: 0,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "This Month",
      value: "12 posts", // TODO: Get actual stats from API
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Organization Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            {/* <AvatarImage
              src={activeOrganization.logo}
              alt={activeOrganization.name}
            />
            <AvatarFallback className="text-lg">
              {getInitials(activeOrganization.name)}
            </AvatarFallback> */}
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {/* {activeOrganization.name} */}
              Organization Name
            </h1>
            {/* {activeOrganization.description && (
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {activeOrganization.description}
              </p>
            )} */}
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline">
                {/* {activeOrganization.userRole.charAt(0).toUpperCase() +
                  activeOrganization.userRole.slice(1)} */}
                User Role
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Member since{" "}
                {/* {new Date(activeOrganization.joinedAt).toLocaleDateString()} */}
                Joined Date
              </span>
            </div>
          </div>
        </div>

        {/* {permissions.canManageOrganization && (
          <Button asChild>
            <Link to="/dashboard/organizations/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        )} */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard/organizations/members">
                <Users className="h-4 w-4 mr-2" />
                {/* {permissions.canManageMembers ? "Manage" : "View"} Members */}
                Manage Members
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard/organizations/teams">
                <Shield className="h-4 w-4 mr-2" />
                {/* {permissions.canCreateTeams ? "Manage" : "View"} Teams */}
                Manage Teams
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard/accounts">
                <Calendar className="h-4 w-4 mr-2" />
                Social Accounts
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Members Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>
              {/* {permissions.canManageMembers ? "Recent Members" : "Team Members"} */}
              Recent Members
            </CardTitle>
            <CardDescription>
              {/* {permissions.canManageMembers
                ? "Recently joined team members"
                : "Members you collaborate with"} */}
              Recently joined team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* {organizationDetails?.members &&
            organizationDetails.members.length > 0 ? (
              <div className="space-y-3">
                {organizationDetails.members.slice(0, 5).map((member) => (
                  <div key={member._id} className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(`${member.firstName} ${member.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
                {organizationDetails.members.length > 5 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    asChild
                  >
                    <Link to="/dashboard/organizations/members">
                      {permissions.canManageMembers
                        ? `View all ${organizationDetails.members.length} members`
                        : `View all ${organizationDetails.members.length} team members`}
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {permissions.canManageMembers
                    ? "No members yet"
                    : "No team members to show"}
                </p>
              </div>
            )} */}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest organization activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Placeholder activity items */}
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    New social account connected
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    Team member added
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    1 day ago
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-purple-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    Post scheduled
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    2 days ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
