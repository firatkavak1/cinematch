/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { createBrowserRouter, Outlet, RouterProvider, NavLink } from 'react-router-dom';
import { useMemo } from 'react';

import { theme } from './styles/theme';
import { Home } from './routes/home/Home';
import { Random } from './routes/random/Random';
import { Search } from './routes/search/Search';

const layout = css`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const nav = css`
  border-bottom: 1px solid ${theme.colors.border};
  background: ${theme.colors.bg.secondary};
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const navInner = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const logo = css`
  font-family: ${theme.fonts.heading};
  font-size: 1.3rem;
  color: ${theme.colors.accent.gold};
  font-weight: 700;
  text-decoration: none;

  &:hover {
    color: ${theme.colors.accent.gold};
  }
`;

const navLinks = css`
  display: flex;
  gap: ${theme.spacing.lg};
`;

const navLink = css`
  color: ${theme.colors.text.secondary};
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: ${theme.radii.full};
  transition: all 0.2s ease;

  &:hover {
    color: ${theme.colors.text.primary};
    background: ${theme.colors.bg.hover};
  }

  &.active {
    color: ${theme.colors.accent.gold};
    background: ${theme.colors.accent.gold}12;
  }
`;

const main = css`
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
`;

function Layout() {
  return (
    <div css={layout}>
      <header css={nav}>
        <div css={navInner}>
          <NavLink to="/" css={logo}>
            CineMatch
          </NavLink>
          <nav css={navLinks}>
            <NavLink to="/random" css={navLink}>
              Surprise Me
            </NavLink>
            <NavLink to="/search" css={navLink}>
              Search
            </NavLink>
          </nav>
        </div>
      </header>
      <main css={main}>
        <Outlet />
      </main>
    </div>
  );
}

export function App() {
  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          element: <Layout />,
          children: [
            { path: '/', element: <Home /> },
            { path: '/random', element: <Random /> },
            { path: '/search', element: <Search /> },
          ],
        },
      ]),
    [],
  );

  return <RouterProvider router={router} />;
}
