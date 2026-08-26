export type Role =
  | 'USER'
  | 'LAWYER'
  | 'PSYCHOLOGIST'
  | 'SUPPORT_WORKER'
  | 'MODERATOR'
  | 'ADMIN'

export type UserStatus = 'ACTIVE' | 'LOCKED' | 'SUSPENDED' | 'DEACTIVATED'

export type Gender = 'WOMAN' | 'TRANS_WOMAN' | 'PREFER_NOT_TO_SAY'

export type MaritalStatus =
  | 'SINGLE' | 'MARRIED' | 'SEPARATED' | 'DIVORCED' | 'WIDOWED' | 'PREFER_NOT_TO_SAY'

export type OccupationStatus =
  | 'STUDENT' | 'EMPLOYED' | 'SELF_EMPLOYED' | 'HOMEMAKER' | 'UNEMPLOYED' | 'PREFER_NOT_TO_SAY'

export type LanguageCode = 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn'

export interface Profile {
  displayName: string | null
  phone: string | null
  gender: Gender | null
  dateOfBirth: string | null
  maritalStatus: MaritalStatus | null
  occupationStatus: OccupationStatus | null
  city: string | null
  district: string | null
  state: string | null
  preferredLanguage: LanguageCode
}

export interface User {
  id: string
  email: string
  role: Role
  status: UserStatus
  profile: Profile | null
  createdAt: string
}

export interface AuthResult {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresInSeconds: number
  user: User
}

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  timestamp: string
}

export interface ApiFieldError {
  field: string
  message: string
}

export interface ApiErrorBody {
  success: false
  code: string
  message: string
  fieldErrors?: ApiFieldError[]
  timestamp: string
}

// ── Cases ─────────────────────────────────────────────────────

export type PrivacyMode = 'ANONYMOUS' | 'CONFIDENTIAL' | 'IDENTIFIED'

export type CaseStatus = 'OPEN' | 'AWAITING_SUPPORT' | 'SUPPORTED' | 'CLOSED'

export type LegalPathway =
  | 'UNDECIDED'
  | 'LEGAL_AID'
  | 'PRIVATE_COUNSEL'
  | 'NOT_SEEKING_LEGAL'

export type SenderType = 'USER' | 'ASSISTANT' | 'PROFESSIONAL' | 'SYSTEM'

export interface CaseMessage {
  id: string
  senderType: SenderType
  content: string
  language: LanguageCode
  createdAt: string
}

export interface Case {
  id: string
  reference: string
  privacyMode: PrivacyMode
  status: CaseStatus
  legalPathway: LegalPathway
  title: string | null
  summary: string | null
  primaryLanguage: LanguageCode
  messages: CaseMessage[]
  lastActivityAt: string
  createdAt: string
}

export interface CaseSummary {
  id: string
  reference: string
  privacyMode: PrivacyMode
  status: CaseStatus
  legalPathway: LegalPathway
  title: string | null
  messageCount: number
  lastActivityAt: string
  createdAt: string
}

export interface CaseCreated {
  caseDetail: Case
  accessKey: string | null
  accessKeyNotice: string | null
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// ── Analysis ──────────────────────────────────────────────────

export type ConcernLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'IMMEDIATE_SAFETY_CONCERN'
export type SafetyLevel = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH'
export type SupportType = 'LEGAL' | 'PSYCHOLOGICAL' | 'GENERAL' | 'FINANCIAL' | 'SAFETY'

export interface CategoryFinding {
  category: string
  label: string
  level: ConcernLevel
  reason: string
  matchedSignals: string[]
}

export interface AIAnalysis {
  categories: CategoryFinding[]
  distressIndicators: string[]
  supportTypes: SupportType[]
  safetyLevel: SafetyLevel
  followUpQuestions: string[]
  response: string
  disclaimer: string
  detectedLanguage: LanguageCode
}

export interface ChatReply {
  reply: string
  suggestedReplies: string[]
  analysis: AIAnalysis
  disclaimer: string
}

export interface Transcription {
  transcript: string
  detectedLanguage: LanguageCode
  confidence: number
  durationSeconds: number
}

// ── Legal ─────────────────────────────────────────────────────

export interface LegalResource {
  id: string
  lawName: string
  section: string | null
  jurisdiction: string
  description: string
  plainLanguageExplanation: string
  whatItMayCover: string | null
  possibleNextSteps: string | null
  sourceUrl: string
  sourceName: string
  lastVerifiedAt: string
  verifiedBy: string
}

export interface LegalCaseSummary {
  id: string
  caseName: string
  court: string
  year: number
  summary: string
  outcome: string | null
  sourceUrl: string
  verifiedAt: string
}

// ── Professionals ─────────────────────────────────────────────

export interface Professional {
  id: string
  kind: 'LAWYER' | 'PSYCHOLOGIST' | 'SUPPORT_WORKER'
  fullName: string
  qualification: string | null
  registrationInfo: string | null
  bio: string | null
  practiceAreas: string
  specialisations: string
  languages: string
  city: string | null
  state: string | null
  yearsExperience: number
  rating: number | null
  reviewCount: number
  offersOnline: boolean
  offersInPerson: boolean
  acceptsLegalAid: boolean
  consultationFeeInfo: string | null
  verified: boolean
  demo: boolean
}

export interface Appointment {
  id: string
  reference: string
  professionalId: string
  professionalName: string
  scheduledAt: string
  durationMinutes: number
  mode: 'ONLINE' | 'IN_PERSON'
  status: 'REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  anonymous: boolean
  whatTheyWillSee: string
}

// ── Community & privacy ───────────────────────────────────────

export interface CommunityPost {
  id: string
  anonymous: boolean
  title: string
  content: string
  category: string
  moderationStatus: 'PENDING' | 'APPROVED' | 'FLAGGED' | 'HIDDEN'
  helpfulCount: number
  createdAt: string
}

export interface Consent {
  id: string
  consentType: string
  granted: boolean
  grantedAt: string | null
  revokedAt: string | null
  sharedWith: string | null
  purpose: string | null
}

export interface SharingLine {
  withWhom: string
  item: string
  shared: boolean
}

export interface PrivacyOverview {
  caseCount: number
  appointmentCount: number
  consents: Consent[]
  currentlySharing: SharingLine[]
  note: string
}
