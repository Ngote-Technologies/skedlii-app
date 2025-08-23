import { useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Separator } from "./separator";
import { useToast } from "../../hooks/use-toast";
import { CheckCircle, AlertCircle, AlertTriangle, Info, Loader2, Sparkles, Keyboard } from "lucide-react";

export default function ToastDemo() {
  const { toast, dismissAll, toasts } = useToast();
  const [counter, setCounter] = useState(1);

  const showSuccessToast = () => {
    toast.success({
      title: "Success!",
      description: "Your post has been published successfully to all platforms.",
    });
  };

  const showErrorToast = () => {
    toast.error({
      title: "Publishing Failed",
      description: "Failed to publish post. Please check your network connection and try again.",
    });
  };

  const showWarningToast = () => {
    toast.warning({
      title: "Subscription Expiring",
      description: "Your Pro subscription expires in 3 days. Upgrade to avoid service interruption.",
    });
  };

  const showInfoToast = () => {
    toast.info({
      title: "New Features Available",
      description: "Check out the new AI content suggestions in your dashboard.",
      showProgress: true,
      duration: 4000,
    });
  };

  const showLoadingToast = () => {
    const loadingToast = toast.loading({
      title: "Publishing to Social Media...",
      description: "Your content is being published to Facebook, Twitter, and LinkedIn.",
    });

    // Simulate async operation
    setTimeout(() => {
      loadingToast.dismiss();
      toast.success({
        title: "Published Successfully!",
        description: "Your post is now live on all selected platforms.",
      });
    }, 3000);
  };

  const showCustomToast = () => {
    toast({
      title: `Custom Toast #${counter}`,
      description: "This is a custom toast with manual configuration.",
      duration: 6000,
      showProgress: true,
    });
    setCounter(c => c + 1);
  };

  const showMultipleToasts = () => {
    toast.info({ title: "First notification", description: "This is the first toast" });
    setTimeout(() => {
      toast.warning({ title: "Second notification", description: "This is the second toast" });
    }, 500);
    setTimeout(() => {
      toast.success({ title: "Third notification", description: "This is the third toast" });
    }, 1000);
  };

  const showPersistentToast = () => {
    toast({
      title: "Persistent Toast",
      description: "This toast will stay until manually dismissed (click the X or press Escape).",
      persistent: true,
      variant: "default",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Enhanced Toast System Demo
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Test the new and improved toast notifications with modern design, smart durations, 
            progress indicators, and enhanced accessibility features.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Keyboard className="h-4 w-4" />
            <span>Press <Badge variant="outline" className="px-1 py-0 text-xs">Esc</Badge> to dismiss all toasts</span>
          </div>
        </div>

        {/* Current State */}
        {toasts.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span>Active Toasts: {toasts.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {toasts.length} toast{toasts.length !== 1 ? 's' : ''} currently visible
                </p>
                <Button onClick={dismissAll} variant="outline" size="sm">
                  Dismiss All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Variants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Basic Variants</span>
              </CardTitle>
              <CardDescription>
                Test the main toast variants with automatic icons and durations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={showSuccessToast} variant="default" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Success Toast
                <Badge variant="secondary" className="ml-auto">4s</Badge>
              </Button>
              <Button onClick={showErrorToast} variant="destructive" className="w-full justify-start">
                <AlertCircle className="h-4 w-4 mr-2" />
                Error Toast
                <Badge variant="secondary" className="ml-auto">6s</Badge>
              </Button>
              <Button onClick={showWarningToast} variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                Warning Toast
                <Badge variant="secondary" className="ml-auto">5s</Badge>
              </Button>
              <Button onClick={showInfoToast} variant="ghost" className="w-full justify-start">
                <Info className="h-4 w-4 mr-2 text-blue-600" />
                Info Toast (with progress)
                <Badge variant="secondary" className="ml-auto">4s</Badge>
              </Button>
            </CardContent>
          </Card>

          {/* Advanced Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 text-blue-600" />
                <span>Advanced Features</span>
              </CardTitle>
              <CardDescription>
                Test loading states, persistence, and custom configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={showLoadingToast} variant="secondary" className="w-full justify-start">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading Toast
                <Badge variant="secondary" className="ml-auto">Auto</Badge>
              </Button>
              <Button onClick={showPersistentToast} variant="outline" className="w-full justify-start">
                <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                Persistent Toast
                <Badge variant="secondary" className="ml-auto">∞</Badge>
              </Button>
              <Button onClick={showCustomToast} variant="ghost" className="w-full justify-start">
                <Info className="h-4 w-4 mr-2" />
                Custom Configuration
                <Badge variant="secondary" className="ml-auto">6s</Badge>
              </Button>
              <Button onClick={showMultipleToasts} variant="default" className="w-full justify-start">
                <span className="flex space-x-1 mr-2">
                  <div className="h-2 w-2 bg-current rounded-full"></div>
                  <div className="h-2 w-2 bg-current rounded-full"></div>
                  <div className="h-2 w-2 bg-current rounded-full"></div>
                </span>
                Multiple Toasts
                <Badge variant="secondary" className="ml-auto">3x</Badge>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Feature List */}
        <Card>
          <CardHeader>
            <CardTitle>✨ Enhanced Features</CardTitle>
            <CardDescription>
              What's new in the improved toast system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">🎨 Design Improvements</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Glass morphism with backdrop blur</li>
                  <li>• Modern rounded corners (12px)</li>
                  <li>• Enhanced animations & transitions</li>
                  <li>• Automatic variant-based icons</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">⚡ Smart Features</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Smart duration based on variant</li>
                  <li>• Progress bars for timed toasts</li>
                  <li>• Persistent loading states</li>
                  <li>• Keyboard shortcuts (Esc to dismiss)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">🚀 Performance</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Fixed 1000s delay bug → 5s</li>
                  <li>• Maximum 3 simultaneous toasts</li>
                  <li>• Efficient memory management</li>
                  <li>• Hardware-accelerated animations</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">♿ Accessibility</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Proper focus management</li>
                  <li>• Screen reader support</li>
                  <li>• Keyboard navigation</li>
                  <li>• High contrast mode support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>💻 Usage Examples</CardTitle>
            <CardDescription>
              How to use the enhanced toast system in your code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Simple Usage</h4>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-sm font-mono">
                  toast.success({`{`}<br />
                  &nbsp;&nbsp;title: "Success!",<br />
                  &nbsp;&nbsp;description: "Your post was published."<br />
                  {`}`});
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Advanced Configuration</h4>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-sm font-mono">
                  toast({`{`}<br />
                  &nbsp;&nbsp;title: "Custom Toast",<br />
                  &nbsp;&nbsp;description: "With custom settings",<br />
                  &nbsp;&nbsp;duration: 8000,<br />
                  &nbsp;&nbsp;showProgress: true,<br />
                  &nbsp;&nbsp;persistent: false<br />
                  {`}`});
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}