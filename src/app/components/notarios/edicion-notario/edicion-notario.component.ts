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

// export interface DataNotario {
//   nombre: string;
//   apellido_paterno: string;
//   apellido_materno: string;
//   rfc: string;
//   curp: string;
//   ine: string;
//   otro_documento: string;
//   numero_documento: string;
// }

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
  endpoint = environment.endpoint + 'registro/';
  displayedColumns: string[] = ['nombre','datos_identificativos','seleccionar'];
  pagina = 1;
  total = 0;
  pageSize = 5;
  loading = false;
  dataSource = [];
  dataPaginate = [];
  httpOptions;
  nombre;
  apellido_paterno;
  apellido_materno;
  rfc;
  curp;
  ine;
  otro_documento;
  numero_documento;
  search = false;
  isIdentificativo;
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private route: ActivatedRoute,
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
  }

  clearInputsIdentNoIdent(isIdentificativo): void {
      this.isIdentificativo = isIdentificativo;
      if(isIdentificativo){
        this.apellido_paterno = null;
        this.apellido_materno = null;
        this.nombre = null;
      } else {
        this.rfc = null;
        this.curp = null;
        this.ine = null;
        this.otro_documento = null;
        this.numero_documento = null;
      }
  }

  clean(): void{
      this.pagina = 1;
      this.total = 0;
      this.dataSource = [];
      this.loading = false;
      this.dataPaginate;
  }

  validateSearch(){
    this.search = (
            this.apellido_paterno ||
            this.apellido_materno ||
            this.nombre ||
            this.rfc ||
            this.curp ||
            this.ine ||
            this.otro_documento ||
            this.numero_documento
        ) ? true : false;
  }

  getData(): void {
      let query = '';
      let busquedaDatos = '';

      if(this.nombre){
        query = query + '&nombre=' + this.nombre + '&filtroNombre=0';
      }
      if(this.apellido_paterno){
          query = query + '&apellidoPaterno=' + this.apellido_paterno + '&filtroApellidoPaterno=0';
      }
      if(this.apellido_materno){
          query = query + '&apellidoMaterno=' + this.apellido_materno + '&filtroApellidoMaterno=0';
      }
      if(this.rfc){
          query = query + '&rfc=' + this.rfc;
      }
      if(this.curp){
          query = query + '&curp=' + this.curp;
      }
      if(this.ine){
          query = query + '&ine=' + this.ine;
      }
     

      if( this.isIdentificativo ){
          busquedaDatos = busquedaDatos + 'getNotariosByDatosIdentificativos';
      }else{
          busquedaDatos = busquedaDatos + 'getNotariosByDatosPersonales';
      }

      query = query.substr(1);

      this.loading = true;
        console.log(this.endpoint + busquedaDatos + '?' + query);
        this.http.post(this.endpoint + busquedaDatos + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    console.log(this.dataSource);
                },
                (error) => {
                    this.loading = false;
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    
  }

  

  

  paginado(evt): void{
      this.pagina = evt.pageIndex + 1;
      this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
  }

  paginate(array, page_size, page_number) {
      return array.slice((page_number - 1) * page_size, page_number * page_size);
  }

}
