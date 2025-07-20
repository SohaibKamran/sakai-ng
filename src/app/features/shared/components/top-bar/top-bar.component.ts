// frontend/src/app/top-bar/top-bar.component.ts
import { Component, inject, signal, effect, computed } from '@angular/core'; // Import 'computed'
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// PrimeNG imports
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { TagModule } from 'primeng/tag'; // For role status tag
import { TooltipModule } from 'primeng/tooltip'; // For tooltip on avatar/status

// Services
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { LayoutService } from '../../../../layout/service/layout.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
// Assuming LayoutService exists in your application, adjust path if necessary

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    CommonModule,
    ToggleSwitchModule,
    RouterModule,
    AvatarModule,
    MenuModule,
    ButtonModule,
    ToastModule,
    TagModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService], // Provide MessageService here if not provided globally
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent {
  // Inject necessary services
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private layoutService = inject(LayoutService); // Inject LayoutService

  // Signal to hold the current user data
  currentUser = this.authService.getCurrentUser();
  // Signal to manage the loading state for author role request
  requestingAuthorRole = signal(false);

  // Computed signal for dark theme state
  isDarkTheme = computed(() => this.layoutService.layoutConfig().darkTheme);

  // Menu items for the user dropdown
  userMenuItems: MenuItem[] = [];

  constructor() {
    // Effect to react to currentUser changes and update menu items
    effect(() => {
      const user = this.currentUser();
      this.updateMenuItems(user);
    });
  }

  /**
   * Updates the user dropdown menu items based on the current user's role and status.
   * @param user The current user object, or null if no user is logged in.
   */
  private updateMenuItems(user: any | null): void {
    if (user) {
      this.userMenuItems = [
        {
          label: this.currentUser()?.name,
          icon: 'pi pi-user',
          // routerLink: '/profile' // Assuming a profile route exists or will be added
        },
        {
          label: 'Dashboard',
          icon: 'pi pi-chart-line',
          routerLink: '/dashboard'
        },
        { separator: true }
      ];

      // Add "Request Author Role" only if the user is a USER and hasn't already requested or been approved/rejected
      if (user.role === 'USER' && user.authorRequestStatus !== 'PENDING' && user.authorRequestStatus !== 'APPROVED') {
        this.userMenuItems.push({
          label: 'Request Author Role',
          icon: 'pi pi-pencil',
          command: () => this.onRequestAuthorRole(),
          disabled: this.requestingAuthorRole() // Disable if request is in progress
        });
      }

      this.userMenuItems.push({
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      });
    } else {
      // If no user, clear menu items
      this.userMenuItems = [];
    }
  }

  /**
   * Toggles the dark mode theme.
   */
  toggleDarkMode(): void {
    this.layoutService.layoutConfig.update((state: any) => ({ ...state, darkTheme: !state.darkTheme }));
  }

  /**
   * Handles the request for author role.
   * Calls the UsersService to send the request and shows appropriate messages.
   */
  onRequestAuthorRole(): void {
    this.requestingAuthorRole.set(true); // Set loading state to true
    this.usersService.requestAuthorRole().subscribe({
      next: (res) => {
        this.authService.updateUserAuthorRequestStatus('PENDING');
        this.messageService.add({ severity: 'success', summary: 'Request Sent', detail: res.message });
        this.requestingAuthorRole.set(false); // Reset loading state
      },
      error: (err) => {
        console.error('Failed to request author role:', err);
        this.requestingAuthorRole.set(false); // Reset loading state
        const errorMessage = err.error?.message || 'Failed to send author role request.';
        this.messageService.add({ severity: 'error', summary: 'Request Failed', detail: errorMessage });
      }
    });
  }

  /**
   * Logs out the current user.
   * Calls the AuthService logout method and redirects to the login page.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.messageService.add({ severity: 'info', summary: 'Logged Out', detail: 'You have been successfully logged out.' });
  }

  /**
   * Generates the initials for the user's avatar.
   * @param user The current user object.
   * @returns The initials (e.g., "JD" for John Doe) or "GU" for Guest User.
   */
  getUserInitials(name: string | undefined): string {
    if (!name ) {
      return 'GU'; // Guest User
    }
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  /**
   * Returns the severity for the author request status tag.
   * @param status The author request status ('PENDING', 'APPROVED', 'REJECTED', or null/undefined).
   * @returns A string representing the PrimeNG Tag severity.
   */
  getAuthorRequestStatusSeverity(status: 'PENDING' | 'APPROVED' | 'REJECTED' | null | undefined): string {
    switch (status) {
      case 'PENDING': return 'info';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'secondary'; // For 'Not Requested' or null
    }
  }
}
