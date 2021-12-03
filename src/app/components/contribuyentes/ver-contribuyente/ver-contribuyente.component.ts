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
import { DialogHistorialComponent, DialogDomicilioHistoricoG, DialogPersonalesHistoricoG } from '@comp/dialog-historial/dialog-historial.component';

export interface DataRepresentacion {
  tipoPersona: string;
  nombre: string;
  nombre_moral: string;
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

export interface DocumentosIdentificativos{
  id_documento: number;
  documento: string;
}

@Component({
  selector: 'app-ver-contribuyente',
  templateUrl: './ver-contribuyente.component.html',
  styleUrls: ['./ver-contribuyente.component.css']
})
export class VerContribuyenteComponent implements OnInit {
  endpoint = environment.endpoint + 'registro/';
  displayedColumnsDom: string[] = ['tipoDir','direccion','historial'];
  displayedColumnsRepdo: string[] = ['representacion','texto','caducidad'];
  displayedColumnsInm: string[] = ['inmueble','direccion','domicilio','descripcion','sujeto'];
  displayedColumnsDataRep: string[] = ['fechaCaducidad','texto','caducidad'];
  loading = false;
  loadingDocumentos = false;
  loadingDomicilios = false;
  loadingRepresentante = false;
  loadingRepresentado = false;
  loadingInmuebles = false;
  pagina = 1;
  total = 0;
  pageSize = 15;
  paginaDom = 1;
  totalDom = 0;
  pageSizeDom = 15;
  httpOptions;
  fisicaFormGroup: FormGroup;
  moralFormGroup: FormGroup;
  dataContribuyenteResultado;
  query;
  idContribuyente;
  // dataDomicilios: DataDomicilio[] = [];
  dataRepresentantes: DataRepresentacion[] = [];
  dataRepresentados: DataRepresentacion[] = [];
  contribuyente: DataRepresentacion = {} as DataRepresentacion;
  dataDocumentos: DocumentosIdentificativos[] = [];
  @ViewChild('paginator') paginator: MatPaginator;

  /*Paginado*/
  dataSource1 = [];
  total1 = 0;
  pagina1 = 1;
  dataPaginate1;
  dataSource2 = [];
  total2 = 0;
  pagina2 = 1;
  dataPaginate2;
  dataSource3 = [];
  total3 = 0;
  pagina3= 1;
  dataPaginate3;
  dataSource4 = [];
  total4 = 0;
  pagina4 = 1;
  dataPaginate4;
  dataSource5 = [];
  total5 = 0;
  pagina5 = 1;
  dataPaginate5;
  total6 = 0;
  pagina6= 1;
  dataPaginate6;
  total7 = 0;
  pagina7= 1;
  dataPaginate7;
  /*Paginado*/

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private _formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private route: ActivatedRoute
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

    this.fisicaFormGroup.controls['nombre'].disable();
    this.fisicaFormGroup.controls['apaterno'].disable();
    this.fisicaFormGroup.controls['amaterno'].disable();
    this.fisicaFormGroup.controls['rfc'].disable();
    this.fisicaFormGroup.controls['curp'].disable();
    this.fisicaFormGroup.controls['ine'].disable();
    this.fisicaFormGroup.controls['idDocIdent'].disable();
    this.fisicaFormGroup.controls['docIdent'].disable();
    this.fisicaFormGroup.controls['fechaNacimiento'].disable();
    this.fisicaFormGroup.controls['fechaDefuncion'].disable();
    this.fisicaFormGroup.controls['celular'].disable();
    this.fisicaFormGroup.controls['email'].disable();

    this.moralFormGroup = this._formBuilder.group({
      nombre_moral: [null, [Validators.required]],
      rfc: [null, [Validators.required]],
      actPreponderante: [null, []],
      idTipoPersonaMoral: ['', []],
      fechaInicioOperacion: [null, []],
      idMotivo: ['', []],
      fechaCambio: [null, []],
    });

    this.moralFormGroup.controls['nombre_moral'].disable();
    this.moralFormGroup.controls['rfc'].disable();
    this.moralFormGroup.controls['actPreponderante'].disable();
    this.moralFormGroup.controls['idTipoPersonaMoral'].disable();
    this.moralFormGroup.controls['fechaInicioOperacion'].disable();
    this.moralFormGroup.controls['idMotivo'].disable();
    this.moralFormGroup.controls['fechaCambio'].disable();

    this.idContribuyente = this.route.snapshot.paramMap.get('idcontribuyente');
    this.getDataDocumentos();
    this.getContribuyenteDatos();
    this.getDomicilioContribuyente();
    this.getRepresentacion();
    this.getRepresentado();
  }

  /**
     * Al cambio en el llenado de curp o rfc se activará o desactivará uno de los dos validadores de requerido.
     * @param remove Valor del campo que se le retirara la validación, puede ser CURP o RFC
     * @param add  Valor del campo que se le agregara a la validación, puede ser CURP o RFC
     */
  changeRequired(remove, add): void {
    this.fisicaFormGroup.controls[remove].setValue(null);
    this.fisicaFormGroup.controls[remove].clearValidators();
    this.fisicaFormGroup.controls[add].setValidators(Validators.required);
    this.fisicaFormGroup.markAsUntouched();
    this.fisicaFormGroup.updateValueAndValidity();
  }

  /** 
    * Obtiene los Documentos Identificativos para llenar el Select de Documentos Identificativos
    */
  getDataDocumentos(): void{
    this.loadingDocumentos = true;
    this.http.get(this.endpoint + 'getCatalogos', this.httpOptions).subscribe(
      (res: any) => {
        this.loadingDocumentos = false;
        this.dataDocumentos = res.CatDocIdentificativos;
        console.log(this.dataDocumentos);
      },
      (error) => {
        this.loadingDocumentos = false;
      }
    );
  }

  /** 
    * Obtiene los Datos del Contribuyente
    */
  getContribuyenteDatos(){
    this.query = '&idPersona=' + this.idContribuyente; 
    this.loading = true;
    console.log(this.endpoint);
    this.http.get(this.endpoint + 'getInfoContribuyente?' + this.query, this.httpOptions)
        .subscribe(
            (res: any) => {
                this.loading = false;
                this.dataContribuyenteResultado = res.contribuyente;
                console.log("AQUI ENTRO EL RES");
                console.log(this.dataContribuyenteResultado);
                this.datoDelContribuyente();
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

  /**
  * Obtiene los domicilios registrados de la sociedad domicilios particulares y para recibir notificaciones.
  */
  getDomicilioContribuyente(){
  this.loadingDomicilios = true;
  let metodo = 'getDireccionesContribuyente';
  this.http.get(this.endpoint + metodo + '?idPersona='+ this.idContribuyente, this.httpOptions)
    .subscribe(
        (res: any) => {
            this.loadingDomicilios = false;

            this.dataSource1 = res.filter(element => element.CODTIPOSDIRECCION !== "N");
            this.dataSource2 = res.filter(element => element.CODTIPOSDIRECCION === "N");
            this.total1 = this.dataSource1.length;
            this.total2 = this.dataSource2.length;
            this.dataPaginate1 = this.paginate(this.dataSource1, 15, this.pagina1);
            this.dataPaginate2 = this.paginate(this.dataSource2, 15, this.pagina2);
        },
        (error) => {
            this.loadingDomicilios = false;
            this.snackBar.open(error.error.mensaje, 'Cerrar', {
                duration: 10000,
                horizontalPosition: 'end',
                verticalPosition: 'top'
            });
        }
    );
  }

  /**
  * Obtiene los inmuebles de la persona
  */
  getidInmuebles(){
  this.loadingInmuebles = true;
  this.http.get(this.endpoint + 'getInmuebles' + '?idPersona='+ this.idContribuyente, this.httpOptions)
    .subscribe(
        (res: any) => {
            this.loadingInmuebles = false;
            console.log("AQUI ENTRO IDINMUEBLE!!!");
            console.log(res);

            this.dataSource3 = res;
            console.log(res.length);
            console.log(this.dataSource3);
            this.dataPaginate3 = this.paginate(this.dataSource3, 15, this.paginaDom);
            this.total3 = this.dataPaginate3.length; 
            this.paginator.pageIndex = 0;
            console.log("AQUI ENTRO EL RES DEL INMUEBLE!");
            console.log(this.dataSource3);

            //console.log(res[0].idinmueble);
            // if(res.length > 0){
            //     this.idInmueble = res[0].idinmueble;
            // }else{
            //     this.idInmueble = null;
            // }
            // this.getInmuebles();
        },
        (error) => {
            this.loadingInmuebles = false;
            this.snackBar.open(error.error.mensaje, 'Cerrar', {
                duration: 10000,
                horizontalPosition: 'end',
                verticalPosition: 'top'
            });
        }
    );
  }

  /**
  * Obtiene las representaciónes del contribuyente
  */
  getRepresentacion(){
  this.loadingRepresentante = true;
  let queryRep = 'rep=Representantes&idPersona=' + this.idContribuyente;
  this.http.get(this.endpoint + 'getRepresentacionContribuyente?' + queryRep, this.httpOptions)
    .subscribe(
        (res: any) => {
            this.loadingRepresentante = false;
            this.dataSource4 = res;
            this.total4 = this.dataSource4.length;
            this.dataPaginate4 = this.paginate(this.dataSource4, 15, this.pagina4);
        },
        (error) => {
            this.loadingRepresentante = false;
            this.snackBar.open(error.error.mensaje, 'Cerrar', {
                duration: 10000,
                horizontalPosition: 'end',
                verticalPosition: 'top'
            });
        }
    );
  }

  /**
  * Obtienen los representados de la sociedad.
  */
  getRepresentado(){
  this.loadingRepresentado = true;
  let queryRepdo = 'rep=Representado&idPersona=' + this.idContribuyente;
  console.log(this.endpoint + 'getRepresentacionContribuyente?' + queryRepdo);
  this.http.get(this.endpoint + 'getRepresentacionContribuyente?' + queryRepdo, this.httpOptions)
    .subscribe(
        (res: any) => {
            this.loadingRepresentado = false;
            this.dataSource5 = res;
            console.log("ACA ENTRO EL REPRESENTADO");
            console.log(res);
            this.total5 = this.dataSource5.length;
            this.dataPaginate5 = this.paginate(this.dataSource5, 15, this.pagina5);
        },
        (error) => {
            this.loadingRepresentado = false;
            this.snackBar.open(error.error.mensaje, 'Cerrar', {
                duration: 10000,
                horizontalPosition: 'end',
                verticalPosition: 'top'
            });
        }
    );
  }


  /**
  * Método del paginado que nos dira la posición del paginado y los datos a mostrar
  * @param evt Nos da la referencia de la pagina en la que se encuentra
  */
  paginado1(evt): void{
    this.pagina1 = evt.pageIndex + 1;
    this.dataSource1 = this.paginate(this.dataSource1, 15, this.pagina1);
  }

  /**
  * Método del paginado que nos dira la posición del paginado y los datos a mostrar
  * @param evt Nos da la referencia de la pagina en la que se encuentra
  */
  paginado2(evt): void{
    this.pagina1 = evt.pageIndex + 1;
    this.dataSource1 = this.paginate(this.dataSource1, 15, this.pagina1);
  }

  /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
   paginado3(evt): void{
    this.pagina3 = evt.pageIndex + 1;
    this.dataSource3 = this.paginate(this.dataSource3, 15, this.pagina3);
}

  /**
  * Método del paginado que nos dira la posición del paginado y los datos a mostrar
  * @param evt Nos da la referencia de la pagina en la que se encuentra
  */
  paginado4(evt): void{
    this.pagina4 = evt.pageIndex + 1;
    this.dataSource4 = this.paginate(this.dataSource4, 15, this.pagina4);
  }

  /**
  * Método del paginado que nos dira la posición del paginado y los datos a mostrar
  * @param evt Nos da la referencia de la pagina en la que se encuentra
  */
  paginado5(evt): void{
    this.pagina5 = evt.pageIndex + 1;
    this.dataSource5 = this.paginate(this.dataSource5, 15, this.pagina5);
  } 

  /**
  * Método del paginado que nos dira la posición del paginado y los datos a mostrar
  * @param evt Nos da la referencia de la pagina en la que se encuentra
  */
  paginate(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  }

  /** 
    * Asigna los valores de la consulta a las variables del formulario
    */
  datoDelContribuyente(){
    this.contribuyente.tipoPersona = this.dataContribuyenteResultado[0].CODTIPOPERSONA;
    this.contribuyente.nombre  = this.dataContribuyenteResultado[0].NOMBRE;
    this.contribuyente.nombre_moral  = this.dataContribuyenteResultado[0].APELLIDOPATERNO;
    this.contribuyente.apaterno = this.dataContribuyenteResultado[0].APELLIDOPATERNO;
    this.contribuyente.amaterno = this.dataContribuyenteResultado[0].APELLIDOMATERNO;
    this.contribuyente.rfc = this.dataContribuyenteResultado[0].RFC;
    this.contribuyente.curp = this.dataContribuyenteResultado[0].CURP;
    this.contribuyente.ine = this.dataContribuyenteResultado[0].CLAVEIFE;
    this.contribuyente.idDocIdent = this.dataContribuyenteResultado[0].IDDOCIDENTIF;
    this.contribuyente.docIdent = this.dataContribuyenteResultado[0].VALDOCIDENTIF;
    this.contribuyente.fechaNacimiento = (this.dataContribuyenteResultado[0].FECHANACIMIENTO) ? new Date(this.dataContribuyenteResultado[0].FECHANACIMIENTO) : null;
    this.contribuyente.fechaDefuncion = (this.dataContribuyenteResultado[0].FECHADEFUNCION) ? new Date(this.dataContribuyenteResultado[0].FECHADEFUNCION) : null;
    this.contribuyente.celular = this.dataContribuyenteResultado[0].CELULAR;
    this.contribuyente.email = this.dataContribuyenteResultado[0].EMAIL;
    this.contribuyente.actPreponderante = this.dataContribuyenteResultado[0].ACTIVPRINCIP;
    this.contribuyente.idTipoPersonaMoral = this.dataContribuyenteResultado[0].IDTIPOMORAL;
    this.contribuyente.fechaInicioOperacion = (this.dataContribuyenteResultado[0].FECHAINICIOACTIV) ? new Date(this.dataContribuyenteResultado[0].FECHAINICIOACTIV) : null;
    this.contribuyente.idMotivo = this.dataContribuyenteResultado[0].IDMOTIVOSMORAL;
    this.contribuyente.fechaCambio = (this.dataContribuyenteResultado[0].FECHACAMBIOSITUACION) ? new Date(this.dataContribuyenteResultado[0].FECHACAMBIOSITUACION) : null;

    console.log(this.contribuyente.tipoPersona);
    
  }

  /**
   * @param idPersona Valor que se enviará para la obtención de los movimientos sobre esa persona
   */
  viewHistoricoDatosPersonales(idPersona): void {
    const dialogRef = this.dialog.open(DialogPersonalesHistoricoG, {
        width: '700px',
        data: {idPersona},
    });
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  /**
   * @param idDireccion Valor que se enviará para la obtención de los movimientos sobre ese domicilio
   */
  viewHistoricoDomicilio(idDireccion): void {
    const dialogRef = this.dialog.open(DialogDomicilioHistoricoG, {
        width: '700px',
        data: {idDireccion},
    });
    dialogRef.afterClosed().subscribe(result => {
            
    });
  }

  /**
   * Abre el dialogo que nos mostrará el historial de las representaciones.
   */
  historialRepresentacion(){
    let idContribuyente = this.route.snapshot.paramMap.get('idcontribuyente');
    const dialogRef = this.dialog.open(DialogHistorialComponent, {
        width: '700px',
        data: idContribuyente,
    });
    dialogRef.afterClosed().subscribe(result => {
    if(result){
        setTimeout (() => {
            
        }, 1000);
      }
    });
  }
}
