import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '@serv/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

export interface Filtros {
  apellido_paterno: string;
  apellido_materno: string;
  nombre: string;
  rfc: string;
  curp: string;
  ine: string;
  otro_documento: string;
  numero_documento: string;
  no_notario: string;
  estado: string;
}

export interface Estados{
  idestado: number;
  estado: string;
}

export interface DocumentosIdentificativos{
  id_documento: number;
  documento: string;
}

@Component({
  selector: 'app-consulta-notario',
  templateUrl: './consulta-notario.component.html',
  styleUrls: ['./consulta-notario.component.css']
})
export class ConsultaNotarioComponent implements OnInit {
  endpoint = environment.endpoint + 'registro/';
  pagina = 1;
  total = 0;
  pageSize = 15;
  loading = false;
  dataSource = [];
  dataPaginate = [];
  displayedColumns: string[] = ['nombre','numero_notario','datos_identificativos','seleccionar'];
  httpOptions;
  filtros: Filtros = {} as Filtros;
  estados: Estados[] = [];
  documentos: DocumentosIdentificativos[] = [];
  loadingEstados = false;
  loadingDocumentosIdentificativos = false;
  isIdentificativo;
  search = false;
  isBusqueda;
  queryParamFiltros;
  endpointBusqueda;
  @ViewChild('paginator') paginator: MatPaginator;
  contribuyenteFormGroup: FormGroup;
  selectDisabled = false;
  selectCedula = false;
  selectPasaporte = false;
  selectLicencia = false;
  selectNSS = false;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private router: Router,
    private _formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
  ) { 
    
  }

  ngOnInit(): void {
    this.isBusqueda = false;
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.auth.getSession().token
      })
    };
    this.getDataEstados();
    this.getDataDocumentosIdentificativos();
    
    this.contribuyenteFormGroup = this._formBuilder.group({
      tipo_persona: ['F', Validators.required],
      nombre: [null,[Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
      rfc: [null],
      apaterno: [null,[Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
      amaterno: [null,[Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
      curp: [null],
      ine: [null],
      numero_documento: [null, []],
      otro_documento: [null, []],
      estado: [null],
      no_notario: ['', [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]]
    });


  }

  clean(): void{    
    this.filtros.apellido_paterno = null;
    this.filtros.apellido_materno = null;
    this.filtros.nombre = null;
    this.filtros.rfc = null;
    this.filtros.curp = null;
    this.filtros.ine = null;
    this.filtros.numero_documento = null;
    this.filtros.no_notario = null;
    this.filtros.estado = null;
   
}

  /** 
  * Obtiene el nombre de los Estados para llenar el el Select de Estados
  */
  getDataEstados(): void {
    this.spinner.show();
    this.loadingEstados = true;
    this.http.get(this.endpoint + 'getEstados', this.httpOptions).subscribe(
      (res: any) => {
        this.spinner.hide();
        this.loadingEstados = false;
        this.estados = res;

      },
      (error) => {
        this.spinner.hide();
        this.loadingEstados = false;
      }
    );
  }

  /** 
  * Obtiene los Documentos Identificativos para llenar el Select de Documentos Identificativos
  */
  getDataDocumentosIdentificativos(): void{
    this.spinner.show();
    this.loadingDocumentosIdentificativos = true;
    this.http.get(this.endpoint + 'getCatalogos', this.httpOptions).subscribe(
      (res: any) => {
        this.spinner.hide();
        this.loadingDocumentosIdentificativos = false;
        this.documentos = res.CatDocIdentificativos;

      },
      (error) => {
        this.spinner.hide();
        this.loadingDocumentosIdentificativos = false;
      }
    );
  }

  /** 
  * @param isIdentificativo Indica si la búsqueda se está realizando por Datos Identificativos o Personales
  */
  clearInputsIdentNoIdent(isIdentificativo): void {
      this.isIdentificativo = isIdentificativo;
          if(isIdentificativo){
            this.filtros.apellido_paterno = null;
            this.filtros.apellido_materno = null;
            this.filtros.nombre = null;
          } else {
            this.filtros.rfc = null;
            this.filtros.curp = null;
            this.filtros.ine = null;
            this.filtros.otro_documento = null;
            this.filtros.numero_documento = null;
            this.filtros.no_notario = null;
            this.filtros.estado = null;
          }
  }

  /** 
  * Verifica que haya campos llenos para habilitar el botón de búsqueda
  */
  validateSearch(){
    this.search = (
            this.filtros.apellido_paterno ||
            this.filtros.apellido_materno ||
            this.filtros.nombre ||
            this.filtros.rfc ||
            this.filtros.curp ||
            this.filtros.no_notario ||
            this.filtros.estado
        ) ? true : false;
  }

  /** 
  * Verifica que esté seleccionado un elemento en el Select de Otro Documento Identificativo para poder capturar su información, de lo contrario lo bloquea
  */
  otroDocumento(){
    if(this.filtros.otro_documento === null || this.filtros.otro_documento === ''){
      this.filtros.numero_documento = '';
    }
  }

  /**
     *  Si se selecciona alguna opción desbloqueará el input del número del documento.
     * @param event Valor del option
     */
   seleccionaDocto(event){
    this.selectDisabled = true;
    this.selectCedula = false;
    this.selectPasaporte = false;
    this.selectLicencia = false;
    this.selectNSS = false;

    if(this.filtros.otro_documento === '1'){
        this.selectCedula = true;
    }

    if(this.filtros.otro_documento === '2'){
        this.selectPasaporte = true;
    }

    if(this.filtros.otro_documento === '3'){
        this.selectLicencia = true;
    }

    if(this.filtros.otro_documento === '6'){
        this.selectNSS = true;
    }
    
  }

    /** 
     * Obtiene la información una vez llenados los filtros y realizado la búsqueda
     */
    getData(): void {
        if(this.search){
            this.spinner.show();
            let query = '';
            let busquedaDatos = '';

            if(this.filtros.nombre){
                query = query + '&nombre=' + this.filtros.nombre + '&filtroNombre=0';
            }
            if(this.filtros.apellido_paterno){
                query = query + '&apellidoPaterno=' + this.filtros.apellido_paterno + '&filtroApellidoPaterno=0';
            }
            if(this.filtros.apellido_materno){
                query = query + '&apellidoMaterno=' + this.filtros.apellido_materno + '&filtroApellidoMaterno=0';
            }
            if(this.filtros.rfc){
                query = query + '&rfc=' + this.filtros.rfc;
            }
            if(this.filtros.curp){
                query = query + '&curp=' + this.filtros.curp;
            }
            if(this.filtros.ine){
                query = query + '&ine=' + this.filtros.ine;
            }
            if(this.filtros.otro_documento){
                query = query + '&iddocidentif=' + this.filtros.otro_documento;
            }
            if(this.filtros.numero_documento){
                query = query + '&valdocidentif=' + this.filtros.numero_documento;
            }
            if(this.filtros.no_notario){
                query = query + '&numnotario=' + this.filtros.no_notario;
            }
            if(this.filtros.estado){
                query = query + '&estado=' + this.filtros.estado;
            }
            

            if( this.isIdentificativo ){
                busquedaDatos = busquedaDatos + 'getNotariosByDatosIdentificativos';
            }else{
                busquedaDatos = busquedaDatos + 'getNotariosByDatosPersonales';
            }

            query = query.substr(1);

            this.loading = true;

                this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
                    .subscribe(
                        (res: any) => {
                          this.spinner.hide();
                          this.loading = false;
                          this.dataSource = res;
                          this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                          this.total = this.dataSource.length; 
                          if (res.length === 0) {
                            Swal.fire({
                              title: 'SIN RESULTADO',
                              text: "No se encontraron datos.",
                              icon: 'error',
                              confirmButtonText: 'Cerrar'
                            });
                          }
                        },
                        (error) => {
                          this.spinner.hide();
                          this.loading = false;
                          Swal.fire({
                            title: 'ERROR',
                            text: error.error.mensaje,
                            icon: 'error',
                            confirmButtonText: 'Cerrar'
                          });
                        }
                    );
        }
    }

  paginado(evt): void{
      this.pagina = evt.pageIndex + 1;
      this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
  }

  paginate(array, page_size, page_number) {
      return array.slice((page_number - 1) * page_size, page_number * page_size);
  }


}
