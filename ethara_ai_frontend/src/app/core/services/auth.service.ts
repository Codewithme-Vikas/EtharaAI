import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { CurrentUserService } from './current-user.service';
import { environment } from '../../../environments/environment';

interface AuthResponse {
    data: {
        token: string,
    },
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl = `${environment.apiBaseUrl}/auth`;
    private readonly tokenKey = 'auth_token';

    constructor(
        private readonly http: HttpClient,
        private readonly currentUserService: CurrentUserService
    ) {
        this.currentUserService.hydrateFromToken(this.getToken());
    }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
            .pipe(tap((response) => this.storeToken(response.data.token)));
    }

    signup(name: string, email: string, password: string): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.apiUrl}/signup`, { name, email, password })
            .pipe(tap((response) => this.storeToken(response.data.token)));
    }

    storeToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
        this.currentUserService.hydrateFromToken(token);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        this.currentUserService.clear();
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    getCurrentUserId(): string | null {
        return this.currentUserService.currentUserId();
    }
}
