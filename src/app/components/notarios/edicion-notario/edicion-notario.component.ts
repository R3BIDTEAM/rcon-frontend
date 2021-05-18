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
  pagina = 1; 
  total = 0;
  loading = false;
  dataSource = [];
  displayedColumns: string[] = ['nombre','rfc','curp','seleccionar'];
  httpOptions;
  dataNotario: DataNotario = {} as DataNotario;
  isIdentificativo: boolean;
  canSearch = false;
  isBusqueda;
  queryParamFiltros;
  endpointBusqueda;
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private _formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.isBusqueda = false;
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.auth.getSession().token
      })
    };
  }

  clearInputsIdentNoIdent(isIdentificativo): void {
    this.isIdentificativo = isIdentificativo;

    if(isIdentificativo){
      this.dataNotario.apellido_paterno = null;
      this.dataNotario.apellido_materno = null;
      this.dataNotario.nombre = null;
    } else {
      this.dataNotario.rfc = null;
      this.dataNotario.curp = null;
      this.dataNotario.ine = null;
      this.dataNotario.otro_documento = null;
      this.dataNotario.numero_documento = null;
    }

  }

  getData(isSearch): void {
    this.loading = true;
    this.isBusqueda = true;
    this.endpointBusqueda = '';

    const notario = {
      apellidoPaterno: 'MARTINEZ',
      filtroApellidoPaterno: '0'
    }

    if(isSearch){
      this.queryParamFiltros = '';

      if(this.isIdentificativo){
    
          this.endpointBusqueda = this.endpointBuscarNotario + 'getNotariosByDatosIdentificativos';

          if(this.dataNotario.rfc){
            this.queryParamFiltros = this.queryParamFiltros + 'rfc=' + this.dataNotario.rfc + '&filtroApellidoPaterno=0'; 
          }

      }else{

        this.endpointBusqueda = this.endpointBuscarNotario + 'getNotariosByDatosPersonales';

        if(this.dataNotario.apellido_paterno){
          this.queryParamFiltros = this.queryParamFiltros + 'apellidoPaterno=' + this.dataNotario.apellido_paterno + '&filtroApellidoPaterno=0'; 
        }
        if(this.dataNotario.apellido_materno){
          this.queryParamFiltros = this.queryParamFiltros + 'apellidoMaterno=' + this.dataNotario.apellido_materno + '&filtroApellidoMaterno=0'; 
        }
        if(this.dataNotario.nombre){
          this.queryParamFiltros = this.queryParamFiltros + 'nombre=' + this.dataNotario.nombre + '&filtroNombre=0'; 
        }

      }

      sessionStorage.filtrosInfEspecifica = JSON.stringify(this.dataNotario);
      // sessionStorage.filtroSelectedInfEspecifica = this.filtroSelected;
    } 
    
    this.http.post(this.endpointBusqueda + '?' + this.queryParamFiltros, '', this.httpOptions)
      .subscribe(
        (res: any) => {
          (isSearch) ? this.resetPaginator() : false;
          this.loading = false;
          
          console.log(res.length);
          if(res.length == 0){
            this.dataSource = [];
          }else{
            this.dataSource = res;
            // this.dataSource = res.data;
            this.total = res.total;
          }
        },
        (error) => {
          this.loading = false;
          this.snackBar.open(error.error.mensaje, 'Cerrar', {
            duration: 10000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        });
  }

  paginado(evt): void{
    this.pagina = evt.pageIndex + 1;
    this.getData(false);
  }

  clean(): void{
    this.isBusqueda = false;
    this.resetPaginator();
  }

  resetPaginator() {
    this.pagina = 1;
    this.total = 0;
    // this.paginator.pageIndex = 0;
  }

}
