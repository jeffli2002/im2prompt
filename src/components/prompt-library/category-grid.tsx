import { CategoryCard } from './category-card';
import { CATEGORY_METADATA, PROMPT_EXAMPLES } from '@/config/prompt-library.config';

export function CategoryGrid() {
  const getPromptCount = (categoryId: string) => {
    return PROMPT_EXAMPLES.filter(p => p.category === categoryId).length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {CATEGORY_METADATA.map(category => (
        <CategoryCard
          key={category.id}
          category={category}
          promptCount={getPromptCount(category.id)}
        />
      ))}
    </div>
  );
}
