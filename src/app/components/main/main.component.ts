import { Component, OnInit } from '@angular/core';
import { AuthService } from '@serv/auth.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  isAuth = false;
  closed = false;

  constructor(private auth: AuthService, public breakpointObserver: BreakpointObserver) { }

  ngOnInit(): void {
    this.isAuth = this.auth.isAuthenticated();
    this.breakpointObserver.observe(['(min-width: 764px)']).subscribe((state: BreakpointState) => {
      this.closed = state.matches;
    });
  }

}
