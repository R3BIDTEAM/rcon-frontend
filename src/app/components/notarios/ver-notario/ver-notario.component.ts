import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DialogDomicilioHistoricoG } from '@comp/dialog-historial/dialog-historial.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

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

export interface DireccionesNotario {
  tipo_via: string;
  id_via: string;
  via: string;
  no_exterior: string;
  no_interior: string;
  entre_calle_1: string;
  entre_calle_2: string;
  andador: string;
  edificio: string;
  seccion: string;
  entrada: string;
  tipo_localidad: string;
  tipo_asentamiento: string;
  id_colonia: string;
  asentamiento: string;
  colonia: string;
  codigo_postal: string;
  codigo_ciudad: string;
  ciudad: string;
  id_delegacion: string;
  codigo_municipio: string;
  delegacion: string;
  telefono: string;
  codigo_estado: string;
  codigo_tipo_direccion: string;
  indicaciones_adicionales: string;
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
  selector: 'app-ver-notario',
  templateUrl: './ver-notario.component.html',
  styleUrls: ['./ver-notario.component.css']
})
export class VerNotarioComponent implements OnInit {
  endpoint = environment.endpoint + 'registro/getInfoNotario';
  endpointEstados = environment.endpoint + 'registro/';
  pagina = 1;
  total = 0;
  pageSize = 15;
  loading = false;
  dataSource = [];
  dataPaginate = [];
  displayedColumns: string[] = ['direccion', 'historial'];
  loadingDomicilios = false;
  dataNotarioResultado;
  dataNotarioDireccionesResultado;
  httpOptions;
  search = false;
  query;
  idNotario;
  datosNotario: DatosNotario = {} as DatosNotario;
  direccionesNotario: DireccionesNotario = {} as DireccionesNotario;
  // estados: Estados = {} as Estados;
  // documentos: DocumentosIdentificativos = {} as DocumentosIdentificativos;
  estados: Estados[] = [];
  documentos: DocumentosIdentificativos[] = [];
  loadingEstados = false;
  loadingDocumentosIdentificativos = false;
  Auditor: boolean = false;
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit(): void {
    this.httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this.auth.getSession().token
        })
    };
    if(this.auth.getSession().userData.rol_nombre == 'AUDITORIA RCON'){
      this.Auditor = true; 
  }
    this.idNotario = this.route.snapshot.paramMap.get('idnotario');

    this.getNotarioDatos();
    this.getNotarioDirecciones();
    this.getDataEstados();
    this.getDataDocumentosIdentificativos();
  }

  /** 
  * Obtiene el nombre de los Estados para llenar el el Select de Estados
  */
  getDataEstados(): void {
    this.spinner.show();
    this.loadingEstados = true;
    this.http.get(this.endpointEstados + 'getEstados', this.httpOptions).subscribe(
      (res: any) => {
        this.spinner.hide();
        this.loadingEstados = false;
        this.estados = res;

      },
      (error) => {
        this.spinner.hide();
        this.loadingEstados = false;
      }
    );
  }

  /** 
  * Obtiene los Documentos Identificativos para llenar el Select de Documentos Identificativos
  */
  getDataDocumentosIdentificativos(): void{
    this.spinner.show();
    this.loadingDocumentosIdentificativos = true;
    this.http.get(this.endpointEstados + 'getCatalogos', this.httpOptions).subscribe(
      (res: any) => {
        this.spinner.hide();
        this.loadingDocumentosIdentificativos = false;
        this.documentos = res.CatDocIdentificativos;

      },
      (error) => {
        this.spinner.hide();
        this.loadingDocumentosIdentificativos = false;
      }
    );
  }

  /**
  * Trae la informaci??n guardada del notario seleccionado (Datos personales, direcciones, etc..)
  */
  getNotarioDatos(){
      this.spinner.show();
      this.query = 'infoExtra=true&idPersona=' + this.idNotario; 
      this.loading = true;

      this.http.get(this.endpoint + '?' + this.query, this.httpOptions)
          .subscribe(
              (res: any) => {
                  this.spinner.hide();
                  this.loading = false;
                  this.dataNotarioResultado = res.notario;
                  // this.dataSource = res.direcciones;
                  // this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                  // this.total = this.dataPaginate.length; 
                  // this.paginator.pageIndex = 0;
                  this.datoDelNotario();
              },
              (error) => {
                  this.spinner.hide();
                  this.loading = false;
                  this.snackBar.open(error.error.mensaje, 'Cerrar', {
                      duration: 10000,
                      horizontalPosition: 'end',
                      verticalPosition: 'top'
                  });
              }
          );
  }

  /**
  * Setea los valores encontrado en getDatosDelNotario en los campos del formulario
  */
  datoDelNotario(){
      this.datosNotario.no_notario = this.dataNotarioResultado[0].NUMNOTARIO;
      this.datosNotario.estado = this.dataNotarioResultado[0].CODESTADO;
      this.datosNotario.nombre  = this.dataNotarioResultado[0].NOMBRE;
      this.datosNotario.apellido_paterno = this.dataNotarioResultado[0].APELLIDOPATERNO;
      this.datosNotario.apellido_materno = this.dataNotarioResultado[0].APELLIDOMATERNO;
      this.datosNotario.rfc = this.dataNotarioResultado[0].RFC;
      this.datosNotario.curp = this.dataNotarioResultado[0].CURP;
      this.datosNotario.ine = this.dataNotarioResultado[0].CLAVEIFE;
      this.datosNotario.otro_documento = this.dataNotarioResultado[0].IDDOCIDENTIF;
      this.datosNotario.numero_documento = this.dataNotarioResultado[0].VALDOCIDENTIF;
      this.datosNotario.fecha_nacimiento = (this.dataNotarioResultado[0].FECHANACIMIENTO) ? new Date(this.dataNotarioResultado[0].FECHANACIMIENTO) : null;
      this.datosNotario.fecha_defuncion = (this.dataNotarioResultado[0].FECHADEFUNCION) ? new Date(this.dataNotarioResultado[0].FECHADEFUNCION) : null;
      this.datosNotario.celular = this.dataNotarioResultado[0].CELULAR;
      this.datosNotario.email = this.dataNotarioResultado[0].EMAIL;
  }
  // paginado(evt): void{
  //     this.pagina = evt.pageIndex + 1;
  //     this.dataSource = this.paginate(this.dataSource, this.pageSize, this.pagina);
  // }

  // paginate(array, page_size, page_number) {
  //     return array.slice((page_number - 1) * page_size, page_number * page_size);
  // }


  /**
  * Trae la informaci??n guardada de las direcciones que est??n dadas de alta para ??ste notario
  */
  getNotarioDirecciones(){
    this.spinner.show();
    this.query = '&idPersona=' + this.idNotario; 
    this.loadingDomicilios = true;

    this.http.get(this.endpointEstados + 'getDireccionesContribuyente?' + this.query, this.httpOptions)
      .subscribe(
          (res: any) => {
            this.spinner.hide();
            this.loadingDomicilios = false;
            this.dataSource = res;
            this.total = this.dataSource.length; 
            this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);


          },
          (error) => {
            this.spinner.hide();
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

  /**
   * @param idDireccion Valor que se enviar?? para la obtenci??n de los movimientos sobre ese domicilio
   */
   viewHistoricoDomicilio(idDireccion): void {
    const dialogRef = this.dialog.open(DialogDomicilioHistoricoG, {
        width: '700px',
        data: {idDireccion},
    });
    dialogRef.afterClosed().subscribe(result => {
            
    });
  }
}
