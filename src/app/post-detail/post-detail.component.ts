import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Post, PostService } from '../services/post.service';
import { CommonModule, DatePipe } from '@angular/common'; // Import CommonModule and DatePipe
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe], // Add CommonModule
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss'
})
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private sanitizer = inject(DomSanitizer); // Inject DomSanitizer

  post: Post | null = null;
  postBodySafeHtml: SafeHtml = ''; // To hold sanitized HTML
  loading: boolean = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const postId = params.get('id');
      if (postId) {
        this.loadPost(postId);
      } else {
        // Handle case where ID is not found in URL (e.g., redirect to not found)
        console.error('Post ID not found in URL');
        // You might want to navigate to a 404 page here
      }
    });
  }

  loadPost(id: string): void {
    this.loading = true;
    this.postService.getPostById(id).subscribe({
      next: (post: Post) => {
        this.post = post;
        // Sanitize the HTML content before binding
        this.postBodySafeHtml = this.sanitizer.bypassSecurityTrustHtml(post.body);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load post:', err);
        this.post = null; // Ensure post is null on error
        this.loading = false;
        // Optionally navigate to a 404 page or show an error message
      }
    });
  }
}
