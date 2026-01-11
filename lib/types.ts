// ================= USER & ORG =================
export type Role = "member" | "scanner" | "admin";

export interface Org {
  id: number;
  name: string;
  logo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  name: string; // convenience full name
  email: string;
  role: Role;
  organization: Org;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ================= EVENT / PASSPORT / STAMP =================
export interface Event {
  id: number;
  organization: Org;
  eventName: string;
  eventDescription?: string;
  eventType?: string;
  eventBadge?: string;
  venueName?: string;
  venueImageUrl?: string;
  scheduledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  stamps?: Stamp[];
}

export interface Passport {
  id: number;
  member: User;
  issuedAt?: string;
  expiresAt?: string;
  passportStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  stamps?: Stamp[];
}

export interface Stamp {
  id: number;
  passport: Passport;
  event: Event;
  scanner: User;
  stampedAt?: string;
  scanStatus?: string;
  valid?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

// ================= AUDIT ENTITIES =================
export interface AuditLog {
  id: number;
  actorUser?: User;
  organization?: Org;
  actionCategory: string;
  actionName: string;
  entityName: string;
  entityId?: number;
  requestMethod?: string;
  requestPath?: string;
  previousData?: any; // JSON string or parsed object
  newData?: any;      // JSON string or parsed object
  ipAddress?: string;
  userAgent?: string;
  occurredAt: string;
}

export interface AuditLoginEvent {
  id: number;
  auditLog: AuditLog;
  user?: User;
  isSuccessful?: boolean;
  failureReason?: string;
  occurredAt: string;
}

export interface AuditPasswordChange {
  id: number;
  auditLog: AuditLog;
  user: User;
  changedBy?: User;
  changeReason?: string;
  changedAt: string;
}

export interface AuditStampAction {
  id: number;
  auditLog: AuditLog;
  stamp?: Stamp;
  action: string;
  performedByScanner?: User; // OrgScanner as User
  performedAt: string;
}
