import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFirmaComponent } from '@comp/login-firma/login-firma.component';
import { LoginComponent } from '@comp/login/login.component';
import { MainComponent } from '@comp/main/main.component';
import { GuardService } from '@serv/guard.service';

const routes: Routes = [
 // { path: '', component: LoginComponent },
  { path: '', component: LoginFirmaComponent },
  {
    path: 'main', component: MainComponent, canActivate: [GuardService],
    children: [
       // { path: '', component: , canActivate: [GuardService] }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
