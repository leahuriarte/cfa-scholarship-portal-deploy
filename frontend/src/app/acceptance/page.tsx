"use client"

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Send, Award, DollarSign, FileText } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface FormData {
  fullName: string;
  agreedToTerms: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  requestAmount: string;
  cardLastFour: string;
  formPurpose: string;
}

export default function ScholarshipAcceptance(): React.ReactElement {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    agreedToTerms: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    requestAmount: '',
    cardLastFour: '',
    formPurpose: ''
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [understoodDisbursement, setUnderstoodDisbursement] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/acceptance-forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          acceptedTerms: formData.agreedToTerms === 'yes',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to submit acceptance form');
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Acceptance form submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit acceptance form');
    } finally {
      setSubmitting(false);
    }
  };

  const nextPage = (): void => {
    if (currentPage === 1 && formData.agreedToTerms !== 'yes') {
      alert('You must agree to the Terms and Conditions to continue.');
      return;
    }
    if (currentPage === 2 && !understoodDisbursement) {
      alert('Please confirm you understand the disbursement instructions.');
      return;
    }
    if (currentPage < 3) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = (): void => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-lg">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="flex items-center gap-6">
              <img
                src="/Logo.png"
                alt="Children's Foundation of America Logo"
                className="h-16 w-16 object-contain flex-shrink-0"
              />
              <div>
                <h1 className="text-3xl font-bold text-indigo-900 mb-2">
                  Scholarship Award Acceptance Form
                </h1>
                <p className="text-gray-600">Children's Foundation of America</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-4 sm:p-6 md:p-10">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Form Submitted Successfully!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for submitting your Scholarship Award Acceptance Form. We have received your information and will process your request shortly.
            </p>
            <p className="text-gray-600 mb-8">
              If you have any questions, please contact us at (909) 426-0773
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-6">
            <img 
              src="/Logo.png" 
              alt="Children's Foundation of America Logo" 
              className="h-16 w-16 object-contain flex-shrink-0"
            />
            <div>
              <h1 className="text-3xl font-bold text-indigo-900 mb-2">
                Scholarship Award Acceptance Form
              </h1>
              <p className="text-gray-600">Children's Foundation of America</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                currentPage === 1 ? 'bg-indigo-600 text-white' : 'bg-green-500 text-white'
              }`}>
                <span className="text-lg font-semibold">1</span>
              </div>
              <span className={`text-xs mt-2 text-center ${
                currentPage === 1 ? 'text-indigo-600 font-semibold' : 'text-gray-500'
              }`}>
                Terms
              </span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2">
              <div className={`h-full transition-all ${currentPage > 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                currentPage === 2 ? 'bg-indigo-600 text-white' :
                currentPage > 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                <span className="text-lg font-semibold">2</span>
              </div>
              <span className={`text-xs mt-2 text-center ${
                currentPage === 2 ? 'text-indigo-600 font-semibold' : 'text-gray-500'
              }`}>
                Disbursement
              </span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2">
              <div className={`h-full transition-all ${currentPage > 2 ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                currentPage === 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                <span className="text-lg font-semibold">3</span>
              </div>
              <span className={`text-xs mt-2 text-center ${
                currentPage === 3 ? 'text-indigo-600 font-semibold' : 'text-gray-500'
              }`}>
                Final Details
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Page 1: Terms and Conditions */}
            {currentPage === 1 && (
              <div className="space-y-6">
                <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6">
                  <div className="flex items-start">
                    <Award className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-green-900 mb-2">Congratulations!</h3>
                      <p className="text-sm text-gray-700">
                        Congratulations on being selected for a Children's Foundation of America Scholarship! You may request reimbursement for funds and/or for the Foundation to pay an invoice on your behalf.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
                  <div className="flex items-start">
                    <DollarSign className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-blue-900 mb-2">Scholarship Amount & Eligible Expenses</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        You may request up to <strong>$5,000</strong> for this school year. Since you are eligible for financial aid, this scholarship is not to be used for tuition.
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Eligible expenses include:</strong>
                      </p>
                      <p className="text-sm text-gray-700">
                        Clothing, shoes, home goods, cleaning supplies, cell phone, cell phone payments, student housing, gas money, groceries, school lunch, meal plan, car payment, computer, school books, school software, student parking pass, uber, school supplies, etc.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Terms and Conditions</h3>
                  <div className="text-sm text-gray-700 space-y-4 max-h-96 overflow-y-auto pr-2">
                    <p>
                      <strong>1.</strong> Scholarship awards are granted for one school year, and can be renewed until the youth reaches the age of 24.
                    </p>
                    
                    <p>
                      <strong>2.</strong> Recipient must notify the Children's Foundation of America of any change in their educational enrollment plans and/or residency changes. In the event of change, continuation of an award is subject to the approval of the Scholarship Committee.
                    </p>
                    
                    <p>
                      <strong>3.</strong> The Scholarship Committee will determine the renewal of scholarship awards and the amounts of the awards.
                    </p>
                    
                    <p>
                      <strong>4.</strong> An award will be reduced, or not renewed and may be revoked, if the youth does not:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Maintain a minimum 2.0 grade point average while enrolled in a full time education or vocational program</li>
                      <li>Provide the Children's Foundation of America on a semester basis a complete Scholarship Report form (provided) with attachments that include documentation of grade performance and current GPA, proof of education/vocational agency enrollment, proof of employment, and all room and board or utility bills if applicable</li>
                      <li>Youth needs to be in good standing with educational institution and/or place of employment and have no convictions of any offense</li>
                    </ul>
                    
                    <p>
                      <strong>5.</strong> It is the responsibility of the student to meet all reporting requirements and to make sure the disbursement funds are received by the school, landlord, utility agencies, etc.
                    </p>
                    
                    <p>
                      <strong>6.</strong> Youth are fully responsible for tuition and fee charges if for any reason the expected disbursement of funds is not received.
                    </p>
                    
                    <p>
                      <strong>7.</strong> Scholarship awards are not renewed automatically and students must reapply for the scholarship award each year by completing and submitting a Scholarship Application.
                    </p>
                    
                    <p>
                      <strong>8.</strong> All applicants and recipients must agree to comply with the policies, procedures and regulations of the scholarship fund.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First and Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    I have read all of the Terms and Conditions in this document and that I understand both the information presented and the possible resulting consequences. <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="agreedToTerms"
                        value="yes"
                        checked={formData.agreedToTerms === 'yes'}
                        onChange={handleChange}
                        className="mr-3 w-4 h-4 text-indigo-600"
                        required
                      />
                      <span className="text-sm font-medium">Yes</span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="agreedToTerms"
                        value="no"
                        checked={formData.agreedToTerms === 'no'}
                        onChange={handleChange}
                        className="mr-3 w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm font-medium">No</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Page 2: Request for Disbursement */}
            {currentPage === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-indigo-200">
                  Request for Disbursement of Funds (Submit an Invoice)
                </h2>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                    <div className="text-sm text-gray-700 space-y-3">
                      <p>
                        Disbursement of scholarship award funds will be paid directly to the appropriate agency(s) by the Children's Foundation of America's Accounting Department. The agency(s) receiving disbursements may be a school, rental company, power company, cell phone company, lending agency, etc.
                      </p>
                      <p>
                        <strong>Funds will not be approved for individuals.</strong> Requests must only be for corporate agencies/businesses and official documents/invoices must be submitted to <strong>aofstedahl@trinityys.org</strong>.
                      </p>
                      <p className="font-semibold text-yellow-800">
                        Please do not request funds for invoices with a hard deadline as timeliness of disbursement is variable.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
                  <div className="flex items-start">
                    <FileText className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div className="text-sm text-gray-700 space-y-2">
                      <p className="font-semibold">Alternative: Request Reimbursement</p>
                      <p>
                        To request reimbursement, send receipts to <strong>aofstedahl@trinityys.org</strong> or <strong>P.O. Box 1210, Claremont, CA 91711</strong>.
                      </p>
                      <p>
                        You do not need to fill out this form for reimbursements. All invoices and receipts must indicate they belong to you either by including your name and/or payment method must match the information we have on file.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center p-4 bg-white border-2 border-indigo-300 rounded-lg cursor-pointer hover:bg-indigo-50">
                    <input
                      type="checkbox"
                      checked={understoodDisbursement}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setUnderstoodDisbursement(e.target.checked)}
                      className="mr-3 w-5 h-5 text-indigo-600 flex-shrink-0"
                      required
                    />
                    <span className="text-sm font-semibold text-gray-800">
                      I have read and understand the instructions for disbursement of funds. (If you do not understand, please stop at this point in the form and contact us for help.) <span className="text-red-500">*</span>
                    </span>
                  </label>
                </div>

                <p className="text-sm text-gray-600 italic mb-6">
                  Use the following form to request payment of a one-time invoice on your behalf. If you are not prepared with information at this time to submit a request for the Foundation to pay an invoice on your behalf, you may return to this form at any time.
                </p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What's the Name of the Company You Want to Request Funds For?
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Mailing Address
                  </label>
                  <input
                    type="text"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Phone
                  </label>
                  <input
                    type="tel"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount of Request
                  </label>
                  <input
                    type="text"
                    name="requestAmount"
                    value={formData.requestAmount}
                    onChange={handleChange}
                    placeholder="$"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Page 3: Final Details */}
            {currentPage === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-indigo-200">
                  Reporting & Final Details
                </h2>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-blue-900 mb-2">Reporting</h4>
                      <p className="text-sm text-gray-700">
                        At the end of the semester (December), you will be asked to report on the year so far.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Receipt Verification for Reimbursement Requests <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Please list out the last 4 digits of your credit/debit card(s) you will be using to submit receipts for approval. Separate multiple cards with a comma. The LAST 4 digits ONLY. Do <strong>NOT</strong> submit your entire card number for security purposes. Payment cards must be in the name of the scholarship recipient.
                  </p>
                  <input
                    type="text"
                    name="cardLastFour"
                    value={formData.cardLastFour}
                    onChange={handleChange}
                    placeholder="e.g., 1234, 5678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    What best describes the purpose of filling out this form? <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="formPurpose"
                        value="starting"
                        checked={formData.formPurpose === 'starting'}
                        onChange={handleChange}
                        className="mt-1 mr-3 w-4 h-4 text-indigo-600 flex-shrink-0"
                        required
                      />
                      <span className="text-sm">Just starting the school year and accepting my scholarship.</span>
                    </label>

                    <label className="flex items-start p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="formPurpose"
                        value="reporting"
                        checked={formData.formPurpose === 'reporting'}
                        onChange={handleChange}
                        className="mt-1 mr-3 w-4 h-4 text-indigo-600 flex-shrink-0"
                      />
                      <span className="text-sm">I have just completed the fall semester and need to report on the semester.</span>
                    </label>

                    <label className="flex items-start p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="formPurpose"
                        value="disbursement"
                        checked={formData.formPurpose === 'disbursement'}
                        onChange={handleChange}
                        className="mt-1 mr-3 w-4 h-4 text-indigo-600 flex-shrink-0"
                      />
                      <span className="text-sm">I have already accepted the scholarship and only need to request disbursement of funds.</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                Previous
              </button>

              <div className="text-sm text-gray-600">
                Page {currentPage} of 3
              </div>

              {currentPage < 3 ? (
                <button
                  type="button"
                  onClick={nextPage}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Form'}
                </button>
              )}
            </div>
          </form>

          {submitError && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {submitError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Questions? Contact Children's Foundation of America at (909) 426-0773</p>
          <p className="mt-2">Email documents to: aofstedahl@trinityys.org</p>
        </div>
      </div>
    </div>
  );
}
