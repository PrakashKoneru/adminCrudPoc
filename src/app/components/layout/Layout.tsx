import { Layout as LayoutType } from '@/types/components/layout';
import { Flex } from '@chakra-ui/react';
import { ImagePanel } from './ImagePanel';
import { ContentPanel } from './ContentPanel';

interface LayoutProps {
  data: LayoutType;
}

export const Layout = ({ data }: LayoutProps) => {
  const { panels, properties, width, height } = data;

  return (
    <Flex
      w={width}
      h={height}
      direction={{ base: 'column', md: 'row' }}
      bg={properties.backgroundColor}
    >
      <ImagePanel {...panels.left} />
      <ContentPanel {...panels.right} />
    </Flex>
  );
};
