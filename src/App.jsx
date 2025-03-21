import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FormulaInput from './components/FormulaInput'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient()

function App() {
  const [count, setCount] = useState(0)

  return (
    <QueryClientProvider client={queryClient}>
      <>
      <h1>Recruitment Task</h1>
      <h3>Lucid Financials</h3>
     
        <FormulaInput />
     
      </>
    </QueryClientProvider>
  )
}

export default App
