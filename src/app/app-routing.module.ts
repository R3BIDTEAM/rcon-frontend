import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFirmaComponent } from '@comp/login-firma/login-firma.component';
import { LoginComponent } from '@comp/login/login.component';
import { MainComponent } from '@comp/main/main.component';
import { PeritosComponent } from '@comp/peritos/peritos.component';
import { SociedadComponent } from '@comp/sociedad/sociedad.component';
import { GuardService } from '@serv/guard.service';

const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'main', component: MainComponent, canActivate: [GuardService],
    children: [
      { path: 'peritos', component: PeritosComponent, canActivate: [GuardService] },
      { path: 'sociedad', component: SociedadComponent, canActivate: [GuardService] }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
