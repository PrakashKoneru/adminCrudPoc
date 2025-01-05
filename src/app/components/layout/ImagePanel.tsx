import { ImagePanel as ImagePanelType } from '@/types';
import { Box, Image } from '@chakra-ui/react';

interface ImagePanelProps {
  properties: ImagePanelType['properties'];
}

export const ImagePanel = ({ properties }: ImagePanelProps) => {
  const { imageUrl, width, height, fit, aspectRatio } = properties;

  return (
    <Box 
      position="relative"
      w={{ base: 'full', md: '50%' }}
      h="full"
    >
      <Image
        src={imageUrl}
        alt=""
        w="full"
        h="full"
        objectFit={fit}
        loading="eager"
      />
    </Box>
  );
};
