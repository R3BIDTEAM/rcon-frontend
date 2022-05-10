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
import { DialogCargaComponent } from '@comp/dialog-carga/dialog-carga.component'
import { DialogHistorialComponent, DialogDomicilioHistoricoG, DialogPersonalesHistoricoG } from '@comp/dialog-historial/dialog-historial.component';
import pdfMake from "pdfmake/build/pdfmake";  
import pdfFonts from "pdfmake/build/vfs_fonts";  
pdfMake.vfs = pdfFonts.pdfMake.vfs; 
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

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
  Auditor: boolean = false;
  historicoCambios = [];
  infoContribuyente = [];
  infoContribuyenteNombre;
  infoContribuyenteCurp;
  infoContribuyenteRfc;
  rol;
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
    private spinner: NgxSpinnerService,
    private _formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.rol = this.auth.getSession().userData.rol_nombre;
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.auth.getSession().token
      })
    };

    if(this.auth.getSession().userData.rol_nombre == 'AUDITORIA RCON'){
      this.Auditor = true; 
    }
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
    this.spinner.show();
    this.loadingDocumentos = true;
    this.http.get(this.endpoint + 'getCatalogos', this.httpOptions).subscribe(
      (res: any) => {
        this.spinner.hide();
        this.loadingDocumentos = false;
        this.dataDocumentos = res.CatDocIdentificativos;
        console.log(this.dataDocumentos);
      },
      (error) => {
        this.spinner.hide();
        this.loadingDocumentos = false;
      }
    );
  }

  /** 
    * Obtiene los Datos del Contribuyente
    */
  getContribuyenteDatos(){
    this.spinner.show();
    this.query = '&idPersona=' + this.idContribuyente; 
    this.loading = true;
    console.log(this.endpoint);
    this.http.get(this.endpoint + 'getInfoContribuyente?' + this.query, this.httpOptions)
      .subscribe(
        (res: any) => {
          this.spinner.hide();
          this.loading = false;
          this.dataContribuyenteResultado = res.contribuyente;
          console.log("AQUI ENTRO EL RES");
          console.log(this.dataContribuyenteResultado);
          this.datoDelContribuyente();
        },
        (error) => {
          this.spinner.hide();
          this.loading = false;
          Swal.fire({
            title: 'ERROR',
            text: error.error.mensaje,
            icon: 'error',
            confirmButtonText: 'Cerrar'
          });
        }
      );
  }

  /**
  * Obtiene los domicilios registrados de la sociedad domicilios particulares y para recibir notificaciones.
  */
  getDomicilioContribuyente(){
    this.spinner.show();
    this.loadingDomicilios = true;
    let metodo = 'getDireccionesContribuyente';
    this.http.get(this.endpoint + metodo + '?idPersona='+ this.idContribuyente, this.httpOptions)
      .subscribe(
        (res: any) => {
          this.spinner.hide();
          this.loadingDomicilios = false;
          this.dataSource1 = res.filter(element => element.CODTIPOSDIRECCION !== "N");
          this.dataSource2 = res.filter(element => element.CODTIPOSDIRECCION === "N");
          this.total1 = this.dataSource1.length;
          this.total2 = this.dataSource2.length;
          this.dataPaginate1 = this.paginate(this.dataSource1, 15, this.pagina1);
          this.dataPaginate2 = this.paginate(this.dataSource2, 15, this.pagina2);
          this.getidInmuebles();
        },
        (error) => {
          this.spinner.hide();
          this.loadingDomicilios = false;
          Swal.fire({
            title: 'ERROR',
            text: error.error.mensaje,
            icon: 'error',
            confirmButtonText: 'Cerrar'
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
    this.dataPaginate1 = this.paginate(this.dataSource1, 15, this.pagina1);
  }

  /**
   * Método del paginado que nos dira la posición del paginado y los datos a mostrar
   * @param evt Nos da la referencia de la pagina en la que se encuentra
   */
  paginado2(evt): void{
    this.pagina2 = evt.pageIndex + 1;
    this.dataPaginate2 = this.paginate(this.dataSource2, 15, this.pagina2);
  }

  /**
  * Obtiene los inmuebles de la persona
  */
  getidInmuebles(){
    this.spinner.show();
    this.loadingInmuebles = true;
    this.http.get(this.endpoint + 'getInmuebles' + '?idPersona='+ this.idContribuyente, this.httpOptions)
      .subscribe(
        (res: any) => {
          this.spinner.hide();
          this.loadingInmuebles = false;
          console.log("AQUI ENTRO IDINMUEBLE!!!");
          console.log(res);

          this.dataSource3 = res;
          console.log(res.length);
          console.log(this.dataSource3);
          this.dataPaginate3 = this.paginate(this.dataSource3, 15, this.pagina3);
          this.total3 = this.dataSource3.length; 
          this.paginator.pageIndex = 0;
          console.log("AQUI ENTRO EL RES DEL INMUEBLE!");
          console.log(this.dataSource3);
        },
        (error) => {
          this.spinner.hide();
          this.loadingInmuebles = false;
          Swal.fire({
            title: 'ERROR',
            text: error.error.mensaje,
            icon: 'error',
            confirmButtonText: 'Cerrar'
          });
        }
      );
  }

  /**
   * Método del paginado que nos dira la posición del paginado y los datos a mostrar
   * @param evt Nos da la referencia de la pagina en la que se encuentra
   */
  paginado3(evt): void{
    this.pagina3 = evt.pageIndex + 1;
    this.dataPaginate3 = this.paginate(this.dataSource3, 15, this.pagina3);
  }

  /**
  * Obtiene las representaciónes del contribuyente
  */
  getRepresentacion(){
    this.spinner.show();
    this.loadingRepresentante = true;
    let queryRep = 'rep=Representantes&idPersona=' + this.idContribuyente;
    this.http.get(this.endpoint + 'getRepresentacionContribuyente?' + queryRep, this.httpOptions)
      .subscribe(
        (res: any) => {
          this.spinner.hide
          this.loadingRepresentante = false;
          this.dataSource4 = res;
          this.total4 = this.dataSource4.length;
          this.dataPaginate4 = this.paginate(this.dataSource4, 15, this.pagina4);
        },
        (error) => {
          this.spinner.hide
          this.loadingRepresentante = false;
          Swal.fire({
            title: 'ERROR',
            text: error.error.mensaje,
            icon: 'error',
            confirmButtonText: 'Cerrar'
          });
        }
      );
  }

  /**
  * Obtienen los representados de la sociedad.
  */
  getRepresentado(){
    this.spinner.show();
    this.loadingRepresentado = true;
    let queryRepdo = 'rep=Representado&idPersona=' + this.idContribuyente;
    console.log(this.endpoint + 'getRepresentacionContribuyente?' + queryRepdo);
    this.http.get(this.endpoint + 'getRepresentacionContribuyente?' + queryRepdo, this.httpOptions)
      .subscribe(
        (res: any) => {
          this.spinner.hide();
          this.loadingRepresentado = false;
          this.dataSource5 = res;
          console.log("ACA ENTRO EL REPRESENTADO");
          console.log(res);
          this.total5 = this.dataSource5.length;
          this.dataPaginate5 = this.paginate(this.dataSource5, 15, this.pagina5);
        },
        (error) => {
          this.spinner.hide();
          this.loadingRepresentado = false;
          Swal.fire({
            title: 'ERROR',
            text: error.error.mensaje,
            icon: 'error',
            confirmButtonText: 'Cerrar'
          });
        }
      );
  }

  /**
  * Método del paginado que nos dira la posición del paginado y los datos a mostrar
  * @param evt Nos da la referencia de la pagina en la que se encuentra
  */
  paginado4(evt): void{
    this.pagina4 = evt.pageIndex + 1;
    this.dataPaginate4 = this.paginate(this.dataSource4, 15, this.pagina4);
  }

  /**
  * Método del paginado que nos dira la posición del paginado y los datos a mostrar
  * @param evt Nos da la referencia de la pagina en la que se encuentra
  */
  paginado5(evt): void{
    this.pagina5 = evt.pageIndex + 1;
    this.dataPaginate5 = this.paginate(this.dataSource5, 15, this.pagina5);
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

  consultaInfoCambios(){
    this.spinner.show();
    this.infoContribuyenteNombre = '';
    let metodo = 'getInfoContribuyente';
    let nombreC = '';
    let apematernoC = '';
    // const dialogRef = this.dialog.open(DialogCargaComponent, {
		// 	width: '800px',
		// });
    this.http.get(this.endpoint + metodo + '?idPersona=' + this.idContribuyente, this.httpOptions)
      .subscribe(
          (res: any) => {
            this.spinner.hide();
            this.infoContribuyente = res.contribuyente;
            nombreC = (this.infoContribuyente[0].NOMBRE) ? this.infoContribuyente[0].NOMBRE : '';
            apematernoC = (this.infoContribuyente[0].APELLIDOMATERNO) ? this.infoContribuyente[0].APELLIDOMATERNO : '';
            if(this.infoContribuyente[0].IDPERSONA){
              this.infoContribuyenteNombre = nombreC + ' ' + this.infoContribuyente[0].APELLIDOPATERNO + ' ' + apematernoC;
              this.infoContribuyenteRfc = (this.infoContribuyente[0].RFC) ? 'RFC: ' + this.infoContribuyente[0].RFC : 'CURP: ' + this.infoContribuyente[0].CURP;
              this.consultaCambios();
              console.log("ACÁ EL RES DEL CONSULTA INFO");
              console.log(res);
              //dialogRef.close();
            }else{
              this.loadingDomicilios = false;
              //dialogRef.close();
              this.spinner.hide();
              Swal.fire({
                title: 'ERROR',
                text: "No se encontro información",
                icon: 'error',
                confirmButtonText: 'Cerrar'
              });
            }
            
          },
          (error) => {
            this.spinner.hide();
            //dialogRef.close();
            this.loadingDomicilios = false;
            Swal.fire({
              title: 'ERROR',
              text: "No se encontro información",
              icon: 'error',
              confirmButtonText: 'Cerrar'
            });
          }
      );
  }

  consultaCambios(){
    let metodo = 'getCambiosContribuyente';
    this.spinner.show();
    // const dialogRef = this.dialog.open(DialogCargaComponent, {
		// 	width: '800px',
		// });
    //this.http.get(this.endpoint + metodo + '?idPersona=4493213', this.httpOptions)
    this.http.get(this.endpoint + metodo + '?idPersona=' + this.idContribuyente, this.httpOptions)
      .subscribe(
          (res: any) => {
            this.spinner.hide();
            this.historicoCambios = res;
            if(this.historicoCambios.length > 0){
              this.generatePDF();
            }else{
              this.loadingDomicilios = false;
              Swal.fire({
                title: '¡ATENCIÓN!',
                text: "No se han encontrado movimientos",
                icon: 'warning',
                confirmButtonText: 'Cerrar'
              });
            }
            console.log("ACÁ EL RES CONSULTA CAMBIO");
            console.log(res);
            //dialogRef.close();
          },
          (error) => {
              //dialogRef.close();
              this.spinner.hide();
              this.loadingDomicilios = false;
              Swal.fire({
                title: 'ERROR',
                text: error.error.mensaje,
                icon: 'error',
                confirmButtonText: 'Cerrar'
              });
          }
      );
  }

  /**
  * Genera el PDF de histórico cambios
  */
  async generatePDF() {
    
    let i = 0;
    //let eldos = [['1','2','3','4','5','6','7'],['1','2','3','4','5','6','7'],['1','2','3','4','5','6','7']];
    this.historicoCambios
    let arreglo = [];    
    if(this.rol == 'SUPERVISOR RCON' || this.rol == 'Administrador'){
      arreglo = [
        [
          { text: 'Campo Modificado', fontSize: 9,  bold: true },
          { text: 'Valor Antes', fontSize: 9, bold: true },
          { text: 'Valor despúes', fontSize: 9, bold: true },
          { text: 'Fecha Cambio', fontSize: 9, bold: true },
          { text: 'Nombre de usuario', fontSize: 9, bold: true },
          // { text: 'Área', fontSize: 9, bold: true },
          // { text: 'Subarea', fontSize: 9, bold: true }
          { text: 'IP', fontSize: 9, bold: true },
        ],
      ];
    }else{
      arreglo = [
        [
          { text: 'Campo Modificado', fontSize: 9,  bold: true },
          { text: 'Valor Antes', fontSize: 9, bold: true },
          { text: 'Valor despúes', fontSize: 9, bold: true },
          { text: 'Fecha Cambio', fontSize: 9, bold: true },
        ],
      ];
    }
    

    for (let i = 0; i < this.historicoCambios.length; i++) {
      //console.log(this.historicoCambios[i].campo_modificado);
      //arreglo.push([{ text:eldos[i][0], fontSize: 9,  bold: true }, { text: eldos[i][1], fontSize: 9, bold: true }, { text: eldos[i][2], fontSize: 9, bold: true }, { text: eldos[i][3], fontSize: 9, bold: true }, { text: eldos[i][4], fontSize: 9, bold: true }, { text: eldos[i][5], fontSize: 9, bold: true }, { text: eldos[i][6], fontSize: 9, bold: true }],  );
      if(this.rol == 'SUPERVISOR RCON' || this.rol == 'Administrador'){
        arreglo.push(
          [
            { text: this.historicoCambios[i].campo_modificado, fontSize: 9, bold: false },
            { text: this.historicoCambios[i].valor_antes, fontSize: 9, bold: false },
            { text: (this.historicoCambios[i].valor_despues) ? this.historicoCambios[i].valor_despues : '', fontSize: 9, bold: false },
            { text: this.historicoCambios[i].fecha_de_cambio, fontSize: 9, bold: false },
            { text: this.historicoCambios[i].nombre_de_usuario, fontSize: 9, bold: false },
            // { text: this.historicoCambios[i].area, fontSize: 9, bold: false },
            // { text: this.historicoCambios[i].subarea, fontSize: 9, bold: false }
            { text: this.historicoCambios[i].ip, fontSize: 9, bold: false },
          ],
        );
      }else{
        arreglo.push(
          [
            { text: this.historicoCambios[i].campo_modificado, fontSize: 9, bold: false },
            { text: this.historicoCambios[i].valor_antes, fontSize: 9, bold: false },
            { text: (this.historicoCambios[i].valor_despues) ? this.historicoCambios[i].valor_despues : '', fontSize: 9, bold: false },
            { text: this.historicoCambios[i].fecha_de_cambio, fontSize: 9, bold: false },
          ],
        );
      }
    }
    let tabla1 = {};
    if(this.rol == 'SUPERVISOR RCON' || this.rol == 'Administrador'){
      tabla1 = 
        {
          table: 
            {  
            headerRows: 1,  
            widths: ['18%', '18%', '18%', '14%', '14%', '18%'],  
            body:   
                arreglo
              
            }
        }
    }else{
      tabla1 = 
        {
          table: 
            {  
            headerRows: 1,  
            widths: ['25%', '25%', '25%', '25%'],  
            body:   
                arreglo
              
            }
        }
    }
    let docDefinition = {
      content: [
        {
            image: await this.getBase64ImageFromURL(
            "assets/img/logo_dependencia_vino.png"
          ),
          width: 450,
          alignment: 'center',
        }, 
        {  
            text: 'HISTÓRICO DE CAMBIOS',  
            fontSize: 9,  
            alignment: 'center',
            color: '#000'  
        }, 
        {
            canvas: [
                {
                    type: 'line',
                    color: 'white',
                    x1: 0,
                    y1: 15,
                    x2: 250,
                    y2: 5,
                    lineWidth: 0.5
                }
            ]
        },
        {  
          text: 'Nombre: ' + this.infoContribuyenteNombre + '   ' + this.infoContribuyenteRfc,  
          fontSize: 9,  
          alignment: 'center',
          color: '#000'  
      }, 
      {
          canvas: [
              {
                  type: 'line',
                  color: 'white',
                  x1: 0,
                  y1: 5,
                  x2: 250,
                  y2: 5,
                  lineWidth: 0.5
              }
          ]
      },
        tabla1  
      ,
        {
            canvas: [
                {
                    type: 'line',
                    color: 'white',
                    x1: 0,
                    y1: 10,
                    x2: 250,
                    y2: 10,
                    lineWidth: 0.5
                }
            ]
        },
      ]
    };

    pdfMake.createPdf(docDefinition).open();
  }

  /**
   * Convierte la imagen para que pueda ser visualizada en el PDF
   */
  getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }
}
