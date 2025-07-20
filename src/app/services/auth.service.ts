// frontend/src/app/services/auth.service.ts
import { Injectable, signal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

// Define the User interface for the logged-in user
export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'AUTHOR' | 'ADMIN'; // Add specific roles from your backend
  authorRequestStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'; // Add optional status
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // Adjust to your backend API base URL

  // Signal to hold the current user's data
  private currentUserSignal = signal<CurrentUser | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    // On service initialization, try to load user data from token in localStorage
    this.loadCurrentUserFromToken();
  }

  updateUserAuthorRequestStatus(newStatus: 'PENDING' | 'APPROVED' | 'REJECTED'): void {
    const currentUser = this.currentUserSignal();
    if (currentUser) {
      const updatedUser = { ...currentUser, authorRequestStatus: newStatus };
      this.currentUserSignal.set(updatedUser); // Update the signal
      localStorage.setItem('currentUser', JSON.stringify(updatedUser)); // Update localStorage
    }
  }

  /**
   * Logs in a user.
   * On success, stores the accessToken and updates the currentUserSignal.
   * @param credentials User's email and password.
   * @returns An Observable with accessToken and user data.
   */
  login(credentials: any): Observable<{ accessToken: string; user: CurrentUser }> {
    return this.http.post<{ accessToken: string; user: CurrentUser }>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        // Ensure the full user object (including role and authorRequestStatus from backend) is stored
        localStorage.setItem('currentUser', JSON.stringify(response.user)); // Store full user object
        this.currentUserSignal.set(response.user); // Update the signal with user data
        this.router.navigate(['/dashboard']); // Navigate here directly after successful login
      })
    );
  }
  register(credentials: any): Observable<{ accessToken: string; user: CurrentUser }> {
    return this.http.post<{ accessToken: string; user: CurrentUser }>(`${this.apiUrl}/auth/register`, credentials)
  }

  /**
   * Logs out the current user.
   * Clears accessToken from localStorage and sets currentUserSignal to null.
   */
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser'); // Also clear the stored user object
    this.currentUserSignal.set(null); // Clear the signal on logout
    this.router.navigate(['/login']); // Redirect to login page
  }

  /**
   * Gets the stored access token from localStorage.
   * @returns The access token or null if not found.
   */
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Checks if a token is expired.
   * @param token The JWT token string.
   * @returns True if the token is expired or invalid, false otherwise.
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Token expiration time is in seconds, convert to milliseconds for Date.now()
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      console.error('Error decoding token or token invalid:', e);
      // If there's any error in decoding or parsing, treat it as expired/invalid
      return true;
    }
  }

  /**
   * Checks if the user is currently logged in and their token is valid.
   * @returns True if logged in with a valid token, false otherwise.
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return !this.isTokenExpired(token);
  }

  /**
   * Attempts to load current user data by decoding the JWT token from localStorage.
   * This is called on service initialization to re-establish user state on app load.
   */
  private loadCurrentUserFromToken(): void {
    const token = this.getToken();
    const storedUserJson = localStorage.getItem('currentUser');

    if (token && storedUserJson) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user: CurrentUser = JSON.parse(storedUserJson); // Parse the stored user object

        // Check if token is expired. If so, log out.
        if (payload.exp * 1000 < Date.now()) {
          this.logout();
        } else {
          // Ensure role and authorRequestStatus are present (from storedUserJson)
          // The payload only contains ID, email, etc., not necessarily the full user object.
          // The 'user' object from login response is more comprehensive.
          this.currentUserSignal.set(user);
        }
      } catch (e) {
        console.error("Failed to decode token or parse payload/stored user:", e);
        this.logout(); // Invalidate session if token or stored user is malformed
      }
    } else {
      this.currentUserSignal.set(null);
    }
  }

  /**
   * Provides a readonly signal for the current user.
   * Components can use this to reactively display user information.
   * @returns A Signal containing the CurrentUser object or null.
   */
  getCurrentUser(): Signal<CurrentUser | null> {
    return this.currentUserSignal.asReadonly();
  }

  /**
   * Checks if the current user has any of the required roles.
   * @param requiredRoles An array of roles (e.g., ['ADMIN', 'AUTHOR']).
   * @returns True if the user is logged in and has at least one of the required roles.
   */
  hasRole(requiredRoles: Array<'USER' | 'AUTHOR' | 'ADMIN'>): boolean {
    const user = this.currentUserSignal();
    return !!user && requiredRoles.includes(user.role);
  }
}