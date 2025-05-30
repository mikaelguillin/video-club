import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "@/components/ui/provider"
import { BrowserRouter, Route, Routes } from 'react-router'
import PersonMovies from './PersonMovies.tsx'
import Layout from './Layout.tsx'
import PersonsList from './PersonsList.tsx'

import './index.css';


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
