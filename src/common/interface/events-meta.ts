export interface AnnouncementMeta {
  announcementId: string;
  performedBy: string;
  publishedAt: Date;
}

export interface ShiftMeta {
  shiftId: string;
  userId: string;
  performedBy: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  date: string; // ISO string
}

export interface TimeOffMeta {
  requestId: string;
  userId: string;
  performedBy: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  startDate: string;
  endDate: string;
}
