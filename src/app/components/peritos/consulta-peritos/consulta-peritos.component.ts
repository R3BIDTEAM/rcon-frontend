import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

export interface DocumentosIdentificativos{
    id_documento: number;
    documento: string;
}

@Component({
    selector: 'app-consulta-peritos',
    templateUrl: './consulta-peritos.component.html',
    styleUrls: ['./consulta-peritos.component.css']
})
export class ConsultaPeritosComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['registro','nombre', 'datos', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    loading = false;
    dataSource = [];
    dataPaginate = [];
    httpOptions;
    nombrePerito;
    filtroNombre;
    search = false;
    appaterno: any = null;
    apmaterno: any = null
    nombre: any = null;
    rfc: any = null;
    curp: any = null;
    ine: any = null;
    registro: any = null;
    identificacion: any = null;
    idedato: any = null;
    isIdentificativo;
    consPeritoFormGroup: FormGroup;
    documentos: DocumentosIdentificativos[] = [];
    loadingDocumentosIdentificativos = false;
    @ViewChild('paginator') paginator: MatPaginator;
    selectDisabled = false;
    selectCedula = false;
    selectPasaporte = false;
    selectLicencia = false;
    selectNSS = false;

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private auth: AuthService,
        private route: ActivatedRoute,    
        private _formBuilder: FormBuilder,
        private spinner: NgxSpinnerService
    ) { }

    /**
     * @param httpOptions No se que hace la neta
     * @return no regresa nada
     */
    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };

        this.consPeritoFormGroup = this._formBuilder.group({
            appaterno: ['', [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            apmaterno: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            nombre: ['', [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            rfc: [null, []],
            curp: [null, []],
            ine: [null, []],
            identificacion: [null],
            idedato: [null],
            registro: ['', [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]]    
        });

        this.getDataDocumentosIdentificativos();
    }

    /** 
    * Obtiene los Documentos Identificativos para llenar el Select de Documentos Identificativos
    */
     getDataDocumentosIdentificativos(): void{
        this.spinner.show();
        this.loadingDocumentosIdentificativos = true;
        this.http.get(this.endpoint + 'getCatalogos', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingDocumentosIdentificativos = false;
                this.documentos = res.CatDocIdentificativos;
                this.spinner.hide();
            },
            (error) => {
                this.loadingDocumentosIdentificativos = false;
                this.spinner.hide();
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
        this.selectDisabled = false;
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
     *  Si se selecciona alguna opción desbloqueará el input del número del documento.
     * @param event Valor del option
     */
    seleccionaDocto(){
        console.log("LO QUE SE SELECCIONO "+this.identificacion);
        this.selectDisabled = true;
        this.selectCedula = false;
        this.selectPasaporte = false;
        this.selectLicencia = false;
        this.selectNSS = false;

        if(this.identificacion == 1){
            this.selectCedula = true;
        }

        if(this.identificacion == 2){
            this.selectPasaporte = true;
        }

        if(this.identificacion == 3){
            this.selectLicencia = true;
        }

        if(this.identificacion == 6){
            this.selectNSS = true;
        }
    }

    /**
     * Realiza la búsqueda del o de los peritos existentes.
     */
    getPerito(){
        this.spinner.show();
        if(this.search){

            console.log(this.search);
        
        
            let query = '';
            let busquedaDatos = '';

            if(this.nombre){
                query = query + '&nombre=' + this.nombre.toLocaleUpperCase() + '&filtroNombre=0';
            }
            if(this.appaterno){
                query = query + '&apellidoPaterno=' + this.appaterno.toLocaleUpperCase() + '&filtroApellidoPaterno=0';
            }
            if(this.apmaterno){
                query = query + '&apellidoMaterno=' + this.apmaterno.toLocaleUpperCase() + '&filtroApellidoMaterno=0';
            }
            if(this.rfc){
                query = query + '&rfc=' + this.rfc.toLocaleUpperCase();
            }
            if(this.curp){
                query = query + '&curp=' + this.curp.toLocaleUpperCase();
            }
            if(this.ine){
                query = query + '&ine=' + this.ine.toLocaleUpperCase();
            }
            if(this.registro){
                query = query + '&registro=' + this.registro.toLocaleUpperCase();
            }
            if(this.identificacion && this.idedato){
                query = query + '&idOtroDocumento=' + this.identificacion + '&valorOtroDocumento=' + this.idedato.toLocaleUpperCase();
            }

            if( this.isIdentificativo ){
                busquedaDatos = busquedaDatos + 'getPeritosByDatosIdentificativos';
            }else{
                busquedaDatos = busquedaDatos + 'getPeritosByDatosPersonales';
            }

            query = query.substr(1);

            this.loading = true;
            console.log(this.endpoint + busquedaDatos + '?' + query);
            this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
                .subscribe(
                    (res: any) => {
                        this.loading = false;
                        this.dataSource = res;
                        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                        this.total = this.dataSource.length; 
                        this.paginator.pageIndex = 0;
                        console.log(this.dataSource);
                        this.spinner.hide();
                    },
                    (error) => {
                        this.loading = false;
                        // this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        //     duration: 10000,
                        //     horizontalPosition: 'end',
                        //     verticalPosition: 'top'
                        // });
                        Swal.fire({
                            title: 'ERROR',
                            text: error.error.mensaje,
                            icon: 'error',
                            confirmButtonText: 'Cerrar'
                        });
                        this.spinner.hide();
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
