import type { Category } from './types';

/**
 * Build hierarchical category options with proper indentation for dropdowns
 * @param categories Array of all categories
 * @returns Array of JSX option elements with proper indentation
 */
export const buildCategoryOptions = (categories: Category[]) => {
  const categoryMap = new Map<string, Category>();
  const rootCategories: Category[] = [];
  
  // Create a map of all categories
  categories.forEach(cat => {
    categoryMap.set(cat.id, cat);
  });
  
  // Find root categories
  categories.forEach(cat => {
    if (cat.parentId === 'root' || !cat.parentId) {
      rootCategories.push(cat);
    }
  });
  
  // Sort root categories by order
  rootCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  const buildOptions = (parentCategories: Category[], level = 0): JSX.Element[] => {
    const options: JSX.Element[] = [];
    
    parentCategories.forEach(category => {
      // Add current category
      const indent = '  '.repeat(level);
      options.push(
        <option
          key={category.id}
          value={category.id}
          style={{ background: '#161d26' }}
        >
          {indent}{category.icon} {category.name}
        </option>
      );
      
      // Find and add subcategories
      const subcategories = categories
        .filter(cat => cat.parentId === category.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      if (subcategories.length > 0) {
        options.push(...buildOptions(subcategories, level + 1));
      }
    });
    
    return options;
  };
  
  return buildOptions(rootCategories);
};

