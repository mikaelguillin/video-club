import { lazy, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "@/components/ui/provider"
import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from './components/Layout.tsx'

import './index.css';

const PersonsList = lazy(() => import('./components/PersonsList.tsx'))
const PersonMovies = lazy(() => import('./components/PersonMovies.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider enableSystem={false}>
        <Layout>
          <Routes>
            <Route path="/" element={<PersonsList />} />
            <Route path="/person/:personId/movies" element={<PersonMovies />} />
            <Route path="*" element={
              <div>
                <h1>404 - Page Not Found</h1>
                <p>The page you are looking for does not exist.</p>
              </div>
            } />
          </Routes>
        </Layout>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)
