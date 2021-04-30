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
  texto: string;
  fechaCaducidad: Date;
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
  dataRepresentantes: DataRepresentacion[] = [];
  dataRepresentados: DataRepresentacion[] = [];
  
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

  addRepresentante(i = -1, dataRepresentante = null): void {
    const dialogRef = this.dialog.open(DialogRepresentacion, {
      width: '700px',
      data: dataRepresentante,
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        if(i != -1){
          this.dataRepresentantes[i] = result;
        }else{
          this.dataRepresentantes.push(result);
        }
      }
    });
  }

  removeRepresentante(i){
		this.dataRepresentantes.splice(i, 1);
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


@Component({
  selector: 'app-dialog-representacion',
  templateUrl: 'app-dialog-representacion.html',
  styleUrls: ['./alta-contribuyente.component.css']
})
export class DialogRepresentacion {
  endpoint = environment.endpoint;
  loading = false;
  httpOptions;
  tipoPersona = 'F';
  fisicaFormGroup: FormGroup;
  moralFormGroup: FormGroup;
  dataRepresentacion: DataRepresentacion = {} as DataRepresentacion;

  constructor(
    private http: HttpClient,
    private _formBuilder: FormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogRepresentacion>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      dialogRef.disableClose = true;

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
        texto: [null, []],
        fechaCaducidad: [null, []],
      });
  
      this.moralFormGroup = this._formBuilder.group({
        nombre: [null, [Validators.required]],
        rfc: [null, [Validators.required]],
        actPreponderante: [null, []],
        idTipoPersonaMoral: ['', []],
        fechaInicioOperacion: [null, []],
        idMotivo: ['', []],
        fechaCambio: [null, []],
        texto: [null, []],
        fechaCaducidad: [null, []],
      });

      if(data){
        this.setDataRepresentacion(data);
      }
    }
    
  changeRequired(remove, add): void {
    this.fisicaFormGroup.controls[remove].setValue(null);
    this.fisicaFormGroup.controls[remove].clearValidators();
    this.fisicaFormGroup.controls[add].setValidators(Validators.required);
    this.fisicaFormGroup.markAsUntouched();
    this.fisicaFormGroup.updateValueAndValidity();
  }

  addDocumento(dataDocumento = null): void {
    const dialogRef = this.dialog.open(DialogDocumento, {
      width: '700px',
      data: dataDocumento,
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.dataRepresentacion.documentoRepresentacion = result;
      }
    });
  }

  removeDocumento(){
		this.dataRepresentacion.documentoRepresentacion = undefined;
	}

  getDataRepresentacion(): DataRepresentacion {
    this.dataRepresentacion.tipoPersona = this.tipoPersona;
    if(this.tipoPersona == 'F'){
      this.dataRepresentacion.nombre = (this.fisicaFormGroup.value.nombre) ? this.fisicaFormGroup.value.nombre : null;
      this.dataRepresentacion.apaterno = (this.fisicaFormGroup.value.apaterno) ? this.fisicaFormGroup.value.apaterno : null;
      this.dataRepresentacion.amaterno = (this.fisicaFormGroup.value.amaterno) ? this.fisicaFormGroup.value.amaterno : null;
      this.dataRepresentacion.rfc = (this.fisicaFormGroup.value.rfc) ? this.fisicaFormGroup.value.rfc : null;
      this.dataRepresentacion.curp = (this.fisicaFormGroup.value.curp) ? this.fisicaFormGroup.value.curp : null;
      this.dataRepresentacion.ine = (this.fisicaFormGroup.value.ine) ? this.fisicaFormGroup.value.ine : null;
      this.dataRepresentacion.idDocIdent = this.fisicaFormGroup.value.idDocIdent;
      this.dataRepresentacion.docIdent = (this.fisicaFormGroup.value.docIdent) ? this.fisicaFormGroup.value.docIdent : null;
      this.dataRepresentacion.fechaNacimiento = (this.fisicaFormGroup.value.fechaNacimiento) ? this.fisicaFormGroup.value.fechaNacimiento : null;
      this.dataRepresentacion.fechaDefuncion = (this.fisicaFormGroup.value.fechaDefuncion) ? this.fisicaFormGroup.value.fechaDefuncion : null;
      this.dataRepresentacion.celular = (this.fisicaFormGroup.value.celular) ? this.fisicaFormGroup.value.celular : null;
      this.dataRepresentacion.email = (this.fisicaFormGroup.value.email) ? this.fisicaFormGroup.value.email : null;
      this.dataRepresentacion.texto = (this.fisicaFormGroup.value.texto) ? this.fisicaFormGroup.value.texto : null;
      this.dataRepresentacion.fechaCaducidad = (this.fisicaFormGroup.value.fechaCaducidad) ? this.fisicaFormGroup.value.fechaCaducidad : null;
    } else {
      this.dataRepresentacion.nombre = (this.moralFormGroup.value.nombre) ? this.moralFormGroup.value.nombre : null;
      this.dataRepresentacion.rfc = (this.moralFormGroup.value.rfc) ? this.moralFormGroup.value.rfc : null;
      this.dataRepresentacion.actPreponderante = (this.moralFormGroup.value.actPreponderante) ? this.moralFormGroup.value.actPreponderante : null;
      this.dataRepresentacion.idTipoPersonaMoral = this.moralFormGroup.value.idTipoPersonaMoral;
      this.dataRepresentacion.fechaInicioOperacion = (this.moralFormGroup.value.fechaInicioOperacion) ? this.moralFormGroup.value.fechaInicioOperacion : null;
      this.dataRepresentacion.idMotivo = this.moralFormGroup.value.idMotivo;
      this.dataRepresentacion.fechaCambio = (this.moralFormGroup.value.fechaCambio) ? this.moralFormGroup.value.fechaCambio : null;
      this.dataRepresentacion.texto = (this.moralFormGroup.value.texto) ? this.moralFormGroup.value.texto : null;
      this.dataRepresentacion.fechaCaducidad = (this.moralFormGroup.value.fechaCaducidad) ? this.moralFormGroup.value.fechaCaducidad : null;
    }

    return this.dataRepresentacion;
  }

  setDataRepresentacion(dataRepresentacion): void {
    this.tipoPersona = dataRepresentacion.tipoPersona;
    if(this.tipoPersona == 'F'){
      this.fisicaFormGroup.controls['nombre'].setValue(dataRepresentacion.nombre);
      this.fisicaFormGroup.controls['apaterno'].setValue(dataRepresentacion.apaterno);
      this.fisicaFormGroup.controls['amaterno'].setValue(dataRepresentacion.amaterno);
      this.fisicaFormGroup.controls['rfc'].setValue(dataRepresentacion.rfc);
      this.fisicaFormGroup.controls['curp'].setValue(dataRepresentacion.curp);
      this.fisicaFormGroup.controls['ine'].setValue(dataRepresentacion.ine);
      this.fisicaFormGroup.controls['idDocIdent'].setValue(dataRepresentacion.idDocIdent);
      this.fisicaFormGroup.controls['docIdent'].setValue(dataRepresentacion.docIdent);
      this.fisicaFormGroup.controls['fechaNacimiento'].setValue(dataRepresentacion.fechaNacimiento);
      this.fisicaFormGroup.controls['fechaDefuncion'].setValue(dataRepresentacion.fechaDefuncion);
      this.fisicaFormGroup.controls['celular'].setValue(dataRepresentacion.celular);
      this.fisicaFormGroup.controls['email'].setValue(dataRepresentacion.email);
      this.fisicaFormGroup.controls['texto'].setValue(dataRepresentacion.texto);
      this.fisicaFormGroup.controls['fechaCaducidad'].setValue(dataRepresentacion.fechaCaducidad);
    } else {
      this.moralFormGroup.controls['nombre'].setValue(dataRepresentacion.nombre);
      this.moralFormGroup.controls['rfc'].setValue(dataRepresentacion.rfc);
      this.moralFormGroup.controls['actPreponderante'].setValue(dataRepresentacion.actPreponderante);
      this.moralFormGroup.controls['idTipoPersonaMoral'].setValue(dataRepresentacion.idTipoPersonaMoral);
      this.moralFormGroup.controls['fechaInicioOperacion'].setValue(dataRepresentacion.fechaInicioOperacion);
      this.moralFormGroup.controls['idMotivo'].setValue(dataRepresentacion.idMotivo);
      this.moralFormGroup.controls['fechaCambio'].setValue(dataRepresentacion.fechaCambio);
      this.moralFormGroup.controls['texto'].setValue(dataRepresentacion.texto);
      this.moralFormGroup.controls['fechaCaducidad'].setValue(dataRepresentacion.fechaCaducidad);
    }

    this.dataRepresentacion.documentoRepresentacion = dataRepresentacion.documentoRepresentacion;
  }
}


@Component({
  selector: 'app-dialog-documento',
  templateUrl: 'app-dialog-documento.html',
  styleUrls: ['./alta-contribuyente.component.css']
})
export class DialogDocumento {
  endpointCatalogos = environment.endpoint;
  loadingTiposDocumentoDigital = false;
  loadingTiposDocumentoJuridico = false;
  httpOptions;
  tiposDocumentoDigital;
  tiposDocumentoJuridico;
  tiposDocumentoFormGroup: FormGroup;
  infoDocumentoFormGroup: FormGroup;
  archivosDocumentoFormGroup: FormGroup;
  dataDocumento: DataDocumentoRepresentacion = {} as DataDocumentoRepresentacion;
  canSend = false;
  
  constructor(
    private http: HttpClient,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogDocumento>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      dialogRef.disableClose = true;

      this.tiposDocumentoFormGroup = this._formBuilder.group({
        codtipodocumento: ['', [Validators.required]],
        codtipodocumentojuridico: ['', [Validators.required]]
      });

      this.infoDocumentoFormGroup = this._formBuilder.group({
        fecha: [null, [Validators.required]],
        descripcion: [null, []],
        lugar: [null, [Validators.required]]
      });

      this.archivosDocumentoFormGroup = this._formBuilder.group({
        archivos: this._formBuilder.array([])
      });

      if(data){
        this.setDataDocumento(data);
      }
    }

  getDataTiposDocumentoDigital(): void {
    this.loadingTiposDocumentoDigital = true;
    this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
      (res: any) => {
        this.loadingTiposDocumentoDigital = false;
        this.tiposDocumentoDigital = res;
      },
      (error) => {
        this.loadingTiposDocumentoDigital = false;
      }
    );
  }

  getDataTiposDocumentoJuridico(): void {
    this.loadingTiposDocumentoJuridico = true;
    this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
      (res: any) => {
        this.loadingTiposDocumentoJuridico = false;
        this.tiposDocumentoJuridico = res;
      },
      (error) => {
        this.loadingTiposDocumentoJuridico = false;
      }
    );
  }

  createItem(data): FormGroup {
    return this._formBuilder.group(data);
  }

  removeItem(i) {
		this.archivos.removeAt(i);
	}

  get archivos(): FormArray {
    return this.archivosDocumentoFormGroup.get('archivos') as FormArray;
  };

  getArchivos(event) {
    let files = event.target.files;
    if(files){
      for(let file of files){
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.archivos.push(this.createItem({
            nombre: file.name,
            base64: reader.result
          }));
        };
      }
    }
  }

  getDataDocumento(): void {
    this.dataDocumento.codtipodocumento = this.tiposDocumentoFormGroup.value.codtipodocumento;
    this.dataDocumento.codtipodocumentojuridico = this.tiposDocumentoFormGroup.value.codtipodocumentojuridico;
    this.dataDocumento.fecha = (this.infoDocumentoFormGroup.value.fecha) ? this.infoDocumentoFormGroup.value.fecha : null;
    this.dataDocumento.descripcion = (this.infoDocumentoFormGroup.value.descripcion) ? this.infoDocumentoFormGroup.value.descripcion : null;
    this.dataDocumento.lugar = (this.infoDocumentoFormGroup.value.lugar) ? this.infoDocumentoFormGroup.value.lugar : null;
    this.dataDocumento.archivos = this.archivosDocumentoFormGroup.value.archivos;

    this.canSend = true;
  }

  setDataDocumento(dataDocumento): void {
    this.tiposDocumentoFormGroup.controls['codtipodocumento'].setValue(dataDocumento.codtipodocumento);
    this.tiposDocumentoFormGroup.controls['codtipodocumentojuridico'].setValue(dataDocumento.codtipodocumentojuridico);
    this.infoDocumentoFormGroup.controls['fecha'].setValue(dataDocumento.fecha);
    this.infoDocumentoFormGroup.controls['descripcion'].setValue(dataDocumento.descripcion);
    this.infoDocumentoFormGroup.controls['lugar'].setValue(dataDocumento.lugar);

    if(dataDocumento.archivos){
      for(let archivo of dataDocumento.archivos){
        this.archivos.push(this.createItem({
          nombre: archivo.nombre,
          base64: archivo.base64
        }));
      }
    }
  }
}