import { z } from 'zod';

export const ButtonActionSchema = z.object({
  type: z.enum(['Link', 'Button', 'Submit']),
  variant: z.string(),
  deep_link: z.string(),
});

export const ButtonSchema = z.object({
  id: z.string(),
  type: z.literal('Button'),
  variant: z.string(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  properties: z.object({
    text: z.string(),
    icon: z.string().optional(),
    action: ButtonActionSchema,
  }),
});

export type ButtonAction = z.infer<typeof ButtonActionSchema>;
export type Button = z.infer<typeof ButtonSchema>;