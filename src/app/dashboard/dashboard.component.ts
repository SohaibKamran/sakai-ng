// frontend/src/app/dashboard/dashboard.component.ts
import { Component, OnInit, inject, signal, effect, Signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// Services
import { AuthService, CurrentUser } from '../services/auth.service';
import { Post, PaginatedPostsResponse, PostService } from '../services/post.service';
import { UsersService } from '../services/users.service'; // Import UsersService for role requests

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
import { AppFloatingConfigurator } from '../layout/component/app.floatingconfigurator';

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
    AppFloatingConfigurator,
    TagModule,
    TooltipModule
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

  currentUser = this.authService.getCurrentUser(); // Get user as a signal
  userPosts = signal<Post[]>([]);
  totalRecords = signal(0);
  page = signal(1);
  limit = signal(5);
  loadingPosts = signal(true);
  requestingAuthorRole = signal(false); // New signal for author role request loading

  constructor() {
    // Effect to react to currentUser changes and load posts
    effect(() => {
      if (this.currentUser()) {
        const user = this.currentUser()!;
        // Only load posts if the user is an AUTHOR or ADMIN
        if (user.role === 'AUTHOR' || user.role === 'ADMIN') {
            this.loadUserPosts();
        } else {
            this.userPosts.set([]); // Clear posts if not an author/admin
            this.totalRecords.set(0);
            this.loadingPosts.set(false);
        }
      } else {
        // If user logs out or is not available, clear data
        this.userPosts.set([]);
        this.totalRecords.set(0);
        this.loadingPosts.set(false);
        this.router.navigate(['/login']); // Redirect to login if no user
      }
    });
  }

  ngOnInit(): void {
    // Initial load will be handled by the effect in the constructor
  }

  loadUserPosts(): void {
    this.loadingPosts.set(true);
    // Use getMyPosts from PostService as it already uses the JWT for filtering
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

  // New method to get severity for author request status tag
  getAuthorRequestStatusSeverity(status: 'PENDING' | 'APPROVED' | 'REJECTED' | null | undefined): string {
    switch (status) {
      case 'PENDING': return 'info';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'secondary'; // For 'Not Requested' or null
    }
  }

  logout(): void {
    this.authService.logout();
  }
  // New method to handle author role request
  onRequestAuthorRole(): void {
    this.requestingAuthorRole.set(true);
    this.usersService.requestAuthorRole().subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Request Sent', detail: res.message });
        this.requestingAuthorRole.set(false);
        // Important: Re-fetch current user data to update authorRequestStatus in the UI
        // This relies on your AuthService being able to refresh user data, or logging out and in again.
        // A simple way is to force a re-load of the current user from the token.
        // For simplicity, we can rely on the user signal update if Auth Service re-reads localStorage,
        // or a manual refresh if your Auth Service has one.
        // For now, the user signal update in AuthService on login/init will pick this up on next app load/refresh.
        // If you need real-time update, the backend should return the updated user object or provide a refresh endpoint.
        // A quick (but not ideal) fix for UI update is to force re-initialization of auth service or re-parse token:
        // this.authService['loadCurrentUserFromToken'](); // Access private method - generally avoid this pattern!
        // A better way would be if the backend requestAuthorRole endpoint returned the updated user.
        // For now, the next time the user logs in or refreshes, their status will update.
        // For immediate feedback without refresh, your backend `request-author-role` should return the updated user.
        // If it returns the updated user, you can call `this.authService.currentUserSignal.set(updatedUser);`
        // Assuming your backend currently only returns `{ message: string }`, the status update won't be immediate without a full reload.
        // Let's assume the UI will reflect the change after a refresh or re-login for now.
        // For a seamless UX, the backend's `request-author-role` should probably return the updated user object.
      },
      error: (err) => {
        console.error('Failed to request author role:', err);
        this.requestingAuthorRole.set(false);
        const errorMessage = err.error?.message || 'Failed to send author role request.';
        this.messageService.add({ severity: 'error', summary: 'Request Failed', detail: errorMessage });
      }
    });
  }
}