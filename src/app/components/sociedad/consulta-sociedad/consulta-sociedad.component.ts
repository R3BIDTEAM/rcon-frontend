import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { ActivatedRoute } from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
    selector: 'app-consulta-sociedad',
    templateUrl: './consulta-sociedad.component.html',
    styleUrls: ['./consulta-sociedad.component.css']
})
export class ConsultaSociedadComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['razon','registro', 'rfc', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    loading = false;
    dataSource = [];
    dataPaginate = [];
    httpOptions;
    razonSocial;
    rfc;
    registro;
    search;
    isIdentificativo;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private auth: AuthService,
        private route: ActivatedRoute
    ) { }

    /**
     * Valida la sesión del usuario
     */
    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };
    }

    /**
     * Reinicia los valores del paginado.
     */
    clean(): void{
        // this.loading = false;
        // this.pagina = 1;
        // this.total = 0;
        // this.pageSize = 15;
        // this.dataSource = [];
        // this.dataPaginate;
        this.razonSocial = null;
        this.rfc = null;
        this.registro = null;
    }

    /**
     * Valida que exista un dato para activar el bóton de búsqueda.
     */
    validateSearch(){
        this.search = (
            this.razonSocial ||
            this.rfc ||
            this.registro
        ) ? true : false;
    }

    /**
     * De acuerdo al parametro sea identificativo o personal se limpiaran los otros campos.
     * @param isIdentificativo Valor que nos indica que campos utilizaremos para realizar la busqueda
     */
    clearInputsIdentNoIdent(isIdentificativo): void {
        this.isIdentificativo = isIdentificativo;
        if(this.isIdentificativo){
            this.razonSocial = null;
        }else{
            this.rfc = null;
            this.registro = null;
        }
    }

    /**
     * Obtiene el o los registros de la sociedad de acuerdo al críterio de búsqueda que pueden ser datos identificativos o personales.
     */
    getSociedad(){
        if(this.search){
            let query = '';
            let busquedaDatos = '';
            if( this.razonSocial ){
                busquedaDatos = busquedaDatos + 'getSocValuacionByDatosPersonales';
            }else{
                busquedaDatos = busquedaDatos + 'getSocValuacionByDatosIdentificativos';
            }

            if( this.razonSocial ){
                query = query + '&razonSocial=' + this.razonSocial + '&filtroRazon=1';
            }
            if(this.rfc){
                query = query + '&rfc=' + this.rfc;
            }
            if(this.registro){
                query = query + '&registro=' + this.registro;
            }

            query = query.substr(1);

            this.loading = true;
            console.log(this.endpoint);
            this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
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

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
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
