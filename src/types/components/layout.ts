import { z } from 'zod';
import { ButtonSchema } from './button';
import { CardSchema } from './card';

// This will allow us to easily add more component types in the future
export const ComponentSchema = z.union([
  ButtonSchema,
  CardSchema,
  // Add more component schemas here as needed
]);

export const LayoutSchema = z.object({
  id: z.string(),
  type: z.literal('Layout'),
  variant: z.string(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  properties: z.object({
    imageUrl: z.string().url(),
    // Add any other layout-specific properties here
  }),
  children: z.array(ComponentSchema),
});

export type Layout = z.infer<typeof LayoutSchema>;
export type Component = z.infer<typeof ComponentSchema>;