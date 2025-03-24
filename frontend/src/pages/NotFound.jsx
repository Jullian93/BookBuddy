import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div>
            <h1 className="text-9xl font-extrabold text-primary-600">404</h1>
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Page not found
            </h2>
            <p className="mt-6 text-base text-gray-500">
              Sorry, we couldn't find the page you're looking for.
            </p>
            <div className="mt-10">
              <Link to="/">
                <Button variant="primary" size="lg">
                  Go back home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;