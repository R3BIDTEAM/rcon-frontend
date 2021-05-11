import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '@serv/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import * as moment from 'moment'; 

export interface DatosGenerales {
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

@Component({
  selector: 'app-alta-notario',
  templateUrl: './alta-notario.component.html',
  styleUrls: ['./alta-notario.component.css']
})
export class AltaNotarioComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
