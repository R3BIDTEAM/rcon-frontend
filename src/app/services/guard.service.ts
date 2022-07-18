import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class GuardService implements CanActivate {
    rol = null;
    constructor(public auth: AuthService, public router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        this.rol = this.auth.getSession().userData.rol_nombre;
        console.log(route);
        switch (this.rol) {
            case "SUPERVISOR RCON":
                if(route.url[0].path === 'main' 
                    || route.url[0].path === 'reporte'
                    || route.url[0].path === 'consulta-contribuyente' 
                    || route.url[0].path === 'consulta-notario' 
                    || route.url[0].path === 'consulta-peritos'
                    || route.url[0].path === 'consulta-sociedad'
                    || route.url[0].path === 'ver-peritos' 
                    || route.url[0].path === 'ver-sociedad' 
                    || route.url[0].path === 'ver-notario'
                    || route.url[0].path === 'ver-contribuyente'
                ){
                    return this.auth.isAuthenticated();
                }else{
                    this.router.navigate(['/main']);
                }
            break;
            case 'CONSULTOR RCON':
                if(route.url[0].path === 'main' 
                    || route.url[0].path === 'consulta-notario' 
                    || route.url[0].path === 'consulta-peritos'
                    || route.url[0].path === 'consulta-sociedad'
                    || route.url[0].path === 'ver-peritos' 
                    || route.url[0].path === 'ver-sociedad' 
                    || route.url[0].path === 'ver-notario'
                ){
                    return this.auth.isAuthenticated();
                }else{
                    this.router.navigate(['/main']);
                }
            break;
            case "EDITOR RCON":
                if(route.url[0].path === "main" 
                    || route.url[0].path == "alta-notario" 
                    || route.url[0].path == "edicion-notario" 
                    || route.url[0].path == "editar-notario"
                    || route.url[0].path == "alta-peritos" 
                    || route.url[0].path == "edicion-peritos"
                    || route.url[0].path == "editar-peritos"
                    || route.url[0].path == "alta-sociedad"
                    || route.url[0].path == "edicion-sociedad"
                    || route.url[0].path == "editar-sociedad"
                ){
                    return this.auth.isAuthenticated();
                }else{
                    this.router.navigate(['/main']);
                }
            break;
            case "AUDITORIA RCON":
                if(route.url[0].path === "main"
                    || route.url[0].path === 'consulta-contribuyente' 
                    || route.url[0].path === "consulta-notario" 
                    || route.url[0].path === "consulta-peritos"
                    || route.url[0].path === "consulta-sociedad" 
                    || route.url[0].path === 'ver-contribuyente'
                    || route.url[0].path === "ver-peritos"
                    || route.url[0].path === "ver-sociedad" 
                    || route.url[0].path === "ver-notario"
                ){
                    return this.auth.isAuthenticated();
                }else{
                    this.router.navigate(['/main']);
                }
            break;
            case 'CONSULTOR CONT RCON':
                if(route.url[0].path === 'main' 
                    || route.url[0].path === 'consulta-contribuyente' 
                    || route.url[0].path === 'ver-contribuyente'
                ){
                    return this.auth.isAuthenticated();
                }else{
                    this.router.navigate(['/main']);
                }
            break;
            case 'EDITOR CONT RCON':
                if(route.url[0].path === 'main' 
                    || route.url[0].path === 'alta-contribuyente' 
                    || route.url[0].path === 'edicion-contribuyente'
                    || route.url[0].path === 'editar-contribuyente'
                    || route.url[0].path === 'editart-contribuyente'
                ){
                    return this.auth.isAuthenticated();
                }else{
                    this.router.navigate(['/main']);
                }
            break;
            case 'Administrador':
                if(route.url[0].path === 'main' 
                    || route.url[0].path === 'alta-contribuyente' 
                    || route.url[0].path === 'edicion-contribuyente'
                    || route.url[0].path === 'editar-contribuyente'
                    || route.url[0].path === 'editart-contribuyente'
                    || route.url[0].path === 'reporte'
                    || route.url[0].path === 'consulta-contribuyente' 
                    || route.url[0].path === 'consulta-notario' 
                    || route.url[0].path === 'consulta-peritos'
                    || route.url[0].path === 'consulta-sociedad'
                    || route.url[0].path === 'ver-peritos' 
                    || route.url[0].path === 'ver-sociedad' 
                    || route.url[0].path === 'ver-notario'
                    || route.url[0].path === 'ver-contribuyente'
                ){
                    return this.auth.isAuthenticated();
                }else{
                    this.router.navigate(['/main']);
                }
            break;
            default:
                if (!this.auth.isAuthenticated()) {
                    this.router.navigate(['/']);
                }
                return this.auth.isAuthenticated();
            break;
        }
    }

}
