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

    path: string;
    path2: string;
    pathRefresh: void;
    pathCambio: void;
    route: string;
  

    constructor(private authService: AuthService, private router: Router, private activatedRoute: ActivatedRoute, private location:Location) {


        window.onload = function() {
            if (window.location.href.indexOf("ver-contribuyente") > -1) {
                document.getElementById('contribuyente2').classList.add('provisional');
            }
            if (window.location.href.indexOf("editar-contribuyente") > -1) {
                document.getElementById('contribuyente3').classList.add('provisional');
            }
            if (window.location.href.indexOf("ver-notario") > -1) {
                document.getElementById('notario2').classList.add('provisional');
            }
            if (window.location.href.indexOf("editar-notario") > -1) {
                document.getElementById('notario3').classList.add('provisional');
            }
            if (window.location.href.indexOf("ver-peritos") > -1) {
                document.getElementById('perito2').classList.add('provisional');
            }
            if (window.location.href.indexOf("editar-peritos") > -1) {
                document.getElementById('perito3').classList.add('provisional');
            }
            if (window.location.href.indexOf("ver-sociedad") > -1) {
                document.getElementById('sociedad2').classList.add('provisional');
            }
            if (window.location.href.indexOf("editar-sociedad") > -1) {
                document.getElementById('sociedad3').classList.add('provisional');
            }
        };


        this.pathCambio=location.onUrlChange((val) => {
            var elementc2 = document.getElementById('contribuyente2');
            var elementc3 = document.getElementById('contribuyente3');
            var elementn2 = document.getElementById('notario2');
            var elementn3 = document.getElementById('notario3');
            var elementp2 = document.getElementById('perito2');
            var elementp3 = document.getElementById('perito3');
            var elements2 = document.getElementById('sociedad2');
            var elements3 = document.getElementById('sociedad3');
            
            elementc2.classList.remove('provisional');
            elementc3.classList.remove('provisional');
            elementn2.classList.remove('provisional');
            elementn3.classList.remove('provisional');
            elementp2.classList.remove('provisional');
            elementp3.classList.remove('provisional');
            elements2.classList.remove('provisional');
            elements3.classList.remove('provisional');

            var posicion = val.split("/");
            console.log(posicion[2]);

                if(posicion[2] == 'ver-contribuyente'){
                    elementc2.classList.add('provisional');
                }
                if(posicion[2] == 'editar-contribuyente'){
                    elementc3.classList.add('provisional');
                }
                if(posicion[2] == 'ver-notario'){
                    elementn2.classList.add('provisional');
                }
                if(posicion[2] == 'editar-notario'){
                    elementn3.classList.add('provisional');
                }
                if(posicion[2] == 'ver-peritos'){
                    elementp2.classList.add('provisional');
                }
                if(posicion[2] == 'editar-peritos'){
                    elementp3.classList.add('provisional');
                }
                if(posicion[2] == 'ver-sociedad'){
                    elements2.classList.add('provisional');
                }
                if(posicion[2] == 'editar-sociedad'){
                    elements3.classList.add('provisional');
                }
        })

    }


    ngOnInit(): void {
        this.menus = this.authService.getMenu();
        console.log(this.rol);
        switch (this.rol) {
            case "RCONSAT":
                this.contribuyentes = this.contribuyentes.filter(item=>{return (item.nombre !== 'Consulta de contribuyente')});
                console.log("ACA EL ROL 1");
            break;
            case 'RCONCSAT':
                this.contribuyentes = this.contribuyentes.filter(item=>{return (item.nombre == 'Consulta de contribuyente')});
                console.log("ACA EL ROL 2");
            break;
            case "RCONPERITOS":
                this.notarios = this.notarios.filter(item=>{return (item.nombre !== 'Consulta de notario')});
                this.peritos = this.peritos.filter(item=>{return (item.nombre !== 'Consulta de peritos')});
                this.sociedad = this.sociedad.filter(item=>{return (item.nombre !== 'Consulta de sociedad')});
                console.log("ACA EL ROL 3");
            break;
            case "RCONCPERITOS":
                this.notarios = this.notarios.filter(item=>{return (item.nombre == 'Consulta de notario')});
                this.peritos = this.peritos.filter(item=>{return (item.nombre == 'Consulta de peritos')});
                this.sociedad = this.sociedad.filter(item=>{return (item.nombre == 'Consulta de sociedad')});
                console.log("ACA EL ROL 4");
            break;
            default:
            break;
        }

        if (window.location.href.indexOf("editar-notario") > -1) {
            var elementn3 = document.getElementById('#notario2');
            // elementn3.classList.add('provisional');
            // elementn3.setAttribute("style", "color:red; border: 1px solid blue;");
        }
    }

}
