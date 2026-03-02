import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Creators from './pages/Creators'
import Subscribe from './pages/Subscribe'
import Subscriptions from './pages/Subscriptions'
import PostDetail from './pages/PostDetail'
import NotFound from './pages/NotFound'
import Feed from './Views/Feed'
import CreatorProfile from './Views/CreatorProfile'
import UserProfile from './Views/UserProfile'
import BecomeCreator from './Views/BecomeCreator'
import Dashboard from './Views/Dashboard'
import NewPost from './Views/NewPost'
import Shop from './Views/Shop'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-8">
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/creators" element={<Creators />} />
                <Route path="/creators/:id" element={<CreatorProfile />} />
                <Route path="/posts/:id" element={<PostDetail />} />
                <Route path="/shop" element={<Shop />} />

                {/* Routes protégées */}
                <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
                <Route path="/subscribe/:creatorId" element={<ProtectedRoute><Subscribe /></ProtectedRoute>} />

                {/* Espace créateur */}
                <Route path="/become-creator" element={<ProtectedRoute><BecomeCreator /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/new-post" element={<ProtectedRoute><NewPost /></ProtectedRoute>} />
                <Route path="/dashboard/edit-post/:id" element={<ProtectedRoute><NewPost /></ProtectedRoute>} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
