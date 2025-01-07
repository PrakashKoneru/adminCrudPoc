/* eslint-disable */
// @ts-ignore 
import { Card as CardType } from '@/types';
import { 
  Box,
  Text,
  VStack,
} from '@chakra-ui/react';
import { defineStyleConfig } from '@chakra-ui/styled-system';
import { useRouter } from 'next/navigation';

// Define component-specific theme
// @ts-ignore 
export const cardTheme = defineStyleConfig({
  baseStyle: {
    container: {
      bg: "white",
      borderRadius: "xl",
      boxShadow: "lg",
      overflow: "hidden",
      cursor: "pointer",
      transition: "all 0.2s",
      border: "1px solid",
      borderColor: "gray.100",
    },
    body: {
      p: 6,
    },
    text: {
      fontSize: "lg",
      fontWeight: "medium",
      color: "gray.700",
      lineHeight: "tall",
    },
  },
  variants: {
    Default: {
      container: {
        _hover: {
          transform: "scale(1.02)",
          boxShadow: "xl",
        },
      },
    },
    Elevated: {
      container: {
        boxShadow: "xl",
        border: "none",
        _hover: {
          transform: "translateY(-4px)",
        },
      },
    },
  },
  defaultProps: {
    variant: "Default",
  },
});

interface CardProps extends CardType {
    gridArea: string
}

export const Card = ({ properties, variant, width, height, gridArea }: CardProps) => {
  const router = useRouter();
  const { text, action } = properties;

  const handleClick = () => {
    if (action.type === 'Link') {
      router.push(action.deep_link);
    }
  };

  return (
    <Box
      onClick={handleClick}
      w={width || 'auto'}
      h={height || 'auto'}
      gridArea={gridArea}
    >
      <VStack align="flex-start" h="full">
        <Box p={6}>
          <Text>{text}</Text>
        </Box>
      </VStack>
    </Box>
  );
};
