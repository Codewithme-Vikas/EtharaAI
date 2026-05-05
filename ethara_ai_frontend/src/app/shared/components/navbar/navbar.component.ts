import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { CurrentUserService } from '../../../core/services/current-user.service';

export interface NavItem {
    label: string;
    route: string;
}

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html'
})
export class NavbarComponent {
    @Input() title = 'Team Task Manager';
    @Input() items: NavItem[] = [
        { label: 'Dashboard', route: '/dashboard' },
        { label: 'Projects', route: '/projects' }
    ];

    protected get userName() {
        return this.currentUserService.currentUserName;
    }

    constructor(
        private readonly authService: AuthService,
        private readonly currentUserService: CurrentUserService,
        private readonly router: Router
    ) { }

    protected onLogout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
