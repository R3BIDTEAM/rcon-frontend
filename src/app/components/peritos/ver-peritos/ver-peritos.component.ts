import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

export interface DatosPeritos {
    apepaterno: string;
    apematerno: string;
    nombre: string;
    rfc: string;
    curp: string;
    ine: string;
    idIden: number;
    identificacion: string;
    fecha_naci: Date;
    fecha_def: Date;
    celular: string;
    email: string;
    registro: string;
    independiente: boolean;
    fecha_alta: Date;
    fecha_baja: Date;
}

@Component({
    selector: 'app-ver-peritos',
    templateUrl: './ver-peritos.component.html',
    styleUrls: ['./ver-peritos.component.css']
})
export class VerPeritosComponent implements OnInit {

    endpoint = environment.endpoint + 'registro/getPerito';
    displayedColumns: string[] = ['nombre','registro', 'rfc'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    loading = false;
    dataPeritoResultado;
    dataSource;
    dataPaginate;
    httpOptions;
    search = false;
    query;
    idPerito;
    datoPeritos: DatosPeritos = {} as DatosPeritos;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private auth: AuthService,
        private route: ActivatedRoute
    ) { }

    /**
     * Valida la sesión del usuario y llama a los metodos necesarios para mostrar en la pantalla la información.
     */
    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };
        this.idPerito = this.route.snapshot.paramMap.get('idperito');
        console.log(this.idPerito);
        this.getPeritoDatos();
    }

    /**
     * Obtiene los datos del perito consultado.
     */
    getPeritoDatos(){
        this.query = 'obtenerSociedades=1&idPerito=' + this.idPerito; 
        this.loading = true;
        console.log(this.endpoint);
        this.http.get(this.endpoint + '?' + this.query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataPeritoResultado = res.dsPeritos[0];
                    this.dataSource = res.dsPeritos[0].Sociedades;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataPaginate.length; 
                    this.paginator.pageIndex = 0;
                    console.log("AQUI ENTRO EL RES");
                    console.log(this.dataSource);
                    this.datoDelPerito();
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

    /**
     * Almacena los valores recibidos de la consulta realizada.
     */
    datoDelPerito(){
        this.datoPeritos.apepaterno = this.dataPeritoResultado.APELLIDOPATERNO;
        this.datoPeritos.apematerno = this.dataPeritoResultado.APELLIDOMATERNO;
        this.datoPeritos.nombre  = this.dataPeritoResultado.NOMBRE;
        this.datoPeritos.rfc = this.dataPeritoResultado.RFC;
        this.datoPeritos.curp = this.dataPeritoResultado.CURP;
        this.datoPeritos.ine = this.dataPeritoResultado.CLAVEIFE;
        this.datoPeritos.idIden = 2;
        this.datoPeritos.identificacion = this.dataPeritoResultado.DESCDOCIDENTIF;
        this.datoPeritos.fecha_naci = this.dataPeritoResultado.FECHANACIMIENTO;
        this.datoPeritos.fecha_def = this.dataPeritoResultado.FECHADEFUNCION;
        this.datoPeritos.celular = this.dataPeritoResultado.CELULAR;
        this.datoPeritos.email = this.dataPeritoResultado.EMAIL;
        this.datoPeritos.registro = this.dataPeritoResultado.REGISTRO;
        this.datoPeritos.fecha_alta = new Date(this.dataPeritoResultado.FECHAALTA);
        this.datoPeritos.fecha_baja = new Date(this.dataPeritoResultado.FECHABAJA);
        
        if(this.dataPeritoResultado.INDEPENDIENTE === 'S'){
            this.datoPeritos.independiente = true;
        }else{
            this.datoPeritos.independiente = false;
        }
    }

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataSource = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    /**
     * Regresa la posición del paginado de acuerdo a los parámetro enviados
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por página.
     * @param page_number Valor de la página en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }
  
}
