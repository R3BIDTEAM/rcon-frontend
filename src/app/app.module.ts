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
import { AltaContribuyenteComponent, DialogDomicilio, DialogRepresentacion } from './components/contribuyentes/alta-contribuyente/alta-contribuyente.component';
import { ConsultaContribuyenteComponent } from './components/contribuyentes/consulta-contribuyente/consulta-contribuyente.component';
import { EdicionContribuyenteComponent } from './components/contribuyentes/edicion-contribuyente/edicion-contribuyente.component';
import { AltaNotarioComponent } from './components/notarios/alta-notario/alta-notario.component';
import { ConsultaNotarioComponent } from './components/notarios/consulta-notario/consulta-notario.component';
import { EdicionNotarioComponent } from './components/notarios/edicion-notario/edicion-notario.component';
import { AltaPeritosComponent, DialogPerito } from './components/peritos/alta-peritos/alta-peritos.component';
import { ConsultaPeritosComponent } from './components/peritos/consulta-peritos/consulta-peritos.component';
import { EdicionPeritosComponent } from './components/peritos/edicion-peritos/edicion-peritos.component';
import { AltaSociedadComponent, DialogSociedad } from './components/sociedad/alta-sociedad/alta-sociedad.component';
import { ConsultaSociedadComponent } from './components/sociedad/consulta-sociedad/consulta-sociedad.component';
import { EdicionSociedadComponent } from './components/sociedad/edicion-sociedad/edicion-sociedad.component';
import { VerPeritosComponent } from './components/peritos/ver-peritos/ver-peritos.component';

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
    DialogPerito,
    DialogSociedad,
    DialogDomicilio,
    VerPeritosComponent,
    DialogRepresentacion
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
    DialogPerito,
    DialogSociedad
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-Mx' },
    BnNgIdleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
