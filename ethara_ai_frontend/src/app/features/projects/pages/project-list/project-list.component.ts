import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Project } from '../../../../core/models/project.model';
import { User } from '../../../../core/models/user.model';
import { ProjectService } from '../../../../core/services/project.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';

@Component({
    selector: 'app-project-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, LoaderComponent, NavbarComponent],
    templateUrl: './project-list.component.html'
})
export class ProjectListComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly projectService = inject(ProjectService);

    protected readonly projects = signal<Project[]>([]);
    protected readonly users = signal<User[]>([]);
    protected readonly isLoading = signal(false);
    protected readonly isCreating = signal(false);
    protected readonly showCreateForm = signal(false);
    protected readonly errorMessage = signal('');
    protected readonly isLoadingUsers = signal(false);

    protected readonly createProjectForm = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        description: [''],
        members: [[] as string[]]
    });

    ngOnInit(): void {
        this.loadProjects();
    }

    protected toggleCreateForm(): void {
        this.showCreateForm.update((value) => !value);
        if (this.showCreateForm()) {
            this.loadUsers();
        }
        this.errorMessage.set('');
    }

    protected createProject(): void {
        if (this.createProjectForm.invalid || this.isCreating()) {
            this.createProjectForm.markAllAsTouched();
            return;
        }

        this.isCreating.set(true);
        this.errorMessage.set('');

        const { name, description, members: memberIds } = this.createProjectForm.getRawValue();

        this.projectService.createProject(name, description, memberIds).subscribe({
            next: (newProject) => {
                this.projects.update((items) => [newProject, ...items]);
                this.createProjectForm.reset({ name: '', description: '', members: [] });
                this.showCreateForm.set(false);
                this.isCreating.set(false);
            },
            error: () => {
                this.errorMessage.set('Failed to create project. Please try again.');
                this.isCreating.set(false);
            }
        });
    }

    private loadProjects(): void {
        this.isLoading.set(true);
        this.errorMessage.set('');

        this.projectService.getProjects().subscribe({
            next: (projects) => {
                this.projects.set(projects);
                this.isLoading.set(false);
            },
            error: () => {
                this.errorMessage.set('Failed to load projects.');
                this.isLoading.set(false);
            }
        });
    }

    protected retryLoad(): void {
        this.loadProjects();
    }

    private loadUsers(): void {
        this.isLoadingUsers.set(true);

        this.projectService.getAllUsers().subscribe({
            next: (users) => {
                this.users.set(users);
                this.isLoadingUsers.set(false);
            },
            error: () => {
                this.isLoadingUsers.set(false);
            }
        });
    }

    protected onMemberToggle(userId: string, event: Event): void {
        const target = event.target as HTMLInputElement;
        const currentMembers = this.createProjectForm.get('members')?.value || [];

        if (target.checked) {
            this.createProjectForm.get('members')?.setValue([...currentMembers, userId]);
        } else {
            this.createProjectForm.get('members')?.setValue(currentMembers.filter((m: string) => m !== userId));
        }
    }
}
