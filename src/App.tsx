import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import { CallProvider } from './context/CallContext'
import Sidebar from './components/Sidebar'
import ToastContainer from './components/ToastContainer'
import GlobalCallUI from './components/GlobalCallUI'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Creators from './pages/Creators'
import Subscribe from './pages/Subscribe'
import PostDetail from './pages/PostDetail'
import GoodieDetail from './pages/GoodieDetail'
import Notifications from './pages/Notifications'
import NotFound from './pages/NotFound'
import Feed from './Views/Feed'
import CreatorProfile from './Views/CreatorProfile'
import UserProfile from './Views/UserProfile'
import UserPublicProfile from './Views/UserPublicProfile'
import Dashboard from './Views/Dashboard'
import NewPost from './Views/NewPost'
import Shop from './Views/Shop'
import Messages from './pages/Messages'
import Chat from './Views/Chat'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
        <CallProvider>
        <BrowserRouter>
          <div className="min-h-screen">
            <Sidebar />
            <ToastContainer />
            <GlobalCallUI />
            <main className="lg:ml-[240px] min-h-screen pt-14 lg:pt-0">
              <div className="max-w-4xl mx-auto px-6 py-8">
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/creators" element={<Creators />} />
                <Route path="/creators/:id" element={<CreatorProfile />} />
                <Route path="/posts/:id" element={<PostDetail />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:id" element={<GoodieDetail />} />
                <Route path="/users/:id" element={<UserPublicProfile />} />

                {/* Routes protégées */}
                <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/profile/edit" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/subscribe/:creatorId" element={<ProtectedRoute><Subscribe /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                {/* Espace créateur */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/new-post" element={<ProtectedRoute><NewPost /></ProtectedRoute>} />
                <Route path="/dashboard/edit-post/:id" element={<ProtectedRoute><NewPost /></ProtectedRoute>} />

                {/* Messages */}
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/messages/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            </main>
          </div>
        </BrowserRouter>
        </CallProvider>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
