import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-edicion-peritos',
    templateUrl: './edicion-peritos.component.html',
    styleUrls: ['./edicion-peritos.component.css']
})
export class EdicionPeritosComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['registro','nombre', 'datos', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    loading = false;
    dataSource = [];
    dataPaginate;
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
        private route: ActivatedRoute
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
        let query = '';
        let busquedaDatos = '';
        if(
            this.appaterno ||
            this.apmaterno ||
            this.nombre
        ){
            busquedaDatos = busquedaDatos + 'getPeritosByDatosPersonales';
        }else{
            busquedaDatos = busquedaDatos + 'getPeritosByDatosIdentificativos';
        }

        if(this.appaterno){
            query = query + 'appaterno=' + this.appaterno + '&filtroApellidoPaterno=0';
        }
        if(this.apmaterno){
            query = query + 'apmaterno=' + this.apmaterno + '&filtroApellidoMaterno=0';
        }
        if(this.nombre){
            query = query + 'nombre=' + this.nombre + '&filtroNombre=0';
        }
        if(this.rfc){
            query = query + 'rfc=' + this.rfc;
        }
        if(this.curp){
            query = query + 'curp=' + this.curp;
        }
        if(this.ine){
            query = query + 'ine=' + this.ine;
        }
        if(this.registro){
            query = query + 'registro=' + this.registro;
        }
        if(this.identificacion){
            query = query + 'identificacion=' + this.identificacion;
        }
        if(this.idedato){
            query = query + 'idedato=' + this.idedato;
        }
        /* const perito = {
            rfc: 'CAGL790217374',
            curp: 'CAGL790217HDFBNS02',
            claveife: '',
            idOtroDocumento: '',
            valorOtroDocumento: '',
            registro: ''
        } */
        //this.query = 'rfc=CAGL790217374&curp&claveife&idOtroDocumento&valorOtroDocumento&registro'; 
        this.loading = true;
        console.log(this.endpoint);
        this.http.post(this.endpoint + busquedaDatos + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataPaginate.length; 
                    this.paginator.pageIndex = 0;
                    console.log(res);
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

    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataSource = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }
}
