import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDetail } from '@test-monorepo/libs';

@Injectable({
  providedIn: 'root',
})
export class DetailService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/user-detail';

  updateUserDetail(
    userId: string,
    updated: Partial<UserDetail>,
  ): Observable<UserDetail> {
    return this.http.patch<UserDetail>(`${this.API_URL}/${userId}`, updated);
  }

  getUserDetailById(userId: string): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${this.API_URL}/${userId}`);
  }
}
