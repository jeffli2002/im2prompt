// Share reward configuration for actions like publishing or social sharing.
// Kept simple for now – if you need more complex rules, we can expand this.

export type ShareRewardKey = 'copyLink' | 'publishIm2prompt' | 'publishViecom' | 'socialShare';

export interface ShareRewardConfigItem {
  credits: number;
  platform: string;
  referencePrefix: string;
}

export const SHARE_REWARD_CONFIG: Record<ShareRewardKey, ShareRewardConfigItem> = {
  copyLink: {
    credits: 0,
    platform: 'copy',
    referencePrefix: 'copy_link',
  },
  publishIm2prompt: {
    credits: 2,
    platform: 'other',
    referencePrefix: 'publish_im2prompt',
  },
  // Backwards-compatible key name used in the original Viecom code.
  publishViecom: {
    credits: 2,
    platform: 'other',
    referencePrefix: 'publish_viecom',
  },
  socialShare: {
    credits: 0,
    platform: 'other',
    referencePrefix: 'social_share',
  },
};


