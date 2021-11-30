import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@serv/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '@env/environment';
import { Md5 } from 'ts-md5/dist/md5';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  public loginInvalid: boolean;
  private formSubmitAttempt: boolean;
  public passVisibility = false;
  loading = false;
  errMsj = '';
  linkRemeber = environment.ssoRemember;
  public soloLetras = { L: { pattern: new RegExp('[A-Za-zñÑáéíóúÁÉÍÓÚ ]') } };
  public soloLetrasNoSpace = {
    L: { pattern: new RegExp('[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ]') },
  };
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) { }
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: environment.ssoToken
    })
  };

  ngOnInit(): void {
    if(this.authService.isAuthenticated){
      this.router.navigate(['main/bandeja-entrada']);
    }
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required,Validators.minLength(6)]]
    });

  }
  get password(): string {
    return this.form.get('password').value;
  }

  onSubmit(): void {
    this.loginInvalid = false;
    this.formSubmitAttempt = false;
    if (this.form.valid) {
      try {
        const payload = {
          login: this.form.get('username').value,
          password: this.authService.hashPassword(this.form.get('password').value),
        };
        this.loading = true;
        this.http.post(environment.ssoEndpoint + 'usuarios/login', payload,
          this.httpOptions).subscribe(
            (res: any) => {
              this.loading = false;
              this.authService.setSession({
                token: res.token,
                userData: res
              });
              this.router.navigate(['main']);
            },
            (error) => {
              if(error.status == 406){
                window.location.replace(error.error.redirect);
              }
              this.loading = false;
              this.errMsj = error.error.mensaje;
            });
      } catch (err) {
        this.loginInvalid = true;
      }
    } else {
      this.formSubmitAttempt = true;
    }
  }

}
