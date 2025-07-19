import { Component, OnInit, inject } from '@angular/core';
import { Post, PaginatedPostsResponse, PostService } from '../services/post.service';
import { CommonModule, DatePipe } from '@angular/common'; // Import CommonModule for ngFor, DatePipe for formatting
import { RouterModule } from '@angular/router'; // For routerLink
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator'; // For pagination UI
import { CardModule } from 'primeng/card'; // For post cards

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    ButtonModule,
    PaginatorModule,
    CardModule
  ],
  templateUrl: './home.component.html',
  styleUrl:'./home.component.scss'
})
export class HomeComponent implements OnInit {
  private postService = inject(PostService);

  posts: Post[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  page: number = 1;
  limit: number = 5;

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.postService.getPosts(this.page, this.limit).subscribe({
      next: (response: PaginatedPostsResponse) => {
        this.posts = response.data;
        this.totalRecords = response.total;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load posts:', err);
        this.loading = false;
        // Optionally show a toast message here
      }
    });
  }

  onPageChange(event: any): void {
    this.page = event.page + 1; // Paginator returns 0-based page, API expects 1-based
    this.limit = event.rows;
    this.loadPosts();
  }
}