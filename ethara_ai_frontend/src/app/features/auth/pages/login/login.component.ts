import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html'
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    protected readonly isSubmitting = signal(false);
    protected readonly errorMessage = signal('');

    protected readonly loginForm = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    protected onSubmit(): void {
        if (this.loginForm.invalid || this.isSubmitting()) {
            this.loginForm.markAllAsTouched();

            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set('');

        const { email, password } = this.loginForm.getRawValue();

        this.authService.login(email, password).subscribe({
            next: (response) => {
                console.log(JSON.stringify(response, null, 2));
                this.authService.storeToken(response.data.token);
                this.router.navigate(['/dashboard']);
            },
            error: () => {
                this.errorMessage.set('Invalid email or password. Please try again.');
                this.isSubmitting.set(false);
            }
        });
    }
}
