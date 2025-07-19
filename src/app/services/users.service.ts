// frontend/src/app/services/users.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs'; // Corrected import

export interface User {
  id: string;
  image?: string; // Made optional as it might not always be present
  email: string;
  name: string;
  role: 'USER' | 'AUTHOR' | 'ADMIN'; // Consistent roles
  authorRequestStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null; // Added status and made it nullable for non-requesting users
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  password?: string; // Usually optional or hidden
}

// Define the API response structure for multiple users (paginated)
export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}


@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = "http://localhost:3000/users";
  }

  // POST: Create a new user (used by RegisterComponent, or Admin to create users)
  createUser(payload: {
    email: string;
    name: string;
    password: string;
    role: string;
    requestAuthor?: boolean; // Optional: for registration to request author role
  }): Observable<User> {
    // Backend's register API is '/auth/register', not '/users'.
    // Your RegisterComponent is calling this.usersService.createUser.
    // Let's assume for now that RegisterComponent is actually using a separate register API in AuthService.
    // If this `createUser` is ONLY for ADMIN to create users, then the role can be anything.
    // If this is for user registration, it should go through auth/register.

    // Let's adjust this assuming it's for ADMIN-created users, or if you meant Auth/Register is missing.
    // For now, I'll keep it as is, but highlight the potential mismatch with backend's /auth/register.
    return this.http.post<{ message: string; data: User }>(this.apiUrl, payload).pipe(
      map(res => res.data)
    );
  }

  // GET: Get all users (Admin only)
  getAllUsers(page: number = 1, limit: number = 10): Observable<PaginatedUsersResponse> {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('limit', limit.toString());
    return this.http.get<PaginatedUsersResponse>(this.apiUrl, { params });
  }

  // GET: Get user by ID (Admin only)
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // DELETE: Delete user by ID (Admin only)
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined) // Map to void as backend returns message, not a data object
    );
  }

  // PATCH: Update user details (Admin only, or user updating their own profile)
  updateUser(id: string, payload: Partial<User>): Observable<User> {
    return this.http.patch<{ message: string; data: User }>(`${this.apiUrl}/${id}`, payload).pipe(
      map(res => res.data)
    );
  }

  // PATCH: Update user role (Admin only)
  updateUserRole(id: string, newRole: 'USER' | 'AUTHOR' | 'ADMIN'): Observable<User> {
    return this.http.patch<{ message: string; data: User }>(`${this.apiUrl}/${id}/role`, { role: newRole }).pipe(
      map(res => res.data)
    );
  }

  // POST: User requests Author role (for non-admin users)
  requestAuthorRole(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/request-author-role`, {
      requestAuthor: true
    });
  }

  // PATCH: Admin processes author request
  processAuthorRequest(id: string, status: 'APPROVED' | 'REJECTED'): Observable<User> {
    return this.http.patch<{ message: string; data: User }>(`${this.apiUrl}/${id}/process-author-request`, { status }).pipe(
      map(res => res.data)
    );
  }
}