import { Layout as LayoutType } from '@/types';
import { Box, Flex } from '@chakra-ui/react';
import { ImagePanel } from './ImagePanel';
import { ContentPanel } from './ContentPanel';

interface LayoutProps {
  data: LayoutType;
}

export const Layout = ({ data }: LayoutProps) => {
  const { panels, properties } = data;

  return (
    <Flex
      w="full"
      direction={{ base: 'column', md: 'row' }}
      bg={properties.backgroundColor}
    >
      <ImagePanel {...panels.left} />
      <ContentPanel {...panels.right} />
    </Flex>
  );
};
