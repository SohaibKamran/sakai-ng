// frontend/src/app/services/post.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the Author interface nested within Post
export interface PostAuthor {
  id: string;
  name: string;
}

// Define the Post interface
export interface Post {
  id: string;
  title: string;
  body: string; // This will likely contain HTML content
  excerpt: string;
  published: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor; // Nested author object
}

// Define the API response structure for multiple posts (paginated)
export interface PaginatedPostsResponse {
  data: Post[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:3000/posts'; // Adjust if your posts endpoint is different

  constructor(private http: HttpClient) { }

  /**
   * Fetches a paginated list of all PUBLISHED blog posts. (Publicly accessible)
   * @param page The current page number.
   * @param limit The number of items per page.
   * @returns An Observable of PaginatedPostsResponse.
   */
  getPosts(page: number = 1, limit: number = 5): Observable<PaginatedPostsResponse> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('limit', limit.toString());

    return this.http.get<PaginatedPostsResponse>(this.apiUrl, { params });
  }

  /**
   * Fetches a single blog post by its ID.
   * Assumes the API returns the Post object directly (not wrapped in 'data').
   * @param id The ID of the post to fetch.
   * @returns An Observable of a single Post object.
   */
  getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  /**
   * Fetches a paginated list of blog posts *by the authenticated user*.
   * This corresponds to the backend's `/posts/my-posts` endpoint.
   * @param page The current page number.
   * @param limit The number of items per page.
   * @returns An Observable of PaginatedPostsResponse.
   */
  getMyPosts(page: number = 1, limit: number = 5): Observable<PaginatedPostsResponse> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('limit', limit.toString());

    // The backend's /posts/my-posts endpoint automatically filters by the user from the JWT.
    return this.http.get<PaginatedPostsResponse>(`${this.apiUrl}/my-posts`, { params });
  }

  /**
   * Creates a new post.
   * @param post The post data (title, body, excerpt, published). AuthorId is taken from JWT.
   * @returns An Observable of the created Post object.
   */
  createPost(post: { title: string, body: string, excerpt?: string, published?: boolean }): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, post);
  }

  /**
   * Updates an existing post.
   * @param id The ID of the post to update.
   * @param post The partial post data to update.
   * @returns An Observable of the updated Post object.
   */
  updatePost(id: string, post: Partial<Post>): Observable<Post> {
    // Use PATCH as it's for partial updates, which is more common for 'update'
    return this.http.patch<Post>(`${this.apiUrl}/${id}`, post);
  }

  /**
   * Deletes a post.
   * @param id The ID of the post to delete.
   * @returns An Observable indicating completion.
   */
  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}