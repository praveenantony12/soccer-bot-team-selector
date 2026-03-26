import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const BASE_URL = '';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}

  getPlayers(): Observable<string[]> {
    return this.http.get<string[]>(`${BASE_URL}/api/players`);
  }

  join(name: string) {
    return this.http.post(`${BASE_URL}/api/join`, { name });
  }

  getCurrent(): Observable<string[]> {
    return this.http.get<string[]>(`${BASE_URL}/api/current`);
  }
}