/* eslint-disable */
// @ts-nocheck
"use client";

import { ChakraProvider, Flex, Input, Button, Box, Code, defaultSystem } from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { FaPlay } from "react-icons/fa";
import { mapAndExecuteTool } from "./lib/toolRegistry";
import { getLLMResponse } from "./lib/llmAgent";
import { data } from "framer-motion/client";
import { Layout } from './components/layout';

export default function Home() {
  const [command, setCommand] = useState("");
  const [outputs, setOutputs] = useState<Array<{ type: "user" | "system"; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [layoutData, setLayoutData] = useState<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [outputs, isLoading]);

  const handleCommand = async () => {
    if (!command.trim()) return;

    // Log the original command
    console.log('Original command:', command);

    setOutputs((prev) => [{ type: "user", content: command }, ...prev]);
    setCommand("");
    setIsLoading(true);
    setLayoutData(null);

    try {
      // Format command to ensure it's a valid string for JSON
      const sanitizedCommand = command
        .replace(/[\u2018\u2019]/g, "'") // Smart quotes to regular quotes
        .replace(/[\u201C\u201D]/g, '"') // Smart double quotes to regular quotes
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .trim();

      console.log('Sanitized command:', sanitizedCommand);

      const response = await getLLMResponse(sanitizedCommand);
      console.log('Raw response:', response);
      
      if (!response) {
        setOutputs((prev) => [
          { type: "system", content: "No response received." },
          ...prev,
        ]);
        return;
      }

      // First try to parse as JSON
      try {
        const parsedResponse = typeof response === 'string' 
          ? JSON.parse(response) 
          : response;

        console.log('Parsed response:', parsedResponse);

        setOutputs((prev) => [
          { type: "system", content: JSON.stringify(parsedResponse, null, 2) },
          ...prev,
        ]);

        if (parsedResponse.type === 'Layout') {
          setLayoutData(parsedResponse);
        }

      } catch (e) {
        console.error('JSON parsing error:', e);
        // If parsing fails, treat it as a plain text response
        setOutputs((prev) => [
          { type: "system", content: response.toString() },
          ...prev,
        ]);
      }

    } catch (error) {
      console.error("Error processing command:", error);
      setOutputs((prev) => [
        { type: "system", content: "Error processing your command. Please try again." },
        ...prev,
      ]);
    } finally {
      setIsLoading(false);
    }
  };
console.log('layoutData: ', layoutData);
  return (
    <ChakraProvider value={defaultSystem}>
      <Flex
        flexDirection="column"
        height="100vh"
        position="relative"
        bg="linear-gradient(to bottom, #0f172a, #1e293b)"
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "-ms-overflow-style": "none",
          scrollbarWidth: "none",
        }}
      >
        <Box
          width="100%"
          maxWidth="750px"
          height="calc(100vh - 100px)"
          overflowY="auto"
          mx="auto"
          px="20px"
          pt="20px"
          css={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
            "-ms-overflow-style": "none",
            scrollbarWidth: "none",
          }}
        >
          <Box
            width="100%"
            display="flex"
            flexDirection="column-reverse"
            minHeight="100%"
            css={{
              "&::-webkit-scrollbar": {
                display: "none",
              },
              "-ms-overflow-style": "none",
              scrollbarWidth: "none",
            }}
          >
            <div ref={messagesEndRef} />
            {isLoading && (
              <Box
                p="16px"
                bg="rgba(255, 255, 255, 0.05)"
                borderRadius="12px"
                width="fit-content"
                maxWidth="85%"
                mb="16px"
                mr="auto"
                backdropFilter="blur(10px)"
                border="1px solid rgba(255, 255, 255, 0.1)"
                boxShadow="0 0 15px rgba(255, 255, 255, 0.05)"
              >
                <Code
                  display="block"
                  whiteSpace="pre-wrap"
                  width="100%"
                  bg="transparent"
                  p="0"
                  fontSize="14px"
                  lineHeight="1.7"
                  letterSpacing="0.3px"
                  color="gray.100"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  Thinking...
                </Code>
              </Box>
            )}
            {outputs.map((output, index) => (
              <Box
                key={index}
                p="16px"
                bg={
                  output.type === "user"
                    ? "rgba(56, 189, 248, 0.1)"
                    : "rgba(255, 255, 255, 0.05)"
                }
                borderRadius="12px"
                width="fit-content"
                maxWidth={output.type === "user" ? "70%" : "85%"}
                mb="16px"
                ml={output.type === "user" ? "auto" : "0"}
                mr={output.type === "user" ? "0" : "auto"}
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor={
                  output.type === "user"
                    ? "rgba(56, 189, 248, 0.2)"
                    : "rgba(255, 255, 255, 0.1)"
                }
                boxShadow={`0 0 15px ${
                  output.type === "user"
                    ? "rgba(56, 189, 248, 0.1)"
                    : "rgba(255, 255, 255, 0.05)"
                }`}
              >
                <Code
                  display="block"
                  whiteSpace="pre-wrap"
                  width="100%"
                  bg="transparent"
                  p="0"
                  fontSize="14px"
                  lineHeight="1.7"
                  letterSpacing="0.3px"
                  color={
                    output.type === "user" ? "cyan.100" : "gray.100"
                  }
                  fontFamily="'JetBrains Mono', monospace"
                  sx={{
                    "& > *": {
                      marginBottom: "8px",
                    },
                    "& > *:last-child": {
                      marginBottom: 0,
                    },
                  }}
                >
                  {output.content}
                </Code>
              </Box>
            ))}
          </Box>
          <Box>
          {layoutData && (
            <Layout data={layoutData} />
          )}
          </Box>
        </Box>
        <Box
          position="fixed"
          bottom="0"
          left="0"
          right="0"
          p="20px"
          bg="rgba(15, 23, 42, 0.8)"
          backdropFilter="blur(10px)"
          borderTop="1px solid rgba(56, 189, 248, 0.1)"
        >
          <Flex position="relative" maxWidth="600px" mx="auto">
            <Input
              pr="50px"
              pl="20px"
              height="45px"
              borderRadius="100px"
              bg="rgba(255, 255, 255, 0.05)"
              border="1px solid rgba(56, 189, 248, 0.2)"
              color="gray.100"
              _hover={{ borderColor: "cyan.400" }}
              _focus={{
                borderColor: "cyan.400",
                boxShadow: "0 0 15px rgba(56, 189, 248, 0.2)",
              }}
              _placeholder={{ color: "gray.400" }}
              placeholder="Ask me anything..."
              fontFamily="'JetBrains Mono', monospace"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
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
              color="cyan.200"
              _hover={{ bg: "rgba(56, 189, 248, 0.1)" }}
              _active={{ bg: "rgba(56, 189, 248, 0.2)" }}
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
