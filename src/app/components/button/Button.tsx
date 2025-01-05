import { Button as ButtonType } from '@/types';
import { Button as ChakraButton, Icon } from '@chakra-ui/react';
import { defineStyle, defineStyleConfig } from '@chakra-ui/styled-system';
import { useRouter } from 'next/navigation';

// Define component-specific theme
export const buttonTheme = defineStyleConfig({
  baseStyle: {
    fontWeight: "medium",
    borderRadius: "lg",
    px: 6,
    py: 4,
    transition: "all 0.2s",
    boxShadow: "md",
    textTransform: "capitalize",
  },
  variants: {
    Default: {
      bg: "blue.500",
      color: "white",
      _hover: {
        bg: "blue.600",
        transform: "translateY(-2px)",
        boxShadow: "lg",
      },
      _active: {
        bg: "blue.700",
        transform: "translateY(0)",
      },
    },
    Secondary: {
      bg: "gray.100",
      color: "gray.800",
      _hover: {
        bg: "gray.200",
        transform: "translateY(-2px)",
        boxShadow: "lg",
      },
      _active: {
        bg: "gray.300",
        transform: "translateY(0)",
      },
    },
  },
  defaultProps: {
    variant: "Default",
  },
});

interface ButtonProps extends ButtonType {}

export const Button = ({ properties, variant, width, height }: ButtonProps) => {
  const router = useRouter();
  const { text, icon, action } = properties;

  const handleClick = () => {
    if (action.type === 'Link') {
      router.push(action.deep_link);
    }
  };

  return (
    <ChakraButton
      onClick={handleClick}
      variant={variant}
      w={width || 'auto'}
      h={height || 'auto'}
      leftIcon={icon ? <Icon as={icon} /> : undefined}
    >
      {text}
    </ChakraButton>
  );
};
