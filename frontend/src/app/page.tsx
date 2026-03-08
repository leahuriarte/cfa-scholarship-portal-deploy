"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Award, RefreshCw, ArrowRight, LogIn, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

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

      {/* Bottom Footer Bar */}
      <footer
        style={{
          backgroundColor: "#e03030",
          color: "white",
          fontFamily: "'Open Sans', 'Helvetica Neue', Arial, sans-serif",
          padding: "60px 80px 40px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* TOP ROW */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "36px", flexWrap: "wrap", gap: "20px" }}>
          <h2 style={{ fontWeight: 800, fontSize: "28px", color: "white", margin: 0 }}>
            Children's Foundation of America
          </h2>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <h2 style={{ color: "#1a2f5e", fontSize: "28px", fontWeight: 800, margin: "0 0 4px 0" }}>
              Join Our Community
            </h2>
            <h3 style={{ color: "white", fontSize: "20px", fontWeight: 700, margin: 0 }}>
              Stay connected
            </h3>
          </div>
        </div>

        {/* MIDDLE ROW */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "60px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "60px" }}>
            {/* Left nav column */}
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "HOME", href: "https://childrensfoundationofamerica.org" },
                { label: "ABOUT US", href: "https://childrensfoundationofamerica.org/about/" },
                { label: "EVENTS", href: "https://childrensfoundationofamerica.org/events/" },
                { label: "GET INVOLVED", href: "https://childrensfoundationofamerica.org/get-involved/" },
                { label: "DONATE", href: "https://childrensfoundationofamerica.org/get-involved/donation-information/" },
                { label: "BLOG", href: "https://childrensfoundationofamerica.org/category/blog/" },
                { label: "CONTACT", href: "https://childrensfoundationofamerica.org/contact-us/" },
              ].map((link) => (
                <li key={link.label} style={{ marginBottom: "8px" }}>
                  <a href={link.href} style={{ color: "white", textDecoration: "none", fontSize: "13px", letterSpacing: "0.5px", fontWeight: 400 }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.textDecoration = "underline")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.textDecoration = "none")}
                  >{link.label}</a>
                </li>
              ))}
            </ul>
            {/* Right nav column */}
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                { label: "VOLUNTEER", href: "https://childrensfoundationofamerica.org/get-involved/volunteer/" },
                { label: "DONATION INFORMATION", href: "https://childrensfoundationofamerica.org/get-involved/donation-information/" },
                { label: "PARTNER", href: "https://childrensfoundationofamerica.org/get-involved/become-a-business-partner/" },
                { label: "CAREERS", href: "https://trinityys.org/get-involved/careers/" },
                { label: "BECOME A RESOURCE FAMILY", href: "https://trinityys.org/programs/become-foster-parent/" },
                { label: "DONATE", href: "https://childrensfoundationofamerica.org/donate/" },
              ].map((link) => (
                <li key={link.label} style={{ marginBottom: "8px" }}>
                  <a href={link.href} style={{ color: "white", textDecoration: "none", fontSize: "13px", letterSpacing: "0.5px", fontWeight: 400 }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.textDecoration = "underline")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.textDecoration = "none")}
                  >{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: "300px" }}>
            <p style={{ color: "white", fontSize: "14px", marginBottom: "28px", marginTop: 0, fontWeight: 400 }}>
              Receive updates and inspiring stories sent right to your inbox.
            </p>
            <a href="#" style={{ display: "flex", alignItems: "center", textDecoration: "none", width: "100%", maxWidth: "420px" }}>
              <div style={{ backgroundColor: "#1a2f5e", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="26" height="20" rx="1" stroke="white" strokeWidth="2" fill="none" />
                  <path d="M1 1L14 13L27 1" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <div style={{ backgroundColor: "#c02828", padding: "18px 28px", flex: 1, color: "white", fontSize: "17px", fontWeight: 600, letterSpacing: "0.3px" }}>
                Sign Up for Updates
              </div>
            </a>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "60px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "white" }}>© 2021 Children's Foundation of America</p>
            <p style={{ margin: 0, fontSize: "14px", color: "white" }}>201 N. Indian Hill Blvd. Suite 200, Claremont, CA 91711</p>
          </div>
          {/* Social Icons */}
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <a href="https://www.facebook.com/childrensfoundation" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <svg width="14" height="26" viewBox="0 0 14 26" fill="#1a2f5e" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 9V6.5C9 5.67 9.67 5 10.5 5H13V1H9.5C7.01 1 5 3.01 5 5.5V9H2V13H5V25H9V13H12.5L14 9H9Z" />
              </svg>
            </a>
            <a href="https://x.com/CFoundationofA" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <svg width="26" height="22" viewBox="0 0 26 22" fill="#1a2f5e" xmlns="http://www.w3.org/2000/svg">
                <path d="M26 2.6a10.7 10.7 0 01-3.07.84A5.35 5.35 0 0025.27.4a10.7 10.7 0 01-3.39 1.3A5.34 5.34 0 0012.8 6.57 15.15 15.15 0 011.8.97a5.34 5.34 0 001.65 7.12 5.3 5.3 0 01-2.42-.67v.07a5.34 5.34 0 004.28 5.23 5.37 5.37 0 01-2.41.09 5.34 5.34 0 004.99 3.7A10.72 10.72 0 010 18.4 15.12 15.12 0 008.18 21c9.82 0 15.2-8.14 15.2-15.2 0-.23 0-.46-.02-.69A10.84 10.84 0 0026 2.6z" />
              </svg>
            </a>
            <a href="https://www.pinterest.com/childrensfoundationofamerica/" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <svg width="22" height="28" viewBox="0 0 22 28" fill="#1a2f5e" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 0C4.93 0 0 4.93 0 11c0 4.66 2.89 8.67 7 10.28-.1-.87-.18-2.2.04-3.15.2-.84 1.34-5.68 1.34-5.68s-.34-.68-.34-1.7c0-1.59.92-2.78 2.07-2.78.97 0 1.45.73 1.45 1.61 0 .98-.63 2.45-.95 3.81-.27 1.14.57 2.07 1.69 2.07 2.02 0 3.38-2.13 3.38-5.21 0-2.73-1.96-4.63-4.76-4.63-3.24 0-5.14 2.43-5.14 4.94 0 .98.38 2.03.85 2.6a.34.34 0 01.08.33c-.09.36-.28 1.14-.32 1.3-.05.21-.17.25-.39.15-1.46-.68-2.37-2.82-2.37-4.54 0-3.69 2.68-7.08 7.73-7.08 4.06 0 7.21 2.89 7.21 6.75 0 4.03-2.54 7.27-6.07 7.27-1.19 0-2.3-.62-2.68-1.34l-.73 2.72c-.26 1.01-1 2.27-1.48 3.04.56.17 1.15.26 1.76.26C17.07 22 22 17.07 22 11S17.07 0 11 0z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/childrensfoundationofamerica/?hl=en" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a2f5e" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="#1a2f5e" stroke="none" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
