export interface Document {
  id: string;
  title: string;
  content: string;
  tags: string[];
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface DocumentVersion {
  version: number;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string; // ISO 8601
}

export interface SearchResult {
  documentId: string;
  title: string;
  version: number;
  score: number;
  snippet: string;
}

export interface Citation {
  rank: number;
  documentId: string;
  score: number;
  snippet: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string; // ISO 8601
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
}

// export interface DocumentService{
//     create(data: {title: string, content:string, tags?:string[] }):Document;
//     getById(id:string):Document | null;
//     update(id:string, data:{title:string, content:string, tags?:string []}): Document | null;
//     getHistory(id:string): DocumentVersion | null;
//     getAll(): Document[];
// }