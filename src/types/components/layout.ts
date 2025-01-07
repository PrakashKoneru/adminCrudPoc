import { z } from 'zod';
import { ButtonSchema } from './button';
import { CardSchema } from './card';

// This will allow us to easily add more component types in the future
export const ComponentSchema = z.union([
  ButtonSchema,
  CardSchema,
  // Add more component schemas here as needed
]);

export const ImagePanelSchema = z.object({
    type: z.literal('ImagePanel'),
    properties: z.object({
        images: z.object({
            desktop: z.object({
                url: z.string().url(),
                width: z.union([z.number(), z.string()]),
                height: z.union([z.number(), z.string()])
            }),
            tablet: z.object({
                url: z.string().url(),
                width: z.union([z.number(), z.string()]),
                height: z.union([z.number(), z.string()])
            }),
            mobile: z.object({
                url: z.string().url(),
                width: z.union([z.number(), z.string()]),
                height: z.union([z.number(), z.string()])
            })
        }),
        fit: z.enum(['cover', 'contain', 'fill']).default('cover')
    })
});

export const ContentPanelSchema = z.object({
    type: z.literal('ContentPanel'),
    properties: z.object({
        layout: z.object({
            display: z.literal('grid'),
            columns: z.number().default(12),
            rows: z.number(),
            width: z.number()
        })
    }),
    children: z.array(z.union([CardSchema, ButtonSchema])).default([])
});

export const LayoutSchema = z.object({
    id: z.string(),
    type: z.literal('Layout'),
    variant: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    properties: z.object({
        responsive: z.object({
            breakpoint: z.number().default(768)
        }),
        backgroundColor: z.object({
            r: z.number(),
            g: z.number(),
            b: z.number(),
            a: z.number()
        }).optional(),
    }),
    panels: z.object({
        left: ImagePanelSchema,
        right: ContentPanelSchema
    })
});

export type Layout = z.infer<typeof LayoutSchema>;
export type ImagePanel = z.infer<typeof ImagePanelSchema>;
export type ContentPanel = z.infer<typeof ContentPanelSchema>;