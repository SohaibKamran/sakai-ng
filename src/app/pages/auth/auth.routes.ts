import { Routes } from '@angular/router';
import { Access } from './access';
import { Error } from './error';
import { Login } from '../../features/auth/login/login';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login }
] as Routes;
