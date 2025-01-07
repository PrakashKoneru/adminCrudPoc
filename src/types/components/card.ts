import { z } from 'zod';

export const CardActionSchema = z.object({
  type: z.literal('Link'),
  variant: z.string(),
  deep_link: z.string()
});

export const CardSchema = z.object({
  id: z.string(),
  type: z.literal('Card'),
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
    action: CardActionSchema
  })
});

export type CardAction = z.infer<typeof CardActionSchema>;
export type Card = z.infer<typeof CardSchema>;
