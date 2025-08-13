import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import NotificationBadge from '../ui/notification-badge';

/**
 * Test component for NotificationBadge - Remove after testing
 */
export const NotificationBadgeTest: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold">Notification Badge Tests</h2>
      
      {/* Test different variants */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Variants</h3>
          <div className="flex gap-6 items-center">
            {/* Text Only (your preferred style) */}
            <div className="flex flex-col items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <NotificationBadge count={3} variant="text-only" />
              </Button>
              <span className="text-xs">Text Only</span>
            </div>

            {/* Dot */}
            <div className="flex flex-col items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <NotificationBadge count={5} variant="dot" />
              </Button>
              <span className="text-xs">Dot</span>
            </div>

            {/* Count with positioning */}
            <div className="flex flex-col items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <NotificationBadge count={12} variant="count" />
              </Button>
              <span className="text-xs">Count</span>
            </div>
          </div>
        </div>

        {/* Test different numbers */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Different Numbers (Text Only)</h3>
          <div className="flex gap-6 items-center">
            {[1, 5, 12, 99, 150].map(count => (
              <div key={count} className="flex flex-col items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <NotificationBadge count={count} variant="text-only" />
                </Button>
                <span className="text-xs">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Test sizes */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Sizes</h3>
          <div className="flex gap-6 items-center">
            {(['sm', 'md', 'lg'] as const).map(size => (
              <div key={size} className="flex flex-col items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <NotificationBadge count={7} variant="text-only" size={size} />
                </Button>
                <span className="text-xs">{size}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dark mode preview */}
        <div className="p-4 bg-gray-800 rounded">
          <h3 className="text-lg font-semibold mb-4 text-white">Dark Mode</h3>
          <div className="flex gap-6 items-center">
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-gray-700">
              <Bell className="h-4 w-4" />
              <NotificationBadge count={3} variant="text-only" />
            </Button>
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-gray-700">
              <Bell className="h-4 w-4" />
              <NotificationBadge count={25} variant="text-only" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};