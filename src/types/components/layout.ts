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
    type: z.literal('ImagePanel'),     // Must be exactly 'ImagePanel'
    properties: z.object({
        imageUrl: z.string().url(),      // Must be a valid URL
        width: z.number(),               // Image width
        height: z.number(),              // Image height
        aspectRatio: z.string().optional(), // Optional aspect ratio (e.g., "16:9")
        fit: z.enum(['cover', 'contain', 'fill']).default('cover'),
    })
});

export const ContentPanelSchema = z.object({
    type: z.literal('ContentPanel'),   // Must be exactly 'ContentPanel'
    properties: z.object({
        layout: z.enum(['grid', 'stack', 'flex']),  // How children are arranged
        gap: z.number(),                 // Space between children
        padding: z.object({              // Space around content
            top: z.number(),
            right: z.number(),
            bottom: z.number(),
            left: z.number(),
        }),
        alignment: z.enum(['start', 'center', 'end', 'space-between']),  // How content aligns
        direction: z.enum(['vertical', 'horizontal']),  // Stack direction
    }),
    children: z.array(ComponentSchema).default([])  // Changed from min(1) to default([])
});

export const LayoutSchema = z.object({
    id: z.string(),
    type: z.literal('Layout'),
    variant: z.string(),
    properties: z.object({
        responsive: z.object({
            breakpoint: z.number().default(768),
            mobileLayout: z.enum(['stacked', 'hidden-image']).default('stacked'),
        }),
        backgroundColor: z.object({
            r: z.number(),
            g: z.number(),
            b: z.number(),
            a: z.number(),
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