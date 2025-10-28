'use client';

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { Amplify } from 'aws-amplify';
import amplifyConfig from '../amplify_outputs.json';
import theme from './theme';

// Configure Amplify
Amplify.configure(amplifyConfig);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </>
  );
}

