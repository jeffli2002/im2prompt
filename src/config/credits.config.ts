export interface CreditsConfig {
  enabled: boolean;
  currency: string;
  
  // Credit consumption rules
  consumption: {
    apiCall: {
      costPerCall: number;        // Credits consumed per API call
      freeQuotaCalls: number;     // Free quota for paid users (0 = all use credits)
    };
    imageGeneration: {
      nanoBanana: number;         // Credits per image with Nano Banana model
    };
    videoGeneration: {
      sora2: number;              // Credits per video with Sora 2 model
    };
    storage: {
      costPerGBPerMonth: number;  // Credits consumed per GB per month
      freeQuotaGB: number;        // Free quota for paid users (0 = all use credits)
    };
  };
  
  // Free user quotas (credit-based)
  freeUser: {
    imageToText: {
      freeQuotaPerDay: number;    // Free Image-to-Text calls per day for free users
    };
    textToPrompt: {
      unlimited: boolean;         // Unlimited Text-to-Prompt generation
    };
    credits: {
      dailyCredits: number;       // Daily free credits for image/video generation
      monthlyCredits: number;     // Monthly free credits for image/video generation
    };
    // apiCall: {
    //   freeQuotaCalls: number;     // Free API calls per month for free users
    // };
    storage: {
      freeQuotaGB: number;        // Free storage for free users
    };
  };
}

export const creditsConfig: CreditsConfig = {
  enabled: true,
  currency: 'credits',
  
  // Consumption rules
  consumption: {
    apiCall: {
      costPerCall: 1,        // Each API call costs 1 credit
      freeQuotaCalls: 0,     // Paid users have no free quota, all use credits
    },
    imageGeneration: {
      nanoBanana: 5,         // Nano Banana model: 5 credits per image
    },
    videoGeneration: {
      sora2: 15,             // Sora 2 model: 15 credits per video
    },
    storage: {
      costPerGBPerMonth: 10, // Each GB per month costs 10 credits
      freeQuotaGB: 0,        // Paid users have no free quota
    },
  },
  
  // Free user quotas
  freeUser: {
    imageToText: {
      freeQuotaPerDay: 5,    // Free users get 5 Image-to-Text calls per day
    },
    textToPrompt: {
      unlimited: true,       // Free users get unlimited Text-to-Prompt generation
    },
    credits: {
      dailyCredits: 20,      // 20 credits/day (1 image + 1 video = 20 credits)
      monthlyCredits: 125,   // 125 credits/month (10 images + 5 videos = 125 credits)
    },
    apiCall: {
      freeQuotaCalls: 100,   // Free users get 100 API calls per month
    },
    storage: {
      freeQuotaGB: 1,        // Free users get 1GB free storage
    },
  },
};
