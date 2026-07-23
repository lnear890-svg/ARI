import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import CallInterface from './pages/CallInterface'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/call/:callId" element={<CallInterface />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
