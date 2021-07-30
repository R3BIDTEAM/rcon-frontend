import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { ActivatedRoute } from '@angular/router';

export interface DocumentosIdentificativos{
    id_documento: number;
    documento: string;
}

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
    isIdentificativo;
    panelDomicilio = false;
    panelDomPredial = false;
    panelBienes = false;
    documentos: DocumentosIdentificativos[] = [];
    loadingDocumentosIdentificativos = false;
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

        this.getDataDocumentosIdentificativos();
    }

    /** 
    * Obtiene los Documentos Identificativos para llenar el Select de Documentos Identificativos
    */
     getDataDocumentosIdentificativos(): void{
        this.loadingDocumentosIdentificativos = true;
        this.http.get(this.endpoint + 'getCatalogos', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingDocumentosIdentificativos = false;
                this.documentos = res.CatDocIdentificativos;
            },
            (error) => {
                this.loadingDocumentosIdentificativos = false;
            }
        );
    }

    /**
     * De acuerdo al parametro sea identificativo o personal se limpiaran los otros campos.
     * @param isIdentificativo Valor que nos indica que campos utilizaremos para realizar la busqueda
     */
    clearInputsIdentNoIdent(isIdentificativo): void {
        this.isIdentificativo = isIdentificativo;
        if(this.isIdentificativo){
            this.appaterno = null;
            this.apmaterno = null;
            this.nombre = null;            
        }else{
            this.rfc = null;
            this.curp = null;
            this.ine = null;
            this.registro = null;
            this.identificacion = null;
            this.idedato = null;
        }
    }

    /**
     * Reinicia los valores del paginado y los campos del formulario.
     */
    clean(): void{
        // this.pagina = 1;
        // this.total = 0;
        // this.dataSource = [];
        // this.loading = false;
        // this.dataPaginate;
        this.appaterno = null;
        this.apmaterno = null;
        this.nombre = null;
        this.rfc = null;
        this.curp = null;
        this.ine = null;
        this.registro = null;
        this.identificacion = null;
        this.idedato = null;
    }

    /**
     * Valida que exista un dato para activar el bóton de búsqueda.
     */
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

    /**
     * Obtiene el o los registros del perito de acuerdo al críterio de búsqueda que pueden ser datos identificativos o personales.
     */
    getPerito(){
        if(this.search){
            let query = '';
            let busquedaDatos = '';

            if(this.nombre){
                query = query + '&nombre=' + this.nombre + '&filtroNombre=0';
            }
            if(this.appaterno){
                query = query + '&apellidoPaterno=' + this.appaterno + '&filtroApellidoPaterno=0';
            }
            if(this.apmaterno){
                query = query + '&apellidoMaterno=' + this.apmaterno + '&filtroApellidoMaterno=0';
            }
            if(this.rfc){
                query = query + '&rfc=' + this.rfc;
            }
            if(this.curp){
                query = query + '&curp=' + this.curp;
            }
            if(this.ine){
                query = query + '&ine=' + this.ine;
            }
            if(this.registro){
                query = query + '&registro=' + this.registro;
            }
            if(this.identificacion && this.idedato){
                query = query + '&idOtroDocumento=' + this.identificacion + '&valorOtroDocumento=' + this.idedato;
            }

            if( this.isIdentificativo ){
                busquedaDatos = busquedaDatos + 'getPeritosByDatosIdentificativos';
            }else{
                busquedaDatos = busquedaDatos + 'getPeritosByDatosPersonales';
            }

            query = query.substr(1);

            console.log(this.endpoint + busquedaDatos + '?' + query);
            this.loading = true;
            this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
                .subscribe(
                    (res: any) => {
                        this.loading = false;
                        this.dataSource = res;
                        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                        this.total = this.dataSource.length; 
                        this.paginator.pageIndex = 0;
                        console.log(this.dataSource);
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
