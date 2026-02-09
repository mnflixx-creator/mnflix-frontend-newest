import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Browse from './pages/Browse'
import MovieDetail from './pages/MovieDetail'
import Player from './pages/Player'
import Watch from './pages/Watch'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Layout from './components/layout/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/search" element={<Browse />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/series/:id" element={<MovieDetail />} />
          <Route path="/anime/:id" element={<MovieDetail />} />
          <Route path="/kdrama/:id" element={<MovieDetail />} />
          <Route path="/cdrama/:id" element={<MovieDetail />} />
          <Route path="/play/:id" element={<Player />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profiles" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/my-list" element={<Browse />} />
          <Route path="/movies" element={<Browse />} />
          <Route path="/new" element={<Browse />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
