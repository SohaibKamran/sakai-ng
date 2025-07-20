// frontend/src/app/dashboard/dashboard.component.ts
import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// Services
import { AuthService } from '../features/shared/services/auth.service';
import { Post, PaginatedPostsResponse, PostService } from '../features/shared/services/post.service';
import { UsersService, User, PaginatedUsersResponse } from '../features/shared/services/users.service'; // Import User and PaginatedUsersResponse

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog'; // For role change dialog
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms'; // For ngModel in dropdown
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    ButtonModule,
    CardModule,
    TableModule,
    PaginatorModule,
    ConfirmDialogModule,
    ToastModule,
    TagModule,
    TooltipModule,
    TabsModule, // Add TabViewModule
    DialogModule, // Add DialogModule
    SelectModule, // Add DropdownModule
    FormsModule // Add FormsModule for ngModel
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private usersService = inject(UsersService); // Inject UsersService
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  currentUser = this.authService.getCurrentUser();
  
  // Signals for Posts Management
  userPosts = signal<Post[]>([]);
  totalRecords = signal(0);
  page = signal(1);
  limit = signal(5);
  loadingPosts = signal(true);

  // Signals for Users Management (Admin only)
  allUsers = signal<User[]>([]);
  totalUsers = signal(0);
  usersPage = signal(1);
  usersLimit = signal(10); // Default limit for users table
  loadingUsers = signal(true);

  // Tab management
  activeTab = signal(0); // 0 for Posts, 1 for Users

  // Dialog for role change
  displayRoleDialog = signal(false);
  selectedUserForRoleChange: User | null = null;
  newRole: 'USER' | 'AUTHOR' | 'ADMIN' | null = null;
  roleOptions = [
    { label: 'User', value: 'USER' },
    { label: 'Author', value: 'AUTHOR' },
    { label: 'Admin', value: 'ADMIN' }
  ];

  constructor() {
    // Effect to react to currentUser changes and load data
    effect(() => {
      const user = this.currentUser();
      if (user) {
        // Load posts for AUTHOR or ADMIN
        if (user.role === 'AUTHOR' || user.role === 'ADMIN') {
          this.loadUserPosts();
        } else {
          this.userPosts.set([]);
          this.totalRecords.set(0);
          this.loadingPosts.set(false);
        }

        // Load all users for ADMIN
        if (user.role === 'ADMIN') {
          this.loadAllUsers();
        } else {
          this.allUsers.set([]);
          this.totalUsers.set(0);
          this.loadingUsers.set(false);
        }
      } else {
        // If user logs out or is not available, clear data and redirect
        this.userPosts.set([]);
        this.totalRecords.set(0);
        this.loadingPosts.set(false);

        this.allUsers.set([]);
        this.totalUsers.set(0);
        this.loadingUsers.set(false);

        this.router.navigate(['/login']); // Redirect to login if no user
      }
    });
  }

  ngOnInit(): void {
    // Initial data loading is handled by the effect in the constructor
  }

  // --- Posts Management Methods ---
  loadUserPosts(): void {
    this.loadingPosts.set(true);
    this.postService.getMyPosts(this.page(), this.limit()).subscribe({
      next: (response) => {
        this.userPosts.set(response.data);
        this.totalRecords.set(response.total);
        this.loadingPosts.set(false);
      },
      error: (err) => {
        console.error('Failed to load user posts:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load your posts.' });
        this.loadingPosts.set(false);
      }
    });
  }

  onPageChange(event: any): void {
    this.page.set(event.page + 1); // PrimeNG page is 0-indexed, API is 1-indexed
    this.limit.set(event.rows);
    this.loadUserPosts();
  }

  confirmDelete(post: Post): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the post "${post.title}"? This action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deletePost(post.id);
      }
    });
  }

  deletePost(id: string): void {
    this.postService.deletePost(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Post deleted successfully.' });
        this.loadUserPosts(); // Reload posts after deletion
      },
      error: (err) => {
        console.error('Failed to delete post:', err);
        const errorMessage = err.error?.message || 'Failed to delete post.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMessage });
      }
    });
  }

  // --- Users Management Methods (Admin only) ---
  loadAllUsers(): void {
    this.loadingUsers.set(true);
    this.usersService.getAllUsers(this.usersPage(), this.usersLimit()).subscribe({
      next: (response) => {
        this.allUsers.set(response.data);
        this.totalUsers.set(response.total);
        this.loadingUsers.set(false);
      },
      error: (err) => {
        console.error('Failed to load all users:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users.' });
        this.loadingUsers.set(false);
      }
    });
  }

  onUsersPageChange(event: any): void {
    this.usersPage.set(event.page + 1);
    this.usersLimit.set(event.rows);
    this.loadAllUsers();
  }

  getUserRoleSeverity(role: string): string {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'AUTHOR': return 'success';
      case 'USER': return 'info';
      default: return 'secondary';
    }
  }

  getUserStatusSeverity(isBlocked: boolean): string {
    return isBlocked ? 'danger' : 'success';
  }

  getAuthorRequestStatusSeverity(status: 'PENDING' | 'APPROVED' | 'REJECTED' | null | undefined): string {
    switch (status) {
      case 'PENDING': return 'info';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'secondary'; // For 'Not Requested' or null
    }
  }

  confirmBlockUser(user: User): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to block user "${user.email}"? They will not be able to log in.`,
      header: 'Confirm Block',
      icon: 'pi pi-ban',
      accept: () => {
        this.blockUser(user.id);
      }
    });
  }

  blockUser(id: string): void {
    this.usersService.updateUser(id, { isBlocked: true }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User blocked successfully.' });
        this.loadAllUsers();
      },
      error: (err) => {
        console.error('Failed to block user:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to block user.' });
      }
    });
  }

  confirmUnblockUser(user: User): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to unblock user "${user.email}"? They will be able to log in again.`,
      header: 'Confirm Unblock',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.unblockUser(user.id);
      }
    });
  }

  unblockUser(id: string): void {
    this.usersService.updateUser(id, { isBlocked: false }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User unblocked successfully.' });
        this.loadAllUsers();
      },
      error: (err) => {
        console.error('Failed to unblock user:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to unblock user.' });
      }
    });
  }

  confirmDeleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete user "${user.email}"? This action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteUser(user.id);
      }
    });
  }

  deleteUser(id: string): void {
    this.usersService.deleteUser(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User deleted successfully.' });
        this.loadAllUsers();
      },
      error: (err) => {
        console.error('Failed to delete user:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user.' });
      }
    });
  }

  showRoleChangeDialog(user: User): void {
    this.selectedUserForRoleChange = user;
    this.newRole = user.role; // Pre-select current role
    this.displayRoleDialog.set(true);
  }

  updateUserRole(): void {
    if (this.selectedUserForRoleChange && this.newRole) {
      this.usersService.updateUserRole(this.selectedUserForRoleChange.id, this.newRole).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: `Role for ${this.selectedUserForRoleChange?.email} updated to ${this.newRole}.` });
          this.displayRoleDialog.set(false);
          this.loadAllUsers();
        },
        error: (err) => {
          console.error('Failed to update user role:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user role.' });
        }
      });
    }
  }

  confirmProcessAuthorRequest(user: User, status: 'APPROVED' | 'REJECTED'): void {
    const message = status === 'APPROVED'
      ? `Are you sure you want to APPROVE the author request for "${user.email}"?`
      : `Are you sure you want to REJECT the author request for "${user.email}"?`;
    const header = status === 'APPROVED' ? 'Approve Author Request' : 'Reject Author Request';
    const icon = status === 'APPROVED' ? 'pi pi-check-circle' : 'pi pi-times-circle';

    this.confirmationService.confirm({
      message: message,
      header: header,
      icon: icon,
      accept: () => {
        this.processAuthorRequest(user.id, status);
      }
    });
  }

  processAuthorRequest(id: string, status: 'APPROVED' | 'REJECTED'): void {
    this.usersService.processAuthorRequest(id, status).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `Author request ${status} for user.` });
        this.loadAllUsers(); // Reload users to reflect status change
      },
      error: (err) => {
        console.error('Failed to process author request:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to process author request.' });
      }
    });
  }
}
