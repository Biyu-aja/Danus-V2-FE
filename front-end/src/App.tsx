
import { Route, Router, RouterProvider } from 'react-router-dom'
import './App.css'
import Auth from './pages/General/Auth'
import Routes from './routes/route'

function App() {
  return(
    <RouterProvider router={Routes}/>
  )
}

export default App
