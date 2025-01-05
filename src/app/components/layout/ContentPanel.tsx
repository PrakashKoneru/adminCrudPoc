import { ContentPanel as ContentPanelType } from '@/types';
import { Box, Flex, VStack, HStack, Grid } from '@chakra-ui/react';
import { Button } from '../button';
import { Card } from '../card';

interface ContentPanelProps {
  properties: ContentPanelType['properties'];
  children: ContentPanelType['children'];
}

export const ContentPanel = ({ properties, children }: ContentPanelProps) => {
  const { layout, gap, padding, alignment, direction } = properties;

  // Choose the appropriate Chakra component based on layout type
  const LayoutComponent = {
    stack: direction === 'vertical' ? VStack : HStack,
    flex: Flex,
    grid: Grid,
  }[layout];

  return (
    <Box 
      w={{ base: 'full', md: '50%' }}
      p={`${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`}
    >
      <LayoutComponent
        w="full"
        gap={`${gap}px`}
        align={getChakraAlignment(alignment)}
        flexWrap={layout === 'flex' ? 'wrap' : undefined}
        templateColumns={layout === 'grid' ? 'repeat(auto-fit, minmax(200px, 1fr))' : undefined}
      >
        {children.map((child) => {
          switch (child.type) {
            case 'Card':
              return <Card key={child.id} {...child} />;
            case 'Button':
              return <Button key={child.id} {...child} />;
            default:
              return null;
          }
        })}
      </LayoutComponent>
    </Box>
  );
};

// Helper function to convert alignment to Chakra UI values
const getChakraAlignment = (alignment: ContentPanelType['properties']['alignment']) => {
  switch (alignment) {
    case 'start':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'end':
      return 'flex-end';
    case 'space-between':
      return 'space-between';
    default:
      return 'flex-start';
  }
};
