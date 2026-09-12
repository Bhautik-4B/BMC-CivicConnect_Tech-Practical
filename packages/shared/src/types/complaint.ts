import { ComplaintStatus } from '../constants/statuses.js';
import { Priority } from '../constants/priorities.js';

export interface IGeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [Longitude, Latitude]
  address: string;
  landmark?: string;
}

export interface IAttachment {
  url: string;
  fileType: 'IMAGE' | 'VIDEO';
  uploadedAt: string;
}

export interface IResolutionEvidence {
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  resolutionNote: string;
  submittedBy?: string;
  submittedByName?: string;
  submittedAt: string;
}

export interface IReopenRecord {
  reopenedAt: string;
  reason: string;
  photoUrl?: string;
}

export interface IAuditLogEntry {
  id: string;
  action: string;
  actorName: string;
  actorRole: string;
  fromState?: string;
  toState?: string;
  comment?: string;
  timestamp: string;
}

export interface IComplaint {
  id: string;
  ticketId: string;
  citizenId: string;
  citizenName?: string;
  citizenMobile?: string; // Masked for non-admins
  categoryId: string;
  categoryName?: string;
  subcategory?: string;
  title: string;
  description: string;
  location: IGeoPoint;
  zoneId: string;
  zoneName?: string;
  wardId: string;
  wardNumber?: number;
  wardName?: string;
  status: ComplaintStatus;
  priority: Priority;
  assignedDepartmentId?: string;
  assignedDepartmentName?: string;
  assignedSupervisorId?: string;
  assignedSupervisorName?: string;
  assignedFieldStaffId?: string;
  assignedFieldStaffName?: string;
  slaTargetHours: number;
  slaDeadline: string;
  slaBreached: boolean;
  workStartedAt?: string;
  workCompletedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  citizenAttachments: IAttachment[];
  resolutionEvidence?: IResolutionEvidence;
  reopenHistory?: IReopenRecord[];
  isDuplicate: boolean;
  parentComplaintId?: string;
  createdAt: string;
  updatedAt: string;
}
