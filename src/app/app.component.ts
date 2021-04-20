import { Component } from '@angular/core';
import { environment } from '@env/environment';
import { AuthService } from '@serv/auth.service';
import { BnNgIdleService } from 'bn-ng-idle';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'base';
  isAuth = false;
  constructor(
    private bnIdle: BnNgIdleService,
    private auth: AuthService) {
    this.isAuth = this.auth.isAuthenticated();
    /* Para cerrar sesion si esta inactivo*/
    this.bnIdle.startWatching(300).subscribe((isInactive) => {
      if(isInactive) {
        if(environment.closeSession){
          this.auth.closeSession();
        }
      }
    });
  }
}
