/* eslint-disable */
// @ts-nocheck

import { Button as ButtonType } from '@/types';
import { Button as ChakraButton, Icon } from '@chakra-ui/react';
import { defineStyle, defineStyleConfig } from '@chakra-ui/styled-system';
import { useRouter } from 'next/navigation';

// Define component-specific theme
export const buttonTheme = defineStyleConfig({
  baseStyle: {
    width: "150px",
    height: "40px",
    minHeight: "40px",
    maxHeight: "40px",
    bg: "blue.500",
    color: "white",
    borderRadius: "lg",
    padding: 0,
    _hover: {
      bg: "blue.600",
    },
    _active: {
      bg: "blue.700",
    }
  }
});

interface ButtonProps extends ButtonType {}

export const Button = ({ properties, width, height }: ButtonProps) => {
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
      w="150px"
      h="40px"
      minH="40px"
      maxH="40px"
      p={0}
      leftIcon={icon ? <Icon as={icon} /> : undefined}
    >
      {text}
    </ChakraButton>
  );
};
