import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Project } from '../../../../core/models/project.model';
import { Task } from '../../../../core/models/task.model';
import { CurrentUserService } from '../../../../core/services/current-user.service';
import { ProjectService } from '../../../../core/services/project.service';
import { TaskService } from '../../../../core/services/task.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';

type TaskStatus = 'To Do' | 'In Progress' | 'Done';

@Component({
    selector: 'app-task-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, LoaderComponent, NavbarComponent],
    templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly taskService = inject(TaskService);
    private readonly projectService = inject(ProjectService);
    private readonly currentUserService = inject(CurrentUserService);

    protected readonly tasks = signal<Task[]>([]);
    protected readonly project = signal<Project | null>(null);
    protected readonly isLoading = signal(false);
    protected readonly isCreating = signal(false);
    protected readonly showCreateTaskForm = signal(false);
    protected readonly isUpdatingStatusTaskId = signal<string | null>(null);
    protected readonly isAssigningTaskId = signal<string | null>(null);
    protected readonly pageErrorMessage = signal('');
    protected readonly actionErrorMessage = signal('');

    protected readonly statusOptions: TaskStatus[] = ['To Do', 'In Progress', 'Done'];
    protected readonly priorityOptions = ['Low', 'Medium', 'High'];

    protected readonly createTaskForm = this.fb.nonNullable.group({
        title: ['', [Validators.required, Validators.minLength(2)]],
        description: [''],
        dueDate: [''],
        priority: ['Medium'],
        assignedUserId: ['', Validators.required]
    });

    protected readonly members = computed(() => this.project()?.members ?? []);
    protected readonly currentUserId = this.currentUserService.currentUserId;
    protected readonly isAdmin = computed(
        () => !!this.currentUserId() && this.project()?.creator.id === this.currentUserId()
    );

    private projectId = '';

    ngOnInit(): void {
        const projectId = this.route.snapshot.paramMap.get('id');

        if (!projectId) {
            this.pageErrorMessage.set('Invalid project route.');
            return;
        }

        this.projectId = projectId;
        this.loadProjectAndTasks();
    }

    protected toggleCreateTaskForm(): void {
        this.showCreateTaskForm.update((value) => !value);
        this.actionErrorMessage.set('');
    }

    protected createTask(): void {
        if (!this.isAdmin()) {
            return;
        }

        if (this.createTaskForm.invalid || this.isCreating()) {
            this.createTaskForm.markAllAsTouched();
            return;
        }

        this.isCreating.set(true);
        this.actionErrorMessage.set('');

        const formValue = this.createTaskForm.getRawValue();

        this.taskService
            .createTask(this.projectId, {
                title: formValue.title,
                description: formValue.description,
                dueDate: formValue.dueDate || undefined,
                priority: formValue.priority,
                assignedUserId: formValue.assignedUserId
            })
            .subscribe({
                next: (task) => {
                    this.tasks.update((items) => [task, ...items]);
                    this.createTaskForm.reset({
                        title: '',
                        description: '',
                        dueDate: '',
                        priority: 'Medium',
                        assignedUserId: ''
                    });
                    this.isCreating.set(false);
                },
                error: () => {
                    this.actionErrorMessage.set('Failed to create task.');
                    this.isCreating.set(false);
                }
            });
    }

    protected onStatusChange(taskId: string, status: string): void {
        const task = this.tasks().find((item) => item.id === taskId);
        if (!task || !this.canUpdateStatus(task) || task.status === status) {
            return;
        }

        this.isUpdatingStatusTaskId.set(taskId);
        this.actionErrorMessage.set('');
        this.taskService.updateTaskStatus(this.projectId, taskId, status).subscribe({
            next: (updatedTask) => {
                this.replaceTask(updatedTask);
                this.isUpdatingStatusTaskId.set(null);
            },
            error: () => {
                this.actionErrorMessage.set('Failed to update task status.');
                this.isUpdatingStatusTaskId.set(null);
            }
        });
    }

    protected onAssignUser(taskId: string, userId: string): void {
        if (!this.isAdmin() || !userId) {
            return;
        }

        this.isAssigningTaskId.set(taskId);
        this.actionErrorMessage.set('');
        this.taskService.assignTask(this.projectId, taskId, userId).subscribe({
            next: (updatedTask) => {
                this.replaceTask(updatedTask);
                this.isAssigningTaskId.set(null);
            },
            error: () => {
                this.actionErrorMessage.set('Failed to assign task.');
                this.isAssigningTaskId.set(null);
            }
        });
    }

    protected retryLoad(): void {
        this.loadProjectAndTasks();
    }

    protected canUpdateStatus(task: Task): boolean {
        if (this.isAdmin()) {
            return true;
        }

        return !!this.currentUserId() && task.assignedUser?.id === this.currentUserId();
    }

    private loadProjectAndTasks(): void {
        this.isLoading.set(true);
        this.pageErrorMessage.set('');
        this.actionErrorMessage.set('');

        this.projectService.getProjects().subscribe({
            next: (projects) => {
                const currentProject = projects.find((project) => project.id === this.projectId) ?? null;
                this.project.set(currentProject);
                if (!currentProject) {
                    this.pageErrorMessage.set('Project not found or access denied.');
                }
            },
            error: () => this.pageErrorMessage.set('Failed to load project details.')
        });

        this.taskService.getTasksByProject(this.projectId).subscribe({
            next: (tasks) => {
                this.tasks.set(tasks);
                this.isLoading.set(false);
            },
            error: () => {
                this.pageErrorMessage.set('Failed to load tasks.');
                this.isLoading.set(false);
            }
        });
    }

    private replaceTask(updatedTask: Task): void {
        this.tasks.update((items) => items.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
    }
}
