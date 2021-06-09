import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '@serv/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';

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
  contribuyenteFormGroup: FormGroup;
  tipoBusqueda;
  isIdentificativo: boolean;
  busqueda = false;
  queryParamFiltros;
  endpointBusqueda;
  loadingDocumentosIdentificativos = false;
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(
    private auth: AuthService,
    private http: HttpClient,
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
      tipo_persona: ['M', Validators.required],
      nombre: [null],
      rfc: [null],
    });

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

  getDataDocumentosIdentificativos(): void{
    this.loadingDocumentosIdentificativos = true;
    this.http.post(this.endpoint + 'getCatalogos', '', this.httpOptions).subscribe(
      (res: any) => {
        this.loadingDocumentosIdentificativos = false;
        this.documentos = res.CatDocIdentificativos;
        // console.log(this.documentos);
      },
      (error) => {
        this.loadingDocumentosIdentificativos = false;
      }
    );
  }

  keyPressAlphaNumeric(event) {
    var inp = String.fromCharCode(event.keyCode);
    if (/[a-zA-Z0-9]/.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }

  focusNextInput(event, input) {
    if(event.srcElement.value.length === event.srcElement.maxLength){
      input.focus();
    }
  }

  clearInputsContribuyente(): void {
    this.contribuyenteFormGroup.controls['nombre'].setValue(null);
    this.contribuyenteFormGroup.controls['rfc'].setValue(null);
    this.contribuyenteFormGroup.markAsUntouched();
    this.contribuyenteFormGroup.updateValueAndValidity();
  }

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

  getData(): void { 
    this.loadingResponse = true;
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

    this.http.post(this.endpointBusqueda + '?' + this.queryParamFiltros, '', this.httpOptions).subscribe(
      (res: any) => {
        this.loadingResponse = false;
        this.data = res;
        this.dataSource = this.paginate(this.data, this.pageSize, this.pagina);
        this.total = this.data.length;
        this.paginator.pageIndex = 0;
      },
      (error) => {
        this.loadingResponse = false;
        this.dataSource = [];
      }
    );
  }

  paginado(evt): void{
    this.pagina = evt.pageIndex + 1;
    this.dataSource = this.paginate(this.data, this.pageSize, this.pagina);
  }

  paginate(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  }
}
