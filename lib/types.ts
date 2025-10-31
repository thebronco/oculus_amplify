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
  categoryId?: string; // Legacy: single category (for backward compatibility)
  categoryIds?: string[]; // Array of category IDs
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

export interface ComplianceChecklist {
  id: string;
  control: string; // Renamed from title
  description: string;
  category: string;
  compliance_standard: string; // Renamed from framework
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'General Requirement' | 'Mandatory' | 'Recommended' | 'Best Practice' | 'Not Started' | 'In Progress' | 'Completed' | 'Failed';
  control_type: 'Technical' | 'Administrative' | 'Physical' | 'Operational';
  implementation_effort: 'Low' | 'Medium' | 'High' | 'Very High';
  business_impact: 'Low' | 'Medium' | 'High' | 'Critical';
  evidence?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityBestPractice {
  id: string;
  framework: string;
  subcategory: string;
  best_practice_checklist_item: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
  implementation_effort: 'Low' | 'Medium' | 'High' | 'Very High';
  business_impact: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAt: string;
  updatedAt: string;
}

export interface AISecurityFramework {
  id: string;
  framework: string;
  subcategory: string;
  ai_security_control: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
  implementation_effort: 'Low' | 'Medium' | 'High' | 'Very High';
  business_impact: 'Low' | 'Medium' | 'High' | 'Critical';
  threat_vector: string;
  mitigation_strategy: string;
  compliance_requirement: string;
  createdAt: string;
  updatedAt: string;
}

