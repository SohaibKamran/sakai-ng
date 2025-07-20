// frontend/src/app/create-post/create-post.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Services
import { PostService, Post } from '../../shared/services/post.service';
import { AuthService } from '../../shared/services/auth.service';

// PrimeNG imports (ensure these are installed)
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api'; // For toast messages
import { ToastModule } from 'primeng/toast'; // For toast notifications
import { EditorModule } from 'primeng/editor'; // For rich text editor (install @angular/cdk if not already)

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    EditorModule // Import PrimeNG EditorModule
  ],
  // Provide MessageService at the component level for toasts
  providers: [MessageService],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-6 text-center text-primary">
        {{ isEditMode() ? 'Edit post Post' : 'Create New post Post' }}
      </h1>

      <form [formGroup]="postForm" (ngSubmit)="onSubmit()" class="p-fluid">
        <div class="field mb-4">
          <label for="title" class="block text-900 font-medium mb-2">Title</label>
          <input id="title" type="text" pInputText formControlName="title"
                 [ngClass]="{ 'ng-invalid ng-dirty': postForm.get('title')?.invalid && postForm.get('title')?.touched }" />
          <small *ngIf="postForm.get('title')?.invalid && postForm.get('title')?.touched" class="p-error">Title is required.</small>
        </div>

        <div class="field mb-4">
          <label for="excerpt" class="block text-900 font-medium mb-2">Excerpt (Short Summary)</label>
          <textarea id="excerpt" pInputText formControlName="excerpt" rows="3"
                    [ngClass]="{ 'ng-invalid ng-dirty': postForm.get('excerpt')?.invalid && postForm.get('excerpt')?.touched }"></textarea>
          <small *ngIf="postForm.get('excerpt')?.invalid && postForm.get('excerpt')?.touched" class="p-error">Excerpt is required.</small>
        </div>

        <div class="field mb-4">
          <label for="body" class="block text-900 font-medium mb-2">Body (Full Content)</label>
          <p-editor id="body" formControlName="body" [style]="{'height':'320px'}"></p-editor>
          <small *ngIf="postForm.get('body')?.invalid && postForm.get('body')?.touched" class="p-error">Body is required.</small>
        </div>

        <div class="field-checkbox mb-4">
          <p-checkbox id="published" formControlName="published" [binary]="true"></p-checkbox>
          <label for="published" class="ml-2">Publish Now</label>
        </div>

        <div class="flex justify-content-end gap-2">
          <p-button type="button" label="Cancel" icon="pi pi-times" styleClass="p-button-outlined" (click)="router.navigate(['/dashboard'])"></p-button>
          <p-button type="submit" [label]="isEditMode() ? 'Update Post' : 'Create Post'" icon="pi pi-check" [loading]="loading()"></p-button>
        </div>
      </form>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .container {
      max-width: 800px;
    }
    .p-error {
      color: var(--red-500); /* Define your error color */
      font-size: 0.875rem;
      margin-top: 0.25rem;
      display: block;
    }
    /* Adjustments for PrimeNG Editor */
    :host ::ng-deep .p-editor-container .p-editor-content {
      border: 1px solid var(--surface-300); /* Match form field borders */
      border-radius: var(--border-radius);
    }
    :host ::ng-deep .p-editor-container.ng-invalid.ng-dirty .p-editor-content {
      border-color: var(--red-500); /* Error state for editor */
    }
  `]
})
export class CreatePostComponent implements OnInit {
  // Using inject for service dependencies
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private authService = inject(AuthService);
  public router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  postForm!: FormGroup; // Reactive form group
  isEditMode = signal(false); // Signal to track if in edit mode
  postId: string | null = null; // Stores the ID of the post being edited
  loading = signal(false); // Signal for loading state of form submission

  ngOnInit(): void {
    this.initForm(); // Initialize the form

    // Subscribe to route parameters to determine if it's edit mode
    this.activatedRoute.paramMap.subscribe(params => {
      this.postId = params.get('id'); // Get the 'id' parameter from the URL
      if (this.postId) {
        this.isEditMode.set(true); // Set edit mode to true
        this.loadPostForEdit(this.postId); // Load post data for editing
      } else {
        this.isEditMode.set(false); // Not in edit mode (creating new post)
        this.postForm.reset({ published: false }); // Reset form with default published state
      }
    });
  }

  /**
   * Initializes the reactive form with validators.
   */
  initForm(): void {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      excerpt: ['', Validators.required],
      body: ['', Validators.required],
      published: [false] // Default to not published
    });
  }

  /**
   * Loads an existing post's data into the form for editing.
   * @param id The ID of the post to load.
   */
  loadPostForEdit(id: string): void {
    this.loading.set(true);
    this.postService.getPostById(id).subscribe({
      next: (post: Post) => {
        this.postForm.patchValue({ // Populate form fields with post data
          title: post.title,
          excerpt: post.excerpt,
          body: post.body,
          published: post.published
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load post for editing:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load post for editing.' });
        this.loading.set(false);
        this.router.navigate(['/dashboard']); // Redirect to dashboard on error/not found
      }
    });
  }

  /**
   * Handles form submission for both creating and updating posts.
   */
  onSubmit(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched(); // Show validation errors
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all required fields.' });
      return;
    }

    this.loading.set(true);
    const postData = this.postForm.value;

    if (this.isEditMode() && this.postId) {
      // Update existing post
      this.postService.updatePost(this.postId, postData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Post updated successfully!' });
          this.router.navigate(['/dashboard']); // Redirect back to dashboard
        },
        error: (err) => {
          console.error('Error updating post:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update post.' });
          this.loading.set(false);
        }
      });
    } else {

      this.postService.createPost(postData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Post created successfully!' });
          this.router.navigate(['/dashboard']); // Redirect back to dashboard
        },
        error: (err) => {
          console.error('Error creating post:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create post.' });
          this.loading.set(false);
        }
      });
    }
  }
}