// frontend/src/app/dashboard/dashboard.component.ts
import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// Services
import { AuthService } from '../services/auth.service';
import { Post, PaginatedPostsResponse, PostService } from '../services/post.service';
import { UsersService } from '../services/users.service';

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
    TooltipModule // Keep if tooltips are used for other elements in dashboard
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // currentUser signal is still needed here to check user role for displaying posts
  currentUser = this.authService.getCurrentUser();
  userPosts = signal<Post[]>([]);
  totalRecords = signal(0);
  page = signal(1);
  limit = signal(5);
  loadingPosts = signal(true);

  constructor() {
    // Effect to react to currentUser changes and load posts
    effect(() => {
      const user = this.currentUser();
      if (user) {
        // Only load posts if the user is an AUTHOR or ADMIN
        if (user.role === 'AUTHOR' || user.role === 'ADMIN') {
          this.loadUserPosts();
        } else {
          this.userPosts.set([]); // Clear posts if not an author/admin
          this.totalRecords.set(0);
          this.loadingPosts.set(false);
        }
      } else {
        // If user logs out or is not available, clear data and redirect
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

  // Removed logout, onRequestAuthorRole, requestingAuthorRole, getAuthorRequestStatusSeverity
  // as they are moved to TopBarComponent
}
