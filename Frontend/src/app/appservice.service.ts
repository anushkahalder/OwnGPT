import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

 
export class AppserviceService {

  private apiUrl = 'http://localhost:3000'; // Update with your backend API URL

  constructor(private http: HttpClient) { }

  uploadDocument(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload-documents`, formData);
  }

  sendPrompt(prompt: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send-prompt`, { prompt });
  }

}
