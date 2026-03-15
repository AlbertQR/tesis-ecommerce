export interface LegalDocument {
  id: string;
  type: 'terms' | 'privacy' | 'returns';
  title: string;
  content: string;
  isActive: boolean;
  updatedAt: string;
}
