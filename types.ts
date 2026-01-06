
export interface EntityData {
  name: string | null;
  document: string | null; // CPF or CNPJ
  municipalRegistration?: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface InvoiceValues {
  serviceValue: number;
  discount: number;
  netValue: number;
  taxAmount?: number;
}

export interface InvoiceData {
  number: string | null;
  series: string | null;
  dpsNumber?: string | null; // Novo: Número da DPS
  dpsSeries?: string | null; // Novo: Série da DPS
  accessKey: string | null;
  issueDate: string | null; // ISO Date string YYYY-MM-DD
  verificationCode: string | null;
  
  // Novos campos institucionais extraídos do cabeçalho original
  documentTitle?: string | null; // Ex: DANFSe v1.0
  documentSubtitle?: string | null; // Ex: Documento Auxiliar da NFS-e
  cityIssuer?: string | null; // Ex: MUNICÍPIO DE TERESINA-PI
  cityDepartment?: string | null; // Ex: SECRETARIA MUNICIPAL DE FINANÇAS - SEMF
  cityEmail?: string | null; // Ex: NOTAFISCALELETRONICA.SEMF@PMT.PI.GOV.BR
  cityLogoUrl?: string | null; // Caso a IA consiga identificar a URL ou brasão (opcional)

  provider: EntityData; // Prestador
  borrower: EntityData; // Tomador
  
  description: string | null;
  activityCode: string | null;
  
  values: InvoiceValues;
  annotations?: string; // Base64 image data of the canvas layer
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  PREVIEW = 'PREVIEW',
  ERROR = 'ERROR',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY'
}

export type TabView = 'INVOICE' | 'RECEIPT';

// Auth Types
export type UserRole = 'ADMIN' | 'OPERATOR';

export interface User {
  id: string;
  name: string;
  password?: string; // Stored for frontend demo purposes
  role: UserRole;
}

export interface PdfMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface AppSettings {
  logoUrl: string | null;
  qrCodeUrl: string | null;
  signatureUrl: string | null;
  pdfMargins?: PdfMargins;
  // Dados Bancários
  bankName?: string | null;
  bankCode?: string | null;
  bankAgency?: string | null;
  bankAccount?: string | null;
}

// HistoryItem interface used for tracking previously processed documents
export interface HistoryItem {
  id: string;
  timestamp: number;
  data: InvoiceData;
}
