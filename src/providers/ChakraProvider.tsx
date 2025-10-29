'use client';

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        'color.sell': {
          value: 'red',
        },
        'color.buy': {
          value: 'green',
        },
      },
    },
    semanticTokens: {
      colors: {
        'bg.primary': {
          value: {
            base: 'colors.gray.50',
            _dark: 'colors.gray.900',
          }
        },
      },
    },
  },
})

export function UIProvider({ children }: { children: React.ReactNode }) {
  const defaultSystem = createSystem(defaultConfig, config);
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
}