import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Stats from '../components/landing/Stats';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Stats />
        
        {/* Testimonials */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Testimonials</h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Hear from our users
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                See what students and librarians have to say about our library management system.
              </p>
            </div>
            
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 rounded-lg shadow-sm px-6 py-8">
                <div className="flex items-center mb-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src="https://via.placeholder.com/150?text=JS"
                    alt="Jane Smith"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Jane Smith</h3>
                    <p className="text-sm text-gray-500">Biology Student</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "This library system has made borrowing books so much easier! I can check availability online and reserve what I need before coming to campus."
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg shadow-sm px-6 py-8">
                <div className="flex items-center mb-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src="https://via.placeholder.com/150?text=MD"
                    alt="Michael Davis"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Michael Davis</h3>
                    <p className="text-sm text-gray-500">Head Librarian</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Managing our collection has never been easier. The dashboard gives me all the information I need at a glance, and adding new books is a breeze."
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg shadow-sm px-6 py-8">
                <div className="flex items-center mb-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src="https://via.placeholder.com/150?text=AR"
                    alt="Alex Rodriguez"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Alex Rodriguez</h3>
                    <p className="text-sm text-gray-500">Computer Science Student</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "I love getting notifications when my books are due. It's helped me avoid late fees, and the mobile interface makes it easy to use on the go."
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="bg-primary-700">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-primary-200">Join our library system today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50"
                >
                  Get Started
                </a>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <a
                  href="/about"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;