import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';

@Component({
    selector: 'app-edicion-peritos',
    templateUrl: './edicion-peritos.component.html',
    styleUrls: ['./edicion-peritos.component.css']
})
export class EdicionPeritosComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/getContribuyente';
    displayedColumns: string[] = ['registro','nombre', 'datos', 'select'];
    pagina = 1;
    total = 0;
    pagesize = 15;
    loading = false;
    dataSource = [];
    httpOptions;
    nombrePerito;
    filtroNombre;
    search = false;
    appaterno;
    apmaterno
    nombre;
    rfc;
    curp;
    ine;
    registro;
    identificacion;
    idedato;
    @ViewChild('paginator') paginator: MatPaginator;

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
                this.appaterno ||
                this.apmaterno ||
                this.nombre ||
                this.rfc ||
                this.curp ||
                this.ine ||
                this.registro ||
                this.identificacion ||
                this.idedato
            ) ? true : false;
    }

    getPerito(){
        const perito = {
            nombrePerito: 'GUILLERMINA',
            filtroNombre: '',
            
        }
        this.loading = true;
        console.log(this.endpoint);
        this.http.post(this.endpoint, perito, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    this.total = 500;
                    console.log(res.length);
                },
                (error) => {
                    this.loading = false;
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }
}
