import { Injectable, computed, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CurrentUserService {
    private readonly currentUserIdSignal = signal<string | null>(null);
    private readonly currentUserNameSignal = signal<string | null>(null);

    readonly currentUserId = this.currentUserIdSignal.asReadonly();
    readonly currentUserName = this.currentUserNameSignal.asReadonly();
    readonly isAuthenticated = computed(() => !!this.currentUserIdSignal());

    hydrateFromToken(token: string | null): void {
        const payload = this.extractPayload(token);
        this.currentUserIdSignal.set(
            payload?.['id'] ?? payload?.['userId'] ?? payload?.['_id'] ?? payload?.['sub'] ?? null
        );
        this.currentUserNameSignal.set(
            payload?.['name'] ?? payload?.['email'] ?? payload?.['sub'] ?? null
        );
    }

    clear(): void {
        this.currentUserIdSignal.set(null);
        this.currentUserNameSignal.set(null);
    }

    private extractPayload(token: string | null): { [key: string]: any } | null {
        if (!token) {
            return null;
        }

        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch {
            return null;
        }
    }
}
