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
import { DialogDuplicadosComponent } from '@comp/dialog-duplicados/dialog-duplicados.component';

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
    fecha_nacimiento: Date;
    fecha_defuncion: Date;
    celular: string;
    email: string;
}

export interface Estados{
    idestado: number;
    estado: string;
}

export interface DocumentosIdentificativos{
    id_documento: number;
    documento: string;
}


@Component({
    selector: 'app-alta-notario',
    templateUrl: './alta-notario.component.html',
    styleUrls: ['./alta-notario.component.css']
})

export class AltaNotarioComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/';
    httpOptions;
    filtros: Filtros = {} as Filtros;
    estados: Estados[] = [];
    documentos: DocumentosIdentificativos[] = [];
    loading = false;
    loadingEstados = false;
    loadingDocumentosIdentificativos = false;
  
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
        this.getDataEstados();
        this.getDataDocumentosIdentificativos();
    }

    clean(){
        this.filtros.no_notario = null;
        this.filtros.estado = null;
        this.filtros.nombre = null;
        this.filtros.apellido_paterno = null;
        this.filtros.apellido_materno = null;
        this.filtros.rfc = null;
        this.filtros.curp = null;
        this.filtros.ine = null;
        this.filtros.otro_documento = null;
        this.filtros.numero_documento = null;
        this.filtros.fecha_nacimiento = null;
        this.filtros.fecha_defuncion = null;
        this.filtros.email = null;
        this.filtros.celular = null;
    }

    getDataEstados(): void {
        this.loadingEstados = true;
        this.http.post(this.endpoint + 'getEstados', '', this.httpOptions).subscribe(
        (res: any) => {
            this.loadingEstados = false;
            this.estados = res;
            // console.log(this.estados);
        },
        (error) => {
            this.loadingEstados = false;
        }
        );
    }


    getDataDocumentosIdentificativos(): void{
        this.loadingDocumentosIdentificativos = true;
        this.http.post(this.endpoint + 'getCatalogos', '', this.httpOptions).subscribe(
        (res: any) => {
            this.loadingDocumentosIdentificativos = false;
            this.documentos = res.CatDocIdentificativos;
            // console.log(this.documentos);
        },
        (error) => {
            this.loadingDocumentosIdentificativos = false;
        }
        );
    }


    searchNotario(): void {
        const dialogRef = this.dialog.open(DialogBuscarNotarioAlta, {
        width: '700px',
        });
        dialogRef.afterClosed().subscribe(result => {
        this.filtros.no_notario = result.no_notario;
        this.filtros.estado = result.estado;
        this.filtros.nombre = result.nombre;
        this.filtros.apellido_paterno = result.apellido_paterno;
        this.filtros.apellido_materno = result.apellido_materno;
        this.filtros.rfc = result.rfc;
        this.filtros.curp = result.curp;
        this.filtros.ine = result.ine;
        this.filtros.celular = result.celular;
        this.filtros.email = result.email;
        });
    }

    consulta_previa(){

        let query = '';
        let busquedaDatos = 'getContribuyentesSimilares';

        //query = (this.filtros.nombre) ? query + 'nombre=' + this.filtros.nombre  + '&filtroNombre=' : query +  'nombre=&filtroNombre=';
        query = query + 'nombre=&filtroNombre=';

        //query = (this.filtros.apellido_paterno) ? query + '&apellidoPaterno=' + this.filtros.apellido_paterno : query + '&apellidoPaterno=';
        query = query + '&apellidopaterno=&filtroApellidoPaterno=';

        //query = (this.filtros.apellido_materno) ? query + '&apellidoMaterno=' + this.filtros.apellido_materno : query + '&apellidoMaterno=';
        query = query + '&apellidomaterno=&filtroApellidoMaterno=';

        query = (this.filtros.curp) ? query + '&curp=' + this.filtros.curp : query + '&curp=';

        query = (this.filtros.rfc) ? query + '&rfc=' + this.filtros.rfc : query + '&rfc=';

        query = (this.filtros.ine) ? query + '&claveife=' + this.filtros.ine : query + '&claveife=';

        query = query + '&actividadPrincip=';

        console.log(this.endpoint + busquedaDatos + '?' + query);
        this.loading = true;
        this.http.post(this.endpoint + busquedaDatos + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    console.log(res);
                    console.log("CON");
                    if(res.length > 0){
                        this.validaDialog(res);
                    }else{
                        this.guardarNotario();
                    }
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

    validaDialog(res){
        const dialogRef = this.dialog.open(DialogDuplicadosComponent, {
            width: '850px',
            data: {
                dataSource: res,
                bandeja: 2
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log(result);
                this.guardarNotario();
            }
        });
    }

    guardarNotario(){
        let query = 'idPersona';
        this.loading = true;

        //registro/insertarNotario?numNotario=666&codEstado=9&nombre=Omar Donchai&apellidoPaterno=Vidal&apellidoMaterno=Perez&rfc=VIP900629MG5&curp&ife=PLGMJN83062615H500&iddocIdentif=1&valdocIdentif&fechaNacimiento&fechaDefuncion&email=ividal@mail.com&celular&codtiposPersona=F&persona

        query = (this.filtros.no_notario) ? query + '&numNotario=' + this.filtros.no_notario : query + '&numNotario=';
        query = (this.filtros.estado) ? query + '&codEstado=' + this.filtros.estado : query + '&codEstado=';
        query = (this.filtros.nombre) ? query + '&nombre=' + this.filtros.nombre : query + '&nombre=';
        query = (this.filtros.apellido_paterno) ? query + '&apellidoPaterno=' + this.filtros.apellido_paterno : query + '&apellidoPaterno=';
        query = (this.filtros.apellido_materno) ? query + '&apellidoMaterno=' + this.filtros.apellido_materno : query + '&apellidoMaterno=';
        query = (this.filtros.rfc) ? query + '&rfc=' + this.filtros.rfc : query + '&rfc=';
        query = (this.filtros.curp) ? query + '&curp=' + this.filtros.curp : query + '&curp=';
        query = (this.filtros.ine) ? query + '&ife=' + this.filtros.ine : query + '&ife=';
        query = (this.filtros.otro_documento) ? query + '&iddocIdentif=' + this.filtros.otro_documento : query + '&iddocIdentif=';
        query = (this.filtros.numero_documento) ? query + '&valdocIdentif=' + this.filtros.numero_documento : query + '&valdocIdentif=';
        query = (this.filtros.fecha_nacimiento) ? query + '&fechaNacimiento=' + moment(this.filtros.fecha_nacimiento).format('DD-MM-YYYY') : query + '&fechaNacimiento=';
        query = (this.filtros.fecha_defuncion) ? query + '&fechaDefuncion=' + moment(this.filtros.fecha_defuncion).format('DD-MM-YYYY') : query + '&fechaDefuncion=';
        query = (this.filtros.email) ? query + '&email=' + this.filtros.email : query + '&email=';
        query = (this.filtros.celular) ? query + '&celular=' + this.filtros.celular : query + '&celular=';
        query = query + '&codtiposPersona=F&persona';

        this.http.post(this.endpoint + 'insertarNotario' + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    // console.log("NOTARIO GUARDADO");
                    // console.log(res);
                    this.snackBar.open('Notario Dado de Alta Correctamente', 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
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


}


///////////////BUSCAR NOTARIO////////////////
export interface DataNotarioSeleccionado {
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

export interface DocumentosIdentificativos{
  id_documento: number;
  documento: string;
}


@Component({
  selector: 'app-dialog-buscar-notario-alta',
  templateUrl: 'app-dialog-buscar-notario-alta.html',
  styleUrls: ['./alta-notario.component.css']
})

export class DialogBuscarNotarioAlta {
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
  notarioSeleccionado;
  dataNotarioSeleccionado: DataNotarioSeleccionado = {} as DataNotarioSeleccionado;
  // documentos: DocumentosIdentificativos = {} as DocumentosIdentificativos;
  documentos: DocumentosIdentificativos[] = [];
  loadingDocumentosIdentificativos = false;
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
      this.getDataDocumentosIdentificativos();
  }

  getDataDocumentosIdentificativos(): void{
    this.loadingDocumentosIdentificativos = true;
    this.http.post(this.endpoint + 'getCatalogos', '', this.httpOptions).subscribe(
      (res: any) => {
        this.loadingDocumentosIdentificativos = false;
        this.documentos = res.CatDocIdentificativos;
        // console.log(this.documentos);
      },
      (error) => {
        this.loadingDocumentosIdentificativos = false;
      }
    );
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
      this.nombre = '';
      this.apellido_paterno = '';
      this.apellido_materno = '';
      this.rfc = '';
      this.curp = '';
      this.ine = '';
      this.otro_documento = '';
      this.numero_documento = '';
      this.search = false;
      this.dataNotarioSeleccionado = {} as DataNotarioSeleccionado;
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
      this.notarioSeleccionado = false;

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
        // console.log(this.endpoint + busquedaDatos + '?' + query);
        this.http.post(this.endpoint + busquedaDatos + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    // console.log(this.dataSource);
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

  RegistroSelect(element) {
    this.dataNotarioSeleccionado.no_notario = element.NUMNOTARIO;
    this.dataNotarioSeleccionado.estado = element.CODESTADO;
    this.dataNotarioSeleccionado.nombre = element.NOMBRE;
    this.dataNotarioSeleccionado.apellido_paterno = element.APELLIDOPATERNO;
    this.dataNotarioSeleccionado.apellido_materno = element.APELLIDOMATERNO;
    this.dataNotarioSeleccionado.rfc = element.RFC;
    this.dataNotarioSeleccionado.curp = element.CURP;
    this.dataNotarioSeleccionado.ine = element.CLAVEIFE;
    this.dataNotarioSeleccionado.celular = element.CELULAR;
    this.dataNotarioSeleccionado.email = element.EMAIL;
    // console.log(this.dataNotarioSeleccionado.email);
  }

}

