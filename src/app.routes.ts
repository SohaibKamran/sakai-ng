import { Routes } from '@angular/router';
import { Notfound } from './app/pages/notfound/notfound';
import { authGuard, authGuardChild, publicGuard } from './app/guards/auth.guard'; // Import all guards
import { CreatePostComponent } from './app/create-post/create-post.component';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { HomeComponent } from './app/home/home.component';
import { Login } from './app/login';
import { PostDetailComponent } from './app/post-detail/post-detail.component';
import { RegisterComponent } from './app/register/register.component';
import { MainLayoutComponent } from './app/main-layout/main-layout.component';

export const appRoutes: Routes = [
    { path: '', redirectTo: '/post', pathMatch: 'full' },
    {
        path: '', component: MainLayoutComponent, children: [
            {
                path: 'post',
                component: HomeComponent, // Use component for standalone
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