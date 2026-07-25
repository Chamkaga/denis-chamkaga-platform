export type Timestamp = string;
export type RequestId = string;
export type Version = string;

export interface ResponseLinks {
  self?: string;
  next?: string;
  prev?: string;
  first?: string;
  last?: string;
}

export interface RequestContext {
  requestId: RequestId;
  correlationId?: string;
  userId?: string;
  userRole?: string;
  clientIp?: string;
  userAgent?: string;
  timestamp: Timestamp;
}

export interface AuditFields {
  createdBy?: string;
  createdAt: Timestamp;
  updatedBy?: string;
  updatedAt: Timestamp;
  deletedBy?: string;
  deletedAt?: Timestamp;
}
