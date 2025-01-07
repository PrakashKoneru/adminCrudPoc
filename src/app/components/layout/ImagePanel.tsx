import { ImagePanel as ImagePanelType } from '@/types/components/layout';
import { Box, Image } from '@chakra-ui/react';

interface ImagePanelProps {
  properties: ImagePanelType['properties'];
}

export const ImagePanel = ({ properties }: ImagePanelProps) => {
  const { images, fit } = properties;

  return (
    <Box 
      position="relative"
      w={images.desktop.width}
      h={images.desktop.height}
    >
      <Image
        src={images.desktop.url}
        alt=""
        w={{
          base: images.mobile.width,
          sm: images.tablet.width,
          md: images.desktop.width
        }}
        h={{
          base: images.mobile.height,
          sm: images.tablet.height,
          md: images.desktop.height
        }}
        objectFit={fit}
        loading="eager"
      />
    </Box>
  );
};
