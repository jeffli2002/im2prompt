export enum PromptCategory {
  PEOPLE_PORTRAITS = 'people-portraits',
  ANIMALS_WILDLIFE = 'animals-wildlife',
  SCENERY_ENVIRONMENT = 'scenery-environment',
  OBJECTS_PRODUCTS = 'objects-products',
  SCIENCE_EDU_TECH = 'science-edu-tech',
  FASHION_LIFESTYLE = 'fashion-lifestyle',
}

export type CategoryColor = 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'pink';

export interface PromptExample {
  id: string;
  category: PromptCategory;
  title: string;
  prompt: string;
  negativePrompt?: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  tags: string[];
  model?: 'nano-banana' | 'flux-1.1-pro' | 'flux-1.1-ultra' | 'stable-diffusion' | 'dall-e' | 'sora';
  featured?: boolean;
  order: number;
  metadata?: {
    style?: string;
    aspectRatio?: string;
    quality?: string;
  };
}

export interface CategoryMeta {
  id: PromptCategory;
  name: string;
  description: string;
  icon: string;
  order: number;
  color: CategoryColor;
}

export interface PromptLibraryFilters {
  category?: PromptCategory | 'all';
  model?: string;
  tags?: string[];
  featured?: boolean;
}

export interface PromptFilters {
  category?: PromptCategory | 'all';
  model?: string;
  tags?: string[];
  featured?: boolean;
  search?: string;
  sortBy?: 'featured' | 'alphabetical';
}
