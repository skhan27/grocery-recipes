
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OpenAiService {
    private apiUrl = environment.apiUrl + '/openai-proxy';

    httpClient = inject(HttpClient);

    generateCompletion(prompt: string): Observable<any> {
        return this.httpClient.post(this.apiUrl, { prompt });
    }
}