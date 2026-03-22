import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/auth/Login'
import ProfileSetup from './pages/ProfileSetup'
import DateCode from './pages/DateCode'
import MatchCode from './pages/MatchCode'
import Schedule from './pages/Schedule'
import Results from './pages/Results'

import OnboardBasic from './pages/onboarding/OnboardBasic'
import OnboardQuestions from './pages/onboarding/OnboardQuestions'
import OnboardPersonality from './pages/onboarding/OnboardPersonality'

import GuestQuestions from './pages/guest/GuestQuestions'
import GuestResults from './pages/guest/GuestResults'

import SecretPlanner from './pages/planner/SecretPlanner'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* New landing */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Path A — full onboarding */}
          <Route path="/onboard" element={<OnboardBasic />} />
          <Route path="/onboard/questions" element={<OnboardQuestions />} />
          <Route path="/onboard/personality" element={<OnboardPersonality />} />

          {/* Path B — guest */}
          <Route path="/guest" element={<GuestQuestions />} />
          <Route path="/guest/results" element={<GuestResults />} />

          {/* Secret Planner — protected */}
          <Route path="/planner" element={<ProtectedRoute><SecretPlanner /></ProtectedRoute>} />

          {/* Legacy flow */}
          <Route path="/setup" element={<ProfileSetup />} />
          <Route path="/code/:code" element={<DateCode />} />
          <Route path="/match/:partnerCode" element={<MatchCode />} />
          <Route path="/schedule/:codeA/:codeB" element={<Schedule />} />
          <Route path="/results/:codeA/:codeB" element={<Results />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
