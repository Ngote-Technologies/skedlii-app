// Mock User
export const mockUser = {
  id: 1,
  username: "demo_user",
  email: "demo@skedlii.com",
  name: "Demo User",
  createdAt: new Date(),
  password: "hashed_password",
  avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=demo",
  role: "user",
};

// Mock Social Accounts
export const mockSocialAccounts = [
  // Instagram Accounts
  {
    id: 1,
    userId: 1,
    orgId: null,
    platform: "instagram",
    username: "travel_shots",
    name: "Travel Shots",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=travel",
    platformId: "insta_123",
    token: "mock_token_1",
    tokenSecret: null,
    refreshToken: null,
    tokenExpiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    userId: 1,
    orgId: null,
    platform: "instagram",
    username: "food_delights",
    name: "Food Delights",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=food",
    platformId: "insta_456",
    token: "mock_token_2",
    tokenSecret: null,
    refreshToken: null,
    tokenExpiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Twitter Accounts
  {
    id: 3,
    userId: 1,
    orgId: null,
    platform: "twitter",
    username: "tech_updates",
    name: "Tech Updates",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=tech",
    platformId: "twit_123",
    token: "mock_token_3",
    tokenSecret: "mock_secret_3",
    refreshToken: null,
    tokenExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // LinkedIn Accounts
  {
    id: 4,
    userId: 1,
    orgId: null,
    platform: "linkedin",
    username: "business_profile",
    name: "Business Solutions Inc.",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=business",
    platformId: "li_123",
    token: "mock_token_4",
    tokenSecret: null,
    refreshToken: "mock_refresh_4",
    tokenExpiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Facebook Accounts
  {
    id: 5,
    userId: 1,
    orgId: null,
    platform: "facebook",
    username: "community_page",
    name: "Community Outreach",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=community",
    platformId: "fb_123",
    token: "mock_token_5",
    tokenSecret: null,
    refreshToken: null,
    tokenExpiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // TikTok Accounts
  {
    id: 6,
    userId: 1,
    orgId: null,
    platform: "tiktok",
    username: "dance_trends",
    name: "Dance Trends",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=dance",
    platformId: "tt_123",
    token: "mock_token_6",
    tokenSecret: null,
    refreshToken: "mock_refresh_6",
    tokenExpiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // Threads Account
  {
    id: 7,
    userId: 1,
    orgId: null,
    platform: "threads",
    username: "discussion_starter",
    name: "Discussion Starter",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=discussion",
    platformId: "thread_123",
    token: "mock_token_7",
    tokenSecret: null,
    refreshToken: null,
    tokenExpiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock Collections
export const mockCollections = [
  {
    id: 1,
    userId: 1,
    orgId: null,
    name: "Summer Campaign",
    description: "Content for summer products and promotions",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    userId: 1,
    orgId: null,
    name: "Product Launches",
    description: "New product announcements and features",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    userId: 1,
    orgId: null,
    name: "Holiday Specials",
    description: "Holiday themed content and promotions",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock Posts
export const mockPosts = [
  {
    id: 1,
    userId: 1,
    orgId: null,
    collectionId: 1,
    caption:
      "Check out our new summer collection! Perfect for your beach vacation. #SummerVibes #BeachLife",
    mediaUrls: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    ],
    scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
    publishedAt: null,
    status: "scheduled",
    type: "image",
    platformData: JSON.stringify({
      instagram: {
        caption:
          "Check out our new summer collection! Perfect for your beach vacation. #SummerVibes #BeachLife",
        accounts: [1],
      },
      twitter: {
        caption:
          "New summer collection is here! Check it out and get ready for the beach! #SummerVibes",
        accounts: [3],
      },
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    userId: 1,
    orgId: null,
    collectionId: 2,
    caption:
      "Introducing our latest product innovation! This game-changing feature will revolutionize how you work. #Innovation #ProductLaunch",
    mediaUrls: [
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    ],
    scheduledAt: new Date(Date.now() + 172800000), // Day after tomorrow
    publishedAt: null,
    status: "scheduled",
    type: "image",
    platformData: JSON.stringify({
      linkedin: {
        caption:
          "Introducing our latest product innovation! This game-changing feature will revolutionize how you work. #Innovation #ProductLaunch",
        accounts: [4],
      },
      facebook: {
        caption:
          "Introducing our latest product innovation! This game-changing feature will revolutionize how you work. #Innovation #ProductLaunch",
        accounts: [5],
      },
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    userId: 1,
    orgId: null,
    collectionId: 3,
    caption: `Get ready for our holiday special offers! Limited time deals you don't want to miss. #HolidayDeals #LimitedTime`,
    mediaUrls: [
      "https://images.unsplash.com/photo-1543589077-47d81606c1bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    ],
    scheduledAt: new Date(Date.now() + 259200000), // 3 days from now
    publishedAt: null,
    status: "scheduled",
    type: "image",
    platformData: JSON.stringify({
      instagram: {
        caption:
          "Get ready for our holiday special offers! Limited time deals you don't want to miss. #HolidayDeals #LimitedTime",
        accounts: [1, 2],
      },
      tiktok: {
        caption: "Holiday deals dropping soon! #HolidayDeals #ShopNow",
        accounts: [6],
      },
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    userId: 1,
    orgId: null,
    collectionId: 1,
    caption:
      "Summer nights and city lights! Our evening collection is perfect for warm summer nights in the city. #SummerNights #CityStyle",
    mediaUrls: [
      "https://images.unsplash.com/photo-1506919258185-6078bba55d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    ],
    scheduledAt: new Date(Date.now() + 345600000), // 4 days from now
    publishedAt: null,
    status: "scheduled",
    type: "video",
    platformData: JSON.stringify({
      threads: {
        caption: "Summer nights and city lights! #SummerNights #CityStyle",
        accounts: [7],
      },
      instagram: {
        caption:
          "Summer nights and city lights! Our evening collection is perfect for warm summer nights in the city. #SummerNights #CityStyle",
        accounts: [2],
      },
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    userId: 1,
    orgId: null,
    collectionId: 2,
    caption:
      "Behind the scenes look at our new product development! #BTS #Innovation",
    mediaUrls: [
      "https://images.unsplash.com/photo-1582079883255-612b895cd0bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    ],
    scheduledAt: new Date(Date.now() + 432000000), // 5 days from now
    publishedAt: null,
    status: "scheduled",
    type: "image",
    platformData: JSON.stringify({
      twitter: {
        caption:
          "Behind the scenes look at our new product development! #BTS #Innovation",
        accounts: [3],
      },
      linkedin: {
        caption:
          "Behind the scenes look at our new product development! Our team is working hard to bring you the best solutions. #BTS #Innovation #ProductDevelopment",
        accounts: [4],
      },
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Analytics data
export interface AnalyticsData {
  engagement: {
    total: number;
    previousPeriod: number;
    byPlatform: Record<string, number>;
    history: { date: string; value: number }[];
  };
  reach: {
    total: number;
    previousPeriod: number;
    byPlatform: Record<string, number>;
    history: { date: string; value: number }[];
  };
  posts: {
    total: number;
    scheduled: number;
    published: number;
    byPlatform: Record<string, number>;
  };
  topPosts: {
    id: number;
    caption: string;
    engagement: number;
    reach: number;
    platform: string;
    mediaUrl: string;
  }[];
  audienceGrowth: {
    overall: number;
    byPlatform: Record<string, number>;
    history: { date: string; value: number }[];
  };
}

export const mockAnalyticsData: AnalyticsData = {
  engagement: {
    total: 12843,
    previousPeriod: 10523,
    byPlatform: {
      instagram: 5642,
      twitter: 1823,
      facebook: 2345,
      linkedin: 987,
      tiktok: 1894,
      threads: 152,
    },
    history: [
      { date: "2025-04-01", value: 372 },
      { date: "2025-04-02", value: 389 },
      { date: "2025-04-03", value: 421 },
      { date: "2025-04-04", value: 457 },
      { date: "2025-04-05", value: 412 },
      { date: "2025-04-06", value: 368 },
      { date: "2025-04-07", value: 389 },
      { date: "2025-04-08", value: 425 },
      { date: "2025-04-09", value: 432 },
      { date: "2025-04-10", value: 478 },
      { date: "2025-04-11", value: 489 },
      { date: "2025-04-12", value: 512 },
      { date: "2025-04-13", value: 498 },
      { date: "2025-04-14", value: 510 },
    ],
  },
  reach: {
    total: 98756,
    previousPeriod: 87543,
    byPlatform: {
      instagram: 45678,
      twitter: 12456,
      facebook: 18976,
      linkedin: 7654,
      tiktok: 12987,
      threads: 1005,
    },
    history: [
      { date: "2025-04-01", value: 6732 },
      { date: "2025-04-02", value: 6834 },
      { date: "2025-04-03", value: 7123 },
      { date: "2025-04-04", value: 7245 },
      { date: "2025-04-05", value: 7098 },
      { date: "2025-04-06", value: 6832 },
      { date: "2025-04-07", value: 6945 },
      { date: "2025-04-08", value: 7123 },
      { date: "2025-04-09", value: 7321 },
      { date: "2025-04-10", value: 7567 },
      { date: "2025-04-11", value: 7689 },
      { date: "2025-04-12", value: 7789 },
      { date: "2025-04-13", value: 7654 },
      { date: "2025-04-14", value: 7804 },
    ],
  },
  posts: {
    total: 187,
    scheduled: 5,
    published: 182,
    byPlatform: {
      instagram: 65,
      twitter: 54,
      facebook: 32,
      linkedin: 15,
      tiktok: 18,
      threads: 3,
    },
  },
  topPosts: [
    {
      id: 101,
      caption: "Summer collection launch! #SummerVibes",
      engagement: 2345,
      reach: 15678,
      platform: "instagram",
      mediaUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 102,
      caption: "New product announcement! #Innovation",
      engagement: 1876,
      reach: 12567,
      platform: "linkedin",
      mediaUrl:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    },
    {
      id: 103,
      caption: "Holiday special offers! #HolidayDeals",
      engagement: 1543,
      reach: 10987,
      platform: "tiktok",
      mediaUrl:
        "https://images.unsplash.com/photo-1543589077-47d81606c1bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 104,
      caption: "Summer nights collection! #SummerNights",
      engagement: 1432,
      reach: 9876,
      platform: "instagram",
      mediaUrl:
        "https://images.unsplash.com/photo-1506919258185-6078bba55d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
  ],
  audienceGrowth: {
    overall: 2.8,
    byPlatform: {
      instagram: 3.2,
      twitter: 1.8,
      facebook: 1.5,
      linkedin: 2.7,
      tiktok: 4.6,
      threads: 5.3,
    },
    history: [
      { date: "2025-04-01", value: 0.18 },
      { date: "2025-04-02", value: 0.21 },
      { date: "2025-04-03", value: 0.19 },
      { date: "2025-04-04", value: 0.22 },
      { date: "2025-04-05", value: 0.2 },
      { date: "2025-04-06", value: 0.17 },
      { date: "2025-04-07", value: 0.19 },
      { date: "2025-04-08", value: 0.23 },
      { date: "2025-04-09", value: 0.21 },
      { date: "2025-04-10", value: 0.24 },
      { date: "2025-04-11", value: 0.25 },
      { date: "2025-04-12", value: 0.23 },
      { date: "2025-04-13", value: 0.22 },
      { date: "2025-04-14", value: 0.26 },
    ],
  },
};



// Create a mock service for fetching data
export const mockService = {
  getUser: () => Promise.resolve(mockUser),
  getSocialAccounts: () => Promise.resolve(mockSocialAccounts),
  getPosts: () => Promise.resolve(mockPosts),
  getCollections: () => Promise.resolve(mockCollections),
  getAnalytics: () => Promise.resolve(mockAnalyticsData),

  // This is used for the create-post feature
  createPost: (postData: Partial<any>) => {
    const newPost: any = {
      id: mockPosts.length + 1,
      userId: 1,
      orgId: null,
      collectionId: postData.collectionId ?? null,
      caption: postData.caption ?? "",
      mediaUrls: postData.mediaUrls ?? [],
      scheduledAt: postData.scheduledAt ?? null,
      publishedAt: null,
      status: postData.scheduledAt ? "scheduled" : "draft",
      type: postData.type ?? "text",
      platformData: postData.platformData ?? "{}",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPosts.push(newPost);
    return Promise.resolve(newPost);
  },
};
