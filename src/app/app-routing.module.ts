import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFirmaComponent } from '@comp/login-firma/login-firma.component';
import { LoginComponent } from '@comp/login/login.component';
import { MainComponent } from '@comp/main/main.component';
import { AltaContribuyenteComponent } from '@comp/contribuyentes/alta-contribuyente/alta-contribuyente.component';
import { ConsultaContribuyenteComponent } from '@comp/contribuyentes/consulta-contribuyente/consulta-contribuyente.component';
import { EdicionContribuyenteComponent } from '@comp/contribuyentes/edicion-contribuyente/edicion-contribuyente.component';
import { AltaNotarioComponent } from '@comp/notarios/alta-notario/alta-notario.component';
import { ConsultaNotarioComponent } from '@comp/notarios/consulta-notario/consulta-notario.component';
import { EdicionNotarioComponent } from '@comp/notarios/edicion-notario/edicion-notario.component';
import { GuardService } from '@serv/guard.service';
import { AltaPeritosComponent } from '@comp/peritos/alta-peritos/alta-peritos.component';
import { ConsultaPeritosComponent } from '@comp/peritos/consulta-peritos/consulta-peritos.component';
import { EdicionPeritosComponent } from '@comp/peritos/edicion-peritos/edicion-peritos.component';
import { AltaSociedadComponent } from '@comp/sociedad/alta-sociedad/alta-sociedad.component';
import { ConsultaSociedadComponent } from '@comp/sociedad/consulta-sociedad/consulta-sociedad.component';
import { EdicionSociedadComponent } from '@comp/sociedad/edicion-sociedad/edicion-sociedad.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'main', component: MainComponent, canActivate: [GuardService],
    children: [
      { path: 'alta-contribuyente', component: AltaContribuyenteComponent, canActivate: [GuardService] },
      { path: 'consulta-contribuyente', component: ConsultaContribuyenteComponent, canActivate: [GuardService] },
      { path: 'edicion-contribuyente', component: EdicionContribuyenteComponent, canActivate: [GuardService] },
      { path: 'alta-notario', component: AltaNotarioComponent, canActivate: [GuardService] },
      { path: 'consulta-notario', component: ConsultaNotarioComponent, canActivate: [GuardService] },
      { path: 'edicion-notario', component: EdicionNotarioComponent, canActivate: [GuardService] },
      { path: 'alta-peritos', component: AltaPeritosComponent, canActivate: [GuardService] },
      { path: 'consulta-peritos', component: ConsultaPeritosComponent, canActivate: [GuardService] },
      { path: 'edicion-peritos', component: EdicionPeritosComponent, canActivate: [GuardService] },
      { path: 'alta-sociedad', component: AltaSociedadComponent, canActivate: [GuardService] },
      { path: 'consulta-sociedad', component: ConsultaSociedadComponent, canActivate: [GuardService] },
      { path: 'edicion-sociedad', component: EdicionSociedadComponent, canActivate: [GuardService] }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
