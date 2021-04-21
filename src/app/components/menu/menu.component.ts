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

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.menus = this.authService.getMenu();
  }

}
