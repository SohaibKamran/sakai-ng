// frontend/src/app/main-layout/main-layout.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar.component'; // Import the new TopBarComponent
import { AppFloatingConfigurator } from '../layout/component/app.floatingconfigurator';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    TopBarComponent // Add TopBarComponent to imports
  ],
  template: `
    <app-top-bar></app-top-bar> <!-- Include the top bar here -->
    <div class="main-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .main-content {
      padding: 1rem; // Add some padding around the main content
    }
  `]
})
export class MainLayoutComponent {
  // No specific logic needed here for now, as TopBarComponent handles its own logic.
}
