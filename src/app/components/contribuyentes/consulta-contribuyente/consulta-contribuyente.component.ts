import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '@serv/auth.service';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

export interface DatosContribuyente {  
  identificacion: number;
  idedato: string;  
}

export interface DocumentosIdentificativos{
  id_documento: number;
  documento: string;
}

@Component({
  selector: 'app-consulta-contribuyente',
  templateUrl: './consulta-contribuyente.component.html',
  styleUrls: ['./consulta-contribuyente.component.css']
})
export class ConsultaContribuyenteComponent implements OnInit {
  endpoint = environment.endpoint + 'registro/';
  pageSize = 15;
  pagina = 1;
  total = 0;
  loadingResponse = false;
  dataSource = [];
  data = [];
  displayedColumns: string[] = ['nombre', 'datos_identificativos', 'seleccionar'];
  documentos: DocumentosIdentificativos[] = [];
  httpOptions;
  cuentaFormGroup: FormGroup;
  contribuyente: DatosContribuyente = {} as DatosContribuyente;
  contribuyenteFormGroup: FormGroup;
  tipoBusqueda;
  isIdentificativo: boolean;
  busqueda = false;
  queryParamFiltros;
  endpointBusqueda;
  loadingDocumentosIdentificativos = false;
  @ViewChild('paginator') paginator: MatPaginator;
  selectDisabled = false;
  selectCedula = false;
  selectPasaporte = false;
  selectLicencia = false;
  selectNSS = false;

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private spinner: NgxSpinnerService,
    private _formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.auth.getSession().token
      })
    };

    this.getDataDocumentosIdentificativos();

    this.cuentaFormGroup = this._formBuilder.group({
      region: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      manzana: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      lote: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      unidad: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    });

    this.contribuyenteFormGroup = this._formBuilder.group({
      tipo_persona: ['F', Validators.required],
      nombre: [null,[Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
      rfc: [null],
      apaterno: [null,[Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
      amaterno: [null,[Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
      curp: [null],
      ine: [null],
      iddocumentoidentificativo: [null],
      documentoidentificativo: [null]
    });

    this.contribuyenteFormGroup.value.tipo_persona = 'F';

    this.contribuyenteFormGroup.controls.tipo_persona.valueChanges.subscribe(tipo_persona => {
      if(tipo_persona == 'F') {
        this.contribuyenteFormGroup.addControl('apaterno', new FormControl(null));
        this.contribuyenteFormGroup.addControl('amaterno', new FormControl(null));
        this.contribuyenteFormGroup.addControl('curp', new FormControl(null));
        this.contribuyenteFormGroup.addControl('ine', new FormControl(null));
        this.contribuyenteFormGroup.addControl('iddocumentoidentificativo', new FormControl(''));
        this.contribuyenteFormGroup.addControl('documentoidentificativo', new FormControl(null));
      } else {
        this.contribuyenteFormGroup.removeControl('apaterno');
        this.contribuyenteFormGroup.removeControl('amaterno');
        this.contribuyenteFormGroup.removeControl('curp');
        this.contribuyenteFormGroup.removeControl('ine');
        this.contribuyenteFormGroup.removeControl('iddocumentoidentificativo');
        this.contribuyenteFormGroup.removeControl('documentoidentificativo');
      }
      this.contribuyenteFormGroup.updateValueAndValidity();
    });
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
  * @param event detecta cuando se presiona una tecla, esta funcion s??lo permite que se tecleen valores alfanum??ricos, los dem??s son bloqueados
  */
  keyPressAlphaNumeric(event) {
    var inp = String.fromCharCode(event.keyCode);
    if (/[a-zA-Z0-9]/.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }

  /** 
  * Genera un salto autom??tico de un input al siguiente una vez que la longitud m??xima del input ha sido alcanzada
  */
  focusNextInput(event, input) {
    if(event.srcElement.value.length === event.srcElement.maxLength){
      input.focus();
    }
  }

  /**
  * De acuerdo al valor del dato limpiara los campos identificativos o personales.
  */
  clearInputsContribuyente(): void {
    this.contribuyenteFormGroup.controls['nombre'].setValue(null);
    this.contribuyenteFormGroup.controls['rfc'].setValue(null);
    this.contribuyenteFormGroup.markAsUntouched();
    this.contribuyenteFormGroup.updateValueAndValidity();
  }

  /**
  * De acuerdo al valor del dato limpiara los campos identificativos o personales.
  * @param isIdentificativo Valor que nos indica que campos utilizaremos para realizar la busqueda
  */
  clearInputsIdentNoIdent(isIdentificativo): void {
    this.isIdentificativo = isIdentificativo;

    if(isIdentificativo){
      this.contribuyenteFormGroup.controls['nombre'].setValue(null);
      if(this.contribuyenteFormGroup.value.tipo_persona == 'F'){
        this.contribuyenteFormGroup.controls['apaterno'].setValue(null);
        this.contribuyenteFormGroup.controls['amaterno'].setValue(null);
      }
    } else {
      this.contribuyenteFormGroup.controls['rfc'].setValue(null);
      if(this.contribuyenteFormGroup.value.tipo_persona == 'F'){
        this.contribuyenteFormGroup.controls['curp'].setValue(null);
        this.contribuyenteFormGroup.controls['ine'].setValue(null);
        this.contribuyenteFormGroup.controls['iddocumentoidentificativo'].setValue('');
        this.contribuyenteFormGroup.controls['documentoidentificativo'].setValue(null);
      }
    }
  }

  /**
   *  Si se selecciona alguna opci??n desbloquear?? el input del n??mero del documento.
   * @param event Valor del option
   */
  seleccionaDocto(event){
    this.selectDisabled = true;
    this.selectCedula = false;
    this.selectPasaporte = false;
    this.selectLicencia = false;
    this.selectNSS = false;
    this.isIdentificativo = true;

    if(this.contribuyente.identificacion == 1){
        this.selectCedula = true;
    }

    if(this.contribuyente.identificacion == 2){
        this.selectPasaporte = true;
    }

    if(this.contribuyente.identificacion == 3){
        this.selectLicencia = true;
    }

    if(this.contribuyente.identificacion == 6){
        this.selectNSS = true;
    }
  }

  /**
   * Verifica que no exista un dato vacio.
   */
   verificaBusqueda(): void{
    if(this.tipoBusqueda == 'cuenta'){
      if(this.cuentaFormGroup.value.region !== '' || this.cuentaFormGroup.value.region !== undefined || this.cuentaFormGroup.value.region !== null ||
        this.cuentaFormGroup.value.manzana !== '' || this.cuentaFormGroup.value.manzana !== undefined || this.cuentaFormGroup.value.manzana !== null ||
        this.cuentaFormGroup.value.lote !== '' || this.cuentaFormGroup.value.lote !== undefined || this.cuentaFormGroup.value.lote !== null ||
        this.cuentaFormGroup.value.unidad !== '' || this.cuentaFormGroup.value.unidad !== undefined || this.cuentaFormGroup.value.unidad !== null
      ){
        this.getData();
      }else{
        Swal.fire(
          {
            title: '??ATENCI??N!',
            text: "Ingres un dato para buscar",
            icon: 'warning',
            confirmButtonText: 'Cerrar'
          }
        );
      }
    } else {
      if(
        (this.contribuyenteFormGroup.value.rfc !== null && this.contribuyenteFormGroup.value.rfc !== '') ||
        (this.contribuyenteFormGroup.value.nombre !== null && this.contribuyenteFormGroup.value.nombre !== '') ||
        (this.contribuyenteFormGroup.value.curp !== null && this.contribuyenteFormGroup.value.curp !== '') ||
        (this.contribuyenteFormGroup.value.rfc !== null && this.contribuyenteFormGroup.value.rfc !== '') ||
        (this.contribuyenteFormGroup.value.ine !== null && this.contribuyenteFormGroup.value.ine !== '') ||
        (this.contribuyenteFormGroup.value.iddocumentoidentificativo !== undefined && this.contribuyenteFormGroup.value.documentoidentificativo !== '') ||
        (this.contribuyenteFormGroup.value.documentoidentificativo !== null && this.contribuyenteFormGroup.value.documentoidentificativo !== '') ||
        (this.contribuyenteFormGroup.value.apaterno !== null && this.contribuyenteFormGroup.value.apaterno !== '') ||
        (this.contribuyenteFormGroup.value.amaterno !== null && this.contribuyenteFormGroup.value.amaterno !== '')
      ){
        this.getData();
      }else{
        Swal.fire(
          {
            title: '??ATENCI??N!',
            text: "Ingres un dato para buscar",
            icon: 'warning',
            confirmButtonText: 'Cerrar'
          }
        );
      }
    }
  }

  /**
   * Obtiene los valores de la consulta
   */
  getData(): void { 
    let busca: boolean = false;
    
    if(this.tipoBusqueda == 'cuenta'){
        busca = this.cuentaFormGroup.valid;
    }else{
        busca = this.contribuyenteFormGroup.valid;
    }
      
    if(busca){
        this.loadingResponse = true;
        this.spinner.show();
        this.busqueda = true;
        this.pagina = 1;
        this.queryParamFiltros = '';
        this.endpointBusqueda = '';

        if(this.tipoBusqueda == 'cuenta'){
        this.endpointBusqueda = this.endpoint + 'getContribuyenteByCuenta';
            if(this.cuentaFormGroup.value.region)
            this.queryParamFiltros = this.queryParamFiltros + '&region=' + this.cuentaFormGroup.value.region;
            if(this.cuentaFormGroup.value.manzana)
            this.queryParamFiltros = this.queryParamFiltros + '&manzana=' + this.cuentaFormGroup.value.manzana;
            if(this.cuentaFormGroup.value.lote)
            this.queryParamFiltros = this.queryParamFiltros + '&lote=' + this.cuentaFormGroup.value.lote;
            if(this.cuentaFormGroup.value.unidad)
            this.queryParamFiltros = this.queryParamFiltros + '&unidadPrivativa=' + this.cuentaFormGroup.value.unidad;
        } else {
        if(this.contribuyenteFormGroup.value.tipo_persona == 'M'){
            if(this.isIdentificativo){
            this.endpointBusqueda = this.endpoint + 'getMoralIdentificativos';
            if(this.contribuyenteFormGroup.value.rfc)
                this.queryParamFiltros = this.queryParamFiltros + '&rfc=' + this.contribuyenteFormGroup.value.rfc;
            } else {
            this.endpointBusqueda = this.endpoint + 'getPersonaMoral';
            if(this.contribuyenteFormGroup.value.nombre)
                this.queryParamFiltros = this.queryParamFiltros + '&razonSocial=' + this.contribuyenteFormGroup.value.nombre + '&filtroApellidoPaterno=0';
            }
        } else {
            if(this.isIdentificativo){
            this.endpointBusqueda = this.endpoint + 'getIdentificativos';
            if(this.contribuyenteFormGroup.value.curp)
                this.queryParamFiltros = this.queryParamFiltros + '&curp=' + this.contribuyenteFormGroup.value.curp;
            if(this.contribuyenteFormGroup.value.rfc)
                this.queryParamFiltros = this.queryParamFiltros + '&rfc=' + this.contribuyenteFormGroup.value.rfc;
            if(this.contribuyenteFormGroup.value.ine)
                this.queryParamFiltros = this.queryParamFiltros + '&claveife=' + this.contribuyenteFormGroup.value.ine;
            if(this.contribuyenteFormGroup.value.iddocumentoidentificativo != '')
                this.queryParamFiltros = this.queryParamFiltros + '&iddocidentif=' + this.contribuyenteFormGroup.value.iddocumentoidentificativo;
            if(this.contribuyenteFormGroup.value.documentoidentificativo)
                this.queryParamFiltros = this.queryParamFiltros + '&valdocidentif=' + this.contribuyenteFormGroup.value.documentoidentificativo;

            this.queryParamFiltros = this.queryParamFiltros + '&coincidenTodos=false';        
            } else {
            this.endpointBusqueda = this.endpoint + 'getContribuyente';
            if(this.contribuyenteFormGroup.value.nombre)
                this.queryParamFiltros = this.queryParamFiltros + '&nombre=' + this.contribuyenteFormGroup.value.nombre + '&filtroNombre=0';
            if(this.contribuyenteFormGroup.value.apaterno)
                this.queryParamFiltros = this.queryParamFiltros + '&apellidoPaterno=' + this.contribuyenteFormGroup.value.apaterno + '&filtroApellidoPaterno=0';
            if(this.contribuyenteFormGroup.value.amaterno)
                this.queryParamFiltros = this.queryParamFiltros + '&apellidoMaterno=' + this.contribuyenteFormGroup.value.amaterno + '&filtroApellidoMaterno=0';
            }
        }
        }

        this.http.get(this.endpointBusqueda + '?' + this.queryParamFiltros, this.httpOptions).subscribe(
          (res: any) => {
            this.spinner.hide();
            this.loadingResponse = false;
            this.data = res;
            this.dataSource = this.paginate(this.data, this.pageSize, this.pagina);
            this.total = this.data.length;
            this.paginator.pageIndex = 0;
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
            this.loadingResponse = false;
            this.dataSource = [];
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

  /**
  * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
  * @param evt Nos da la referencia de la pagina en la que se encuentra
  */
  paginado(evt): void{
    this.pagina = evt.pageIndex + 1;
    this.dataSource = this.paginate(this.data, this.pageSize, this.pagina);
  }

  /**
  * 
  * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
  * @param page_size Valor de la cantidad de registros que se pintaran por p??gina.
  * @param page_number Valor de la p??gina en la cual se encuentra el paginado.
  * @returns 
  */
  paginate(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  }
}
