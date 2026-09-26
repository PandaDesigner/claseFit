import type { ImageSourcePropType } from 'react-native';
import { designTokens } from './tokens';

const yogaAsset: ImageSourcePropType = require('../../../assets/yoga.png');
const danceAsset: ImageSourcePropType = require('../../../assets/dance.png');
const biciAsset: ImageSourcePropType = require('../../../assets/bici.png');
const exampleAsset: ImageSourcePropType = require('../../../assets/example.png');

const camilaAvatar: ImageSourcePropType = require('../../../assets/avatar/e9ae0ba8-9040-4a7f-b0c1-395cc5785d01.jpeg');
const valentinaAvatar: ImageSourcePropType = require('../../../assets/avatar/4f644e0e-da23-4f58-8c22-06a2a5ad65e6.jpeg');
const julianAvatar: ImageSourcePropType = require('../../../assets/avatar/c90435a0-013a-41e6-bafc-6120ea7cd2a8.jpeg');
const andresAvatar: ImageSourcePropType = require('../../../assets/avatar/24dceb8b-8f0d-40ce-a579-b3bd05b13d8a.jpeg');

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

export function categoryAsset(category: string): ImageSourcePropType | null {
  switch (category.toLowerCase()) {
    case 'spinning':
      return biciAsset;
    case 'yoga':
      return yogaAsset;
    case 'rumba':
      return danceAsset;
    case 'funcional':
      return exampleAsset;
    default:
      return null;
  }
}

export type InstructorGender = 'female' | 'male';

const femaleInstructors: Record<string, true> = {
  'Camila Ospina': true,
  'Valentina Ríos': true,
};

const instructorAvatarMap: Record<string, ImageSourcePropType> = {
  'Camila Ospina': camilaAvatar,
  'Valentina Ríos': valentinaAvatar,
  'Julián Mejía': julianAvatar,
  'Andrés Restrepo': andresAvatar,
};

export function instructorGender(name: string): InstructorGender {
  return femaleInstructors[name] === true ? 'female' : 'male';
}

export function instructorAvatar(name: string): ImageSourcePropType | null {
  return instructorAvatarMap[name] ?? null;
}
