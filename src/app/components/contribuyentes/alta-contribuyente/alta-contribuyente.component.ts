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
  idtipoasentamiento: number;
  asentamiento: string;
  idtipovia: number;
  via: string;
  idlocalidad: number;
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

  addDomicilio(): void {
    const dialogRef = this.dialog.open(DialogDomicilio, {
      width: '700px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        console.log(result);
      }
    });
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
}
