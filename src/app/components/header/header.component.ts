import { Component, OnInit, Input } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { AuthService } from '@serv/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() sidenav: MatSidenav;
  isAuth = false;
  session: any;
  constructor(
    private auth: AuthService,
    private router: Router) {}

  ngOnInit(): void {
    this.isAuth = this.auth.isAuthenticated();
    this.session = this.auth.getSession();
  }

  cerrarSession(): void{
    this.auth.closeSession();
  }

}
