import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '@serv/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';

export interface DataCuenta {
  region: string;
  manzana: string;
  lote: string;
  unidad: string;
}
export interface DataContribuyente {
  tipo_persona: string;
  apaterno: string;
  amaterno: string;
  nombre: string;
  rfc: string;
  curp: string;
  ine: string;
  iddocumentoidentificativo: number;
  documentoidentificativo: string;
}

@Component({
  selector: 'app-consulta-contribuyente',
  templateUrl: './consulta-contribuyente.component.html',
  styleUrls: ['./consulta-contribuyente.component.css']
})
export class ConsultaContribuyenteComponent implements OnInit {
  endpoint = environment.endpoint;
  pagina = 1;
  total = 0;
  loadingResponse = false;
  dataSource = [];
  displayedColumns: string[] = ['nombre', 'datos_identificativos', 'actions'];
  httpOptions;
  cuenta: DataCuenta = {} as DataCuenta;
  contribuyente: DataContribuyente = {} as DataContribuyente;
  cuentaFormGroup: FormGroup;
  contribuyenteFormGroup: FormGroup;
  tipoBusqueda;
  busqueda = false;
  queryParamFiltros;
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
    this.cuenta = {} as DataCuenta;
    this.contribuyente = {} as DataContribuyente;

    this.cuentaFormGroup = this._formBuilder.group({
      region: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      manzana: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      lote: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      unidad: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    });

    this.contribuyenteFormGroup = this._formBuilder.group({
      tipo_persona: ['M', Validators.required],
      nombre: [null, Validators.required],
      rfc: [null, Validators.required],
    });

    this.contribuyenteFormGroup.controls.tipo_persona.valueChanges.subscribe(tipo_persona => {
      if(tipo_persona == 'F') {
        this.contribuyenteFormGroup.addControl('apaterno', new FormControl(null, Validators.required));
        this.contribuyenteFormGroup.addControl('amaterno', new FormControl(null, Validators.required));
        this.contribuyenteFormGroup.addControl('curp', new FormControl(null, Validators.required));
        this.contribuyenteFormGroup.addControl('ine', new FormControl(null, Validators.required));
        this.contribuyenteFormGroup.addControl('iddocumentoidentificativo', new FormControl('', Validators.required));
        this.contribuyenteFormGroup.addControl('documentoidentificativo', new FormControl(null, Validators.required));
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

  getData(isSearch): void {
    console.log(isSearch);
  }
}
