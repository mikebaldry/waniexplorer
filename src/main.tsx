import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import './styles.scss'
import App from './App.tsx'
import Loader from './components/graph/Loader.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/v/:type/:id" element={<Loader />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
