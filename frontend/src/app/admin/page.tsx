"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardList, ChevronDown, ChevronUp, Filter, RefreshCw,
  CheckCircle, XCircle, Clock, Send, ArrowLeft, StickyNote,
  GraduationCap, User, Briefcase, Home, FileText, MessageSquare,
  Users, DollarSign, Award
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type AppStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'denied';
type ChecklistStatus = 'pending' | 'submitted' | 'reviewed';
type ReimbursementStatus = 'pending' | 'approved' | 'denied' | 'paid';
type TabType = 'students' | 'checklists' | 'acceptance' | 'reimbursements';

interface Application {
  _id: string;
  applicationType: 'new' | 'renewal';
  academicYear: string;
  status: AppStatus;
  submittedAt?: string;
  reviewedAt?: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    mailingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    dateOfBirth: string;
    currentAge?: number;
  };
  educationInfo: {
    hasHighSchoolDiploma: boolean;
    diplomaSource?: string;
    estimatedGraduationDate?: string;
    collegeName: string;
    isAccepted: boolean;
    yearInSchool: string;
    attendanceType: string;
    unitsEnrolled: number;
    currentGPA: number;
    majorOrCourseOfStudy?: string;
  };
  fosterCareInfo?: {
    agencyName: string;
    socialWorker: { name: string; email: string; relationship: string };
    resourceParent: { name: string; address: string; phoneOrEmail: string; relationship: string };
    lengthInPlacement: string;
  };
  livingSituation: {
    currentDescription: string;
    willContinue: boolean;
    futurePlans?: string;
  };
  employmentInfo: {
    isEmployed: boolean;
    employer?: string;
    position?: string;
    responsibilities?: string;
    hourlyRate?: number;
    hoursPerWeek?: number;
    employmentDuration?: string;
    employerContact?: { name: string; phoneOrEmail: string };
    plansToContinueWhileInSchool?: boolean;
    isSeekingEmployment?: boolean;
  };
  essays: {
    reasonForRequest: string;
    educationAndCareerGoals: string;
    plansAfterFosterCare?: string;
    otherResources?: string;
    nextStepIfDenied?: string;
    whyGoodCandidate: string;
    howScholarshipHelped?: string;
  };
  requiredDocuments: {
    highSchoolDiplomaOrGED: { required: boolean; uploaded: boolean };
    transcripts: { required: boolean; uploaded: boolean };
    enrollmentVerification: { required: boolean; uploaded: boolean };
    employmentVerification: { required: boolean; uploaded: boolean };
    recommendationLetter: { submitted: boolean };
  };
  adminNotes: Array<{
    _id?: string;
    note: string;
    createdBy: any;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface RenewalChecklist {
  _id: string;
  userId: any;
  applicationId: any;
  academicYear: string;
  reportingPeriod: string;
  submittedAt?: string;
  status: ChecklistStatus;
  academicUpdate: {
    currentGPA: number;
    unitsEnrolled: number;
    attendanceType: string;
  };
  employmentUpdate: {
    isEmployed: boolean;
    employer?: string;
    hoursPerWeek?: number;
  };
  complianceChecklist: {
    maintainedGPAOver2: boolean;
    attendingFullTimeOrWorkingPartTime: boolean;
    cleanArrestRecord: boolean;
    noIllegalSubstances: boolean;
    compliedWithPolicies: boolean;
  };
  reviewedBy?: any;
  reviewedAt?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AcceptanceFormData {
  _id: string;
  userId: any;
  applicationId: any;
  acceptedTerms: boolean;
  acceptedAt: string;
  ipAddress: string;
  createdAt: string;
}

interface ReimbursementRequest {
  _id: string;
  userId: any;
  applicationId: any;
  requestType: 'tuition_payment' | 'reimbursement';
  amount: number;
  description: string;
  paymentInfo: {
    payableTo: string;
    paymentMethod: string;
    accountOrAddress: string;
  };
  receipts: Array<{
    description: string;
    amount: number;
    date: string;
    fileId: string;
    category: string;
  }>;
  status: ReimbursementStatus;
  submittedAt?: string;
  reviewedBy?: any;
  reviewedAt?: string;
  paidAt?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface StudentGroup {
  email: string;
  name: string;
  college: string;
  phone: string;
  applications: Application[];
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  denied: 'bg-red-100 text-red-700',
  pending: 'bg-gray-100 text-gray-700',
  reviewed: 'bg-green-100 text-green-700',
  paid: 'bg-emerald-100 text-emerald-700',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  denied: 'Denied',
  pending: 'Pending',
  reviewed: 'Reviewed',
  paid: 'Paid',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
      {statusLabels[status] || status}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const isNew = type === 'new';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isNew ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
      {isNew ? 'New' : 'Renewal'}
    </span>
  );
}

function RequestTypeBadge({ type }: { type: string }) {
  const isTuition = type === 'tuition_payment';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isTuition ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
      {isTuition ? 'Tuition Payment' : 'Reimbursement'}
    </span>
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
      <Icon className="w-5 h-5 text-indigo-600" />
      {title}
    </h4>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="py-1.5">
      <span className="text-sm font-medium text-gray-500">{label}: </span>
      <span className="text-sm text-gray-900">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
    </div>
  );
}

function EssayBlock({ label, text }: { label: string; text?: string }) {
  if (!text) return null;
  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function ComplianceItem({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1">
      {value ? (
        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
      )}
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
}

// --- Application Detail ---

function ApplicationDetail({ app, onStatusChange, onNoteAdded, onNoteDeleted }: {
  app: Application;
  onStatusChange: (id: string, status: AppStatus) => void;
  onNoteAdded: (id: string, note: Application['adminNotes'][number]) => void;
  onNoteDeleted: (id: string, noteId: string) => void;
}) {
  const [newNote, setNewNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState('');

  const handleStatusChange = async (newStatus: AppStatus) => {
    setStatusLoading(newStatus);
    try {
      const res = await fetch(`${API_BASE}/api/applications/${app._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        onStatusChange(app._id, newStatus);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setStatusLoading('');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setNoteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/applications/${app._id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ note: newNote }),
      });
      const data = await res.json();
      if (data.success) {
        const notes = data.application?.adminNotes;
        const createdNote = Array.isArray(notes) && notes.length > 0 ? notes[notes.length - 1] : undefined;
        onNoteAdded(app._id, createdNote ?? { note: newNote, createdBy: null, createdAt: new Date().toISOString() });
        setNewNote('');
      }
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setNoteLoading(false);
    }
  };

  const handleDeleteNote = async (noteId?: string) => {
    if (!noteId) return;
    setDeletingNoteId(noteId);
    try {
      const res = await fetch(`${API_BASE}/api/applications/${app._id}/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        onNoteDeleted(app._id, noteId);
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setDeletingNoteId(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Status Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Set Status:</span>
        {(['submitted', 'under_review', 'approved', 'denied'] as AppStatus[]).map((s) => {
          const icons: Record<string, React.ReactNode> = {
            submitted: <Send className="w-3.5 h-3.5" />,
            under_review: <Clock className="w-3.5 h-3.5" />,
            approved: <CheckCircle className="w-3.5 h-3.5" />,
            denied: <XCircle className="w-3.5 h-3.5" />,
          };
          const colors: Record<string, string> = {
            submitted: 'bg-blue-600 hover:bg-blue-700',
            under_review: 'bg-yellow-600 hover:bg-yellow-700',
            approved: 'bg-green-600 hover:bg-green-700',
            denied: 'bg-red-600 hover:bg-red-700',
          };
          const isActive = app.status === s;
          return (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={isActive || statusLoading !== ''}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors ${
                isActive ? 'opacity-50 cursor-not-allowed ' + colors[s] : colors[s]
              } ${statusLoading === s ? 'opacity-70' : ''}`}
            >
              {icons[s]}
              {statusLoading === s ? 'Updating...' : statusLabels[s]}
            </button>
          );
        })}
      </div>

      {/* Personal Info */}
      <div>
        <SectionHeader icon={User} title="Personal Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <DetailRow label="Full Name" value={app.personalInfo.fullName} />
          <DetailRow label="Email" value={app.personalInfo.email} />
          <DetailRow label="Phone" value={app.personalInfo.phone} />
          <DetailRow label="Date of Birth" value={formatDate(app.personalInfo.dateOfBirth)} />
          <DetailRow label="Address" value={`${app.personalInfo.mailingAddress.street}, ${app.personalInfo.mailingAddress.city}, ${app.personalInfo.mailingAddress.state} ${app.personalInfo.mailingAddress.zipCode}`} />
          {app.personalInfo.currentAge && <DetailRow label="Age" value={app.personalInfo.currentAge} />}
        </div>
      </div>

      {/* Education */}
      <div>
        <SectionHeader icon={GraduationCap} title="Education" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <DetailRow label="College" value={app.educationInfo.collegeName} />
          <DetailRow label="Accepted" value={app.educationInfo.isAccepted} />
          <DetailRow label="Year" value={app.educationInfo.yearInSchool} />
          <DetailRow label="Attendance" value={app.educationInfo.attendanceType} />
          <DetailRow label="Units" value={app.educationInfo.unitsEnrolled} />
          <DetailRow label="GPA" value={app.educationInfo.currentGPA} />
          <DetailRow label="Major" value={app.educationInfo.majorOrCourseOfStudy} />
          <DetailRow label="HS Diploma/GED" value={app.educationInfo.hasHighSchoolDiploma} />
          <DetailRow label="Diploma From" value={app.educationInfo.diplomaSource} />
        </div>
      </div>

      {/* Foster Care */}
      {app.fosterCareInfo && (
        <div>
          <SectionHeader icon={Home} title="Foster Care Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <DetailRow label="Agency" value={app.fosterCareInfo.agencyName} />
            <DetailRow label="Time in Placement" value={app.fosterCareInfo.lengthInPlacement} />
            <DetailRow label="Social Worker" value={app.fosterCareInfo.socialWorker?.name} />
            <DetailRow label="SW Email" value={app.fosterCareInfo.socialWorker?.email} />
            <DetailRow label="SW Relationship" value={app.fosterCareInfo.socialWorker?.relationship} />
            <DetailRow label="Resource Parent" value={app.fosterCareInfo.resourceParent?.name} />
            <DetailRow label="RP Address" value={app.fosterCareInfo.resourceParent?.address} />
            <DetailRow label="RP Contact" value={app.fosterCareInfo.resourceParent?.phoneOrEmail} />
            <DetailRow label="RP Relationship" value={app.fosterCareInfo.resourceParent?.relationship} />
          </div>
        </div>
      )}

      {/* Living Situation */}
      <div>
        <SectionHeader icon={Home} title="Living Situation" />
        <DetailRow label="Current" value={app.livingSituation.currentDescription} />
        <DetailRow label="Will Continue" value={app.livingSituation.willContinue} />
        <DetailRow label="Future Plans" value={app.livingSituation.futurePlans} />
      </div>

      {/* Employment */}
      <div>
        <SectionHeader icon={Briefcase} title="Employment" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <DetailRow label="Employed" value={app.employmentInfo.isEmployed} />
          <DetailRow label="Employer" value={app.employmentInfo.employer} />
          <DetailRow label="Position" value={app.employmentInfo.position} />
          <DetailRow label="Hourly Rate" value={app.employmentInfo.hourlyRate ? `$${app.employmentInfo.hourlyRate}` : undefined} />
          <DetailRow label="Hours/Week" value={app.employmentInfo.hoursPerWeek} />
          <DetailRow label="Responsibilities" value={app.employmentInfo.responsibilities} />
          <DetailRow label="Continue While in School" value={app.employmentInfo.plansToContinueWhileInSchool} />
          <DetailRow label="Seeking Employment" value={app.employmentInfo.isSeekingEmployment} />
        </div>
      </div>

      {/* Essays */}
      <div>
        <SectionHeader icon={FileText} title="Essays" />
        <EssayBlock label="Reason for Request" text={app.essays.reasonForRequest} />
        <EssayBlock label="Education & Career Goals" text={app.essays.educationAndCareerGoals} />
        <EssayBlock label="Plans After Foster Care" text={app.essays.plansAfterFosterCare} />
        <EssayBlock label="Other Resources" text={app.essays.otherResources} />
        <EssayBlock label="Next Step if Denied" text={app.essays.nextStepIfDenied} />
        <EssayBlock label="Why a Good Candidate" text={app.essays.whyGoodCandidate} />
        <EssayBlock label="How Scholarship Has Helped" text={app.essays.howScholarshipHelped} />
      </div>

      {/* Documents */}
      <div>
        <SectionHeader icon={ClipboardList} title="Documents" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: 'HS Diploma/GED', data: app.requiredDocuments.highSchoolDiplomaOrGED },
            { label: 'Transcripts', data: app.requiredDocuments.transcripts },
            { label: 'Enrollment Verification', data: app.requiredDocuments.enrollmentVerification },
            { label: 'Employment Verification', data: app.requiredDocuments.employmentVerification },
          ].map(({ label, data }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              {data.uploaded ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : data.required ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : (
                <span className="w-4 h-4 text-gray-300">—</span>
              )}
              <span className="text-gray-700">{label}</span>
              {!data.required && <span className="text-xs text-gray-400">(optional)</span>}
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm">
            {app.requiredDocuments.recommendationLetter.submitted ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-gray-700">Recommendation Letter</span>
          </div>
        </div>
      </div>

      {/* Admin Notes */}
      <div>
        <SectionHeader icon={MessageSquare} title="Admin Notes" />
        {app.adminNotes && app.adminNotes.length > 0 ? (
          <div className="space-y-2 mb-4">
            {app.adminNotes.map((n, i) => (
              <div key={n._id || i} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800">{n.note}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(n._id)}
                    disabled={!n._id || deletingNoteId === n._id}
                    className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deletingNoteId === n._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-4">No notes yet.</p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
            placeholder="Add a note..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleAddNote}
            disabled={noteLoading || !newNote.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {noteLoading ? '...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Renewal Checklist Detail ---

function ChecklistDetail({ checklist }: { checklist: RenewalChecklist }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div>
        <SectionHeader icon={GraduationCap} title="Academic Update" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
          <DetailRow label="GPA" value={checklist.academicUpdate.currentGPA} />
          <DetailRow label="Units Enrolled" value={checklist.academicUpdate.unitsEnrolled} />
          <DetailRow label="Attendance" value={checklist.academicUpdate.attendanceType} />
        </div>
      </div>
      <div>
        <SectionHeader icon={Briefcase} title="Employment Update" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
          <DetailRow label="Employed" value={checklist.employmentUpdate.isEmployed} />
          <DetailRow label="Employer" value={checklist.employmentUpdate.employer} />
          <DetailRow label="Hours/Week" value={checklist.employmentUpdate.hoursPerWeek} />
        </div>
      </div>
      <div>
        <SectionHeader icon={ClipboardList} title="Compliance Checklist" />
        <ComplianceItem label="Maintained GPA over 2.0" value={checklist.complianceChecklist.maintainedGPAOver2} />
        <ComplianceItem label="Attending full-time or working part-time" value={checklist.complianceChecklist.attendingFullTimeOrWorkingPartTime} />
        <ComplianceItem label="Clean arrest record" value={checklist.complianceChecklist.cleanArrestRecord} />
        <ComplianceItem label="No illegal substances" value={checklist.complianceChecklist.noIllegalSubstances} />
        <ComplianceItem label="Complied with policies" value={checklist.complianceChecklist.compliedWithPolicies} />
      </div>
      {checklist.adminNotes && (
        <div>
          <SectionHeader icon={MessageSquare} title="Admin Notes" />
          <p className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3">{checklist.adminNotes}</p>
        </div>
      )}
    </div>
  );
}

// --- Acceptance Form Detail ---

function AcceptanceFormDetail({ form }: { form: AcceptanceFormData }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <SectionHeader icon={Award} title="Acceptance Details" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <DetailRow label="Accepted Terms" value={form.acceptedTerms} />
        <DetailRow label="Accepted At" value={formatDate(form.acceptedAt)} />
        <DetailRow label="IP Address" value={form.ipAddress} />
        <DetailRow label="Application ID" value={typeof form.applicationId === 'string' ? form.applicationId : form.applicationId?._id || '—'} />
        <DetailRow label="User ID" value={typeof form.userId === 'string' ? form.userId : form.userId?._id || '—'} />
        <DetailRow label="Created" value={formatDate(form.createdAt)} />
      </div>
    </div>
  );
}

// --- Reimbursement Detail ---

function ReimbursementDetail({ reimbursement, onStatusChange }: {
  reimbursement: ReimbursementRequest;
  onStatusChange: (id: string, status: ReimbursementStatus) => void;
}) {
  const [statusLoading, setStatusLoading] = useState('');

  const handleStatusChange = async (newStatus: ReimbursementStatus) => {
    setStatusLoading(newStatus);
    try {
      const res = await fetch(`${API_BASE}/api/reimbursements/${reimbursement._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        onStatusChange(reimbursement._id, newStatus);
      }
    } catch (err) {
      console.error('Failed to update reimbursement status:', err);
    } finally {
      setStatusLoading('');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Status Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Set Status:</span>
        {(['pending', 'approved', 'denied', 'paid'] as ReimbursementStatus[]).map((s) => {
          const icons: Record<string, React.ReactNode> = {
            pending: <Clock className="w-3.5 h-3.5" />,
            approved: <CheckCircle className="w-3.5 h-3.5" />,
            denied: <XCircle className="w-3.5 h-3.5" />,
            paid: <DollarSign className="w-3.5 h-3.5" />,
          };
          const colors: Record<string, string> = {
            pending: 'bg-gray-600 hover:bg-gray-700',
            approved: 'bg-green-600 hover:bg-green-700',
            denied: 'bg-red-600 hover:bg-red-700',
            paid: 'bg-emerald-600 hover:bg-emerald-700',
          };
          const isActive = reimbursement.status === s;
          return (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={isActive || statusLoading !== ''}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors ${
                isActive ? 'opacity-50 cursor-not-allowed ' + colors[s] : colors[s]
              } ${statusLoading === s ? 'opacity-70' : ''}`}
            >
              {icons[s]}
              {statusLoading === s ? 'Updating...' : statusLabels[s]}
            </button>
          );
        })}
      </div>

      {/* Request Info */}
      <div>
        <SectionHeader icon={DollarSign} title="Request Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <DetailRow label="Type" value={reimbursement.requestType === 'tuition_payment' ? 'Tuition Payment' : 'Reimbursement'} />
          <DetailRow label="Amount" value={formatCurrency(reimbursement.amount)} />
          <DetailRow label="Description" value={reimbursement.description} />
          <DetailRow label="Submitted" value={formatDate(reimbursement.submittedAt)} />
          <DetailRow label="Reviewed" value={formatDate(reimbursement.reviewedAt)} />
          <DetailRow label="Paid" value={formatDate(reimbursement.paidAt)} />
        </div>
      </div>

      {/* Payment Info */}
      <div>
        <SectionHeader icon={Briefcase} title="Payment Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <DetailRow label="Payable To" value={reimbursement.paymentInfo.payableTo} />
          <DetailRow label="Payment Method" value={reimbursement.paymentInfo.paymentMethod} />
          <DetailRow label="Account/Address" value={reimbursement.paymentInfo.accountOrAddress} />
        </div>
      </div>

      {/* Receipts */}
      {reimbursement.receipts && reimbursement.receipts.length > 0 && (
        <div>
          <SectionHeader icon={FileText} title="Receipts" />
          <div className="space-y-2">
            {reimbursement.receipts.map((r, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{r.description}</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(r.amount)}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span>{r.category}</span>
                  <span>{formatDate(r.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Notes */}
      {reimbursement.adminNotes && (
        <div>
          <SectionHeader icon={MessageSquare} title="Admin Notes" />
          <p className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3">{reimbursement.adminNotes}</p>
        </div>
      )}
    </div>
  );
}

// --- Student Card (groups applications by student) ---

function StudentCard({ student, onStatusChange, onNoteAdded, onNoteDeleted }: {
  student: StudentGroup;
  onStatusChange: (id: string, status: AppStatus) => void;
  onNoteAdded: (id: string, note: Application['adminNotes'][number]) => void;
  onNoteDeleted: (id: string, noteId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const statusSummary = student.applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => { setIsOpen(!isOpen); if (isOpen) setExpandedAppId(null); }}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{student.name}</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {student.applications.length} {student.applications.length === 1 ? 'application' : 'applications'}
              </span>
              {Object.entries(statusSummary).map(([status]) => (
                <StatusBadge key={status} status={status} />
              ))}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span>{student.email}</span>
              <span>{student.college}</span>
              <span>{student.phone}</span>
            </div>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 pb-4 space-y-3">
          {student.applications.map((app) => {
            const isAppExpanded = expandedAppId === app._id;
            return (
              <div key={app._id}>
                <button
                  onClick={() => setExpandedAppId(isAppExpanded ? null : app._id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <TypeBadge type={app.applicationType} />
                      <StatusBadge status={app.status} />
                      <span className="text-sm text-gray-600">{app.academicYear}</span>
                      <span className="text-sm text-gray-400">{app.educationInfo.collegeName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{formatDate(app.submittedAt || app.createdAt)}</span>
                    {isAppExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>
                {isAppExpanded && (
                  <div className="mt-2 ml-4">
                    <ApplicationDetail
                      app={app}
                      onStatusChange={onStatusChange}
                      onNoteAdded={onNoteAdded}
                      onNoteDeleted={onNoteDeleted}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Group applications by student email ---

function groupByStudent(applications: Application[]): StudentGroup[] {
  const map = new Map<string, StudentGroup>();

  for (const app of applications) {
    const email = app.personalInfo.email.toLowerCase();
    if (!map.has(email)) {
      map.set(email, {
        email: app.personalInfo.email,
        name: app.personalInfo.fullName,
        college: app.educationInfo.collegeName,
        phone: app.personalInfo.phone,
        applications: [],
      });
    }
    map.get(email)!.applications.push(app);
  }

  return Array.from(map.values()).sort((a, b) => {
    const aDate = a.applications[0]?.createdAt || '';
    const bDate = b.applications[0]?.createdAt || '';
    return bDate.localeCompare(aDate);
  });
}

// --- Main Admin Page ---

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<TabType>('students');
  const [applications, setApplications] = useState<Application[]>([]);
  const [checklists, setChecklists] = useState<RenewalChecklist[]>([]);
  const [acceptanceForms, setAcceptanceForms] = useState<AcceptanceFormData[]>([]);
  const [reimbursements, setReimbursements] = useState<ReimbursementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Auth guard: redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace('/login');
    }
  }, [authLoading, user, isAdmin, router]);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('applicationType', typeFilter);
      const res = await fetch(`${API_BASE}/api/applications?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setApplications(data.applications);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  const fetchChecklists = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`${API_BASE}/api/renewal-checklists?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setChecklists(data.checklists);
    } catch (err) {
      console.error('Failed to fetch checklists:', err);
    }
  };

  const fetchAcceptanceForms = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/acceptance-forms`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Acceptance forms request failed (${res.status})`);
      }
      const data = await res.json();
      if (data.success) setAcceptanceForms(data.forms);
      else throw new Error(data.message || 'Failed to fetch acceptance forms');
    } catch (err) {
      console.error('Failed to fetch acceptance forms:', err);
      setAcceptanceForms([]);
    }
  };

  const fetchReimbursements = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`${API_BASE}/api/reimbursements?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setReimbursements(data.reimbursements);
    } catch (err) {
      console.error('Failed to fetch reimbursements:', err);
    }
  };

  const refresh = async () => {
    setLoading(true);
    if (tab === 'students') await fetchApplications();
    else if (tab === 'checklists') await fetchChecklists();
    else if (tab === 'acceptance') await fetchAcceptanceForms();
    else if (tab === 'reimbursements') await fetchReimbursements();
    setLoading(false);
  };

  useEffect(() => {
    setExpandedId(null);
    refresh();
  }, [tab, statusFilter, typeFilter]);

  const handleStatusChange = (id: string, newStatus: AppStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a))
    );
  };

  const handleNoteAdded = (id: string, note: Application['adminNotes'][number]) => {
    setApplications((prev) =>
      prev.map((a) =>
        a._id === id
          ? { ...a, adminNotes: [...a.adminNotes, note] }
          : a
      )
    );
  };

  const handleNoteDeleted = (id: string, noteId: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a._id === id
          ? { ...a, adminNotes: a.adminNotes.filter((n) => n._id !== noteId) }
          : a
      )
    );
  };

  const handleReimbursementStatusChange = (id: string, newStatus: ReimbursementStatus) => {
    setReimbursements((prev) =>
      prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
    );
  };

  const students = groupByStudent(applications);

  const switchTab = (newTab: TabType) => {
    setTab(newTab);
    setStatusFilter('all');
    setTypeFilter('all');
  };

  // Show nothing while checking auth
  if (authLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const renderFilters = () => {
    if (tab === 'students') {
      return (
        <>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="all">All Types</option>
            <option value="new">New</option>
            <option value="renewal">Renewal</option>
          </select>
        </>
      );
    }
    if (tab === 'checklists') {
      return (
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
        </select>
      );
    }
    if (tab === 'reimbursements') {
      return (
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
          <option value="paid">Paid</option>
        </select>
      );
    }
    // acceptance tab has no filters
    return <span className="text-sm text-gray-400">No filters available</span>;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-12 text-center text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p>Loading...</p>
        </div>
      );
    }

    if (tab === 'students') {
      if (students.length === 0) {
        return (
          <div className="p-12 text-center text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-3" />
            <p>No students found.</p>
          </div>
        );
      }
      return (
        <div>
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">
              {students.length} {students.length === 1 ? 'student' : 'students'} — {applications.length} total {applications.length === 1 ? 'application' : 'applications'}
            </span>
          </div>
          {students.map((student) => (
            <StudentCard
              key={student.email}
              student={student}
              onStatusChange={handleStatusChange}
              onNoteAdded={handleNoteAdded}
              onNoteDeleted={handleNoteDeleted}
            />
          ))}
        </div>
      );
    }

    if (tab === 'checklists') {
      if (checklists.length === 0) {
        return (
          <div className="p-12 text-center text-gray-400">
            <StickyNote className="w-8 h-8 mx-auto mb-3" />
            <p>No renewal checklists found.</p>
          </div>
        );
      }
      return (
        <div>
          {checklists.map((cl) => {
            const isExpanded = expandedId === cl._id;
            const userName = [cl.userId?.profile?.firstName, cl.userId?.profile?.lastName]
              .filter(Boolean)
              .join(' ')
              || cl.applicationId?.personalInfo?.fullName
              || 'Unknown student';
            const userEmail = cl.userId?.email || cl.applicationId?.personalInfo?.email || 'No email';
            const collegeName = cl.applicationId?.educationInfo?.collegeName;
            const appType = cl.applicationId?.applicationType;
            return (
              <div key={cl._id} className="border-b border-gray-100 last:border-b-0">
                <button onClick={() => setExpandedId(isExpanded ? null : cl._id)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {userName}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{cl.academicYear} — {cl.reportingPeriod}</span>
                      <StatusBadge status={cl.status} />
                      {appType && <TypeBadge type={appType} />}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{userEmail}</span>
                      {collegeName && <span>{collegeName}</span>}
                      <span className="text-gray-400">Checklist #{cl._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>GPA: {cl.academicUpdate.currentGPA}</span>
                      <span>{cl.academicUpdate.unitsEnrolled} units</span>
                      <span>{formatDate(cl.submittedAt || cl.createdAt)}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {isExpanded && <div className="px-6 pb-4"><ChecklistDetail checklist={cl} /></div>}
              </div>
            );
          })}
        </div>
      );
    }

    if (tab === 'acceptance') {
      if (acceptanceForms.length === 0) {
        return (
          <div className="p-12 text-center text-gray-400">
            <Award className="w-8 h-8 mx-auto mb-3" />
            <p>No acceptance forms found.</p>
          </div>
        );
      }
      return (
        <div>
          {acceptanceForms.map((form) => {
            const isExpanded = expandedId === form._id;
            return (
              <div key={form._id} className="border-b border-gray-100 last:border-b-0">
                <button onClick={() => setExpandedId(isExpanded ? null : form._id)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">Acceptance Form</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${form.acceptedTerms ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {form.acceptedTerms ? 'Accepted' : 'Not Accepted'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>Accepted: {formatDate(form.acceptedAt)}</span>
                      <span>IP: {form.ipAddress}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {isExpanded && <div className="px-6 pb-4"><AcceptanceFormDetail form={form} /></div>}
              </div>
            );
          })}
        </div>
      );
    }

    if (tab === 'reimbursements') {
      if (reimbursements.length === 0) {
        return (
          <div className="p-12 text-center text-gray-400">
            <DollarSign className="w-8 h-8 mx-auto mb-3" />
            <p>No reimbursement requests found.</p>
          </div>
        );
      }
      return (
        <div>
          {reimbursements.map((r) => {
            const isExpanded = expandedId === r._id;
            return (
              <div key={r._id} className="border-b border-gray-100 last:border-b-0">
                <button onClick={() => setExpandedId(isExpanded ? null : r._id)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{formatCurrency(r.amount)}</span>
                      <RequestTypeBadge type={r.requestType} />
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{r.description}</span>
                      <span>To: {r.paymentInfo.payableTo}</span>
                      <span>{formatDate(r.submittedAt || r.createdAt)}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {isExpanded && <div className="px-6 pb-4"><ReimbursementDetail reimbursement={r} onStatusChange={handleReimbursementStatusChange} /></div>}
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-indigo-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Review applications, checklists, acceptances, and reimbursements</p>
              </div>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-lg shadow-md p-1 mb-6">
          {([
            { key: 'students' as TabType, label: 'Students', icon: Users },
            { key: 'checklists' as TabType, label: 'Checklists', icon: StickyNote },
            { key: 'acceptance' as TabType, label: 'Acceptances', icon: Award },
            { key: 'reimbursements' as TabType, label: 'Reimbursements', icon: DollarSign },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                tab === key ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              <span>Filters:</span>
            </div>
            {renderFilters()}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
