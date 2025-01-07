import { z } from 'zod';

export const ButtonActionSchema = z.object({
  type: z.literal('Button'),
  variant: z.string(),
  onClick: z.string()
});

export const ButtonSchema = z.object({
  id: z.string(),
  type: z.literal('Button'),
  variant: z.string(),
  width: z.number(),
  height: z.number(),
  grid: z.object({
    colStart: z.number(),
    colSpan: z.number(),
    rowStart: z.number(),
    rowSpan: z.number().optional()
  }),
  properties: z.object({
    text: z.string(),
    icon: z.string().optional(),
    action: ButtonActionSchema
  })
});

export type ButtonAction = z.infer<typeof ButtonActionSchema>;
export type Button = z.infer<typeof ButtonSchema>;