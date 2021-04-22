import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '@serv/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';

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
  cuentaFormGroup: FormGroup;
  contribuyenteFormGroup: FormGroup;
  tipoBusqueda;
  isIdentificativo: boolean;
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

  getData(isSearch): void {
    console.log(isSearch);
  }
}
