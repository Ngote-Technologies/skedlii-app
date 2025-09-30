import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import {
  Bell,
  Mail,
  MessageSquare,
  Users,
  Shield,
  Clock,
  CheckCircle2,
  Settings,
  Save,
  Sparkles,
  Smartphone,
  Monitor,
} from "lucide-react";
import { useState } from "react";

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    postPublishing: true,
    teamInvitations: true,
    accountSecurity: true,
    pushNotifications: false,
    browserNotifications: true,
    weeklyDigest: "weekly",
    marketingEmails: false,
  });

  const updateSetting = (key: string, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-background to-muted/30 border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />

      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-bold">
                Notification Preferences
              </CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                <span className="text-xs">Customizable</span>
              </Badge>
            </div>
            <CardDescription className="mt-1">
              Control how and when you receive notifications across all
              platforms
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Essential Notifications</h3>
            <Badge variant="outline" className="text-xs">
              Required
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-500/10">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    Email Notifications
                    {settings.emailNotifications && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates about your account
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  updateSetting("emailNotifications", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-green-500/10">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    Post Publishing
                    {settings.postPublishing && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your posts are published or fail
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.postPublishing}
                onCheckedChange={(checked) =>
                  updateSetting("postPublishing", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-purple-500/10">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    Team Invitations
                    {settings.teamInvitations && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about team invites and updates
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.teamInvitations}
                onCheckedChange={(checked) =>
                  updateSetting("teamInvitations", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-orange-500/10">
                  <Shield className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    Account Security
                    <Badge
                      variant="secondary"
                      className="text-xs bg-orange-500/10 text-orange-600"
                    >
                      Recommended
                    </Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Critical security alerts and login notifications
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.accountSecurity}
                onCheckedChange={(checked) =>
                  updateSetting("accountSecurity", checked)
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Platform Preferences</h3>
            <Badge variant="outline" className="text-xs">
              Optional
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-500/10">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on your mobile device
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) =>
                  updateSetting("pushNotifications", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-green-500/10">
                  <Monitor className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Browser Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Show notifications in your web browser
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.browserNotifications}
                onCheckedChange={(checked) =>
                  updateSetting("browserNotifications", checked)
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Summary Digest</h3>
          </div>

          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-sm font-medium mb-3">
              How often should we send you a summary?
            </p>
            <div className="flex flex-wrap gap-2">
              {["daily", "weekly", "monthly", "never"].map((frequency) => (
                <Button
                  key={frequency}
                  variant={
                    settings.weeklyDigest === frequency ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => updateSetting("weeklyDigest", frequency)}
                  className={
                    settings.weeklyDigest === frequency
                      ? "bg-gradient-to-r from-primary to-purple-500 text-white"
                      : ""
                  }
                >
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span>Settings are saved automatically</span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-border/50">
            Reset to Default
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <Save className="mr-2 h-4 w-4" />
            Save Preferences
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NotificationSettings;
