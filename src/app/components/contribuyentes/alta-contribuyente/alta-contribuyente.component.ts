import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '@serv/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import * as moment from 'moment';

export interface DataDomicilio {
  idtipodireccion: number;
  tipodireccion: string;
  idestado: number;
  estado: string;
  idalcaldia: number;
  alcaldia: string;
  municipio: string;
  ciudad: string;
  idtipoasentamiento: number;
  asentamiento: string;
  idtipovia: number;
  via: string;
  idtipolocalidad: number;
  localidad: string;
  cp: string;
  nexterior: string;
  entrecalle1: string;
  entrecalle2: string;
  andador: string;
  edificio: string;
  seccion: string;
  entrada: string;
  ninterior: string;
  telefono: string;
  adicional: string;
}
export interface DataRepresentacion {
  tipoPersona: string;
  nombre: string;
  apaterno: string;
  amaterno: string;
  rfc: string;
  curp: string;
  ine: string;
  idDocIdent: number;
  docIdent: string;
  fechaNacimiento: Date;
  fechaDefuncion: Date;
  celular: string;
  email: string;
  actPreponderante: string;
  idTipoPersonaMoral: number;
  fechaInicioOperacion: Date;
  idMotivo: number;
  fechaCambio: Date;
  documentoRepresentacion: DataDocumentoRepresentacion;
}
export interface DataDocumentoRepresentacion {
  codtipodocumento: number;
  nombreTipoDocumento: string;
  codtipodocumentojuridico: number;
  nombreTipoDocumentoJuridico: string;
  fecha: Date;
  descripcion: string;
  lugar: string;
  archivos: Array<{nombre: string, base64: string}>;
}

@Component({
  selector: 'app-alta-contribuyente',
  templateUrl: './alta-contribuyente.component.html',
  styleUrls: ['./alta-contribuyente.component.css']
})
export class AltaContribuyenteComponent implements OnInit {
  endpoint = environment.endpoint;
  loading = false;
  httpOptions;
  tipoPersona = 'F';
  fisicaFormGroup: FormGroup;
  moralFormGroup: FormGroup;
  dataDomicilios: DataDomicilio[] = [];
  
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private _formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.auth.getSession().token
      })
    };
    
    this.fisicaFormGroup = this._formBuilder.group({
      nombre: [null, [Validators.required]],
      apaterno: [null, [Validators.required]],
      amaterno: [null, []],
      rfc: [null, [Validators.required]],
      curp: [null, [Validators.required]],
      ine: [null, []],
      idDocIdent: ['', []],
      docIdent: [null, []],
      fechaNacimiento: [null, []],
      fechaDefuncion: [null, []],
      celular: [null, []],
      email: [null, []],
    });

    this.moralFormGroup = this._formBuilder.group({
      nombre: [null, [Validators.required]],
      rfc: [null, [Validators.required]],
      actPreponderante: [null, []],
      idTipoPersonaMoral: ['', []],
      fechaInicioOperacion: [null, []],
      idMotivo: ['', []],
      fechaCambio: [null, []],
    });
  }

  changeRequired(remove, add): void {
    this.fisicaFormGroup.controls[remove].setValue(null);
    this.fisicaFormGroup.controls[remove].clearValidators();
    this.fisicaFormGroup.controls[add].setValidators(Validators.required);
    this.fisicaFormGroup.markAsUntouched();
    this.fisicaFormGroup.updateValueAndValidity();
  }

  getHistorialDatosGenerales(): void {
    console.log("hola");
  }

  addDomicilio(i = -1, dataDomicilio = null): void {
    const dialogRef = this.dialog.open(DialogDomicilio, {
      width: '700px',
      data: dataDomicilio,
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        if(i != -1){
          this.dataDomicilios[i] = result;
        }else{
          this.dataDomicilios.push(result);
        }
      }
    });
  }

  viewHistorial(i, domicilio): void {
    console.log(i + " " + domicilio);
  }

}


@Component({
  selector: 'app-dialog-domicilio',
  templateUrl: 'app-dialog-domicilio.html',
  styleUrls: ['./alta-contribuyente.component.css']
})
export class DialogDomicilio {
  endpointCatalogos = environment.endpoint;
  loadingTiposDireccion = false;
  loadingEstados = false;
  loadingAlcaldias = false;
  loadingTiposAsentamiento = false;
  loadingTiposVia = false;
  loadingTiposLocalidad = false;
  httpOptions;
  tiposDireccion;
  estados;
  alcaldias;
  tiposAsentamiento;
  tiposVia;
  tiposLocalidad;
  domicilioFormGroup: FormGroup;
  dataDomicilio: DataDomicilio = {} as DataDomicilio;

  constructor(
    private http: HttpClient,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogDomicilio>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      dialogRef.disableClose = true;
      
      this.domicilioFormGroup = this._formBuilder.group({
        idtipodireccion: ['', Validators.required],
        idestado: ['', Validators.required],
        municipio: [null, Validators.required],
        ciudad: [null, Validators.required],
        idtipoasentamiento: ['', Validators.required],
        asentamiento: [null, Validators.required],
        idtipovia: ['', Validators.required],
        via: [null, Validators.required],
        idtipolocalidad: ['', Validators.required],
        cp: [null],
        nexterior: [null, Validators.required],
        entrecalle1: [null],
        entrecalle2: [null],
        andador: [null],
        edificio: [null],
        seccion: [null],
        entrada: [null],
        ninterior: [null],
        telefono: [null],
        adicional: [null],
      });

      this.domicilioFormGroup.controls.idestado.valueChanges.subscribe(idestado => {
        if(idestado == 2) {
          this.domicilioFormGroup.removeControl('municipio');
          this.domicilioFormGroup.removeControl('ciudad');
          this.domicilioFormGroup.addControl('idalcaldia', new FormControl('', Validators.required));
        } else {
          this.domicilioFormGroup.removeControl('idalcaldia');
          this.domicilioFormGroup.addControl('municipio', new FormControl(null, Validators.required));
          this.domicilioFormGroup.addControl('ciudad', new FormControl(null, Validators.required));
        }
        this.domicilioFormGroup.updateValueAndValidity();
      });

      if(data){
        this.setDataDomicilio(data);
      }
    }
  
  getDataTiposDireccion(): void {
    this.loadingTiposDireccion = true;
    this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
      (res: any) => {
        this.loadingTiposDireccion = false;
        this.tiposDireccion = res;
      },
      (error) => {
        this.loadingTiposDireccion = false;
      }
    );
  }

  getDataEstados(): void {
    this.loadingEstados = true;
    this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
      (res: any) => {
        this.loadingEstados = false;
        this.estados = res;
      },
      (error) => {
        this.loadingEstados = false;
      }
    );
  }

  getDataAlcaldias(): void {
    this.loadingAlcaldias = true;
    this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
      (res: any) => {
        this.loadingAlcaldias = false;
        this.alcaldias = res;
      },
      (error) => {
        this.loadingAlcaldias = false;
      }
    );
  }

  getDataTiposAsentamiento(): void {
    this.loadingTiposAsentamiento = true;
    this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
      (res: any) => {
        this.loadingTiposAsentamiento = false;
        this.tiposAsentamiento = res;
      },
      (error) => {
        this.loadingTiposAsentamiento = false;
      }
    );
  }

  getDataTiposVia(): void {
    this.loadingTiposVia = true;
    this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
      (res: any) => {
        this.loadingTiposVia = false;
        this.tiposVia = res;
      },
      (error) => {
        this.loadingTiposVia = false;
      }
    );
  }

  getDataTiposLocalidad(): void {
    this.loadingTiposLocalidad = true;
    this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
      (res: any) => {
        this.loadingTiposLocalidad = false;
        this.tiposLocalidad = res;
      },
      (error) => {
        this.loadingTiposLocalidad = false;
      }
    );
  }

  getDataDomicilio(): DataDomicilio {
    this.dataDomicilio.idtipodireccion = this.domicilioFormGroup.value.idtipodireccion;
    this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
    this.dataDomicilio.idtipoasentamiento = this.domicilioFormGroup.value.idtipoasentamiento;
    this.dataDomicilio.asentamiento = (this.domicilioFormGroup.value.asentamiento) ? this.domicilioFormGroup.value.asentamiento : null;
    this.dataDomicilio.idtipovia = this.domicilioFormGroup.value.idtipovia;
    this.dataDomicilio.via = (this.domicilioFormGroup.value.via) ? this.domicilioFormGroup.value.via : null;
    this.dataDomicilio.idtipolocalidad = this.domicilioFormGroup.value.idtipolocalidad;
    this.dataDomicilio.cp = (this.domicilioFormGroup.value.cp) ? this.domicilioFormGroup.value.cp : null;
    this.dataDomicilio.nexterior = (this.domicilioFormGroup.value.nexterior) ? this.domicilioFormGroup.value.nexterior : null;
    this.dataDomicilio.entrecalle1 = (this.domicilioFormGroup.value.entrecalle1) ? this.domicilioFormGroup.value.entrecalle1 : null;
    this.dataDomicilio.entrecalle2 = (this.domicilioFormGroup.value.entrecalle2) ? this.domicilioFormGroup.value.entrecalle2 : null;
    this.dataDomicilio.andador = (this.domicilioFormGroup.value.andador) ? this.domicilioFormGroup.value.andador : null;
    this.dataDomicilio.edificio = (this.domicilioFormGroup.value.edificio) ? this.domicilioFormGroup.value.edificio : null;
    this.dataDomicilio.seccion = (this.domicilioFormGroup.value.seccion) ? this.domicilioFormGroup.value.seccion : null;
    this.dataDomicilio.entrada = (this.domicilioFormGroup.value.entrada) ? this.domicilioFormGroup.value.entrada : null;
    this.dataDomicilio.ninterior = (this.domicilioFormGroup.value.ninterior) ? this.domicilioFormGroup.value.ninterior : null;
    this.dataDomicilio.telefono = (this.domicilioFormGroup.value.telefono) ? this.domicilioFormGroup.value.telefono : null;
    this.dataDomicilio.adicional = (this.domicilioFormGroup.value.adicional) ? this.domicilioFormGroup.value.adicional : null;
    
    if(this.domicilioFormGroup.value.idestado == 2){
      this.dataDomicilio.idalcaldia = this.domicilioFormGroup.value.idalcaldia;
    } else {
      this.dataDomicilio.municipio = (this.domicilioFormGroup.value.municipio) ? this.domicilioFormGroup.value.municipio : null;
      this.dataDomicilio.ciudad = (this.domicilioFormGroup.value.ciudad) ? this.domicilioFormGroup.value.ciudad : null;
    }

    return this.dataDomicilio;
  }

  setDataDomicilio(dataDomicilio): void {
    this.domicilioFormGroup.controls['idtipodireccion'].setValue(dataDomicilio.idtipodireccion);
    this.domicilioFormGroup.controls['idestado'].setValue(dataDomicilio.idestado);
    this.domicilioFormGroup.controls['idtipoasentamiento'].setValue(dataDomicilio.idtipoasentamiento);
    this.domicilioFormGroup.controls['asentamiento'].setValue(dataDomicilio.asentamiento);
    this.domicilioFormGroup.controls['idtipovia'].setValue(dataDomicilio.idtipovia);
    this.domicilioFormGroup.controls['via'].setValue(dataDomicilio.via);
    this.domicilioFormGroup.controls['idtipolocalidad'].setValue(dataDomicilio.idtipolocalidad);
    this.domicilioFormGroup.controls['cp'].setValue(dataDomicilio.cp);
    this.domicilioFormGroup.controls['nexterior'].setValue(dataDomicilio.nexterior);
    this.domicilioFormGroup.controls['entrecalle1'].setValue(dataDomicilio.entrecalle1);
    this.domicilioFormGroup.controls['entrecalle2'].setValue(dataDomicilio.entrecalle2);
    this.domicilioFormGroup.controls['andador'].setValue(dataDomicilio.andador);
    this.domicilioFormGroup.controls['edificio'].setValue(dataDomicilio.edificio);
    this.domicilioFormGroup.controls['seccion'].setValue(dataDomicilio.seccion);
    this.domicilioFormGroup.controls['entrada'].setValue(dataDomicilio.entrada);
    this.domicilioFormGroup.controls['ninterior'].setValue(dataDomicilio.ninterior);
    this.domicilioFormGroup.controls['telefono'].setValue(dataDomicilio.telefono);
    this.domicilioFormGroup.controls['adicional'].setValue(dataDomicilio.adicional);

    if(dataDomicilio.idestado == 2){
      this.domicilioFormGroup.controls['idalcaldia'].setValue(dataDomicilio.idalcaldia);
    } else {
      this.domicilioFormGroup.controls['municipio'].setValue(dataDomicilio.municipio);
      this.domicilioFormGroup.controls['ciudad'].setValue(dataDomicilio.ciudad);
    }
  }
}
