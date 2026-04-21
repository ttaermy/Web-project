export interface AuditLog {
  id:          number;
  user:        number | string;
  action:      string;
  entity:      string;
  entity_id:   number | null;
  description: string;
  ip_address:  string;
  created_at:  string;
}

export interface PaginatedAuditLog {
  count:    number;
  next:     string | null;
  previous: string | null;
  results:  AuditLog[];
}
