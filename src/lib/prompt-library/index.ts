import { CATEGORY_METADATA, PROMPT_EXAMPLES } from '@/config/prompt-library.config';
import type { PromptCategory, PromptExample, PromptLibraryFilters } from '@/types/prompt-library';
import { getPromptImageUrl } from './image-utils';

export function getPromptsByCategory(category: PromptCategory): PromptExample[] {
  return PROMPT_EXAMPLES.filter((prompt) => prompt.category === category)
    .sort((a, b) => a.order - b.order)
    .map((prompt) => ({
      ...prompt,
      imageUrl: getPromptImageUrl(prompt.cloudinaryPublicId, 'card'),
    }));
}

export function getFeaturedPrompts(limit = 6): PromptExample[] {
  return PROMPT_EXAMPLES.filter((prompt) => prompt.featured)
    .sort((a, b) => a.order - b.order)
    .slice(0, limit)
    .map((prompt) => ({
      ...prompt,
      imageUrl: getPromptImageUrl(prompt.cloudinaryPublicId, 'card'),
    }));
}

export function getAllPrompts(filters?: PromptLibraryFilters): PromptExample[] {
  let prompts = [...PROMPT_EXAMPLES];

  if (filters?.category && filters.category !== 'all') {
    prompts = prompts.filter((p) => p.category === filters.category);
  }

  if (filters?.model) {
    prompts = prompts.filter((p) => p.model === filters.model);
  }

  if (filters?.tags && filters.tags.length > 0) {
    prompts = prompts.filter((p) => filters.tags?.some((tag) => p.tags.includes(tag)));
  }

  if (filters?.featured !== undefined) {
    prompts = prompts.filter((p) => p.featured === filters.featured);
  }

  return prompts
    .sort((a, b) => a.order - b.order)
    .map((prompt) => ({
      ...prompt,
      imageUrl: getPromptImageUrl(prompt.cloudinaryPublicId, 'card'),
    }));
}

export function getPromptById(id: string): PromptExample | undefined {
  const prompt = PROMPT_EXAMPLES.find((p) => p.id === id);
  if (!prompt) return undefined;

  return {
    ...prompt,
    imageUrl: getPromptImageUrl(prompt.cloudinaryPublicId, 'full'),
  };
}

export function getCategoryMetadata(category: PromptCategory) {
  return CATEGORY_METADATA.find((c) => c.id === category);
}

export function getAllCategories() {
  return CATEGORY_METADATA.sort((a, b) => a.order - b.order);
}

export function getPromptCountByCategory(category: PromptCategory): number {
  return PROMPT_EXAMPLES.filter((p) => p.category === category).length;
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  PROMPT_EXAMPLES.forEach((prompt) => {
    prompt.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

export function getCloudinaryFolderStructure() {
  return {
    baseFolder: 'prompt-library',
    categories: [
      'people-portraits',
      'animals-wildlife',
      'scenery-environment',
      'objects-products',
      'science-edu-tech',
      'fashion-lifestyle',
    ],
  };
}
