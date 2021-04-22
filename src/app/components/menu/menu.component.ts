import { Component, OnInit } from '@angular/core';
import { AuthService } from '@serv/auth.service';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  menus: any[] = [
    { nombre: 'Dashboard', ruta: '/dashboard', icono: 'dashboard' },
  ];

  contribuyentes: any[] = [
    { nombre: 'Alta de contribuyente', ruta: '/main/alta-contribuyente', icono: 'add' },
    { nombre: 'Consulta de contribuyente', ruta: '/main/consulta-contribuyente', icono: 'search' },
    { nombre: 'Edición de contribuyente', ruta: '/main/edicion-contribuyente', icono: 'edit' },
  ];

  notarios: any[] = [
    { nombre: 'Alta de notario', ruta: '/main/alta-notario', icono: 'add' },
    { nombre: 'Consulta de notario', ruta: '/main/consulta-notario', icono: 'search' },
    { nombre: 'Edición de notario', ruta: '/main/edicion-notario', icono: 'edit' },
  ];

  peritos: any[] = [
    { nombre: 'Alta de peritos', ruta: '/main/alta-peritos', icono: 'add' },
    { nombre: 'Consulta de peritos', ruta: '/main/consulta-peritos', icono: 'search' },
    { nombre: 'Edición de peritos', ruta: '/main/edicion-peritos', icono: 'edit' },
  ];

  sociedad: any[] = [
    { nombre: 'Alta de sociedad', ruta: '/main/alta-sociedad', icono: 'add' },
    { nombre: 'Consulta de sociedad', ruta: '/main/consulta-sociedad', icono: 'search' },
    { nombre: 'Edición de sociedad', ruta: '/main/edicion-sociedad', icono: 'edit' },
  ];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.menus = this.authService.getMenu();
  }

}
