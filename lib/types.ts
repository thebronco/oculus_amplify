// TypeScript interfaces for the application

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId: string; // 'root' for top-level
  order?: number;
  isVisible?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string; // Lexical JSON format
  categoryId: string;
  status: 'published' | 'draft';
  author: string;
  attachments?: string; // JSON array
  published?: boolean; // Legacy field
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vulnerability {
  cveID: string;
  vendorname: string;
  vendorproduct: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  knownRansomwareCampaignUse: string;
  notes?: string;
  cwes?: string;
  createdAt: string;
  updatedAt: string;
}

