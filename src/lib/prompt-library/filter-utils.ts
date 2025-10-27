import type { PromptExample, PromptFilters } from '@/types/prompt-library';

export function filterPrompts(prompts: PromptExample[], filters: PromptFilters): PromptExample[] {
  return prompts
    .filter((prompt) => {
      if (filters.category && filters.category !== 'all' && prompt.category !== filters.category) {
        return false;
      }

      if (filters.model && filters.model !== 'all' && prompt.model !== filters.model) {
        return false;
      }

      if (filters.featured && !prompt.featured) {
        return false;
      }

      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) => prompt.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = prompt.title.toLowerCase().includes(searchLower);
        const matchesPrompt = prompt.prompt.toLowerCase().includes(searchLower);
        const matchesTags = prompt.tags.some((tag) => tag.toLowerCase().includes(searchLower));

        if (!matchesTitle && !matchesPrompt && !matchesTags) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'featured':
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.order - b.order;

        case 'alphabetical':
          return a.title.localeCompare(b.title);

        default:
          return a.order - b.order;
      }
    });
}

export function parseFiltersFromURL(searchParams: URLSearchParams): PromptFilters {
  return {
    category: (searchParams.get('category') as any) || undefined,
    model: (searchParams.get('model') as any) || undefined,
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
    featured: searchParams.get('featured') === 'true' || undefined,
    search: searchParams.get('search') || undefined,
    sortBy: (searchParams.get('sortBy') as any) || undefined,
  };
}

export function getActiveFilterCount(filters: PromptFilters): number {
  return Object.values(filters).filter(
    (value) =>
      value !== undefined && value !== 'all' && (Array.isArray(value) ? value.length > 0 : true)
  ).length;
}

export function getAllUniqueTags(prompts: PromptExample[]): string[] {
  const tags = new Set<string>();
  prompts.forEach((prompt) => {
    prompt.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}
