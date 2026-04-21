import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AuditLog, PaginatedAuditLog } from '../../shared/interfaces/audit.interface';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly API = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getLogs(entity?: string) {
    let params = new HttpParams();
    if (entity) params = params.set('entity', entity);
    return this.http.get<PaginatedAuditLog | AuditLog[]>(`${this.API}/audit-logs/`, { params }).pipe(
      map(res => Array.isArray(res) ? res : (res as PaginatedAuditLog).results)
    );
  }
}
