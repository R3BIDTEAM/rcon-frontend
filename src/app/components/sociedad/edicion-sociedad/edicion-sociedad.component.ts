import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';

@Component({
    selector: 'app-edicion-sociedad',
    templateUrl: './edicion-sociedad.component.html',
    styleUrls: ['./edicion-sociedad.component.css']
})
export class EdicionSociedadComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/getContribuyente';
    displayedColumns: string[] = ['registro','nombre', 'datos', 'select'];
    pagina = 1;
    total = 0;
    pagesize = 15;
    loading = false;
    dataSource = [];
    httpOptions;
    razonSocial;
    rfc;
    registro;
    search;

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private auth: AuthService,
    ) { }
    
    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };
    }

    clean(): void{
        // this.busqueda = false;
        // this.resetPaginator();
    }

    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
    }

    validateSearch(){
        this.search = (
            this.razonSocial ||
            this.rfc ||
            this.registro
        ) ? true : false;
    }
}
