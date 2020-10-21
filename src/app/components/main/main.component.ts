import { Component, OnInit } from '@angular/core';
import { AuthService } from '@serv/auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  isAuth = false;

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.isAuth = this.auth.isAuthenticated();
  }

}
