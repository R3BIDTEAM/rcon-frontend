import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFirmaComponent } from '@comp/login-firma/login-firma.component';
import { LoginComponent } from '@comp/login/login.component';
import { MainComponent } from '@comp/main/main.component';
import { AltaContribuyenteComponent } from '@comp/contribuyentes/alta-contribuyente/alta-contribuyente.component';
import { ConsultaContribuyenteComponent } from '@comp/contribuyentes/consulta-contribuyente/consulta-contribuyente.component';
import { EdicionContribuyenteComponent } from '@comp/contribuyentes/edicion-contribuyente/edicion-contribuyente.component';
import { PeritosComponent } from '@comp/peritos/peritos.component';
import { SociedadComponent } from '@comp/sociedad/sociedad.component';
import { GuardService } from '@serv/guard.service';

const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'main', component: MainComponent, canActivate: [GuardService],
    children: [
      { path: 'alta-contribuyente', component: AltaContribuyenteComponent, canActivate: [GuardService] },
      { path: 'consulta-contribuyente', component: ConsultaContribuyenteComponent, canActivate: [GuardService] },
      { path: 'edicion-contribuyente', component: EdicionContribuyenteComponent, canActivate: [GuardService] },
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
