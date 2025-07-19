// frontend/src/app/register/register.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
// import { UsersService } from '../services/users.service'; // REMOVE this import
import { AppFloatingConfigurator } from '../layout/component/app.floatingconfigurator';
import { AuthService } from '../services/auth.service'; // Keep AuthService

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    ToastModule,
    InputTextModule,
    PasswordModule,
    AppFloatingConfigurator,
    ButtonModule
  ],
  providers: [MessageService],
  templateUrl: './register.component.html', // Assuming you have an HTML template
  styleUrl: './register.component.scss' // Assuming you have a SCSS style file
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  // private usersService = inject(UsersService); // REMOVE this line
  private router = inject(Router);
  private messageService = inject(MessageService);
  private authService = inject(AuthService); // Inject AuthService

  registerForm!: FormGroup;
  loading: boolean = false;

  ngOnInit(): void {
    // Redirect to dashboard if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return; // Stop execution
    }

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // New: Add a checkbox for 'requestAuthor' if you want this option during registration
      requestAuthor: [false] // Default to false
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      const { name, email, password, requestAuthor } = this.registerForm.value; // Get requestAuthor too

      // Call authService.register instead of usersService.createUser
      this.authService.register({ name, email, password, requestAuthor }).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Registration successful! You can now log in.' });
          this.loading = false;
          this.router.navigate(['/login']); // Navigate to login after successful registration
        },
        error: (err) => {
          this.loading = false;
          const errorMessage = err.error?.message || 'Registration failed. Please try again.';
          this.messageService.add({ severity: 'error', summary: 'Registration Failed', detail: errorMessage });
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill in all required fields correctly.' });
    }
  }
}