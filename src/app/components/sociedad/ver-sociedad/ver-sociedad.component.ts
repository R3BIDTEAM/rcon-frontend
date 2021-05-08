import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

export interface DatosSociedad {
    razonSocial: string;
    rfc: string;
    registro: string;
    fecha_alta: Date;
    fecha_baja: Date;
}

@Component({
    selector: 'app-ver-sociedad',
    templateUrl: './ver-sociedad.component.html',
    styleUrls: ['./ver-sociedad.component.css']
})
export class VerSociedadComponent implements OnInit {

    endpoint = environment.endpoint + 'registro/getSociedadValuacion';
    displayedColumns: string[] = ['nombre','registro', 'rfc'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    loading = false;
    dataSocedadResultado;
    dataSource;
    dataPaginate;
    httpOptions;
    search = false;
    query;
    idSociedad;
    datosSociedad: DatosSociedad = {} as DatosSociedad;
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
        this.idSociedad = this.route.snapshot.paramMap.get('idsociedad');
        console.log(this.idSociedad);
        this.getSociedadDatos();
    }

    getSociedadDatos(){
        this.query = 'idSociedad=' + this.idSociedad; 
        this.loading = true;
        console.log(this.endpoint);
        this.http.post(this.endpoint + '?' + this.query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSocedadResultado = res[0];
                    // this.dataSource = res.dsPeritos[0].Sociedades;
                    // this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    // this.total = this.dataPaginate.length; 
                    // this.paginator.pageIndex = 0;
                    console.log("AQUI ENTRO EL RES");
                    console.log(this.dataSocedadResultado);
                    this.datosDeLaSociedad();
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

    datosDeLaSociedad(){
        this.datosSociedad.razonSocial  = this.dataSocedadResultado.RAZONSOCIAL;
        this.datosSociedad.rfc = this.dataSocedadResultado.RFC;
        this.datosSociedad.registro = this.dataSocedadResultado.REGISTRO;
        this.datosSociedad.fecha_alta = new Date(this.dataSocedadResultado.FECHAALTA);
        this.datosSociedad.fecha_baja = new Date(this.dataSocedadResultado.FECHABAJA);
    }
    paginado(evt): void{
        // this.pagina = evt.pageIndex + 1;
        // this.dataSource = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    paginate(array, page_size, page_number) {
        // return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

}
