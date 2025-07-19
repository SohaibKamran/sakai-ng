// frontend/src/app/show-all-posts/show-all-posts.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext'; // For search input

// Services
import { Post, PaginatedPostsResponse, PostService } from '../services/post.service';

@Component({
  selector: 'app-show-all-posts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    CardModule,
    PaginatorModule,
    TagModule,
    ButtonModule,
    InputTextModule // If adding search
  ],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-4xl font-bold mb-8 text-center text-primary">All Blog Posts</h1>

      <div class="mb-4 flex justify-content-end">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input pInputText type="text" (input)="onSearchInput($event)" placeholder="Search posts..." />
        </span>
      </div>

      <div *ngIf="loadingPosts()">
        <p-card>Loading posts...</p-card>
      </div>

      <div *ngIf="!loadingPosts() && allPosts().length === 0" class="text-center text-muted-color">
        No published posts available yet.
      </div>

      <div *ngIf="!loadingPosts() && allPosts().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <p-card *ngFor="let post of allPosts()" styleClass="mb-4">
          <!-- <ng-template pTemplate="header">
            <img *ngIf="post.image" alt="Card" [src]="post.image" class="w-full h-48 object-cover rounded-t-lg" />
          </ng-template> -->
          <ng-template pTemplate="title">
            <h2 class="text-xl font-semibold mb-2">{{ post.title }}</h2>
          </ng-template>
          <ng-template pTemplate="subtitle">
            <span class="text-sm text-muted-color">By {{ post.author.name }} on {{ post.createdAt | date:'mediumDate' }}</span>
          </ng-template>
          <ng-template pTemplate="content">
            <p class="mb-4 text-surface-700 dark:text-surface-300 line-clamp-3">{{ post.excerpt }}</p>
            <p-tag *ngIf="post.published" value="Published" severity="success" class="mr-2"></p-tag>
            </ng-template>
          <ng-template pTemplate="footer">
            <p-button label="Read More" [routerLink]="['/posts', post.id]" styleClass="p-button-sm"></p-button>
            </ng-template>
        </p-card>
      </div>

      <div *ngIf="!loadingPosts() && allPosts().length > 0" class="mt-8">
        <p-paginator
          [rows]="limit()"
          [totalRecords]="totalRecords()"
          [first]="(page() - 1) * limit()"
          (onPageChange)="onPageChange($event)"
          [rowsPerPageOptions]="[5, 10, 20]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          [showCurrentPageReport]="true"
        ></p-paginator>
      </div>
    </div>
  `
})
export class ShowAllPostsComponent implements OnInit {
  private postService = inject(PostService);

  allPosts = signal<Post[]>([]);
  totalRecords = signal(0);
  page = signal(1);
  limit = signal(9); // Show more on public view
  loadingPosts = signal(true);

  ngOnInit(): void {
    this.loadAllPosts();
  }

  loadAllPosts(): void {
    this.loadingPosts.set(true);
    this.postService.getPosts(this.page(), this.limit()).subscribe({
      next: (response) => {
        this.allPosts.set(response.data);
        this.totalRecords.set(response.total);
        this.loadingPosts.set(false);
      },
      error: (err) => {
        console.error('Failed to load all posts:', err);
        // You might want a MessageService here too
        this.loadingPosts.set(false);
      }
    });
  }

  onPageChange(event: any): void {
    this.page.set(event.page + 1);
    this.limit.set(event.rows);
    this.loadAllPosts();
  }

  // Optional: For search functionality
  onSearchInput(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    // You'll need to modify your PostService.getPosts to accept a searchTerm
    // and your backend /posts endpoint to filter by it.
    console.log('Search term:', searchTerm);
    // For now, this just logs. To implement, you'd add:
    // this.loadAllPosts(searchTerm); // assuming getPosts takes a search param
  }
}