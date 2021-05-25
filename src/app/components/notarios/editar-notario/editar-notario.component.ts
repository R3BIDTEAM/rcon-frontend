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

export interface DatosNotario {
  no_notario: string;
  estado: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  rfc: string;
  curp: string;
  ine: string;
  otro_documento: number;
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

export interface DataDomicilios {
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
  // documentoRepresentacion: DataDocumentoRepresentacion;
}

@Component({
  selector: 'app-editar-notario',
  templateUrl: './editar-notario.component.html',
  styleUrls: ['./editar-notario.component.css']
})
export class EditarNotarioComponent implements OnInit {
  endpoint = environment.endpoint + 'registro/getInfoNotario';
  endpointEstados = environment.endpoint + 'registro/';
  displayedColumns: string[] = ['nombre','registro', 'rfc'];
  pagina = 1;
  total = 0;
  pageSize = 15;
  loading = false;
  dataNotarioResultado;
  dataSource;
  dataPaginate;
  httpOptions;
  search = false;
  query;
  idNotario;
  datosNotario: DatosNotario = {} as DatosNotario;
  estados: Estados = {} as Estados;
  dataDomicilios: DataDomicilios[] = [];
  loadingEstados = false;
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this.auth.getSession().token
        })
    };
    this.idNotario = this.route.snapshot.paramMap.get('idnotario');
    console.log(this.idNotario);
    this.getNotarioDatos();
    this.getDataEstados();
  }

  getDataEstados(): void {
    this.loadingEstados = true;
    this.http.post(this.endpointEstados + 'getEstados', '', this.httpOptions).subscribe(
      (res: any) => {
        this.loadingEstados = false;
        this.estados = res;
        console.log(this.estados);
      },
      (error) => {
        this.loadingEstados = false;
      }
    );
  }

  getNotarioDatos(){
      this.query = 'infoExtra=true&idPersona=' + this.idNotario; 
      this.loading = true;
      console.log(this.endpoint);
      this.http.post(this.endpoint + '?' + this.query, '', this.httpOptions)
          .subscribe(
              (res: any) => {
                  this.loading = false;
                  this.dataNotarioResultado = res.notario;
                  this.dataSource = res.direcciones;
                  // this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                  // this.total = this.dataPaginate.length; 
                  // this.paginator.pageIndex = 0;
                  console.log("AQUI ENTRO EL RES");
                  console.log(this.dataNotarioResultado);
                  this.datoDelPerito();
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

  datoDelPerito(){
      this.datosNotario.no_notario = this.dataNotarioResultado[0].IDPERSONA;
      this.datosNotario.estado = this.dataNotarioResultado[0].CODESTADO;
      this.datosNotario.nombre  = this.dataNotarioResultado[0].NOMBRE;
      this.datosNotario.apellido_paterno = this.dataNotarioResultado[0].APELLIDOPATERNO;
      this.datosNotario.apellido_materno = this.dataNotarioResultado[0].APELLIDOMATERNO;
      this.datosNotario.rfc = this.dataNotarioResultado.RFC;
      this.datosNotario.curp = this.dataNotarioResultado.CURP;
      this.datosNotario.ine = this.dataNotarioResultado.CLAVEIFE;
      this.datosNotario.otro_documento = this.dataNotarioResultado.IDDOCIDENTIF;
      this.datosNotario.numero_documento = this.dataNotarioResultado.VALDOCIDENTIF;
      this.datosNotario.fecha_nacimiento = this.dataNotarioResultado.FECHANACIMIENTO;
      this.datosNotario.fecha_defuncion = this.dataNotarioResultado.FECHADEFUNCION;
      this.datosNotario.celular = this.dataNotarioResultado.CELULAR;
      this.datosNotario.email = this.dataNotarioResultado.EMAIL;

      console.log(this.datosNotario.nombre);
      
      // if(this.dataNotarioResultado.INDEPENDIENTE === 'S'){
      //     this.datosNotario.independiente = true;
      // }else{
      //     this.datosNotario.independiente = false;
      // }
  }
  paginado(evt): void{
      this.pagina = evt.pageIndex + 1;
      this.dataSource = this.paginate(this.dataSource, this.pageSize, this.pagina);
  }

  paginate(array, page_size, page_number) {
      return array.slice((page_number - 1) * page_size, page_number * page_size);
  }


  addDomicilio(i = -1, dataDomicilio = null): void {
    const dialogRef = this.dialog.open(DialogDomiciliosNotario, {
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

  removeDomicilio(i){
		this.dataDomicilios.splice(i, 1);
	}


}


/////////////// DOMICILIOS ////////////////
@Component({
  selector: 'app-dialog-domicilios-notario',
  templateUrl: 'app-dialog-domicilios-notario.html',
  styleUrls: ['./editar-notario.component.css']
})
export class DialogDomiciliosNotario {
  endpoint = environment.endpoint;
  loading = false;
  httpOptions;
  tipoPersona = 'F';
  fisicaFormGroup: FormGroup;
  moralFormGroup: FormGroup;
  // dataRepresentacion: DataRepresentacion = {} as DataRepresentacion;


}
