import { z } from 'zod';

export const CardActionSchema = z.object({
  type: z.enum(['Link', 'Button', 'Submit']),
  variant: z.string(),
  deep_link: z.string(),
});

export const CardSchema = z.object({
  id: z.string(),
  type: z.literal('Card'),
  variant: z.string(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  properties: z.object({
    text: z.string(),
    icon: z.string().optional(),
    action: CardActionSchema,
  }),
});

export type CardAction = z.infer<typeof CardActionSchema>;
export type Card = z.infer<typeof CardSchema>;
