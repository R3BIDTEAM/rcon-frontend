import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class GuardService implements CanActivate {
    rol = this.auth.getSession().userData.rol_nombre;
    constructor(public auth: AuthService, public router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        switch (this.rol) {
            case "RCONSAT":
                if(route.url[0].path == "alta-contribuyente" ||  route.url[0].path == "edicion-contribuyente"
                    ||  route.url[0].path == "main" || route.url[0].path == "editar-contribuyente"){
                    return this.auth.isAuthenticated();
                }else{
                    this.router.navigate(['/main']);
                }
            break;
            case 'RCONCSAT':
                if(route.url[0].path == "consulta-contribuyente" ||  route.url[0].path == "main"
                    || route.url[0].path == "edicion-contribuyente" || route.url[0].path == "ver-contribuyente"){
                    return this.auth.isAuthenticated();
                }else{
                    this.router.navigate(['/main']);
                }
            break;
            case "RCONPERITOS":
                if(route.url[0].path == "alta-notario" ||  route.url[0].path == "edicion-notario" ||  route.url[0].path == "main" || route.url[0].path == "editar-notario"
                    || route.url[0].path == "alta-peritos" || route.url[0].path == "edicion-peritos" || route.url[0].path == "editar-peritos"
                    || route.url[0].path == "alta-sociedad" || route.url[0].path == "edicion-sociedad" || route.url[0].path == "editar-sociedad"){
                    return this.auth.isAuthenticated();
                }else{
                    this.router.navigate(['/main']);
                }
            break;
            case "RCONCPERITOS":
                if(route.url[0].path == "consulta-notario" ||  route.url[0].path == "main" || route.url[0].path == "consulta-peritos"
                    || route.url[0].path == "consulta-sociedad" || route.url[0].path == "ver-peritos"
                    || route.url[0].path == "ver-sociedad" || route.url[0].path == "ver-notario"){
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
