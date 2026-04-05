import { css, Global } from '@emotion/react';

import { theme } from './theme';

export const globalStyles = (
  <Global
    styles={css`
      *,
      *::before,
      *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html {
        font-size: 16px;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      body {
        font-family: ${theme.fonts.body};
        background-color: ${theme.colors.bg.primary};
        color: ${theme.colors.text.primary};
        line-height: 1.6;
        min-height: 100vh;
      }

      #root {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      a {
        color: ${theme.colors.accent.blue};
        text-decoration: none;
      }

      button {
        cursor: pointer;
        font-family: inherit;
      }

      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: ${theme.colors.bg.secondary};
      }

      ::-webkit-scrollbar-thumb {
        background: ${theme.colors.border};
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: ${theme.colors.text.muted};
      }
    `}
  />
);
