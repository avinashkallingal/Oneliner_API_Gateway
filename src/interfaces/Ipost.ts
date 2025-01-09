export interface IPost {
    _id?: string; 
    userId?: string; 
    title?: string; 
    summary?: string; 
    genre?: string; 
    imageUrl?: string[]; 
    pdfUrl?: string; 
    tags?: string[]; 
    isDelete?: boolean; 
    likes?: string[]; 
    comments?: string[]; 
    reportPost?: { userId: string; reason: string }[];
    created_at?: Date; 
    
  }