import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

export interface DatosSociedad {
    razonSocial: string;
    rfc: string;
    registro: string;
    fecha_alta: Date;
    fecha_baja: Date;
}

@Component({
    selector: 'app-editar-sociedad',
    templateUrl: './editar-sociedad.component.html',
    styleUrls: ['./editar-sociedad.component.css']
})
export class EditarSociedadComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/getSociedadValuacion';
    endpointTable = environment.endpoint + 'registro/getPeritoBySociedad';
    endpointActualiza = environment.endpoint + 'registro/actualizarSociedad';
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
                    //this.loading = false;
                    this.dataSocedadResultado = res[0];
                    console.log("AQUI ENTRO EL RES");
                    console.log(this.dataSocedadResultado);
                    this.getPeritosSociedad();
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

    getPeritosSociedad(){
        this.http.post(this.endpointTable + '?' + 'idSociedad=' + this.idSociedad + '&idPerito', '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataPaginate.length; 
                    this.paginator.pageIndex = 0;
                    console.log("OTRO RES");
                    console.log(this.total);
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
        this.pagina = evt.pageIndex + 1;
        this.dataSource = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    actualizaSociedad(){
        let query = '';

        query = 'idPersona=' + this.idSociedad;

        query = ( this.datosSociedad.registro ) ? query + '&registro=' + this.datosSociedad.registro : query + '&registro=';
        
        query = (this.datosSociedad.fecha_alta) ? query + '&fechaAlta=' + moment(this.datosSociedad.fecha_alta).format('DD-MM-YYYY')
                                                : query + '&fechaAlta=';

        query = (this.datosSociedad.fecha_baja) ? query + '&fechaBaja=' + moment(this.datosSociedad.fecha_baja).format('DD-MM-YYYY')
                                                : query + '&fechaBaja=';
        //this.loading = true;
        console.log(this.endpointActualiza + '?' + query);

        //http://localhost:8000/api/v1/registro/actualizarSociedad?idPersona=4485244&registro=S-9999-98&fechaAlta=20-05-2021&fechaBaja
        //http://localhost:8000/api/v1/registro/actualizarSociedad?idPersona=4485269&registro=S-0012-99&fechaAlta=21-05-2021&fechaBaja=31-05-2021
        return;
        this.http.post(this.endpointActualiza + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
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
}
