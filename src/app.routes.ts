import { Routes } from '@angular/router';
import { Notfound } from './app/pages/notfound/notfound';
import { authGuard, publicGuard } from './app/features/shared/guards/auth.guard'; // Import all guards
import { CreatePostComponent } from './app/features/posts/create-post/create-post.component';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { AllPostsComponent } from './app/features/posts/all-posts/all-posts.component';
import { PostDetailComponent } from './app/features/posts/post-detail/post-detail.component';
import { RegisterComponent } from './app/features/auth/register/register.component';
import { MainLayoutComponent } from './app/features/app-layout/main-layout.component';
import { Login } from './app/features/auth/login/login';

export const appRoutes: Routes = [
    { path: '', redirectTo: '/post', pathMatch: 'full' },
    {
        path: '', component: MainLayoutComponent, children: [
            {
                path: 'post',
                component: AllPostsComponent, // Use component for standalone
            },
            {
                path: 'posts/:id', // Route for individual posts
                component: PostDetailComponent, // Use component for standalone
            },
            {
                path: 'dashboard',
                component: DashboardComponent, // Use component for standalone
                canActivate: [authGuard], // Protect the dashboard root
            },
            {
                path: 'create-post', // Route to create a new post
                component: CreatePostComponent, // Use component for standalone
                canActivate: [authGuard], // Protect the dashboard root
            },
            {
                path: 'edit-post/:id', // Route to edit an existing post
                component: CreatePostComponent, // Re-use CreatePostComponent for edit mode
                canActivate: [authGuard], // Protect the dashboard root
            },
        ]
    },
    {
        path: 'login',
        component: Login, // Use component for standalone
        canActivate: [publicGuard]
    },
    {
        path: 'register',
        component: RegisterComponent, // Use component for standalone
        canActivate: [publicGuard]
    },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' },
];