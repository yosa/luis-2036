import '@fontsource-variable/fredoka'
import '@fontsource-variable/nunito'
import './styles/main.sass'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from './app/router'

const container = document.getElementById('root')
if (!container) throw new Error('No existe el contenedor #root')

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
