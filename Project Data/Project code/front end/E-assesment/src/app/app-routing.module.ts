import { UserhomeComponent } from './userhome/userhome.component';
import { AdminhomeComponent } from './adminhome/adminhome.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';

const routes: Routes = [
  // default route
  { path: '', redirectTo: '/landing-page', pathMatch: 'full' },
  
  { path: 'landing-page', component: LandingPageComponent, },
  { path: 'adminhome', component: AdminhomeComponent,children:[
    { path: 'admin', loadChildren : () =>import('./admin/admin.module').then(m =>m.AdminModule) }
  ]},
  { path: 'userhome', component: UserhomeComponent,children :[
    { path: 'user', loadChildren: () =>import('./user/user.module').then(m =>m.UserModule) }
  ]},
  { path: 'auth', loadChildren : () =>import('./auth/auth.module').then(m =>m.AuthModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
