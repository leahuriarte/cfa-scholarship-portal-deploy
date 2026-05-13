"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardList, ChevronDown, ChevronUp, Filter, RefreshCw,
  CheckCircle, XCircle, Clock, Send, ArrowLeft, StickyNote,
  GraduationCap, User, Briefcase, Home, FileText, MessageSquare,
  Users, DollarSign, Award, Settings
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type AppStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'denied';
type ChecklistStatus = 'pending' | 'submitted' | 'reviewed';
type TabType = 'students' | 'new-applications' | 'checklists' | 'acceptance' | 'settings';
type ReimbursementStatus = 'pending' | 'approved' | 'denied' | 'paid';

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
  userId: { _id: string; email: string; profile?: { firstName?: string; lastName?: string } } | null;
  applicationId: Application | null;
  acceptedTerms: boolean;
  acceptedAt: string;
  ipAddress: string;
  fullName?: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  requestAmount?: string;
  cardLastFour?: string;
  formPurpose?: string;
  createdAt: string;
}

interface AdminUser {
  _id: string;
  email: string;
  role: string;
  profile: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
  };
  createdAt: string;
  updatedAt: string;
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
  acceptanceForms: AcceptanceFormData[];
  checklists: RenewalChecklist[];
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
  const [appFiles, setAppFiles] = useState<Array<{ id: string; originalName: string; documentType: string; mimeType: string }>>([]);
  const [viewingFileId, setViewingFileId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/files/entity/application/${app._id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setAppFiles(data.files ?? []))
      .catch(() => {});
  }, [app._id]);

  const handleViewFile = async (fileId: string) => {
    setViewingFileId(fileId);
    try {
      const res = await fetch(`${API_BASE}/api/files/${fileId}/presigned-url`, { credentials: 'include' });
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
    } catch {
      // ignore
    } finally {
      setViewingFileId(null);
    }
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
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
        {appFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Uploaded Files</p>
            {appFiles.map(file => (
              <div key={file.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{file.originalName}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{file.documentType}</span>
                </div>
                <button
                  onClick={() => handleViewFile(file.id)}
                  disabled={viewingFileId === file.id}
                  className="ml-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium flex-shrink-0 disabled:opacity-50"
                >
                  {viewingFileId === file.id ? 'Opening...' : 'View'}
                </button>
              </div>
            ))}
          </div>
        )}
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
  const studentName =
    (typeof form.applicationId === 'object' ? form.applicationId?.personalInfo?.fullName : null)
    || form.fullName
    || (typeof form.userId === 'object' ? [form.userId?.profile?.firstName, form.userId?.profile?.lastName].filter(Boolean).join(' ') : null)
    || null;

  const studentEmail =
    (typeof form.applicationId === 'object' ? form.applicationId?.personalInfo?.email : null)
    || (typeof form.userId === 'object' ? form.userId?.email : null)
    || null;

  const userName = form.userId
    ? [form.userId.profile?.firstName, form.userId.profile?.lastName].filter(Boolean).join(' ') || form.userId.email
    : null;
  const app = form.applicationId;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div>
        <SectionHeader icon={Award} title="Acceptance Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          {studentName && <DetailRow label="Student Name" value={studentName} />}
          {studentEmail && <DetailRow label="Student Email" value={studentEmail} />}
          <DetailRow label="Accepted Terms" value={form.acceptedTerms} />
          <DetailRow label="Accepted At" value={formatDate(form.acceptedAt)} />
          <DetailRow label="IP Address" value={form.ipAddress} />
          <DetailRow label="Submitted" value={formatDate(form.createdAt)} />
        </div>
      </div>
      {(form.companyName || form.requestAmount || form.cardLastFour || form.formPurpose) && (
        <div>
          <SectionHeader icon={DollarSign} title="Payment / Disbursement Request" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <DetailRow label="Payable To (Name)" value={form.fullName} />
            <DetailRow label="Company / Institution" value={form.companyName} />
            <DetailRow label="Company Address" value={form.companyAddress} />
            <DetailRow label="Company Phone" value={form.companyPhone} />
            <DetailRow label="Request Amount" value={form.requestAmount} />
            <DetailRow label="Card Last Four" value={form.cardLastFour} />
            <DetailRow label="Purpose" value={form.formPurpose} />
          </div>
        </div>
      )}
      {app && (
        <div>
          <SectionHeader icon={GraduationCap} title="Application" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <DetailRow label="Type" value={app.applicationType === 'new' ? 'New Application' : 'Renewal'} />
            <DetailRow label="Academic Year" value={app.academicYear} />
            <DetailRow label="College" value={app.educationInfo?.collegeName} />
            <DetailRow label="Status" value={<StatusBadge status={app.status} />} />
            <DetailRow label="Name on Application" value={app.personalInfo?.fullName} />
            <DetailRow label="Email on Application" value={app.personalInfo?.email} />
          </div>
        </div>
      )}
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
    </div>
  );
}

// --- Student Card (groups all records by student) ---

function StudentCard({ student, onStatusChange, onNoteAdded, onNoteDeleted }: {
  student: StudentGroup;
  onStatusChange: (id: string, status: AppStatus) => void;
  onNoteAdded: (id: string, note: Application['adminNotes'][number]) => void;
  onNoteDeleted: (id: string, noteId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [expandedFormId, setExpandedFormId] = useState<string | null>(null);
  const [expandedChecklistId, setExpandedChecklistId] = useState<string | null>(null);

  const statusSummary = student.applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const totalCount = student.applications.length + student.acceptanceForms.length + student.checklists.length;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => { setIsOpen(!isOpen); if (isOpen) { setExpandedAppId(null); setExpandedFormId(null); setExpandedChecklistId(null); } }}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{student.name}</span>
              {student.applications.filter(a => a.applicationType === 'new').length > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {student.applications.filter(a => a.applicationType === 'new').length} new
                </span>
              )}
              {student.applications.filter(a => a.applicationType === 'renewal').length > 0 && (
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {student.applications.filter(a => a.applicationType === 'renewal').length} renewal
                </span>
              )}
              {student.acceptanceForms.length > 0 && (
                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  {student.acceptanceForms.length} {student.acceptanceForms.length === 1 ? 'acceptance' : 'acceptances'}
                </span>
              )}
              {student.checklists.length > 0 && (
                <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                  {student.checklists.length} {student.checklists.length === 1 ? 'checklist' : 'checklists'}
                </span>
              )}
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
        <div className="px-6 pb-4 space-y-4">
          {/* New Applications */}
          {student.applications.filter(a => a.applicationType === 'new').length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">New Applications</p>
              <div className="space-y-2">
                {student.applications.filter(a => a.applicationType === 'new').map((app) => {
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
                            <StatusBadge status={app.status} />
                            <span className="text-sm text-gray-600">{app.academicYear}</span>
                            <span className="text-sm text-gray-400">{app.educationInfo.collegeName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{formatDate(app.submittedAt || app.createdAt)}</span>
                          {isAppExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </button>
                      {isAppExpanded && (
                        <div className="mt-2 ml-4">
                          <ApplicationDetail app={app} onStatusChange={onStatusChange} onNoteAdded={onNoteAdded} onNoteDeleted={onNoteDeleted} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Renewals */}
          {student.applications.filter(a => a.applicationType === 'renewal').length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Renewals</p>
              <div className="space-y-2">
                {student.applications.filter(a => a.applicationType === 'renewal').map((app) => {
                  const isAppExpanded = expandedAppId === app._id;
                  return (
                    <div key={app._id}>
                      <button
                        onClick={() => setExpandedAppId(isAppExpanded ? null : app._id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                          <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={app.status} />
                            <span className="text-sm text-gray-600">{app.academicYear}</span>
                            <span className="text-sm text-gray-400">{app.educationInfo.collegeName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{formatDate(app.submittedAt || app.createdAt)}</span>
                          {isAppExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </button>
                      {isAppExpanded && (
                        <div className="mt-2 ml-4">
                          <ApplicationDetail app={app} onStatusChange={onStatusChange} onNoteAdded={onNoteAdded} onNoteDeleted={onNoteDeleted} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Acceptance Forms */}
          {student.acceptanceForms.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Acceptances</p>
              <div className="space-y-2">
                {student.acceptanceForms.map((form) => {
                  const isFormExpanded = expandedFormId === form._id;
                  const hasPaymentInfo = !!(form.companyName || form.requestAmount || form.cardLastFour);
                  return (
                    <div key={form._id}>
                      <button
                        onClick={() => setExpandedFormId(isFormExpanded ? null : form._id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Award className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${form.acceptedTerms ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {form.acceptedTerms ? 'Terms Accepted' : 'Not Accepted'}
                            </span>
                            {hasPaymentInfo && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                Payment Request
                              </span>
                            )}
                            {form.requestAmount && (
                              <span className="text-sm text-gray-600">{form.requestAmount}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{formatDate(form.acceptedAt)}</span>
                          {isFormExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>
                      {isFormExpanded && (
                        <div className="mt-2 ml-4">
                          <AcceptanceFormDetail form={form} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Renewal Checklists */}
          {student.checklists.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Renewal Checklists</p>
              <div className="space-y-2">
                {student.checklists.map((cl) => {
                  const isClExpanded = expandedChecklistId === cl._id;
                  return (
                    <div key={cl._id}>
                      <button
                        onClick={() => setExpandedChecklistId(isClExpanded ? null : cl._id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <StickyNote className="w-4 h-4 text-teal-400 flex-shrink-0" />
                          <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={cl.status} />
                            <span className="text-sm text-gray-600">{cl.academicYear} — {cl.reportingPeriod}</span>
                            <span className="text-sm text-gray-400">GPA: {cl.academicUpdate.currentGPA}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{formatDate(cl.submittedAt || cl.createdAt)}</span>
                          {isClExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>
                      {isClExpanded && (
                        <div className="mt-2 ml-4">
                          <ChecklistDetail checklist={cl} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {totalCount === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No records found for this student.</p>
          )}
        </div>
      )}
    </div>
  );
}

// --- Person Card (accounts view) ---

function PersonCard({ user }: { user: AdminUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [userChecklists, setUserChecklists] = useState<RenewalChecklist[]>([]);
  const [userForms, setUserForms] = useState<AcceptanceFormData[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const fetchUserData = async () => {
    setLoadingData(true);
    try {
      const [appsRes, checklistsRes, formsRes] = await Promise.all([
        fetch(`${API_BASE}/api/applications?userId=${user._id}`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/renewal-checklists?userId=${user._id}`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/acceptance-forms?userId=${user._id}`, { credentials: 'include' }),
      ]);
      const [appsData, checklistsData, formsData] = await Promise.all([
        appsRes.json(), checklistsRes.json(), formsRes.json(),
      ]);
      if (appsData.success) setUserApplications(appsData.applications);
      if (checklistsData.success) setUserChecklists(checklistsData.checklists);
      if (formsData.success) setUserForms(formsData.forms);
      setFetched(true);
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleToggle = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen && !fetched) fetchUserData();
    if (!willOpen) setExpandedItemId(null);
  };

  const handleStatusChange = (id: string, newStatus: AppStatus) => {
    setUserApplications(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
  };

  const handleNoteAdded = (id: string, note: Application['adminNotes'][number]) => {
    setUserApplications(prev => prev.map(a => a._id === id ? { ...a, adminNotes: [...a.adminNotes, note] } : a));
  };

  const handleNoteDeleted = (id: string, noteId: string) => {
    setUserApplications(prev => prev.map(a => a._id === id ? { ...a, adminNotes: a.adminNotes.filter(n => n._id !== noteId) } : a));
  };

  const fullName = [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') || user.email;
  const totalSubmissions = userApplications.length + userChecklists.length + userForms.length;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={handleToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{fullName}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                {user.role}
              </span>
              {fetched && totalSubmissions > 0 && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {totalSubmissions} {totalSubmissions === 1 ? 'submission' : 'submissions'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span>{user.email}</span>
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>

      {isOpen && (
        <div className="px-6 pb-4 space-y-4">
          {loadingData ? (
            <div className="py-6 text-center text-gray-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading submissions...</p>
            </div>
          ) : (
            <>
              {userApplications.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Applications ({userApplications.length})
                  </p>
                  <div className="space-y-2">
                    {userApplications.map((app) => {
                      const isExpanded = expandedItemId === app._id;
                      return (
                        <div key={app._id}>
                          <button
                            onClick={() => setExpandedItemId(isExpanded ? null : app._id)}
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
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{formatDate(app.submittedAt || app.createdAt)}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="mt-2 ml-4">
                              <ApplicationDetail
                                app={app}
                                onStatusChange={handleStatusChange}
                                onNoteAdded={handleNoteAdded}
                                onNoteDeleted={handleNoteDeleted}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {userChecklists.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Renewal Checklists ({userChecklists.length})
                  </p>
                  <div className="space-y-2">
                    {userChecklists.map((cl) => {
                      const isExpanded = expandedItemId === cl._id;
                      return (
                        <div key={cl._id}>
                          <button
                            onClick={() => setExpandedItemId(isExpanded ? null : cl._id)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <StickyNote className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <StatusBadge status={cl.status} />
                              <span className="text-sm text-gray-600">{cl.academicYear} — {cl.reportingPeriod}</span>
                              <span className="text-sm text-gray-400">GPA: {cl.academicUpdate.currentGPA}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{formatDate(cl.submittedAt || cl.createdAt)}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="mt-2 ml-4">
                              <ChecklistDetail checklist={cl} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {userForms.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Scholarship Acceptances ({userForms.length})
                  </p>
                  <div className="space-y-2">
                    {userForms.map((form) => {
                      const isExpanded = expandedItemId === form._id;
                      return (
                        <div key={form._id}>
                          <button
                            onClick={() => setExpandedItemId(isExpanded ? null : form._id)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <Award className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${form.acceptedTerms ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {form.acceptedTerms ? 'Accepted' : 'Not Accepted'}
                              </span>
                              {form.applicationId && (
                                <span className="text-sm text-gray-400">{form.applicationId.educationInfo?.collegeName}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{formatDate(form.acceptedAt)}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="mt-2 ml-4">
                              <AcceptanceFormDetail form={form} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {fetched && totalSubmissions === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">No submissions found for this account.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// --- Group all records by student email ---

function groupByStudent(
  applications: Application[],
  acceptanceForms: AcceptanceFormData[],
  checklists: RenewalChecklist[]
): StudentGroup[] {
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
        acceptanceForms: [],
        checklists: [],
      });
    }
    map.get(email)!.applications.push(app);
  }

  for (const form of acceptanceForms) {
    const appEmail = typeof form.applicationId === 'object'
      ? form.applicationId?.personalInfo?.email?.toLowerCase()
      : null;
    const userEmail = typeof form.userId === 'object'
      ? form.userId?.email?.toLowerCase()
      : null;
    const email = appEmail || userEmail;

    if (email && map.has(email)) {
      map.get(email)!.acceptanceForms.push(form);
    } else {
      // Form with no matching application — create a standalone entry
      const fallbackKey = `__form__${form._id}`;
      const fallbackName = form.fullName
        || (typeof form.userId === 'object' ? [form.userId?.profile?.firstName, form.userId?.profile?.lastName].filter(Boolean).join(' ') : null)
        || 'Unknown Student';
      map.set(fallbackKey, {
        email: userEmail || '',
        name: fallbackName,
        college: '',
        phone: '',
        applications: [],
        acceptanceForms: [form],
        checklists: [],
      });
    }
  }

  for (const cl of checklists) {
    const appEmail = typeof cl.applicationId === 'object'
      ? cl.applicationId?.personalInfo?.email?.toLowerCase()
      : null;
    const userEmail = typeof cl.userId === 'object'
      ? cl.userId?.email?.toLowerCase()
      : null;
    const email = appEmail || userEmail;

    if (email && map.has(email)) {
      map.get(email)!.checklists.push(cl);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const aDate = a.applications[0]?.createdAt || a.acceptanceForms[0]?.createdAt || '';
    const bDate = b.applications[0]?.createdAt || b.acceptanceForms[0]?.createdAt || '';
    return bDate.localeCompare(aDate);
  });
}

function getAcademicYears(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let y = currentYear - 3; y <= currentYear + 1; y++) {
    years.push(`${y}-${y + 1}`);
  }
  return years.reverse();
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
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [nameSearch, setNameSearch] = useState<string>('');
  const [siteSettings, setSiteSettings] = useState({ schoolYear: '', deadline: '' });
  const [settingsForm, setSettingsForm] = useState({ schoolYear: '', deadline: '' });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Auth guard: redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace('/login');
    }
  }, [authLoading, user, isAdmin, router]);

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then(r => r.json())
      .then(data => {
        if (data.schoolYear) {
          setSiteSettings(data);
          setSettingsForm(data);
        }
      })
      .catch(() => {});
  }, []);

  const fetchApplications = async (applicationType?: string) => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const type = applicationType ?? (typeFilter !== 'all' ? typeFilter : undefined);
      if (type) params.set('applicationType', type);
      if (yearFilter !== 'all') params.set('academicYear', yearFilter);
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
      if (yearFilter !== 'all') params.set('academicYear', yearFilter);
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
      if (!res.ok) throw new Error(`Acceptance forms request failed (${res.status})`);
      const data = await res.json();
      if (data.success) setAcceptanceForms(data.forms);
      else throw new Error(data.message || 'Failed to fetch acceptance forms');
    } catch (err) {
      console.error('Failed to fetch acceptance forms:', err);
      setAcceptanceForms([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, { credentials: 'include' });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
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
    if (tab === 'settings') return;
    setLoading(true);
    if (tab === 'students') {
      await Promise.all([fetchApplications(), fetchAcceptanceForms(), fetchChecklists()]);
    } else if (tab === 'new-applications') {
      await fetchApplications('new');
    } else if (tab === 'checklists') {
      await fetchChecklists();
    } else if (tab === 'acceptance') {
      await fetchAcceptanceForms();
    }
    setLoading(false);
  };

  useEffect(() => {
    setExpandedId(null);
    refresh();
  }, [tab, statusFilter, typeFilter, yearFilter]);

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

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    setSettingsMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (res.ok) {
        setSiteSettings(data);
        setSettingsMsg('Settings saved successfully.');
      } else {
        setSettingsMsg(data.message || 'Failed to save settings.');
      }
    } catch {
      setSettingsMsg('Failed to save settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const allStudents = groupByStudent(applications, acceptanceForms, checklists);
  const students = nameSearch.trim()
    ? allStudents.filter(s =>
        s.name.toLowerCase().includes(nameSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(nameSearch.toLowerCase())
      )
    : allStudents;

  const academicYears = getAcademicYears();

  const switchTab = (newTab: TabType) => {
    setTab(newTab);
    setStatusFilter('all');
    setTypeFilter('all');
    setYearFilter('all');
    setNameSearch('');
  };

  // Show nothing while checking auth
  if (authLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const yearSelect = (
    <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
      <option value="all">All Years</option>
      {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
    </select>
  );

  const statusSelect = (
    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
      <option value="all">All Statuses</option>
      <option value="submitted">Submitted</option>
      <option value="under_review">Under Review</option>
      <option value="approved">Approved</option>
      <option value="denied">Denied</option>
    </select>
  );

  const renderFilters = () => {
    if (tab === 'students') {
      return (
        <>
          <input
            type="search"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-56"
          />
          {statusSelect}
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="all">All Types</option>
            <option value="new">New</option>
            <option value="renewal">Renewal</option>
          </select>
          {yearSelect}
        </>
      );
    }
    if (tab === 'new-applications') {
      return (
        <>
          {statusSelect}
          {yearSelect}
        </>
      );
    }
    if (tab === 'checklists') {
      return (
        <>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
          </select>
          {yearSelect}
        </>
      );
    }
    if (tab === 'acceptance') {
      return yearSelect;
    }
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
            <p>No new applications found.</p>
          </div>
        );
      }
      return (
        <div>
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">
              {students.length} {students.length === 1 ? 'student' : 'students'} — {applications.length} total {applications.length === 1 ? 'application' : 'applications'}
              {nameSearch && ` (filtered by "${nameSearch}")`}
            </span>
          </div>
          {students.map((student) => (
            <StudentCard
              key={student.email || student.name}
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
      const visibleForms = yearFilter === 'all'
        ? acceptanceForms
        : acceptanceForms.filter(f =>
            typeof f.applicationId === 'object'
              ? f.applicationId?.academicYear === yearFilter
              : false
          );
      if (visibleForms.length === 0) {
        return (
          <div className="p-12 text-center text-gray-400">
            <Award className="w-8 h-8 mx-auto mb-3" />
            <p>No acceptance forms found.</p>
          </div>
        );
      }
      return (
        <div>
          {visibleForms.map((form) => {
            const isExpanded = expandedId === form._id;
            const studentName =
              (typeof form.applicationId === 'object' ? form.applicationId?.personalInfo?.fullName : null)
              || form.fullName
              || (typeof form.userId === 'object' ? [form.userId?.profile?.firstName, form.userId?.profile?.lastName].filter(Boolean).join(' ') : null)
              || 'Unknown Student';
            const studentEmail =
              (typeof form.applicationId === 'object' ? form.applicationId?.personalInfo?.email : null)
              || (typeof form.userId === 'object' ? form.userId?.email : null)
              || null;
            const hasPaymentInfo = !!(form.companyName || form.requestAmount || form.cardLastFour);
            const formUserName = form.userId
              ? [form.userId.profile?.firstName, form.userId.profile?.lastName].filter(Boolean).join(' ') || form.userId.email
              : null;
            const formApp = form.applicationId;
            return (
              <div key={form._id} className="border-b border-gray-100 last:border-b-0">
                <button onClick={() => setExpandedId(isExpanded ? null : form._id)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 flex-shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{studentName}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${form.acceptedTerms ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {form.acceptedTerms ? 'Accepted' : 'Not Accepted'}
                        </span>
                        {hasPaymentInfo && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Payment Request
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        {studentEmail && <span>{studentEmail}</span>}
                        {formApp && <span>{formApp.educationInfo?.collegeName}</span>}
                        <span>Accepted: {formatDate(form.acceptedAt)}</span>
                        {form.requestAmount && <span>Amount: {form.requestAmount}</span>}
                      </div>
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

    if (tab === 'new-applications') {
      if (applications.length === 0) {
        return (
          <div className="p-12 text-center text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-3" />
            <p>No new applications found.</p>
          </div>
        );
      }
      return (
        <div>
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">
              {applications.length} {applications.length === 1 ? 'application' : 'applications'}
            </span>
          </div>
          {applications.map((app) => {
            const isExpanded = expandedId === app._id;
            return (
              <div key={app._id} className="border-b border-gray-100 last:border-b-0">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : app._id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{app.personalInfo.fullName}</span>
                      <StatusBadge status={app.status} />
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{app.academicYear}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{app.personalInfo.email}</span>
                      <span>{app.educationInfo.collegeName}</span>
                      <span>{formatDate(app.submittedAt || app.createdAt)}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-6 pb-4">
                    <ApplicationDetail
                      app={app}
                      onStatusChange={handleStatusChange}
                      onNoteAdded={handleNoteAdded}
                      onNoteDeleted={handleNoteDeleted}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (tab === 'settings') {
      return (
        <div className="p-8 max-w-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Site Settings</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Year</label>
              <input
                type="text"
                value={settingsForm.schoolYear}
                onChange={e => setSettingsForm(f => ({ ...f, schoolYear: e.target.value }))}
                placeholder="e.g. 2025-2026"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Shown on application forms and used when submitting applications.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
              <input
                type="text"
                value={settingsForm.deadline}
                onChange={e => setSettingsForm(f => ({ ...f, deadline: e.target.value }))}
                placeholder="e.g. June 1st, 2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Shown on the home page, new applicant page, and renewal page.</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveSettings}
                disabled={settingsSaving}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {settingsSaving ? 'Saving…' : 'Save Settings'}
              </button>
              {settingsMsg && (
                <span className={`text-sm ${settingsMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {settingsMsg}
                </span>
              )}
            </div>
            {siteSettings.schoolYear && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                <strong>Current:</strong> {siteSettings.schoolYear} — Deadline: {siteSettings.deadline}
              </div>
            )}
          </div>
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
                <p className="text-sm text-gray-500">Review applications, acceptances, and checklists</p>
              </div>
            </div>
            {tab !== 'settings' && (
              <button
                onClick={refresh}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-lg shadow-md p-1 mb-6">
          {([
            { key: 'students' as TabType, label: 'Accounts', icon: Users },
            { key: 'new-applications' as TabType, label: 'New Applications', icon: FileText },
            { key: 'checklists' as TabType, label: 'Renewal Checklists', icon: StickyNote },
            { key: 'acceptance' as TabType, label: 'Acceptances', icon: Award },
            { key: 'settings' as TabType, label: 'Settings', icon: Settings },
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
        {tab !== 'settings' && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Filter className="w-4 h-4" />
                <span>Filters:</span>
              </div>
              {renderFilters()}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
