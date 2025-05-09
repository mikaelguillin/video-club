import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "@/components/ui/provider"
// import './index.css'
import App from './App.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import PersonMovies from './PersonMovies.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/person/:personId/movies" element={<PersonMovies />} />
        </Routes>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)
