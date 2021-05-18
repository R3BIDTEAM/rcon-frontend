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

export interface Filtros {
  no_notario: string;
  estado: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  rfc: string;
  curp: string;
  ine: string;
  otro_documento: string;
  numero_documento: string;
  fecha_nacimiento: string;
  fecha_defuncion: string;
  celular: string;
  email: string;
}

export interface DataNotario {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  rfc: string;
  curp: string;
  ine: string;
  otro_documento: string;
  numero_documento: string;
}

@Component({
  selector: 'app-edicion-notario',
  templateUrl: './edicion-notario.component.html',
  styleUrls: ['./edicion-notario.component.css']
})

export class EdicionNotarioComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private _formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }





  // searchNotario(i = -1, dataDomicilio = null): void {
  searchNotario(): void {
    const dialogRef = this.dialog.open(DialogBuscarNotario, {
      width: '700px',
      // data: dataNotario,
    });
    dialogRef.afterClosed().subscribe(result => {
      // if(result){
      //   if(i != -1){
      //     this.dataDomicilios[i] = result;
      //   }else{
      //     this.dataDomicilios.push(result);
      //   }
      // }
    });
  }


}



///////////////BUSCAR NOTARIO////////////////
@Component({
  selector: 'app-dialog-buscar-notario',
  templateUrl: 'app-dialog-buscar-notario.html',
  styleUrls: ['./edicion-notario.component.css']
})

export class DialogBuscarNotario {
  endpointBuscarNotario = environment.endpoint + 'registro/';
  //loadingTiposDireccion = false;
  // loadingEstados = false;
  // loadingMunicipios = false;
  // loadingTiposAsentamiento = false;
  // loadingTiposVia = false;
  // loadingTiposLocalidad = false;
  httpOptions;
  // tiposDireccion;
  // estados;
  // municipios;
  // tiposAsentamiento;
  // tiposVia;
  // tiposLocalidad;
  // domicilioFormGroup: FormGroup;
  dataNotario: DataNotario = {} as DataNotario;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private _formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) { }

}
