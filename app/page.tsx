"use client";

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle, Book, School, Home, ClipboardList, Calendar, MessageSquare, Users, BarChart3 } from 'lucide-react'

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed w-full bg-white/90 dark:bg-gray-950/90 border-b backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-[rgb(23,23,23)] text-white p-1.5 rounded">
              <Users size={20} />
            </div>
            <span className="text-2xl font-bold text-[rgb(23,23,23)] dark:text-white">UniSync</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium hover:text-gray-600 transition-colors">
              Features
            </Link>
            <Link href="#modules" className="text-sm font-medium hover:text-gray-600 transition-colors">
              Modules
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-gray-600 transition-colors">
              Contact
            </Link>
            <Link href="/login" passHref>
              <Button variant="outline" className="bg-[rgb(23,23,23)] text-white hover:bg-white hover:text-[rgb(23,23,23)] transition-colors">Login</Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-[rgb(23,23,23)] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] bg-repeat bg-[length:30px_30px]"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-0">
          <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium mb-6">
            Configurable · Modular · Scalable
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            A Configurable University <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Management Solution</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-300">
            Streamline academic and administrative operations with a centralized platform designed for multiple universities.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup" passHref>
              <Button size="lg" className="bg-white text-[rgb(23,23,23)] hover:bg-gray-100 hover:text-gray-900 transition-colors px-8">
                Register Your University
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login" passHref>
              <Button size="lg" variant="outline" className="bg-black text-white hover:bg-white hover:text-[rgb(23,23,23)] transition-all px-8">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-gray-200 dark:bg-gray-800 text-[rgb(23,23,23)] dark:text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
              KEY FEATURES
            </div>
            <h2 className="text-3xl font-bold mb-4">Why Choose UniSync?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform offers comprehensive solutions designed specifically for higher education institutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-7 w-7 text-[rgb(23,23,23)] dark:text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Automated Processes</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Simplify tasks like course enrollment, grading, and event scheduling with automated workflows that save time and reduce errors.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-[rgb(23,23,23)] dark:text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Improved Collaboration</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Robust tools for faculty and student project management, enhancing teamwork and communication across departments.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <BarChart3 className="h-7 w-7 text-[rgb(23,23,23)] dark:text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Enhanced Decision-Making</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Detailed analytics and reporting tools for administrators and higher authorities to make data-driven decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-gray-200 dark:bg-gray-800 text-[rgb(23,23,23)] dark:text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
              MODULES
            </div>
            <h2 className="text-3xl font-bold mb-4">Fully Customizable Modules</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Select and configure only the modules your institution needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Learning Management',
                description: 'Course materials, assignments, and grading in one integrated platform.',
                icon: <Book className="h-6 w-6" />,
                colorClass: 'bg-gray-100 dark:bg-gray-800 text-[rgb(23,23,23)] dark:text-white'
              },
              {
                title: 'Campus Management',
                description: 'Streamline administrative tasks and campus operations efficiently.',
                icon: <School className="h-6 w-6" />,
                colorClass: 'bg-gray-100 dark:bg-gray-800 text-[rgb(23,23,23)] dark:text-white'
              },
              {
                title: 'Hostel Management',
                description: 'Manage room allocations, maintenance, and student requests seamlessly.',
                icon: <Home className="h-6 w-6" />,
                colorClass: 'bg-gray-100 dark:bg-gray-800 text-[rgb(23,23,23)] dark:text-white'
              },
              {
                title: 'Project Management',
                description: 'Track projects, milestones, and facilitate team collaboration.',
                icon: <ClipboardList className="h-6 w-6" />,
                colorClass: 'bg-gray-100 dark:bg-gray-800 text-[rgb(23,23,23)] dark:text-white'
              },
              {
                title: 'Attendance Tracking',
                description: 'Automated attendance management for classes and campus events.',
                icon: <Calendar className="h-6 w-6" />,
                colorClass: 'bg-gray-100 dark:bg-gray-800 text-[rgb(23,23,23)] dark:text-white'
              },
              {
                title: 'Feedback Collection',
                description: 'Gather and analyze feedback from students and faculty members.',
                icon: <MessageSquare className="h-6 w-6" />,
                colorClass: 'bg-gray-100 dark:bg-gray-800 text-[rgb(23,23,23)] dark:text-white'
              },
            ].map((module, index) => (
              <div 
                key={index} 
                className="border rounded-xl p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all"
              >
                <div className={`w-12 h-12 ${module.colorClass} rounded-full flex items-center justify-center mb-4`}>
                  {module.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[rgb(23,23,23)] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your University Management?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join universities worldwide that are streamlining their operations with UniSync.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup" passHref>
              <Button size="lg" className="bg-white text-[rgb(23,23,23)] hover:bg-gray-100 hover:text-gray-900 transition-colors px-8">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-white text-[rgb(23,23,23)] p-1 rounded">
                  <Users size={18} />
                </div>
                <span className="text-xl font-bold">UniSync</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                A centralized, modular, and configurable university management platform designed to cater to multiple
                universities simultaneously.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400">info@unisync.com</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-400">+1 (123) 456-7890</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-400">123 Education St, Academic City</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#modules" className="text-gray-400 hover:text-white transition-colors">
                    Modules
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-400 hover:text-white transition-colors">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} UniSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 