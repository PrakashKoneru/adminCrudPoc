"use client";

import { ChakraProvider, Flex, Input, Button, Box, Code, defaultSystem } from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { getLLMResponse } from "./lib/llmAgent";
import { FaPlay } from "react-icons/fa";

export default function Home() {
  const [command, setCommand] = useState("");
  const [outputs, setOutputs] = useState<Array<{type: 'user' | 'llm', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [outputs, isLoading]);

  const handleCommand = async () => {
    if (!command.trim()) {
      return;
    }

    // Add user message to the end of the array
    setOutputs(prev => [...prev, {type: 'user', content: command}]);
    
    // Clear input after sending
    setCommand("");
    
    setIsLoading(true);

    try {
      const llmResponse = await getLLMResponse(command);
      console.log(llmResponse);
      
      // Add LLM response to the end of the array
      setOutputs(prev => [...prev, {type: 'llm', content: llmResponse}]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChakraProvider value={defaultSystem}>
      <Flex
        flexDirection="column"
        height="100vh"
        position="relative"
      >
        <Box
          width="100%"
          maxWidth="600px"
          height="calc(100vh - 100px)"
          overflowY="auto"
          mx="auto"
          px="20px"
          pt="20px"
          sx={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray.200',
              borderRadius: '24px',
            },
          }}
        >
          <Box
            width="100%"
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
          >
            {outputs.map((output, index) => (
              <Box 
                key={index}
                p="10px" 
                bg={output.type === 'user' ? 'blue.50' : 'gray.100'} 
                borderRadius="10px" 
                width="fit-content"
                maxWidth={output.type === 'user' ? '70%' : '85%'}
                mb="10px"
                ml={output.type === 'user' ? 'auto' : '0'}
                mr={output.type === 'user' ? '0' : 'auto'}
              >
                <Code 
                  display="block"
                  whiteSpace="pre-wrap"
                  width="100%"
                  bg="transparent"
                  p="0"
                  fontSize="sm"
                >
                  {output.content}
                </Code>
              </Box>
            ))}
            {isLoading && (
              <Box 
                p="10px" 
                bg="gray.100" 
                borderRadius="10px" 
                width="fit-content"
                maxWidth="85%"
                mb="10px"
                mr="auto"
              >
                <Code 
                  display="block"
                  whiteSpace="pre-wrap"
                  width="100%"
                  bg="transparent"
                  p="0"
                  fontSize="sm"
                >
                  Thinking...
                </Code>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
        </Box>

        <Box
          position="fixed"
          bottom="0"
          left="0"
          right="0"
          p="20px"
          bg="white"
          borderTop="1px solid"
          borderColor="gray.100"
        >
          <Flex
            position="relative"
            maxWidth="600px"
            mx="auto"
          >
            <Input
              pr="50px"
              pl="20px"
              height="45px"
              borderRadius="100px"
              boxShadow="md"
              _hover={{ borderColor: "gray.400" }}
              _focus={{ borderColor: "gray.400" }}
              _placeholder={{ color: "gray.500" }}
              placeholder="I'm An Agent, ask me anything"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCommand();
                }
              }}
            />
            <Button
              position="absolute"
              right="4px"
              top="50%"
              transform="translateY(-50%)"
              size="sm"
              borderRadius="full"
              onClick={handleCommand}
              bg="transparent"
              color="gray.600"
              _hover={{ bg: "gray.100" }}
              _active={{ bg: "gray.200" }}
              width="35px"
              height="35px"
              p="0"
            >
              <FaPlay size="12px" />
            </Button>
          </Flex>
        </Box>
      </Flex>
    </ChakraProvider>
  );
}
