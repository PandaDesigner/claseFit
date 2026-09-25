import { designTokens } from './tokens';

export function categoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'spinning':
      return designTokens.color.categorySpinning;
    case 'yoga':
      return designTokens.color.categoryYoga;
    case 'rumba':
      return designTokens.color.categoryRumba;
    case 'funcional':
      return designTokens.color.categoryFunctional;
    default:
      return designTokens.color.categoryFunctional;
  }
}
