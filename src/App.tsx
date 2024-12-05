import React from "react";
import { ChakraProvider, Box, Heading, Flex, Link, Image, Text } from "@chakra-ui/react";
import reactLogo from "./assets/react.svg";
import tiptapLogo from "./assets/tiptap.svg";
import Example  from "./Example3";
import viteLogo from "/vite.svg";

function App() {
    return (
        <ChakraProvider>
            <Box textAlign="center" p={5}>
                {/* Logo Links */}
                <Flex justifyContent="center" gap={6} mb={5}>
                    <Link href="https://vitejs.dev" isExternal>
                        <Image src={viteLogo} boxSize="50px" alt="Vite logo" />
                    </Link>
                    <Link href="https://reactjs.org" isExternal>
                        <Image src={reactLogo} boxSize="50px" alt="React logo" />
                    </Link>
                    <Link href="https://tiptap.dev" isExternal>
                        <Image src={tiptapLogo} boxSize="50px" alt="Tiptap logo" />
                    </Link>
                </Flex>

                {/* Heading */}
                <Heading as="h1" size="2xl" mb={5}>
                    Vite + React + Tiptap
                </Heading>

                {/* Editor Card */}
                <Box
                    maxWidth="800px"
                    mx="auto"
                    p={6}
                    borderWidth="1px"
                    borderRadius="lg"
                    boxShadow="lg"
                    bg="white"
                >
                    <Example />
                </Box>

                {/* Footer Text */}
                <Text mt={6} fontSize="sm" color="gray.500">
                    Click on the Vite, React, and Tiptap logos to learn more
                </Text>
            </Box>
        </ChakraProvider>
    );
}

export default App;
