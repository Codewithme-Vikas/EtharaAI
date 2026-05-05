import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './signup.component.html'
})
export class SignupComponent {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    protected readonly isSubmitting = signal(false);
    protected readonly errorMessage = signal('');

    protected readonly signupForm = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    protected onSubmit(): void {
        if (this.signupForm.invalid || this.isSubmitting()) {
            this.signupForm.markAllAsTouched();
            this.errorMessage.set('Please fix the highlighted form errors.');
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set('');

        const { name, email, password } = this.signupForm.getRawValue();

        this.authService.signup(name, email, password).subscribe({
            next: (response) => {
                this.authService.storeToken(response.data.token);
                this.router.navigate(['/dashboard']);
            },
            error: () => {
                this.errorMessage.set('Signup failed. Please check your details and try again.');
                this.isSubmitting.set(false);
            }
        });
    }
}
