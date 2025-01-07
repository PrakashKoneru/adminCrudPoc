import { z } from 'zod';

export const GridSchema = z.object({
  colStart: z.number(),
  colSpan: z.number(),
  rowStart: z.number(),
  rowSpan: z.number().optional()
});

export type Grid = z.infer<typeof GridSchema>;
