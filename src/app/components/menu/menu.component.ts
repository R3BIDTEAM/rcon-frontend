import { Component, OnInit } from '@angular/core';
import { AuthService } from '@serv/auth.service';

import { Router, ActivatedRoute, NavigationStart } from '@angular/router';

import { Location } from '@angular/common';


@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

    menus: any[] = [
        { nombre: 'Dashboard', ruta: '/dashboard', icono: 'dashboard' },
    ];

    rol = this.authService.getSession().userData.rol_nombre;
    
    contribuyentes: any[] = [
        { nombre: 'Alta de contribuyente', ruta: '/main/alta-contribuyente', icono: 'add', identificador: '1' },
        { nombre: 'Consulta de contribuyente', ruta: '/main/consulta-contribuyente', icono: 'search', identificador: '2' },
        { nombre: 'Edición de contribuyente', ruta: '/main/edicion-contribuyente', icono: 'edit', identificador: '3' },
        { nombre: 'Reporte', ruta: '/main/reporte', icono: 'assessment', identificador: '4' },
    ];

    notarios: any[] = [
        { nombre: 'Alta de notario', ruta: '/main/alta-notario', icono: 'add', identificador: '1' },
        { nombre: 'Consulta de notario', ruta: '/main/consulta-notario', icono: 'search', identificador: '2' },
        { nombre: 'Edición de notario', ruta: '/main/edicion-notario', icono: 'edit', identificador: '3' },
    ];

    peritos: any[] = [
        { nombre: 'Alta de peritos', ruta: '/main/alta-peritos', icono: 'add', identificador: '1' },
        { nombre: 'Consulta de peritos', ruta: '/main/consulta-peritos', icono: 'search', identificador: '2' },
        { nombre: 'Edición de peritos', ruta: '/main/edicion-peritos', icono: 'edit', identificador: '3' },
    ];

    sociedad: any[] = [
        { nombre: 'Alta de sociedad', ruta: '/main/alta-sociedad', icono: 'add', identificador: '1' },
        { nombre: 'Consulta de sociedad', ruta: '/main/consulta-sociedad', icono: 'search', identificador: '2' },
        { nombre: 'Edición de sociedad', ruta: '/main/edicion-sociedad', icono: 'edit', identificador: '3' },
    ];

    // reporte: any[] = [
    //     { nombre: 'Reporte', ruta: '/main/reporte', icono: 'file', identificador: '1' },
    // ];

    path: string;
    path2: string;
    pathRefresh: void;
    pathCambio: void;
    route: string;
  
    step: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
    constructor(private authService: AuthService, private router: Router, private activatedRoute: ActivatedRoute, private location:Location) {


    }


    ngOnInit(): void {
        this.menus = this.authService.getMenu();
        //console.log(this.rol);
        switch (this.rol) {
            case "SUPERVISOR RCON":
                this.contribuyentes = this.contribuyentes.filter(item=>{return (item.nombre == 'Reporte' || item.nombre == 'Consulta de contribuyente')});
                this.notarios = this.notarios.filter(item=>{return (item.nombre == 'Consulta de notario')});
                this.peritos = this.peritos.filter(item=>{return (item.nombre == 'Consulta de peritos')});
                this.sociedad = this.sociedad.filter(item=>{return (item.nombre == 'Consulta de sociedad')});
            break;
            case "CONSULTOR RCON":
                this.notarios = this.notarios.filter(item=>{return (item.nombre == 'Consulta de notario')});
                this.peritos = this.peritos.filter(item=>{return (item.nombre == 'Consulta de peritos')});
                this.sociedad = this.sociedad.filter(item=>{return (item.nombre == 'Consulta de sociedad')});
                this.contribuyentes = [];
            break;
            case "AUDITORIA RCON":
                this.contribuyentes = this.contribuyentes.filter(item=>{return (item.nombre == 'Consulta de contribuyente')});
                this.notarios = this.notarios.filter(item=>{return (item.nombre == 'Consulta de notario')});
                this.peritos = this.peritos.filter(item=>{return (item.nombre == 'Consulta de peritos')});
                this.sociedad = this.sociedad.filter(item=>{return (item.nombre == 'Consulta de sociedad')});
            break;
            case "EDITOR RCON":
                this.notarios = this.notarios.filter(item=>{return (item.nombre !== 'Consulta de notario')});
                this.peritos = this.peritos.filter(item=>{return (item.nombre !== 'Consulta de peritos')});
                this.sociedad = this.sociedad.filter(item=>{return (item.nombre !== 'Consulta de sociedad')});
                this.contribuyentes = [];
            break;
            case "CONSULTOR CONT RCON":
                this.contribuyentes = this.contribuyentes.filter(item=>{return (item.nombre == 'Consulta de contribuyente')});
                this.notarios = [];
                this.peritos = [];
                this.sociedad = [];
            break;
            case "EDITOR CONT RCON":
                this.contribuyentes = this.contribuyentes.filter(item=>{return (item.nombre !== 'Consulta de contribuyente')});
                this.notarios = [];
                this.peritos = [];
                this.sociedad = [];
            break;
            default:
            break;
        }

    }

    elactive(ruta){
        if(ruta == '/main/alta-contribuyente' || ruta == '/main/consulta-contribuyente' || ruta == '/main/edicion-contribuyente' || ruta == '/main/reporte'){
            this.step = ruta;
            this.step2 = null;
            this.step3 = null;
            this.step4 = null;
            this.step5 = ruta;
        }else if(ruta == '/main/alta-notario' || ruta == '/main/consulta-notario' || ruta == '/main/edicion-notario'){
            this.step = null;
            this.step2 = ruta;
            this.step3 = null;
            this.step4 = null;
            this.step5 = ruta;
        }else if(ruta == '/main/alta-peritos' || ruta == '/main/consulta-peritos' || ruta == '/main/edicion-peritos'){
            this.step = null;
            this.step2 = null;
            this.step3 = ruta;
            this.step4 = null;
            this.step5 = ruta;
        }else if(ruta == '/main/alta-sociedad' || ruta == '/main/consulta-sociedad' || ruta == '/main/edicion-sociedad'){
            this.step = null;
            this.step2 = null;
            this.step3 = null;
            this.step4 = ruta;
            this.step5 = null;
        }//else if(ruta == '/main/reporte'){
        //     this.step = null;
        //     this.step2 = null;
        //     this.step3 = null;
        //     this.step4 = null;
        //     this.step5 = ruta;
        // }
    }

}
