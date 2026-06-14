import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './config';

export interface LoadResponse {
  ok: boolean;
  data: any | null;
  updated_at: string | null;
}
export interface LoginResponse {
  ok: boolean;
  token?: string;
  ttl?: number;
  error?: string;
}
export interface SaveResponse {
  ok: boolean;
  updated_at?: string;
  error?: string;
}
export interface UploadResponse {
  ok: boolean;
  url?: string;
  name?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private http: HttpClient) {}

  /** Charge les donnees enregistrees (acces public). */
  load(): Observable<LoadResponse> {
    return this.http.get<LoadResponse>(API_BASE + 'get.php');
  }

  /** Verifie le mot de passe admin et renvoie un jeton de connexion. */
  login(password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(API_BASE + 'login.php', { password });
  }

  /** Enregistre l'integralite des donnees de la planche (admin). */
  save(data: any, token: string): Observable<SaveResponse> {
    return this.http.post<SaveResponse>(
      API_BASE + 'save.php',
      { data },
      { headers: { Authorization: 'Bearer ' + token } }
    );
  }

  /** Televerse une image et renvoie son URL publique (admin). */
  upload(file: File, token: string): Observable<UploadResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<UploadResponse>(API_BASE + 'upload.php', form, {
      headers: { Authorization: 'Bearer ' + token },
    });
  }
}
