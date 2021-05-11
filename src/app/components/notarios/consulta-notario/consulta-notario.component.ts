import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '@serv/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import * as moment from 'moment';

export interface Filtros {
  apellido_paterno: string;
  apellido_materno: string;
  nombre: string;
  rfc: string;
  curp: string;
  ine: string;
  otro_documento: string;
  numero_documento: string;
  no_notario: string;
  estado: string;
}

@Component({
  selector: 'app-consulta-notario',
  templateUrl: './consulta-notario.component.html',
  styleUrls: ['./consulta-notario.component.css']
})
export class ConsultaNotarioComponent implements OnInit {
  endpoint = environment.endpoint + 'registro/';
  pagina = 1; 
  total = 0;
  loading = false;
  dataSource = [];
  displayedColumns: string[] = ['estado','no_notario','nombre','rfc','curp'];
  httpOptions;
  filtros: Filtros = {} as Filtros;
  isIdentificativo: boolean;
  canSearch = false;
  isBusqueda;
  queryParamFiltros;
  endpointBusqueda;
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private router: Router,
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
      // this.contribuyenteFormGroup.controls['nombre'].setValue(null);
      // if(this.contribuyenteFormGroup.value.tipo_persona == 'F'){
      //   this.contribuyenteFormGroup.controls['apaterno'].setValue(null);
      //   this.contribuyenteFormGroup.controls['amaterno'].setValue(null);
      // }
      this.filtros.apellido_paterno = null;
      this.filtros.apellido_materno = null;
      this.filtros.nombre = null;
    } else {
      // this.contribuyenteFormGroup.controls['rfc'].setValue(null);
      // if(this.contribuyenteFormGroup.value.tipo_persona == 'F'){
      //   this.contribuyenteFormGroup.controls['curp'].setValue(null);
      //   this.contribuyenteFormGroup.controls['ine'].setValue(null);
      //   this.contribuyenteFormGroup.controls['iddocumentoidentificativo'].setValue('');
      //   this.contribuyenteFormGroup.controls['documentoidentificativo'].setValue(null);
      // }
      this.filtros.rfc = null;
      this.filtros.curp = null;
      this.filtros.ine = null;
      this.filtros.otro_documento = null;
      this.filtros.numero_documento = null;
      this.filtros.no_notario = null;
      this.filtros.estado = null;
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
    
          this.endpointBusqueda = this.endpoint + 'getNotariosByDatosIdentificativos';

          if(this.filtros.rfc){
            this.queryParamFiltros = this.queryParamFiltros + 'rfc=' + this.filtros.rfc + '&filtroApellidoPaterno=0'; 
          }

      }else{

        this.endpointBusqueda = this.endpoint + 'getNotariosByDatosPersonales';

        if(this.filtros.apellido_paterno){
          this.queryParamFiltros = this.queryParamFiltros + 'apellidoPaterno=' + this.filtros.apellido_paterno + '&filtroApellidoPaterno=0'; 
        }
        if(this.filtros.apellido_materno){
          this.queryParamFiltros = this.queryParamFiltros + 'apellidoMaterno=' + this.filtros.apellido_materno + '&filtroApellidoMaterno=0'; 
        }
        if(this.filtros.nombre){
          this.queryParamFiltros = this.queryParamFiltros + 'nombre=' + this.filtros.nombre + '&filtroNombre=0'; 
        }

      }

        // if(this.filtros.sujeto){
        //   this.queryParamFiltros = this.queryParamFiltros + '&sujeto=' + this.filtros.sujeto; 
        // }

        // if(this.filtros.numExterior && this.filtros.numInterior){
        //   this.queryParamFiltros = this.queryParamFiltros + '&numExterior=' + this.filtros.numExterior + '&numInterior=' + this.filtros.numInterior; 
        // }

      sessionStorage.filtrosInfEspecifica = JSON.stringify(this.filtros);
      // sessionStorage.filtroSelectedInfEspecifica = this.filtroSelected;
    } 
    
    // this.http.get(this.endpoint + '?page=' + this.pagina + this.queryParamFiltros,
    // this.http.post(this.endpoint, notario, this.httpOptions)
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
