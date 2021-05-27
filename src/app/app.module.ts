import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AvatarModule } from 'ngx-avatar';
import { registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';
import { BnNgIdleService } from 'bn-ng-idle';
registerLocaleData(localeEsMx, 'es-Mx');
import { NgxMaskModule, IConfig } from 'ngx-mask';

import { AppRoutingModule } from './app-routing.module';
import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CardElevationDirective } from './card-elevation.directive';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './components/login/login.component';
import { MenuComponent } from './components/menu/menu.component';
import { LoginFirmaComponent } from './components/login-firma/login-firma.component';
import { MainComponent } from './components/main/main.component';
import { AltaContribuyenteComponent, DialogDomicilio, DialogRepresentacion, DialogDocumento, DialogNotario, DialogPersona } from './components/contribuyentes/alta-contribuyente/alta-contribuyente.component';
import { ConsultaContribuyenteComponent } from './components/contribuyentes/consulta-contribuyente/consulta-contribuyente.component';
import { EdicionContribuyenteComponent } from './components/contribuyentes/edicion-contribuyente/edicion-contribuyente.component';
import { AltaNotarioComponent, DialogBuscarNotarioAlta } from './components/notarios/alta-notario/alta-notario.component';
import { ConsultaNotarioComponent } from './components/notarios/consulta-notario/consulta-notario.component';
import { EdicionNotarioComponent } from './components/notarios/edicion-notario/edicion-notario.component';
import { AltaPeritosComponent, DialogAltaBusca } from './components/peritos/alta-peritos/alta-peritos.component';
import { ConsultaPeritosComponent } from './components/peritos/consulta-peritos/consulta-peritos.component';
import { EdicionPeritosComponent } from './components/peritos/edicion-peritos/edicion-peritos.component';
import { AltaSociedadComponent, DialogSociedad } from './components/sociedad/alta-sociedad/alta-sociedad.component';
import { ConsultaSociedadComponent } from './components/sociedad/consulta-sociedad/consulta-sociedad.component';
import { EdicionSociedadComponent } from './components/sociedad/edicion-sociedad/edicion-sociedad.component';
import { VerPeritosComponent } from './components/peritos/ver-peritos/ver-peritos.component';
import { VerSociedadComponent } from './components/sociedad/ver-sociedad/ver-sociedad.component';
import { EditarPeritosComponent, DialogDomicilioPerito, DialogDocumentoPerito,
        DialogNotarioPeritos, DialogPersonaPeritos, DialogRepresentacionPeritos,
        DialogRepresentadoPeritos, DialogSociedadAsociada, DialogBuscaPerito,
        DialogAsentamiento, DialogMunicipios, DialogCiudad, DialogVia } from './components/peritos/editar-peritos/editar-peritos.component';
import { EditarSociedadComponent } from './components/sociedad/editar-sociedad/editar-sociedad.component';
import { VerNotarioComponent } from './components/notarios/ver-notario/ver-notario.component';
import { EditarNotarioComponent, DialogDomiciliosNotario } from './components/notarios/editar-notario/editar-notario.component';
import { VerContribuyenteComponent } from './components/contribuyentes/ver-contribuyente/ver-contribuyente.component';
import { EditarContribuyenteComponent } from './components/contribuyentes/editar-contribuyente/editar-contribuyente.component';

@NgModule({
  declarations: [
    AppComponent,
    CardElevationDirective,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    MenuComponent,
    LoginFirmaComponent,
    MainComponent,
    AltaContribuyenteComponent,
    ConsultaContribuyenteComponent,
    EdicionContribuyenteComponent,
    AltaNotarioComponent,
    ConsultaNotarioComponent,
    EdicionNotarioComponent,
    AltaPeritosComponent,
    ConsultaPeritosComponent,
    EdicionPeritosComponent,
    AltaSociedadComponent,
    ConsultaSociedadComponent,
    EdicionSociedadComponent,
    DialogAltaBusca,
    DialogSociedad,
    DialogDomicilio,
    VerPeritosComponent,
    DialogRepresentacion,
    DialogDocumento,
    DialogNotario,
    DialogPersona,
    DialogBuscarNotarioAlta,
    VerSociedadComponent,
    EditarPeritosComponent,
    EditarSociedadComponent,
    DialogDomicilioPerito,
    DialogDocumentoPerito,
    DialogNotarioPeritos,
    DialogPersonaPeritos,
    DialogRepresentacionPeritos,
    DialogRepresentadoPeritos,
    DialogSociedadAsociada,
    DialogBuscaPerito,
    VerNotarioComponent,
    EditarNotarioComponent,
    DialogDomiciliosNotario,
    DialogAsentamiento,
    DialogMunicipios,
    DialogCiudad,
    DialogVia,
    VerContribuyenteComponent,
    EditarContribuyenteComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AvatarModule,
    NgxMatFileInputModule,
    NgxMaskModule.forRoot(),
  ],
  entryComponents: [
    DialogAltaBusca,
    DialogSociedad
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-Mx' },
    BnNgIdleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
