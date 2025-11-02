"use client"

import { useAuth } from "@/lib/auth-context"
import { ArrowRight, Check, Menu, Shield, Users, X, Zap, QrCode, IdCard } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LoginModal } from "./login/LoginModal"

export default function Home() {
  const router = useRouter()
  const auth = useAuth()
  const { user } = auth
  const isLoading = (auth as { isLoading?: boolean }).isLoading ?? false
  const isAuthenticated = !!user
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-lg z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <IdCard className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">STAMPiFY</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-purple-400 transition">Features</a>
              <a href="#solutions" className="hover:text-purple-400 transition">Solutions</a>
              <a href="#pricing" className="hover:text-purple-400 transition">Pricing</a>
              <button 
                onClick={() => { setIsRegister(false); setShowLoginModal(true); }}
                className="text-purple-400 hover:text-purple-300 transition"
              >
                Login
              </button>
              <button 
                onClick={() => { setIsRegister(true); setShowLoginModal(true); }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-4">
              <a href="#features" className="block hover:text-purple-400 transition">Features</a>
              <a href="#solutions" className="block hover:text-purple-400 transition">Solutions</a>
              <a href="#pricing" className="block hover:text-purple-400 transition">Pricing</a>
              <button 
                onClick={() => { setIsRegister(false); setShowLoginModal(true); setMobileMenuOpen(false); }}
                className="block w-full text-left text-purple-400 hover:text-purple-300 transition"
              >
                Login
              </button>
              <button 
                onClick={() => { setIsRegister(true); setShowLoginModal(true); setMobileMenuOpen(false); }}
                className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm font-semibold">
            ✅ The Smart Way to Manage Events
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight my-5">
            Modernize Your Event Attendance
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              With STAMPiFY Digital IDs
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            STAMPiFY is an all-in-one attendance management and digital ID verification system 
            designed to streamline events, improve onsite verification, and boost organizational engagement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => { setIsRegister(true); setShowLoginModal(true); }}
              className="group bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            <button className="border-2 border-purple-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-500/10 transition">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Features Built for Organizations</h2>
            <p className="text-xl text-gray-300">Everything you need to manage events smoothly</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <IdCard className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Digital ID Verification</h3>
              <p className="text-gray-300">
                Secure and scannable digital IDs that let members verify instantly during any event.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">QR Attendance Scanning</h3>
              <p className="text-gray-300">
                Fast, reliable scanning for check-in, check-out, and event participation logs.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Member Engagement</h3>
              <p className="text-gray-300">
                Track participation trends, event history, and attendance analytics in one dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Solutions for Schools & Organizations</h2>
            <p className="text-xl text-gray-300">Scalable. Secure. Accurate.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Automated Attendance Logs</h3>
                  <p className="text-gray-300">
                    Real-time attendance history with tamper-proof digital records.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Event Registration System</h3>
                  <p className="text-gray-300">
                    Manage sign-ups, track participation, and organize member attendance effortlessly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Admin Dashboard</h3>
                  <p className="text-gray-300">
                    Powerful dashboard for officers, administrators, and organizers.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-8 rounded-2xl border border-purple-500/30">
              <div className="aspect-video bg-slate-800/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IdCard className="w-10 h-10" />
                  </div>
                  <p className="text-gray-400">STAMPiFY Platform Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-300 mb-16">Perfect for organizations of all sizes</p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₱0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-300">
                <li className="flex items-center gap-2"><Check className="text-green-400" /> Basic attendance</li>
                <li className="flex items-center gap-2"><Check className="text-green-400" /> Digital ID issuance</li>
                <li className="flex items-center gap-2"><Check className="text-green-400" /> Up to 100 members</li>
              </ul>
              <button 
                onClick={() => { setIsRegister(true); setShowLoginModal(true); }}
                className="w-full border-2 border-purple-500 px-6 py-3 rounded-lg hover:bg-purple-500/10 transition"
              >
                Start Free
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-8 rounded-2xl border-2 border-purple-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₱299</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-300">
                <li className="flex items-center gap-2"><Check className="text-green-400" /> Unlimited scanning</li>
                <li className="flex items-center gap-2"><Check className="text-green-400" /> Event modules</li>
                <li className="flex items-center gap-2"><Check className="text-green-400" /> Analytics dashboard</li>
              </ul>
              <button 
                onClick={() => { setIsRegister(true); setShowLoginModal(true); }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
              >
                Upgrade
              </button>
            </div>

            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-300">
                <li className="flex items-center gap-2"><Check className="text-green-400" /> Unlimited members</li>
                <li className="flex items-center gap-2"><Check className="text-green-400" /> Dedicated support</li>
                <li className="flex items-center gap-2"><Check className="text-green-400" /> Custom integrations</li>
              </ul>
              <button className="w-full border-2 border-purple-500 px-6 py-3 rounded-lg hover:bg-purple-500/10 transition">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <IdCard className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">STAMPiFY</span>
              </div>
              <p className="text-gray-400 text-sm">
                The all-in-one attendance and digital ID system designed for modern organizations.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-purple-400 transition">Features</a></li>
                <li><a href="#solutions" className="hover:text-purple-400 transition">Solutions</a></li>
                <li><a href="#pricing" className="hover:text-purple-400 transition">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Organization</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition">About</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Support</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Security</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-purple-500/20 pt-8 text-center text-gray-400 text-sm">
            © 2025 STAMPiFY. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Login/Register Modal */}
      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          isRegister={isRegister}
          onToggleMode={() => setIsRegister(!isRegister)}
        />
      )}
    </div>
  )
}
