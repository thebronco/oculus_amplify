import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: '#161d26',
        color: '#D5DBDB',
      },
    },
  },
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#5294CF', // Primary brand color
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    background: {
      primary: '#161d26',
      secondary: '#1A2332',
      card: '#37475A',
      cardHover: '#3E5266',
    },
    border: {
      default: '#4A5F7A',
      hover: '#5A6F8A',
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: '#161d26',
          borderColor: '#4A5F7A',
        },
      },
    },
  },
});

export default theme;

