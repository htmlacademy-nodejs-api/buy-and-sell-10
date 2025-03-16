import {
  defaultClasses,
  getModelForClass,
  modelOptions,
  prop
} from '@typegoose/typegoose';

import { Category } from '../../types/index.js';

export interface CategoryEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'categories',
    timestamps: true,
  }
})
export class CategoryEntity extends defaultClasses.TimeStamps implements Category {
  @prop({required: true, trim: true})
  public name!: string;

  @prop({required: true, trim: true})
  public image: string;
}

export const CategoryModel = getModelForClass(CategoryEntity);
