"use client"

import React from 'react';
import Link from 'next/link';
import { FileText, Award, RefreshCw, ArrowRight, LogIn, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading, logout, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img
                src="/Logo.png"
                alt="Children's Foundation of America Logo"
                className="h-16 w-16 object-contain flex-shrink-0"
              />
              <div>
                <h1 className="text-3xl font-bold text-indigo-900 mb-2">
                  Children's Foundation of America
                </h1>
                <p className="text-gray-600">Scholarship Portal</p>
              </div>
            </div>
            {!loading && (
              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Page
                      </Link>
                    )}
                    <span className="text-sm text-gray-600">
                      {user.profile.firstName} {user.profile.lastName}
                    </span>
                    <button
                      onClick={logout}
                      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Log in
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to the CFA Scholarship Portal
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Supporting present and former foster youth in pursuing their academic and vocational education goals.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* New Applicant Card */}
          <Link href="/new-applicant">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow cursor-pointer group h-full flex flex-col">
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6 group-hover:bg-indigo-200 transition-colors">
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                New Applicant
              </h3>
              <p className="text-gray-600 mb-6 flex-grow">
                Apply for the CFA Scholarship for the first time. Complete the new applicant form to be considered for scholarship funding.
              </p>
              <div className="flex items-center text-indigo-600 font-semibold group-hover:text-indigo-700">
                Start Application
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Acceptance Card */}
          <Link href="/acceptance">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow cursor-pointer group h-full flex flex-col">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 group-hover:bg-green-200 transition-colors">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Accept Award
              </h3>
              <p className="text-gray-600 mb-6 flex-grow">
                Congratulations! If you've been awarded a scholarship, complete this form to accept your award and request disbursement.
              </p>
              <div className="flex items-center text-green-600 font-semibold group-hover:text-green-700">
                Accept Scholarship
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Renewal Card */}
          <Link href="/renewal">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow cursor-pointer group h-full flex flex-col">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6 group-hover:bg-purple-200 transition-colors">
                <RefreshCw className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Renewal Application
              </h3>
              <p className="text-gray-600 mb-6 flex-grow">
                Current scholarship recipients can apply to renew their award for the upcoming academic year through this form.
              </p>
              <div className="flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                Renew Scholarship
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Information Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            About the Scholarship
          </h3>
          <div className="space-y-4 text-gray-700">
            <p>
              The Children's Foundation of America scholarship fund is designed to assist present and former foster youth in pursuing their academic and vocational education. Our goal is to ensure academic success and successful emancipation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Scholarship Amount</h4>
                <p className="text-sm">Awards of up to $5,000 per year</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Eligibility</h4>
                <p className="text-sm">Present and former foster youth ages 16-24</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Application Deadline</h4>
                <p className="text-sm text-red-600 font-semibold">June 1st, 2025</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Contact</h4>
                <p className="text-sm">(909) 426-0773</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Questions? Contact us at (909) 426-0773</p>
          <p className="mt-2">Email: aofstedahl@trinityys.org</p>
          <p className="mt-4">
            <Link href="/admin" className="text-indigo-500 hover:text-indigo-700 hover:underline transition-colors">
              Admin Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
