import { Component, OnInit, Inject, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '@serv/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import * as moment from 'moment';
import * as FileSaver from 'file-saver';
import pdfMake from "pdfmake/build/pdfmake";  
import pdfFonts from "pdfmake/build/vfs_fonts";  
pdfMake.vfs = pdfFonts.pdfMake.vfs; 
import { DialogConfirmacionComponent, DialogsCambiaPersona, DialogsAsociarCuenta } from '@comp/dialog-confirmacion/dialog-confirmacion.component';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

export interface DatosContribuyente {
  tipoPersona: string;
  apepaterno: string;
  apematerno: string;
  nombre: string;
  rfc: string;
  curp: string;
  ine: string;
  identificacion: number;
  idedato: string;
  fecha_naci: Date;
  fecha_def: Date;
  celular: string;
  email: string;
  registro: string;
  independiente: boolean;
  independienteAct: string;
  fecha_alta: Date;
  fecha_baja: Date;
  actPreponderante: string;
  idTipoPersonaMoral: number;
  fechaInicioOperacion: Date;
  idMotivo: number;
  fechaCambio: Date;
  nombre_moral: string;
  texto: string;
}

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
documentoRepresentacion: DataDocumentoRepresentacion;
}

export interface DocumentosIdentificativos{
id_documento: number;
documento: string;
}

export interface DataTipoDerecho{
  codtipoderecho: string;
  descripcion: string;
}

export interface PersonaInmueble{
  porcentajeparticipacion: string;
  codtipoderecho: string;
}

export interface DataDocumentoRepresentacion {
  codtipodocumento: number;
  nombreTipoDocumento: string;
  codtipodocumentojuridico: string;
  nombreTipoDocumentoJuridico: string;
  idnotario: number;
  noNotario: string;
  ciudadNotario: string;
  nombreNotario: string;
  num_escritura: string;
  fecha: Date;
  descripcion: string;
  lugar: string;
  archivos: Array<{nombre: string, base64: string}>;
}
export interface DataDomicilio {
codtiposdireccion: string;
idestado: number;
estado: string;
idmunicipio: number;
idmunicipio2: number;
municipio: string;
delegacion: string;
idciudad: number;
ciudad: string;
codasentamiento: number;
idtipoasentamiento: number;
asentamiento: string;
codtiposvia: number;
idtipovia: number;
via: string;
idtipolocalidad: number;
localidad: string;
cp: string;
nexterior: string;
entrecalle1: string;
entrecalle2: string;
andador: string;
edificio: string;
seccion: string;
entrada: string;
ninterior: string;
telefono: string;
adicional: string;
id_direccion: string;
}

export interface DataActualizacion{
  after_CP: string;
  after_Col: string;
  after_Direccion: string;
  after_Nombre: string;
  after_RFC: string;
  area: string;
  at: string;
  before_CP: string;
  before_Col: string;
  before_Direccion: string;
  before_Nombre: string;
  before_RFC: string;
  cuentaP: string;
  fechaConsulta: string;
  folio: string;
  idpersona: string;
  usuario: string;
  after_cuenta: string;
  before_cuenta: string;
}

@Component({
  selector: 'app-editart-contribuyente',
  templateUrl: './editart-contribuyente.component.html',
  styleUrls: ['./editart-contribuyente.component.css']
})
export class EditartContribuyenteComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/';
    loading = false;
    loadingDocumentos = false;
    httpOptions;
    fisicaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    cuentaFormGroup: FormGroup;
    dataContribuyenteResultado;
    cuentaPredial;
    query;
    idContribuyente;
    idChs;
    panelDomicilio = false;
    panelDomPredial = false;
    panelBienes = false;
    panelDatosRepre = false;
    dataRepresentantes: DataRepresentacion[] = [];
    dataRepresentados: DataRepresentacion[] = [];
    dataActualizacion: DataActualizacion = {} as DataActualizacion;
    contribuyente: DatosContribuyente = {} as DatosContribuyente;
    personaInmueble: PersonaInmueble[] = [];
    dataDocumentos: DocumentosIdentificativos[] = [];
    dataTipoDerecho: DataTipoDerecho[] = [];
    dataDomicilios: DataDomicilio[] = [];
    dataDomicilioEspecifico: DataDomicilio[] = [];
    displayedColumnsDom: string[] = ['tipoDir','direccion', 'editar'];
    displayedColumnsDomInm: string[] = ['radio','direccion'];
    displayedColumnsRepdo: string[] = ['representacion','texto','caducidad','eliminar'];
    displayedColumnsInm: string[] = ['inmueble','direccion','domicilio','descripcion','sujeto'];
    displayedColumnsDataRep: string[] = ['fechaCaducidad','texto','caducidad'];
    loadingDomicilios = false;
    loadingInmuebles = false;
    paginaDom = 1;
    totalDom = 0;
    pageSizeDom = 15;
    dataDomicilioResultado;
    dataSourceDom = [];
    dataPaginateDom;
    endpointActualiza = environment.endpoint + 'registro/';
    endpointSimulacion = environment.endpoint + 'simulacion/';
    isIdentificativo;
    idInmueble;
    idDomicilioFP;
    idDireccionI;
    idPersonaInmueble;
    loadingDireccionEspecifica = false;
    panelRepresentantes = false;
    panelRepresentados = false;
    loadingRepresentante = false;
    loadingRepresentado = false;
    loadingDerecho = false;
    panelPDF = false;
    actualizado = false;
    actualizadoCuenta = false;
    accionDomicilio = false;
    accionDomicilioBoletas = false;
    cambioPersona;
    tipoContribuyente;
    existetipoContribuyente = false;
    actCambioPersona = true;
    isRequired = true;
    selectDisabled = false;
    selectCedula = false;
    selectPasaporte = false;
    selectLicencia = false;
    selectNSS = false;
    selectIdDireccion = true;
    selectIdPersonaI = true;
    mensajeConfirma;
    minDate;
    getSimula = false;
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
        private route: ActivatedRoute,
        private routerL: Router,
        private spinner: NgxSpinnerService,
    ) {
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };
    }

    ngOnInit(): void {
        this.cuentaPredial = '';
        this.fisicaFormGroup = this._formBuilder.group({
            nombre: [null,  []],
            apepaterno: [null, [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            apematerno: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            rfc: [null, []],
            curp: [null, []],
            ine: [null, []],
            idDocIdent: ['', []],
            docIdent: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            fecha_naci: [null, []],
            fecha_def: [null, []],
            celular: [null, [Validators.pattern("^\\w+(\\s+\\w+)*$")]],
            email: ['', [Validators.email, Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            texto: [null, []],
        });

        this.moralFormGroup = this._formBuilder.group({
            nombre_moral: [null, [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            rfc: [null, [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            actPreponderante: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            idTipoPersonaMoral: ['', []],
            fechaInicioOperacion: [null, []],
            idMotivo: ['', []],
            fechaCambio: [null, []],
            texto: [null, []],
        });

        this.cuentaFormGroup = this._formBuilder.group({
            porcentanje: [null, []],
            cuenta: [null, []],
            tipoDerecho: [null, []],
            texto: [null, []],
        });

        this.idContribuyente = this.route.snapshot.paramMap.get('idcontribuyente');
        this.cuentaPredial = this.route.snapshot.paramMap.get('cuenta').toUpperCase();

        this.getTipoDerecho();
        this.getDataDocumentos();
        this.getContribuyenteDatos();
        this.getDomicilioContribuyente();
        this.getRepresentacion();
        this.getRepresentado();
    }

    /** 
     * @param event detecta cuando se presiona una tecla, esta funcion s??lo permite que se tecleen valores alfanum??ricos, los dem??s son bloqueados
     */
     keyPressAlphaNumeric(event) {
        var inp = String.fromCharCode(event.keyCode);
        if (/[a-zA-Z0-9]/.test(inp)) {
            return true;
        } else {
        event.preventDefault();
            return false;
        }
    }

    /**
     * Obtiene el cat??logo del tipo de derecho
     */
    getTipoDerecho(){
        this.loadingDerecho = true;
        this.spinner.show();
        this.http.get(this.endpoint + 'getCatTiposDerecho', this.httpOptions)
            .subscribe(
                (res: any) => {
                    //this.loadingDerecho = false;
                    this.dataTipoDerecho = res;
                    if(this.getSimula){
                        this.getInfoPersonaInmuebleSimula();
                    }else{
                        this.getInfoPersonaInmueble();
                    }
                },
                (error) => {
                    this.loadingDerecho = false;
                    this.spinner.hide();
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'error',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Obtiene la informaci??n del inmueble de la persona
     */
    getInfoPersonaInmueble(){
        this.loadingDerecho = true;
        this.spinner.show();
        let metodo = 'getCasPersonaInmueble';
        let param = 'idPersona=' + this.idContribuyente + '&cuentaCatastral=' + this.cuentaPredial;
        this.http.get(this.endpoint + metodo + '?' + param, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDerecho = false;
                    this.personaInmueble = res;
                    this.spinner.hide();
                },
                (error) => {
                    this.loadingDerecho = false;
                    this.spinner.hide();
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Obtiene la informaci??n del inmueble de la persona
     */
    getInfoPersonaInmuebleSimula(){
        this.spinner.show();
        this.loadingDerecho = true;
        let metodo = 'getCasPersonaInmueble';
        let param = 'idPersona=' + this.idContribuyente + '&cuentaCatastral=' + this.cuentaPredial;
        this.http.get(this.endpointSimulacion + metodo + '?' + param, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loadingDerecho = false;
                    this.personaInmueble = res;
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingDerecho = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Actualiza la informaci??n del inmueble.
     */
    actualizaPersonaInmueble(i,idpersonainmueble){
        this.spinner.show();
        
        this.loadingDerecho = true;
        let varPorcentaje = (this.personaInmueble[i].porcentajeparticipacion) ? this.personaInmueble[i].porcentajeparticipacion : '';
        let queryP = 'idPersona=' + this.idContribuyente + '&codTipoDerecho=' + this.personaInmueble[i].codtipoderecho 
                    + '&porcentajeParticipacion=' + varPorcentaje + '&idPersonaInmueble=' + idpersonainmueble;
        this.http.post(this.endpointSimulacion + 'updatePersonaInmueble' + '?' + queryP, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDerecho = false;
                    if(res == "Actualizado"){
                        Swal.fire(
                            {
                              title: 'CORRECTO',
                              text: "Actualizaci??n correcta",
                              icon: 'success',
                              confirmButtonText: 'Cerrar'
                            }
                        );
                        this.getSimula = true;
                        this.spinner.hide();
                        this.getInfoPersonaInmuebleSimula();
                    }
                    
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingDerecho = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Actualiza la informaci??n del inmueble.
     */
    desasociarCuenta(idpersonainmueble){
        this.spinner.show();
        
        this.loadingDerecho = true;
        let queryP = 'idpersonainmueble=' + idpersonainmueble;
        this.http.post(this.endpointSimulacion + 'borrarAsociaCuentaContrib' + '?' + queryP, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDerecho = false;
                    if(res){
                        this.actualizadoCuenta = true;
                        this.actualizado = false;
                        Swal.fire(
                            {
                              title: 'CORRECTO',
                              text: "Actualizaci??n correcta",
                              icon: 'success',
                              confirmButtonText: 'Cerrar'
                            }
                        );
                        this.spinner.hide();
                        this.getSimula = true;
                        this.getTipoDerecho();
                    }
                    
                },
                (error) => {
                    this.loadingDerecho = false;
                    this.spinner.hide();
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Muestra el dialogo de advertencia para realizar el cambio de tipo de persona.
     * @param event Variable que contiene el valor del tipo de persona actual.
     */
    addCuenta(){
        const dialogRef = this.dialog.open(DialogsAsociarCuenta, {
            width: '800px'
        });
        dialogRef.afterClosed().subscribe(result => {
            
            if(result != false){
                this.asociarCuenta(result);
            }
        });
    }

    asociarCuenta(dataCuenta){
        this.spinner.show();
        this.loadingDerecho = true;
        let queryP = 'idPersona=' + this.idContribuyente + '&region=' + dataCuenta.region + '&manzana=' + dataCuenta.manzana 
                    + '&lote=' + dataCuenta.lote + '&unidadPrivativa=' + dataCuenta.unidad
                    + '&digitoVerificador=' + dataCuenta.digito + '&codtipoderecho=' + dataCuenta.codDerecho + '&porcenparticipacion=' + dataCuenta.porcentaje;
        this.http.post(this.endpointSimulacion + 'insertAsociaCuentaContrib' + '?' + queryP, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.routerL.navigate(['main/editar-contribuyente/' + res]);
                    Swal.fire(
                        {
                          title: 'CORRECTO',
                          text: "Guardado correcto",
                          icon: 'success',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                },
                (error) => {
                    this.loadingDerecho = false;
                    Swal.fire(
                        {
                          title: 'ERROR',
                          text: "Error al asociar.",
                          icon: 'error',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                    this.spinner.hide();
                }
            );
    }

    /**
     * Muestra el dialogo de advertencia para realizar el cambio de tipo de persona.
     * @param event Variable que contiene el valor del tipo de persona actual.
     */
    actualizaPersona(event){
        
        this.actCambioPersona = (event == this.cambioPersona) ? true : false;
        
        const dialogRef = this.dialog.open(DialogsCambiaPersona, {
            width: '700px',
            data: this.actCambioPersona
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result === true){
                this.confirmaCambiaPersona();
            }else{
                this.contribuyente.tipoPersona = this.cambioPersona;
                
                
            }
        });
        
        
    }

    confirmaCambiaPersona(){
        if(this.contribuyente.tipoPersona == 'M'){
            this.contribuyente.nombre_moral = ((this.contribuyente.apepaterno !== null) ? this.contribuyente.apepaterno : '') 
                                                + ' ' + 
                                                ((this.contribuyente.apematerno !== null) ?  this.contribuyente.apematerno : '')
                                                + ' ' + 
                                                ((this.contribuyente.nombre !== null) ? this.contribuyente.nombre : '');
        }
        this.contribuyente.rfc = null;
        this.cambioPersona = this.contribuyente.tipoPersona;
    }

    /**
     *  Si se selecciona alguna opci??n desbloquear?? el input del n??mero del documento.
     * @param event Valor del option
     */
     seleccionaDocto(event){
        this.selectDisabled = true;
        this.selectCedula = false;
        this.selectPasaporte = false;
        this.selectLicencia = false;
        this.selectNSS = false;

        if(this.contribuyente.identificacion == 1){
            this.selectCedula = true;
        }

        if(this.contribuyente.identificacion == 2){
            this.selectPasaporte = true;
        }

        if(this.contribuyente.identificacion == 3){
            this.selectLicencia = true;
        }

        if(this.contribuyente.identificacion == 6){
            this.selectNSS = true;
        }

        this.fisicaFormGroup.markAsTouched();
        this.fisicaFormGroup.updateValueAndValidity();
    }

    /**
     * De acuerdo al campo seleccionado ser?? requerido el RFC, el CURP o ambos.
     */
    changeRequired(): void {
        if((!this.contribuyente.rfc && !this.contribuyente.curp)){????????????????????????
            this.isRequired = true;
        }???????????????????????? else {????????????????????????
            this.isRequired = false;
        }????????????????????????

        this.fisicaFormGroup.markAsTouched();
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
        this.query = '&idPersona=' + this.idContribuyente + '&cuentaCatastral=' + this.cuentaPredial;
        this.spinner.show();
        this.loading = true;
        this.http.get(this.endpoint + 'getInfoContribuyente?' + this.query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.tipoContribuyente = (res.P_N_S) ? res.P_N_S : '';
                    this.existetipoContribuyente = (res.P_N_S) ? true : false;
                    this.dataContribuyenteResultado = res.contribuyente;
                    this.datoDelContribuyente();
                },
                (error) => {
                    this.loading = false;
                    this.spinner.hide();
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /** 
    * Asigna los valores de la consulta a las variables del formulario
    */
    datoDelContribuyente(){
        this.cambioPersona = this.dataContribuyenteResultado[0].CODTIPOPERSONA;
        this.contribuyente.tipoPersona = this.dataContribuyenteResultado[0].CODTIPOPERSONA;
        this.contribuyente.nombre  = this.dataContribuyenteResultado[0].NOMBRE;
        this.contribuyente.nombre_moral  = this.dataContribuyenteResultado[0].APELLIDOPATERNO;
        this.contribuyente.apepaterno = this.dataContribuyenteResultado[0].APELLIDOPATERNO;
        this.contribuyente.apematerno = this.dataContribuyenteResultado[0].APELLIDOMATERNO;
        this.contribuyente.rfc = this.dataContribuyenteResultado[0].RFC;
        this.contribuyente.curp = this.dataContribuyenteResultado[0].CURP;
        this.contribuyente.ine = this.dataContribuyenteResultado[0].CLAVEIFE;
        this.contribuyente.identificacion = this.dataContribuyenteResultado[0].IDDOCIDENTIF;
        this.contribuyente.idedato = this.dataContribuyenteResultado[0].VALDOCIDENTIF;
        this.contribuyente.fecha_naci = (this.dataContribuyenteResultado[0].FECHANACIMIENTO) ? new Date(this.dataContribuyenteResultado[0].FECHANACIMIENTO) : null;
        this.contribuyente.fecha_def = (this.dataContribuyenteResultado[0].FECHADEFUNCION) ? new Date(this.dataContribuyenteResultado[0].FECHADEFUNCION) : null;
        this.contribuyente.celular = this.dataContribuyenteResultado[0].CELULAR;
        this.contribuyente.email = this.dataContribuyenteResultado[0].EMAIL;
        this.contribuyente.actPreponderante = this.dataContribuyenteResultado[0].ACTIVPRINCIP;
        this.contribuyente.idTipoPersonaMoral = this.dataContribuyenteResultado[0].IDTIPOMORAL;
        this.contribuyente.fechaInicioOperacion = (this.dataContribuyenteResultado[0].FECHAINICIOACTIV) ? new Date(this.dataContribuyenteResultado[0].FECHAINICIOACTIV) : null;
        this.contribuyente.idMotivo = this.dataContribuyenteResultado[0].IDMOTIVOSMORAL;
        this.contribuyente.fechaCambio = (this.dataContribuyenteResultado[0].FECHACAMBIOSITUACION) ? new Date(this.dataContribuyenteResultado[0].FECHACAMBIOSITUACION) : null;
        this.contribuyente.texto = this.dataContribuyenteResultado[0].OBSERVACION;

        this.minDate = (moment(this.contribuyente.fecha_naci).add(2, 'd').format('YYYY-MM-DD'));
        this.changeRequired();
        this.spinner.hide();
    }

    /**
     * Validaci??n para las fechas, fecha defunci??n no puede ser menor a la de nacimiento.
     */
    fechaTope(){
        this.fisicaFormGroup.controls['fecha_def'].setValue(null);
        this.minDate = moment(this.fisicaFormGroup.controls['fecha_naci'].value).add(2, 'd').format('YYYY-MM-DD');  
    }

    /** 
    * Actualiza los datos del contribuyente
    */
    actualizarContribuyente(){
        let query = '';
        this.loading = true;
        this.actualizado = false;
        this.spinner.show();
        query = (this.contribuyente.tipoPersona) ? query + '&codtipospersona=' + this.contribuyente.tipoPersona : query + '&codtipospersona=';
        query = (this.contribuyente.nombre) ? query + '&nombre=' + this.contribuyente.nombre.toLocaleUpperCase().trim() : query + '&nombre=';
        query = (this.contribuyente.idTipoPersonaMoral) ? query + '&idtipomoral=' + this.contribuyente.idTipoPersonaMoral : query + '&idtipomoral=';
        query = (this.contribuyente.idMotivo) ? query + '&idmotivosmoral=' + this.contribuyente.idMotivo : query + '&idmotivosmoral=';
        query = (this.contribuyente.fechaInicioOperacion) ? query + '&fechainicioactiv=' + moment(this.contribuyente.fechaInicioOperacion).format('DD-MM-YYYY') : query + '&fechainicioactiv=';
        query = (this.contribuyente.fechaCambio) ? query + '&fechacambiosituacion=' + moment(this.contribuyente.fechaCambio).format('DD-MM-YYYY') : query + '&fechacambiosituacion=';
        query = (this.contribuyente.rfc) ? query + '&rfc=' + this.contribuyente.rfc.toLocaleUpperCase().trim() : query + '&rfc=';
        // query = (this.contribuyente.apepaterno) ? query + '&apellidopaterno=' + this.contribuyente.apepaterno : query + '&apellidopaterno=';
        query = (this.contribuyente.apematerno) ? query + '&apellidomaterno=' + this.contribuyente.apematerno.toLocaleUpperCase().trim() : query + '&apellidomaterno=';
        query = (this.contribuyente.curp) ? query + '&curp=' + this.contribuyente.curp.toLocaleUpperCase().trim() : query + '&curp=';
        query = (this.contribuyente.ine) ? query + '&claveife=' + this.contribuyente.ine.toLocaleUpperCase().trim() : query + '&claveife=';
        query = (this.contribuyente.identificacion) ? query + '&iddocidentif=' + this.contribuyente.identificacion : query + '&iddocidentif=';
        query = (this.contribuyente.idedato) ? query + '&valdocidentif=' + this.contribuyente.idedato : query + '&valdocidentif=';
        query = (this.contribuyente.fecha_naci) ? query + '&fechanacimiento=' + moment(this.contribuyente.fecha_naci).format('DD-MM-YYYY') : query + '&fechanacimiento=';
        query = (this.contribuyente.fecha_def) ? query + '&fechadefuncion=' + moment(this.contribuyente.fecha_def).format('DD-MM-YYYY') : query + '&fechadefuncion=';
        query = (this.contribuyente.celular) ? query + '&celular=' + this.contribuyente.celular : query + '&celular=';
        query = (this.contribuyente.email) ? query + '&email=' + this.contribuyente.email : query + '&email=';
        query = (this.contribuyente.actPreponderante) ? query + '&activprincip=' + this.contribuyente.actPreponderante : query + '&activprincip=';
        query = (this.contribuyente.texto) ? query + '&observacion=' + this.contribuyente.texto.toLocaleUpperCase().trim() : query + '&observacion=';

        if(this.contribuyente.tipoPersona === 'F'){
            query = (this.contribuyente.apepaterno) ? query + '&apellidopaterno=' + this.contribuyente.apepaterno.toLocaleUpperCase().trim() : query + '&apellidopaterno=';
        } else {
            query = (this.contribuyente.nombre_moral) ? query + '&apellidopaterno=' + this.contribuyente.nombre_moral.toLocaleUpperCase().trim() : query + '&apellidopaterno=';
        }

        query = query + '&idExpediente&idPersona='  + this.idContribuyente;

        this.http.post(this.endpointSimulacion + 'insertarContribuyente' + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.spinner.hide();
                        // this.dataActualizacion.after_CP = res.after_CP;
                        // this.dataActualizacion.after_Col = res.after_Col;
                        // this.dataActualizacion.after_Direccion = res.after_Direccion;
                        // this.dataActualizacion.after_Nombre = res.after_Nombre;
                        // this.dataActualizacion.after_RFC = res.after_RFC;
                        // this.dataActualizacion.after_cuenta = res.after_cuenta;
                        // this.dataActualizacion.area = res.area;
                        // this.dataActualizacion.at = res.at;
                        // this.dataActualizacion.before_cuenta = res.before_cuenta;
                        // this.dataActualizacion.before_CP = res.before_CP;
                        // this.dataActualizacion.before_Col = res.before_Col;
                        // this.dataActualizacion.before_Direccion = res.before_Direccion;
                        // this.dataActualizacion.before_Nombre = res.before_Nombre;
                        // this.dataActualizacion.before_RFC = res.before_RFC;
                        // this.dataActualizacion.cuentaP = res.cuentaP;
                        // this.dataActualizacion.fechaConsulta = res.fechaConsulta;
                        // this.dataActualizacion.folio = res.folio;
                        // this.dataActualizacion.idpersona = res.idpersona;
                        // this.dataActualizacion.usuario = res.usuario;
                        this.routerL.navigate(['main/editar-contribuyente/' + res]); 
                        this.actualizado = true;
                        this.actualizadoCuenta = false;
                        this.accionDomicilio = false;
                        this.accionDomicilioBoletas = false;

                    Swal.fire(
                        {
                          title: 'CORRECTO',
                          text: "Guardado correcto",
                          icon: 'success',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                },
                (error) => {
                    this.loading = false;
                    this.spinner.hide();
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /** 
    * Abre el dialogo que mostrarr?? un mensaje de confirmaci??n seg??n sea el caso
    * @param evento Es el parametro que recibe el m??todo para elegir en el switch que acci??n realizar.
    * @param element Pude ser un solo dato o un array dependiendo el metodo del swtich.
    * @param tipo Utilizado en el m??todo de eliminarRepresentaci??n para diferenciar entre un representante o representado
    * con valor de 1 y 2 respectivamente.
    */
    confirmaCambio(evento = null, element = null, tipo = null): void {
        this.mensajeConfirma = evento;
        const dialogRef = this.dialog.open(DialogConfirmacionComponent, {
            width: '700px',
            data: this.mensajeConfirma
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                switch (this.mensajeConfirma) {
                    case 1:
                        this.cambiarTipoPersona();                        
                        break;
                    case 4:
                        this.eliminarRepresentacion(element,tipo);
                        break;
                    case 5:
                        this.desasociarCuenta(element);
                        break;
                    case 7:
                        this.actualizaPersonaInmueble(element,tipo);
                        break;
                    case 8:
                        this.actualizarContribuyente();
                        break;
                    default:
                        break;
                }
            }
        });
    }
    
    /**
     * Cambia el tipo de persona de F??sca a Moral o viceversa.
     */
    cambiarTipoPersona(){

        let query = 'idpersona=' + this.idContribuyente;
        this.loading = true;
        this.actualizado = false;
        this.spinner.show();
        query = (this.contribuyente.tipoPersona) ? query + '&codtipospersona=' + this.contribuyente.tipoPersona : query + '&codtipospersona=';

        if(this.contribuyente.tipoPersona === 'F'){
            query = (this.contribuyente.apepaterno) ? query + '&apellidopaterno=' + this.contribuyente.apepaterno.toLocaleUpperCase().trim() : query + '&apellidopaterno=';
            query = (this.contribuyente.apematerno) ? query + '&apellidomaterno=' + this.contribuyente.apematerno.toLocaleUpperCase().trim() : query + '&apellidomaterno=';
            query = (this.contribuyente.nombre) ? query + '&nombreF=' + this.contribuyente.nombre.toLocaleUpperCase().trim() : query + '&nombreF=';
            query = (this.contribuyente.rfc) ? query + '&rfcF=' + this.contribuyente.rfc.toLocaleUpperCase().trim() : query + '&rfcF=';
        } else {
            query = (this.contribuyente.nombre_moral) ? query + '&nombreM=' + this.contribuyente.nombre_moral.toLocaleUpperCase().trim() : query + '&nombreM=';
            query = (this.contribuyente.rfc) ? query + '&rfcM=' + this.contribuyente.rfc.toLocaleUpperCase().trim() : query + '&rfcM=';
        }

        query = (this.contribuyente.curp) ? query + '&curp=' + this.contribuyente.curp.toLocaleUpperCase().trim() : query + '&curp=';
        query = (this.contribuyente.ine) ? query + '&claveife=' + this.contribuyente.ine.toLocaleUpperCase().trim() : query + '&claveife=';
        query = (this.contribuyente.identificacion) ? query + '&iddocidentif=' + this.contribuyente.identificacion : query + '&iddocidentif=';
        query = (this.contribuyente.idedato) ? query + '&valdocidentif=' + this.contribuyente.idedato.toLocaleUpperCase().trim() : query + '&valdocidentif=';
        query = (this.contribuyente.fecha_naci) ? query + '&fechanacimiento=' + moment(this.contribuyente.fecha_naci).format('DD-MM-YYYY') : query + '&fechanacimiento=';
        query = (this.contribuyente.fecha_def) ? query + '&fechadefuncion=' + moment(this.contribuyente.fecha_def).format('DD-MM-YYYY') : query + '&fechadefuncion=';
        query = (this.contribuyente.celular) ? query + '&celular=' + this.contribuyente.celular : query + '&celular=';
        query = (this.contribuyente.email) ? query + '&email=' + this.contribuyente.email : query + '&email=';

        query = (this.contribuyente.actPreponderante) ? query + '&activprincip=' + this.contribuyente.actPreponderante.toLocaleUpperCase().trim() : query + '&activprincip=';
        query = (this.contribuyente.idTipoPersonaMoral) ? query + '&idtipomoral=' + this.contribuyente.idTipoPersonaMoral : query + '&idtipomoral=';
        query = (this.contribuyente.idMotivo) ? query + '&idmotivosmoral=' + this.contribuyente.idMotivo : query + '&idmotivosmoral=';
        query = (this.contribuyente.fechaInicioOperacion) ? query + '&fechainicioactiv=' + moment(this.contribuyente.fechaInicioOperacion).format('DD-MM-YYYY') : query + '&fechainicioactiv=';
        query = (this.contribuyente.fechaCambio) ? query + '&fechacambiosituacion=' + moment(this.contribuyente.fechaCambio).format('DD-MM-YYYY') : query + '&fechacambiosituacion=';
        query = (this.contribuyente.fechaCambio) ? query + '&fechacambiosituacion=' + moment(this.contribuyente.fechaCambio).format('DD-MM-YYYY') : query + '&fechacambiosituacion=';
        query = query + '&idPersona=' + this.idContribuyente;
        //query = (this.contribuyente.texto) ? query + '&observacion=' + this.contribuyente.texto : query + '&observacion=';
        //cambioTipoPersona?idpersona=4493942&apellidopaterno=Palacios&apellidomaterno=Garcia&nombreF=Telesforo&rfcF=PAGT830626AE0&curp&claveife=&iddocidentif&valdocidentif&fechanacimiento=26-06-1983&fechadefuncion
        //&codtipospersona=M&nombreM=Telesforo Palacios Garcia&activprincipM&idtipomoral&idmotivosmoral&fechainicioactiv&fechacambiosituacion&rfcM=GEC8501014I5&celular&email=
        this.http.post(this.endpointSimulacion + 'cambioTipoPersona' + '?' + query, '', this.httpOptions)
        .subscribe(
            (res: any) => {
                this.loading = false;
                if(res){
                    this.routerL.navigate(['main/editar-contribuyente/' + res]);

                    this.actualizado = true;
                    this.accionDomicilio = false;
                    this.accionDomicilioBoletas = false;
                    this.actCambioPersona = true;
                    Swal.fire(
                        {
                          title: 'CORRECTO',
                          text: "Guardado correcto",
                          icon: 'success',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }else{
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: "Se ha presentado un problema intente m??s tarde",
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            },
            (error) => {
                this.loading = false;
                this.spinner.hide();
                Swal.fire(
                    {
                      title: 'SIN RESULTADO',
                      text: error.error.mensaje,
                      icon: 'warning',
                      confirmButtonText: 'Cerrar'
                    }
                );
            }
        );
    }

    /**
     * Obtiene los domicilios registrados de la sociedad domicilios particulares y para recibir notificaciones.
     */
     getDomicilioContribuyente(){
        this.loadingDomicilios = true;
        this.loadingInmuebles = true;
        this.spinner.show();
        let metodo = 'getDireccionesContribuyente';
        this.http.get(this.endpointActualiza + metodo + '?idPersona='+ this.idContribuyente, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDomicilios = false;
                    this.spinner.hide();
                    //this.dataSource1 = res.filter(element => element.CODTIPOSDIRECCION !== "N");
                    this.dataSource1 = res;
                    this.dataSource2 = res;
                    this.total1 = this.dataSource1.length;
                    this.total2 = this.dataSource2.length;
                    this.dataPaginate1 = this.paginate(this.dataSource1, 15, this.pagina1);
                    this.dataPaginate2 = this.paginate(this.dataSource2, 15, this.pagina2);
                    this.getidInmuebles();
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingDomicilios = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Obtiene los domicilios registrados de la simulaci??nde la sociedad domicilios particulares y para recibir notificaciones.
     */
    getDomicilioContribuyenteSimula(){
        this.spinner.show();
        
        this.loadingDomicilios = true;
        this.loadingInmuebles = true;
        let metodo = 'getDireccionesContribuyente';
        this.http.get(this.endpointSimulacion + metodo + '?idPersona='+ this.idContribuyente, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loadingDomicilios = false;
                    this.dataSource1 = res;
                    this.dataSource2 = res;
                    this.total1 = this.dataSource1.length;
                    this.total2 = this.dataSource2.length;
                    this.dataPaginate1 = this.paginate(this.dataSource1, 15, this.pagina1);
                    this.dataPaginate2 = this.paginate(this.dataSource2, 15, this.pagina2);
                    this.getidInmueblesSimula();
                },
                (error) => {
                    this.spinner.hide();
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
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
     paginado1(evt): void{
        this.pagina1 = evt.pageIndex + 1;
        this.dataPaginate1 = this.paginate(this.dataSource1, 15, this.pagina1);
    }

    /**
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
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
        this.loadingInmuebles = true;
        this.spinner.show();
        let metodoI = 'getInmuebles';
        let paramI = 'idPersona=' + this.idContribuyente + '&cuentaCatastral=' + this.cuentaPredial;
        this.http.get(this.endpoint + metodoI + '?' + paramI, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingInmuebles = false;
                    this.spinner.hide();
                    this.dataSource3 = res;
                    this.dataPaginate3 = this.paginate(this.dataSource3, 15, this.pagina3);
                    this.total3 = this.dataSource3.length; 
                    this.paginator.pageIndex = 0;
                },
                (error) => {
                    this.loadingInmuebles = false;
                    this.spinner.hide();
                    Swal.fire(
                        {
                          title: 'ERROR',
                          text: error.error.mensaje,
                          icon: 'error',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    getidInmueblesSimula(){
        this.spinner.show();
        this.loadingInmuebles = true;
        let metodoI = 'getInmuebles';
        let paramI = 'idPersona=' + this.idContribuyente + '&cuentaCatastral=' + this.cuentaPredial;
        this.http.get(this.endpointSimulacion + metodoI + '?' + paramI, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loadingInmuebles = false;
                    this.dataSource3 = res;
                    this.dataPaginate3 = this.paginate(this.dataSource3, 15, this.pagina3);
                    this.total3 = this.dataSource3.length; 
                    this.paginator.pageIndex = 0;
                },
                (error) => {
                    this.spinner.hide();
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
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado3(evt): void{
        this.pagina3 = evt.pageIndex + 1;
        this.dataPaginate3 = this.paginate(this.dataSource3, 15, this.pagina3);
    }

    /**
     * Almacena la variable con el id seleccionado en la tabla. 
     * @param direccionID Variable con el valor del id de la direcci??n
     */
    setIdDireccion(direccionID){
        this.idDireccionI = direccionID;
        this.selectIdDireccion = false;
    }

    /**
     * Almacena las variables del inmueble seleccionado para insertar o actualizar la informaci??n del inmuble.
     * @param inmueblePersonaID Variable con el valor del id del inmueblePersona.
     * @param domicilioFPId Variable con el valor de id del domicilio fiscal predial.
     */
    setIdInmueble(inmueblePersonaID,domicilioFPId){
        this.idPersonaInmueble = inmueblePersonaID;
        this.idDomicilioFP = domicilioFPId;
        this.selectIdPersonaI = false;
    }

    verificaDomicilioInmueble(){
        if(this.idDomicilioFP){
            this.actualizaDomicilioInmueble();
            
        }else{
            this.insertaDomicilioInmueble();
            
        }
    }
    
    /**
     * Inserta la nueva direcci??n fiscal del inmuble.
     */
    insertaDomicilioInmueble(){
        this.loadingDomicilios = true;
        this.loadingInmuebles = true;
        this.spinner.show();
        let queryDPI = 'idPersona=' + this.idContribuyente + '&idDireccion=' + this.idDireccionI + '&idPersonaInmueble=' + this.idPersonaInmueble;
        this.http.post(this.endpointSimulacion + 'InsertarInmuebleDomicilioFiscal' + '?' + queryDPI, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    if(res.length > 0){
                        this.getDomicilioContribuyenteSimula();
                        this.selectIdPersonaI = true;
                        this.snackBar.open('Actualizaci??n correcta', 'Cerrar', {
                            duration: 10000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                    }else{
                        this.snackBar.open('No se pudo registrar intente nuevamente', 'Cerrar', {
                            duration: 10000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                    }
                    this.loadingDomicilios = false;
                    this.loadingInmuebles = false;
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingDomicilios = false;
                    this.loadingInmuebles = false;
                    Swal.fire(
                        {
                          title: 'ERROR',
                          text: error.error.mensaje,
                          icon: 'error',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Inserta la nueva direcci??n fiscal del inmuble.
     */
    actualizaDomicilioInmueble(){
        Swal.fire(
            {
              title: '??ATENCI??N!',
              text: "El inmueble ya cuenta con una direcci??n registrada.",
              icon: 'warning',
              confirmButtonText: 'Cerrar'
            }
        );
    }

    /**
     * @param iddireccion obtiene la direccion especifica con el id que recibe
     */
    getDireccionEspecifica(iddireccion){
        this.loadingDireccionEspecifica = true;
        let metodo = 'getDireccionById';
        this.spinner.show();
        this.http.get(this.endpointActualiza + metodo + '?idDireccion='+ iddireccion, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loadingDireccionEspecifica = false;
                    this.dataDomicilioEspecifico = res;
                    this.editDomicilio(this.dataDomicilioEspecifico);
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingDireccionEspecifica = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginate(array, page_size, page_number) {
      return array.slice((page_number - 1) * page_size, page_number * page_size);
    }


    /**
     * Abre el dialogo que registrara un nuevo domicilio
     */
    addDomicilio(i = -1, dataDomicilio = null): void {
        let codtiposdireccion = '';
        const dialogRef = this.dialog.open(DialogDomicilioContribuyenteT, {
            width: '700px',
            data: {dataDomicilio:dataDomicilio, idContribuyente: this.idContribuyente, codtiposdireccion: codtiposdireccion},
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.accionDomicilio = true;
                this.accionDomicilioBoletas = false;
                this.actualizado = false;
                this.loadingDomicilios = true;
                setTimeout (() => {
                    this.getDomicilioContribuyenteSimula();
                }, 1500);
            }
            
        });
    }

    /**
     * Abre el dialogo que registrara un nuevo domicilio con notificaci??n
     */
    addDomicilioBoleta(i = -1, dataDomicilio = null): void {
        let codtiposdireccion = 'N';
        const dialogRef = this.dialog.open(DialogDomicilioContribuyenteT, {
            width: '700px',
            data: {dataDomicilio:dataDomicilio, idContribuyente: this.idContribuyente, codtiposdireccion: codtiposdireccion},
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.accionDomicilio = false;
                this.accionDomicilioBoletas = true;
                this.actualizado = false;
                this.loadingDomicilios = true;
                setTimeout (() => {
                    this.getDomicilioContribuyente();
                }, 1500);
            }
            
        });
    }

    /**
     * Recibe el id direcci??n que enviar?? al dialog para realizar la b??squeda del domicilio.
     * @param dataDomicilioEspecifico Valor que se enviar?? para la obtenci??n del registro a editar.
     */
    editDomicilio(dataDomicilioEspecifico): void {
        const dialogRef = this.dialog.open(DialogDomicilioContribuyenteT, {
            width: '700px',
            data: {dataDomicilioEspecifico:dataDomicilioEspecifico, idContribuyente: this.idContribuyente},
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.dataActualizacion.after_CP = result.after_CP;
                this.dataActualizacion.after_Col = result.after_Col;
                this.dataActualizacion.after_Direccion = result.after_Direccion;
                this.dataActualizacion.after_Nombre = result.after_Nombre;
                this.dataActualizacion.after_RFC = result.after_RFC;
                this.dataActualizacion.area = result.area;
                this.dataActualizacion.at = result.at;
                this.dataActualizacion.before_CP = result.before_CP;
                this.dataActualizacion.before_Col = result.before_Col;
                this.dataActualizacion.before_Direccion = result.before_Direccion;
                this.dataActualizacion.before_Nombre = result.before_Nombre;
                this.dataActualizacion.before_RFC = result.before_RFC;
                this.dataActualizacion.cuentaP = result.cuentaP;
                this.dataActualizacion.fechaConsulta = result.fechaConsulta;
                this.dataActualizacion.folio = result.folio;
                this.dataActualizacion.idpersona = result.idpersona;
                this.dataActualizacion.usuario = result.usuario;
                
                this.accionDomicilio = true;
                this.accionDomicilioBoletas = false;
                this.actualizado = false;
                this.loadingDomicilios = true;
                setTimeout (() => {
                    this.getDomicilioContribuyenteSimula();
                }, 1500);
            }
        });
    }

    /**
     * Recibe el id direcci??n que enviar?? al dialog para realizar la b??squeda del domicilio.
     * @param dataDomicilioEspecifico Valor que se enviar?? para la obtenci??n del registro a editar.
     */
    editDomicilioBoleta(dataDomicilioEspecifico): void {
        let codtiposdireccion = 'N';
        const dialogRef = this.dialog.open(DialogDomicilioContribuyenteT, {
            width: '700px',
            data: {dataDomicilioEspecifico:dataDomicilioEspecifico, idContribuyente: this.idContribuyente, codtiposdireccion: codtiposdireccion},
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){

                this.dataActualizacion.after_CP = result.after_CP;
                this.dataActualizacion.after_Col = result.after_Col;
                this.dataActualizacion.after_Direccion = result.after_Direccion;
                this.dataActualizacion.after_Nombre = result.after_Nombre;
                this.dataActualizacion.after_RFC = result.after_RFC;
                this.dataActualizacion.area = result.area;
                this.dataActualizacion.at = result.at;
                this.dataActualizacion.before_CP = result.before_CP;
                this.dataActualizacion.before_Col = result.before_Col;
                this.dataActualizacion.before_Direccion = result.before_Direccion;
                this.dataActualizacion.before_Nombre = result.before_Nombre;
                this.dataActualizacion.before_RFC = result.before_RFC;
                this.dataActualizacion.cuentaP = result.cuentaP;
                this.dataActualizacion.fechaConsulta = result.fechaConsulta;
                this.dataActualizacion.folio = result.folio;
                this.dataActualizacion.idpersona = result.idpersona;
                this.dataActualizacion.usuario = result.usuario;
                
                this.accionDomicilio = false;
                this.accionDomicilioBoletas = true;
                this.actualizado = false;
            
            }
            setTimeout (() => {
                this.getDomicilioContribuyente();
            }, 1500);
        });
    }

    /**
     * @param idDireccion Valor que se enviar?? para la obtenci??n de los movimientos sobre ese domicilio
     */
    viewHistoricoDomicilio(idDireccion): void {
        const dialogRef = this.dialog.open(DialogDomicilioHistoricoContribuyenteT, {
            width: '700px',
            data: {idDireccion},
        });
        dialogRef.afterClosed().subscribe(result => {
                // this.getNotarioDirecciones();
        });
    }

    /**
     * @param idPersona Valor que se enviar?? para la obtenci??n de los movimientos sobre esa persona
     */
    viewHistoricoDatosPersonales(idPersona): void {
        const dialogRef = this.dialog.open(DialogPersonalesHistoricoContribuyenteT, {
            width: '700px',
            data: {idPersona},
        });
        dialogRef.afterClosed().subscribe(result => {
                // this.getNotarioDirecciones();
        });
    }

    /**
     * Abre el dialogo para relizar el registro de la representaci??n o edici??n de la misma.
     * @param dataRepresentante Arreglo de los datos de la representaci??n seleccionada
     */
    addRepresentante(i = -1, dataRepresentante = null): void {
        const dialogRef = this.dialog.open(DialogRepresentacionCT, {
            width: '700px',
            data: {dataRepresentante : dataRepresentante,
                    datosPerito : this.contribuyente,
                    idPerito : this.idContribuyente
            },
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.loadingRepresentante = true;
                setTimeout (() => {
                    this.getRepresentacion();
                }, 1000);
            }
        });
    }

    /**
     * Abre el dialogo para relizar el registro de la representaci??n o edici??n de la misma.
     * @param dataRepresentante Arreglo de los datos de la representaci??n seleccionada
     */
    addRepresentado(i = -1, dataRepresentante = null): void {
        const dialogRef = this.dialog.open(DialogRepresentadoCT, {
            width: '700px',
            data: {dataRepresentante : dataRepresentante,
                    datosPerito: this.contribuyente,
                    idPerito : this.idContribuyente
            },
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                setTimeout (() => {
                    this.loadingRepresentado = true;
                    this.getRepresentado();
                }, 2000);
            }
        });
    }

    /**
     * Elimina la representaci??n seleccionada
     * @param element Datos de la representaci??n a eliminar
     * @param tipo Valor del tipo de representaci??n de acuerdo al valor seleccionara el m??todo correspondiente.
     */
    eliminarRepresentacion(element,tipo){
        this.loadingRepresentante = true;
        this.loadingRepresentado = true;
        this.spinner.show();
        let queryDelRep = 'idRepresentacion=' + element.IDREPRESENTACION + '&idPersona=' + this.idContribuyente;
        
        this.http.post(this.endpointSimulacion + 'deleteRepresentacion?' + queryDelRep, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    
                    if(res){
                        if(tipo == 1){
                            this.loadingRepresentado = false;
                            this.getRepresentacionSimula();
                        }else{
                            this.loadingRepresentante = false;
                            this.getRepresentadoSimula();
                        }
                        Swal.fire(
                            {
                              title: 'CORRECTO',
                              text: "Se ha eliminado la representaci??n",
                              icon: 'success',
                              confirmButtonText: 'Cerrar'
                            }
                        );
                    }else{
                        Swal.fire(
                            {
                              title: 'ERROR',
                              text: "Ocurrio un error al eliminar, intentelo nuevamente",
                              icon: 'error',
                              confirmButtonText: 'Cerrar'
                            }
                        );
                    }
                },
                (error) => {
                    Swal.fire(
                        {
                          title: 'ERROR',
                          text: error.error.mensaje,
                          icon: 'error',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Obtiene las representaci??nes del contribuyente
     */
    getRepresentacion(){
        this.loadingRepresentante = true;
        this.spinner.show();
        let queryRep = 'rep=Representantes&idPersona=' + this.idContribuyente;
        this.http.get(this.endpointActualiza + 'getRepresentacionContribuyente?' + queryRep, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingRepresentante = false;
                    this.dataSource4 = res;
                    this.total4 = this.dataSource4.length;
                    this.dataPaginate4 = this.paginate(this.dataSource4, 15, this.pagina4);
                    this.spinner.hide();
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingRepresentante = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Obtiene las representaci??nes simuladas del contribuyente
     */
     getRepresentacionSimula(){
        this.spinner.show();
        this.loadingRepresentante = true;
        let queryRep = 'rep=Representantes&idPersona=' + this.idContribuyente;
        this.http.get(this.endpointSimulacion + 'getRepresentacionContribuyente?' + queryRep, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loadingRepresentante = false;
                    this.dataSource4 = res;
                    this.total4 = this.dataSource4.length;
                    this.dataPaginate4 = this.paginate(this.dataSource4, 15, this.pagina4);
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingRepresentante = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado4(evt): void{
        this.pagina4 = evt.pageIndex + 1;
        this.dataPaginate4 = this.paginate(this.dataSource4, 15, this.pagina4);
    }

    /**
     * Obtienen los representados de la sociedad.
     */
    getRepresentado(){
        this.loadingRepresentado = true;
        this.spinner.show();
        let queryRepdo = 'rep=Representado&idPersona=' + this.idContribuyente;
        this.http.get(this.endpointActualiza + 'getRepresentacionContribuyente?' + queryRepdo, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingRepresentado = false;
                    this.dataSource5 = res;
                    this.total5 = this.dataSource5.length;
                    this.dataPaginate5 = this.paginate(this.dataSource5, 15, this.pagina5);
                    this.spinner.hide();
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingRepresentado = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Obtienen los representados de la sociedad.
     */
     getRepresentadoSimula(){
        this.loadingRepresentado = true;
        this.spinner.show();
        let queryRepdo = 'rep=Representado&idPersona=' + this.idContribuyente;
        
        this.http.get(this.endpointSimulacion + 'getRepresentacionContribuyente?' + queryRepdo, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loadingRepresentado = false;
                    this.dataSource5 = res;
                    this.total5 = this.dataSource5.length;
                    this.dataPaginate5 = this.paginate(this.dataSource5, 15, this.pagina5);
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingRepresentado = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado5(evt): void{
        this.pagina5 = evt.pageIndex + 1;
        this.dataPaginate5 = this.paginate(this.dataSource5, 15, this.pagina5);
    }

    /**
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
     paginado6(evt): void{
        this.pagina6 = evt.pageIndex + 1;
        this.dataPaginate4 = this.paginate(this.dataSource4, 15, this.pagina6);
    }

    /**
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
     paginado7(evt): void{
        this.pagina7 = evt.pageIndex + 1;
        this.dataPaginate5 = this.paginate(this.dataSource5, 15, this.pagina7);
    }

    /**
     * Abre el dialogo que nos mostrar?? el historial de las representaciones.
     */
    historialRepresentacion(){
        const dialogRef = this.dialog.open(DialogHistorialRepCT, {
            width: '700px',
            data: this.idContribuyente,
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                setTimeout (() => {
                    
                }, 1000);
            }
        });
    }
}

///////////////DOMICILIO////////////////
export interface DataMovimientoDomicilio {
    after_CP: string;
    after_Col: string;
    after_Direccion: string;
    after_Nombre: string;
    after_RFC: string;
    area: string;
    at: string;
    before_CP: string;
    before_Col: string;
    before_Direccion: string;
    before_Nombre: string;
    before_RFC: string;
    cuentaP: string;
    fechaConsulta: string;
    folio: string;
    idpersona: string;
    usuario: string;
}

@Component({
  selector: 'app-dialog-domicilio-contribuyente',
  templateUrl: 'app-dialog-domicilio-contribuyente.html',
  styleUrls: ['./editart-contribuyente.component.css']
})
export class DialogDomicilioContribuyenteT {
  endpointCatalogos = environment.endpoint + 'registro/';
  endpointSimulacion = environment.endpoint + 'simulacion/';
  //loadingTiposDireccion = false;
  loadingEstados = false;
  loadingMunicipios = false;
  loadingTiposAsentamiento = false;
  loadingTiposVia = false;
  loadingTiposLocalidad = false;
  httpOptions;
  tiposDireccion;
  estados;
  municipios;
  tiposAsentamiento;
  tiposVia;
  tiposLocalidad;
  optionCiudad;
  codtiposdireccion;
  idestadoNg = '9';
  idmunicipioNg
  idmunicipio2Ng
  municipioNg
  idciudadNg
  ciudadNg
  codasentamientoNg
  asentamientoNg
  idtipoasentamientoNg
  cpNg
  codtiposviaNg
  idtipoviaNg
  viaNg
  idtipolocalidadNg
  nexteriorNg
  entrecalle1Ng
  entrecalle2Ng
  andadorNg
  edificioNg
  seccionNg
  entradaNg
  ninteriorNg
  telefonoNg
  adicionalNg
  botonAsentamiento = true;
  botonCiudad = true;
  botonMunicipio = true;
  botonVia = true;
  buscaMunicipios;
  domicilioFormGroup: FormGroup;
  dataDomicilio: DataDomicilio = {} as DataDomicilio;
  dataDomicilioEspecifico: DataDomicilio = {} as DataDomicilio;
  dataMovimientoDomicilio: DataMovimientoDomicilio = {} as DataMovimientoDomicilio;
  loadingDireccionEspecifica = false;
  iddomicilio;
  iddireccion;
  idPersonaT;
  blockButtons = true;
  lafinal: DataMovimientoDomicilio[] = [];

    constructor(
        private auth: AuthService,
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private spinner: NgxSpinnerService,
        public dialogRef: MatDialogRef<DialogDomicilioContribuyenteT>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any) {
            dialogRef.disableClose = true;
            this.httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: this.auth.getSession().token
                })
            };

            this.iddireccion = data.dataDomicilioEspecifico;
            this.codtiposdireccion = data.codtiposdireccion;
            this.dataDomicilio = {} as DataDomicilio;
            this.dataDomicilioEspecifico = {} as DataDomicilio;
            this.getDataEstados();
            this.getDataTiposAsentamiento();
            this.getDataTiposVia();
            this.getDataTiposLocalidad();
            
            this.domicilioFormGroup = this._formBuilder.group({
                //idtipodireccion: ['', Validators.required],
                idestado: ['', Validators.required],
                delegacion: [null],
                municipio: [null, Validators.required],
                idciudad: [null],
                ciudad: [null, Validators.required],
                codasentamiento: [null, Validators.required],
                asentamiento: [null, Validators.required],
                idtipoasentamiento: [null],
                codtiposvia: [null],
                idtipovia: ['', Validators.required],
                via: [null, Validators.required],
                idtipolocalidad: [null],
                cp: [null],
                nexterior: [null, [Validators.required, Validators.pattern("^\\w+(\\s+\\w+)*$")]],
                entrecalle1: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
                entrecalle2: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
                andador: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
                edificio: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
                seccion: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
                entrada: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
                ninterior: [null, [Validators.pattern("^\\w+(\\s+\\w+)*$")]],
                telefono: [null, [Validators.pattern("^\\w+(\\s+\\w+)*$")]],
                adicional: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
                id_direccion: [null]
            });
    
            this.domicilioFormGroup.controls.idestado.valueChanges.subscribe(idestado => {
                if(idestado == 9) {
                    this.domicilioFormGroup.removeControl('municipio');
                    this.domicilioFormGroup.removeControl('idciudad');
                    this.domicilioFormGroup.removeControl('ciudad');
                    this.domicilioFormGroup.addControl('idmunicipio', new FormControl('', Validators.required));
                    this.domicilioFormGroup.removeControl('idmunicipio2');
                } else {
                    this.domicilioFormGroup.removeControl('idmunicipio');
                    this.domicilioFormGroup.addControl('municipio', new FormControl(null, Validators.required));
                    this.domicilioFormGroup.addControl('idciudad', new FormControl(null, Validators.required));
                    this.domicilioFormGroup.addControl('ciudad', new FormControl(null, Validators.required));
                    this.domicilioFormGroup.addControl('idmunicipio2', new FormControl('', Validators.required));
                }
                this.domicilioFormGroup.updateValueAndValidity();
            });
    

            if(data.dataDomicilioEspecifico){
                this.loadingDireccionEspecifica = true;
                this.idPersonaT = data.idContribuyente;
                setTimeout(() => {
                    this.getDireccionEspecifica();
                }, 5000);
            }
        }
  
    /** 
     * Realiza la b??squeda del domicilio por el id Direcci??n
     * */  
    getDireccionEspecifica(){
        this.spinner.show();
        let metodo = 'getDireccionById';
        let param = 'idDireccion='+ this.iddireccion + '&idPersona=' + this.idPersonaT;
        this.http.get(this.endpointSimulacion + metodo + '?' + param, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDireccionEspecifica = false;
                    this.dataDomicilioEspecifico = res;
                    setTimeout(() => {
                        this.setDataDomicilio(this.dataDomicilioEspecifico);    
                    }, 500);
                    
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingDireccionEspecifica = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Obtiene el nombre de acuerdo al valor seleccionado en el select.
     * @param event Obtiene el valor y nombre de la etiqueta option en el select
     */
    getNombreDel(event): void {
        this.domicilioFormGroup.controls['codasentamiento'].setValue('');
        this.domicilioFormGroup.controls['asentamiento'].setValue('');
        this.domicilioFormGroup.controls['idtipoasentamiento'].setValue('');
        this.domicilioFormGroup.controls['cp'].setValue('');
        this.domicilioFormGroup.controls['idtipovia'].setValue('');
        this.domicilioFormGroup.controls['via'].setValue('');
        this.domicilioFormGroup.controls['codtiposvia'].setValue('');

        this.dataDomicilio.delegacion = event.source.triggerValue;
        this.botonAsentamiento = false;
    }

    /**
     * Obtiene el cat??logo de estados de la rep??blica mexicana. 
     */
    getDataEstados(): void {
        this.spinner.show();
        this.loadingEstados = true;
        this.http.get(this.endpointCatalogos + 'getEstados', this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.loadingEstados = false;
                this.estados = res;
                this.getAlcaldia();
            },
            (error) => {
                this.spinner.hide();
                this.loadingEstados = false;
            }
        );
    }

    /**
     * Obtiene el cat??logo de la alcaldia.
     */
     getAlcaldia(){
        this.spinner.show();
        let busquedaMunCol = 'getDelegaciones';
        this.loadingMunicipios = true;
        this.http.get(this.endpointCatalogos + busquedaMunCol, this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.loadingMunicipios = false;
                this.municipios = res;
            },
            (error) => {
                this.spinner.hide();
                this.loadingMunicipios = false;
            }
        );
    }

    /**
     * Obtiene los municipios de acuerdo al estado seleccionado
     * @param event Valor que se recibe para la obtenci??n de las alcaldias o municipios.
     */
     getDataMunicipios(event): void {
        this.spinner.show();
        if(event.value != 9){
            this.domicilioFormGroup.controls['idmunicipio2'].setValue('');
            this.domicilioFormGroup.controls['municipio'].setValue('');
            this.domicilioFormGroup.controls['idciudad'].setValue('');
            this.domicilioFormGroup.controls['ciudad'].setValue('');
            
        }

        this.domicilioFormGroup.controls['codasentamiento'].setValue('');
        this.domicilioFormGroup.controls['asentamiento'].setValue('');
        this.domicilioFormGroup.controls['idtipoasentamiento'].setValue('');
        this.domicilioFormGroup.controls['cp'].setValue('');
        this.domicilioFormGroup.controls['idtipovia'].setValue('');
        this.domicilioFormGroup.controls['via'].setValue('');
        this.domicilioFormGroup.controls['codtiposvia'].setValue('');
        
        
        this.botonMunicipio = false;
        let busquedaMunCol = '';
        busquedaMunCol = (event.value == 9) ? 'getDelegaciones' : 'getMunicipiosByEstado?codEstado=' + event.value;
        this.loadingMunicipios = true;
        this.http.get(this.endpointCatalogos + busquedaMunCol, this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.loadingMunicipios = false;
                this.municipios = res;
            },
            (error) => {
                this.spinner.hide();
                this.loadingMunicipios = false;
            }
        );
    }
    
    /**
     * Obtiene el cat??logo de los asentamientos.
     */
    getDataTiposAsentamiento(): void {
        this.loadingTiposAsentamiento = true;
        this.spinner.show();
        this.http.get(this.endpointCatalogos + 'getTiposAsentamiento', this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.loadingTiposAsentamiento = false;
                this.tiposAsentamiento = res;
            },
            (error) => {
                this.spinner.hide();
                this.loadingTiposAsentamiento = false;
            }
        );
    }

    /**
     * Obtiene el cat??logo de las v??as
     */
    getDataTiposVia(): void {
        this.loadingTiposVia = true;
        this.spinner.show();
        this.http.get(this.endpointCatalogos + 'getTiposVia', this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.loadingTiposVia = false;
                this.tiposVia = res;
            },
            (error) => {
                this.spinner.hide();
                this.loadingTiposVia = false;
            }
        );
    }

    /**
     * Obtiene el cat??logo de los tipos de localidad
     */
    getDataTiposLocalidad(): void {
        this.loadingTiposLocalidad = true;
        this.spinner.show();
        this.http.get(this.endpointCatalogos + 'getTiposLocalidad', this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.loadingTiposLocalidad = false;
                this.tiposLocalidad = res;
            },
            (error) => {
                this.spinner.hide();
                this.loadingTiposLocalidad = false;
            }
        );
    }

    /**
     * Almacena los datos del formulario del domicilio y de acuerdo al valor inserta o actualiza
     */
    getDataDomicilio(): void {
        this.spinner.show();
        this.loadingEstados = true;
        this.blockButtons = false;
        //this.dataDomicilio.idtipodireccion = this.domicilioFormGroup.value.idtipodireccion;
        this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
        this.dataDomicilio.codasentamiento = this.domicilioFormGroup.value.codasentamiento;
        this.dataDomicilio.idtipoasentamiento = this.domicilioFormGroup.value.idtipoasentamiento;
        this.dataDomicilio.asentamiento = (this.domicilioFormGroup.value.asentamiento) ? this.domicilioFormGroup.value.asentamiento : null;
        this.dataDomicilio.codtiposvia = (this.domicilioFormGroup.value.codtiposvia) ? this.domicilioFormGroup.value.codtiposvia : null;
        this.dataDomicilio.idtipovia = this.domicilioFormGroup.value.idtipovia;
        this.dataDomicilio.via = (this.domicilioFormGroup.value.via) ? this.domicilioFormGroup.value.via : null;
        this.dataDomicilio.idtipolocalidad = this.domicilioFormGroup.value.idtipolocalidad;
        this.dataDomicilio.cp = (this.domicilioFormGroup.value.cp) ? this.domicilioFormGroup.value.cp : null;
        this.dataDomicilio.nexterior = (this.domicilioFormGroup.value.nexterior) ? this.domicilioFormGroup.value.nexterior : null;
        this.dataDomicilio.entrecalle1 = (this.domicilioFormGroup.value.entrecalle1) ? this.domicilioFormGroup.value.entrecalle1 : null;
        this.dataDomicilio.entrecalle2 = (this.domicilioFormGroup.value.entrecalle2) ? this.domicilioFormGroup.value.entrecalle2 : null;
        this.dataDomicilio.andador = (this.domicilioFormGroup.value.andador) ? this.domicilioFormGroup.value.andador : null;
        this.dataDomicilio.edificio = (this.domicilioFormGroup.value.edificio) ? this.domicilioFormGroup.value.edificio : null;
        this.dataDomicilio.seccion = (this.domicilioFormGroup.value.seccion) ? this.domicilioFormGroup.value.seccion : null;
        this.dataDomicilio.entrada = (this.domicilioFormGroup.value.entrada) ? this.domicilioFormGroup.value.entrada : null;
        this.dataDomicilio.ninterior = (this.domicilioFormGroup.value.ninterior) ? this.domicilioFormGroup.value.ninterior : null;
        this.dataDomicilio.telefono = (this.domicilioFormGroup.value.telefono) ? this.domicilioFormGroup.value.telefono : null;
        this.dataDomicilio.adicional = (this.domicilioFormGroup.value.adicional) ? this.domicilioFormGroup.value.adicional : null;

        this.dataDomicilio.id_direccion = (this.domicilioFormGroup.value.id_direccion) ? this.domicilioFormGroup.value.id_direccion : null;
        
        if(this.domicilioFormGroup.value.idestado == 9){
            this.dataDomicilio.idmunicipio = this.domicilioFormGroup.value.idmunicipio;
        } else {
            this.dataDomicilio.idmunicipio2 = this.domicilioFormGroup.value.idmunicipio2;
            this.dataDomicilio.municipio = (this.domicilioFormGroup.value.municipio) ? this.domicilioFormGroup.value.municipio : null;
            this.dataDomicilio.ciudad = (this.domicilioFormGroup.value.ciudad) ? this.domicilioFormGroup.value.ciudad : null;
            this.dataDomicilio.idciudad = (this.domicilioFormGroup.value.idciudad) ? this.domicilioFormGroup.value.idciudad : null;
        }

            if(this.domicilioFormGroup.value.id_direccion == null){
                this.guardaDomicilio();
            } else{
                this.actualizarDomicilio();
            }
    }
      
    /**
     * Guarda el registro del nuevo domicilio.
     */
    guardaDomicilio(){
      
        let query = 'insertarDireccion?idPersona=' + this.data.idContribuyente;

        query = (this.dataDomicilio.codtiposvia) ? query + '&codtiposvia=' + this.dataDomicilio.codtiposvia : query + '&codtiposvia=';
        query = (this.dataDomicilio.idtipovia) ? query + '&idvia=' + this.dataDomicilio.idtipovia : query + '&idvia=';
        query = (this.dataDomicilio.via) ? query + '&via=' + this.dataDomicilio.via : query + '&via=';
        query = (this.dataDomicilio.nexterior) ? query + '&numeroexterior=' + this.dataDomicilio.nexterior.trim() : query + '&numeroexterior=';
        query = (this.dataDomicilio.entrecalle1) ? query + '&entrecalle1='  + this.dataDomicilio.entrecalle1.toLocaleUpperCase().trim() : query + '&entrecalle1';
        query = (this.dataDomicilio.entrecalle2) ? query + '&entrecalle2='  + this.dataDomicilio.entrecalle2.toLocaleUpperCase().trim() : query + '&entrecalle2';
        query = (this.dataDomicilio.andador) ? query + '&andador=' + this.dataDomicilio.andador.toLocaleUpperCase().trim() : query + '&andador';
        query = (this.dataDomicilio.edificio) ? query + '&edificio=' + this.dataDomicilio.edificio.toLocaleUpperCase().trim() : query + '&edificio';
        query = (this.dataDomicilio.seccion) ? query + '&seccion=' + this.dataDomicilio.seccion.toLocaleUpperCase().trim() : query + '&seccion=';
        query = (this.dataDomicilio.entrada) ? query + '&entrada=' + this.dataDomicilio.entrada.toLocaleUpperCase().trim() : query + '&entrada=';
        query = (this.dataDomicilio.idtipolocalidad) ? query + '&codtiposlocalidad=' + this.dataDomicilio.idtipolocalidad : query + '&codtiposlocalidad=';
        query = (this.dataDomicilio.idtipoasentamiento) ? query + '&codtiposasentamiento=' + this.dataDomicilio.idtipoasentamiento : query + '&codtiposasentamiento=';
        query = (this.dataDomicilio.codasentamiento) ? query + '&idcolonia=' + this.dataDomicilio.codasentamiento : query + '&idcolonia=';
        query = (this.dataDomicilio.codasentamiento) ? query + '&codasentamiento=' + this.dataDomicilio.codasentamiento : query + '&codasentamiento=';
        query = (this.dataDomicilio.asentamiento) ? query + '&colonia=' + this.dataDomicilio.asentamiento : query + '&colonia=';
        query = (this.dataDomicilio.cp) ? query + '&codigopostal=' + this.dataDomicilio.cp : query + '&codigopostal=';
        query = (this.dataDomicilio.idciudad) ? query + '&codciudad=' + this.dataDomicilio.idciudad : query + '&codciudad=';
        query = (this.dataDomicilio.ciudad) ? query + '&ciudad=' + this.dataDomicilio.ciudad : query + '&ciudad=';
        query = (this.dataDomicilio.idmunicipio) ? query + '&iddelegacion=' + this.dataDomicilio.idmunicipio : query + '&iddelegacion';
        query = (this.dataDomicilio.idmunicipio2) ? query + '&codmunicipio=' + this.dataDomicilio.idmunicipio2 : query + '&codmunicipio=';
        query = (this.dataDomicilio.idestado == 9) ? query + '&delegacion=' + this.dataDomicilio.delegacion : query + '&delegacion=' + this.dataDomicilio.municipio;
        query = (this.dataDomicilio.telefono) ? query + '&telefono=' + this.dataDomicilio.telefono.trim() : query + '&telefono=';
        query = (this.dataDomicilio.idestado) ? query + '&codestado=' + this.dataDomicilio.idestado : query + '&codestado=';
        query = (this.codtiposdireccion) ? query + '&codtiposdireccion=' + this.codtiposdireccion : query + '&codtiposdireccion=';
        query = (this.dataDomicilio.adicional) ? query + '&indicacionesadicionales=' + this.dataDomicilio.adicional.toLocaleUpperCase().trim() : query + '&indicacionesadicionales=';
        query = (this.dataDomicilio.ninterior) ? query + '&numerointerior=' + this.dataDomicilio.ninterior.trim() : query + '&numerointerior=';
      
        this.http.post(this.endpointSimulacion + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.dialogRef.close(1);
                    this.loadingEstados = false;
                    Swal.fire(
                        {
                          title: 'CORRECTO',
                          text: "Registro exitoso",
                          icon: 'success',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                    this.spinner.hide();
                },
                (error) => {
                    this.spinner.hide();
                    this.dialogRef.close();
                    Swal.fire(
                        {
                          title: 'ERROR',
                          text: error.error.mensaje,
                          icon: 'error',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Actualiza el domicilio seleccionado.
     */
    actualizarDomicilio(){
        
        let query = 'actualizarDireccion?idPersona=' + this.data.idContribuyente + '&idDireccion=' + this.iddireccion;

        query = (this.dataDomicilio.codtiposvia) ? query + '&codtiposvia=' + this.dataDomicilio.codtiposvia : query + '&codtiposvia=';
        query = (this.dataDomicilio.idtipovia) ? query + '&idvia=' + this.dataDomicilio.idtipovia : query + '&idvia=';
        query = (this.dataDomicilio.via) ? query + '&via=' + this.dataDomicilio.via : query + '&via=';
        query = (this.dataDomicilio.nexterior) ? query + '&numeroexterior=' + this.dataDomicilio.nexterior.toLocaleUpperCase() : query + '&numeroexterior=';
        query = (this.dataDomicilio.entrecalle1) ? query + '&entrecalle1='  + this.dataDomicilio.entrecalle1.toLocaleUpperCase() : query + '&entrecalle1';
        query = (this.dataDomicilio.entrecalle2) ? query + '&entrecalle2='  + this.dataDomicilio.entrecalle2.toLocaleUpperCase() : query + '&entrecalle2';
        query = (this.dataDomicilio.andador) ? query + '&andador=' + this.dataDomicilio.andador.toLocaleUpperCase() : query + '&andador';
        query = (this.dataDomicilio.edificio) ? query + '&edificio=' + this.dataDomicilio.edificio.toLocaleUpperCase() : query + '&edificio';
        query = (this.dataDomicilio.seccion) ? query + '&seccion=' + this.dataDomicilio.seccion.toLocaleUpperCase() : query + '&seccion=';
        query = (this.dataDomicilio.entrada) ? query + '&entrada=' + this.dataDomicilio.entrada.toLocaleUpperCase() : query + '&entrada=';
        query = (this.dataDomicilio.idtipolocalidad) ? query + '&codtiposlocalidad=' + this.dataDomicilio.idtipolocalidad : query + '&codtiposlocalidad=';
        query = (this.dataDomicilio.idtipoasentamiento) ? query + '&codtiposasentamiento=' + this.dataDomicilio.idtipoasentamiento : query + '&codtiposasentamiento=';
        query = (this.dataDomicilio.codasentamiento) ? query + '&idcolonia=' + this.dataDomicilio.codasentamiento : query + '&idcolonia=';
        query = (this.dataDomicilio.codasentamiento) ? query + '&codasentamiento=' + this.dataDomicilio.codasentamiento : query + '&codasentamiento=';
        query = (this.dataDomicilio.asentamiento) ? query + '&colonia=' + this.dataDomicilio.asentamiento : query + '&colonia=';
        query = (this.dataDomicilio.cp) ? query + '&codigopostal=' + this.dataDomicilio.cp : query + '&codigopostal=';
        query = (this.dataDomicilio.idciudad) ? query + '&codciudad=' + this.dataDomicilio.idciudad : query + '&codciudad=';
        query = (this.dataDomicilio.ciudad) ? query + '&ciudad=' + this.dataDomicilio.ciudad : query + '&ciudad=';
        query = (this.dataDomicilio.idmunicipio) ? query + '&iddelegacion=' + this.dataDomicilio.idmunicipio : query + '&iddelegacion';
        query = (this.dataDomicilio.idmunicipio2) ? query + '&codmunicipio=' + this.dataDomicilio.idmunicipio2 : query + '&codmunicipio=';
        query = (this.dataDomicilio.idestado == 9) ? query + '&delegacion=' + this.dataDomicilio.delegacion : query + '&delegacion=' + this.dataDomicilio.municipio;
        query = (this.dataDomicilio.telefono) ? query + '&telefono=' + this.dataDomicilio.telefono : query + '&telefono=';
        query = (this.dataDomicilio.idestado) ? query + '&codestado=' + this.dataDomicilio.idestado : query + '&codestado=';
        query = (this.codtiposdireccion) ? query + '&codtiposdireccion=' + this.codtiposdireccion : query + '&codtiposdireccion=';
        query = (this.dataDomicilio.adicional) ? query + '&indicacionesadicionales=' + this.dataDomicilio.adicional.toLocaleUpperCase() : query + '&indicacionesadicionales=';
        query = (this.dataDomicilio.ninterior) ? query + '&numerointerior=' + this.dataDomicilio.ninterior.toLocaleUpperCase() : query + '&numerointerior=';
    
        this.http.post(this.endpointSimulacion + query, '', this.httpOptions)
            .subscribe(
            
                (res: any) => {
                    this.dataMovimientoDomicilio.after_CP = res.after_CP;
                    this.dataMovimientoDomicilio.after_Col = res.after_Col;
                    this.dataMovimientoDomicilio.after_Direccion = res.after_Direccion;
                    this.dataMovimientoDomicilio.after_Nombre = res.after_Nombre;
                    this.dataMovimientoDomicilio.after_RFC = res.after_RFC;
                    this.dataMovimientoDomicilio.area = res.area;
                    this.dataMovimientoDomicilio.at = res.at;
                    this.dataMovimientoDomicilio.before_CP = res.before_CP;
                    this.dataMovimientoDomicilio.before_Col = res.before_Col;
                    this.dataMovimientoDomicilio.before_Direccion = res.before_Direccion;
                    this.dataMovimientoDomicilio.before_Nombre = res.before_Nombre;
                    this.dataMovimientoDomicilio.before_RFC = res.before_RFC;
                    this.dataMovimientoDomicilio.cuentaP = res.cuentaP;
                    this.dataMovimientoDomicilio.fechaConsulta = res.fechaConsulta;
                    this.dataMovimientoDomicilio.folio = res.folio;
                    this.dataMovimientoDomicilio.idpersona = res.idpersona;
                    this.dataMovimientoDomicilio.usuario = res.usuario;

                    Swal.fire(
                        {
                          title: 'CORRECTO',
                          text: "Actualizaci??n Correcta",
                          icon: 'success',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                    this.dialogRef.close(this.dataMovimientoDomicilio);
                    this.loadingEstados = false;
                    this.spinner.hide();
                },
                (error) => {
                    this.spinner.hide();
                    this.dialogRef.close();
                    Swal.fire(
                        {
                          title: 'ERROR',
                          text: error.error.mensaje,
                          icon: 'error',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Recibe los datos del domicilio previamente seleccionado para su edici??n
     * @param data Arreglo con los datos del registro seleccionado.
     */
    setDataDomicilio(data): void {
        this.domicilioFormGroup.controls['idestado'].setValue(data.CODESTADO);
        this.domicilioFormGroup.updateValueAndValidity();
        this.getDataMunicipios({value: this.domicilioFormGroup.value.idestado});
        this.domicilioFormGroup.controls['codasentamiento'].setValue(data.IDCOLONIA);
        this.domicilioFormGroup.controls['idtipoasentamiento'].setValue(data.CODTIPOSASENTAMIENTO);
        this.domicilioFormGroup.controls['asentamiento'].setValue(data.COLONIA);
        this.domicilioFormGroup.controls['codtiposvia'].setValue(data.CODTIPOSVIA);
        this.domicilioFormGroup.controls['idtipovia'].setValue(data.IDVIA);
        this.domicilioFormGroup.controls['via'].setValue(data.VIA);
        this.domicilioFormGroup.controls['idtipolocalidad'].setValue(data.CODTIPOSLOCALIDAD);
        this.domicilioFormGroup.controls['cp'].setValue(data.CODIGOPOSTAL);
        this.domicilioFormGroup.controls['nexterior'].setValue(data.NUMEROEXTERIOR);
        this.domicilioFormGroup.controls['entrecalle1'].setValue(data.ENTRECALLE1);
        this.domicilioFormGroup.controls['entrecalle2'].setValue(data.ENTRECALLE2);
        this.domicilioFormGroup.controls['andador'].setValue(data.ANDADOR);
        this.domicilioFormGroup.controls['edificio'].setValue(data.EDIFICIO);
        this.domicilioFormGroup.controls['seccion'].setValue(data.SECCION);
        this.domicilioFormGroup.controls['entrada'].setValue(data.ENTRADA);
        this.domicilioFormGroup.controls['ninterior'].setValue(data.NUMEROINTERIOR);
        this.domicilioFormGroup.controls['telefono'].setValue(data.TELEFONO);
        this.domicilioFormGroup.controls['adicional'].setValue(data.INDICACIONESADICIONALES);
        this.domicilioFormGroup.controls['id_direccion'].setValue(data.IDDIRECCION);
        
        setTimeout(() => {
            if(data.CODESTADO == 9){
                this.domicilioFormGroup.controls['idmunicipio'].setValue(data.IDDELEGACION);
            } else {
                this.domicilioFormGroup.controls['idmunicipio2'].setValue(data.CODMUNICIPIO);
                this.domicilioFormGroup.controls['municipio'].setValue(data.DELEGACION);
                this.domicilioFormGroup.controls['ciudad'].setValue(data.CIUDAD);
                this.domicilioFormGroup.controls['idciudad'].setValue(data.CODCIUDAD);
            }
        }, 500);
        this.dataDomicilio.delegacion = data.DELEGACION;
    }

    /**
     * Abre el dialogo que muestra los municipios de acuerdo al estado,
     * con opci??n para b??squeda especifica.
     */
    getMunicipios(){
        this.domicilioFormGroup.controls['idciudad'].setValue('');
        this.domicilioFormGroup.controls['ciudad'].setValue('');
        this.domicilioFormGroup.controls['codasentamiento'].setValue('');
        this.domicilioFormGroup.controls['asentamiento'].setValue('');
        this.domicilioFormGroup.controls['idtipoasentamiento'].setValue('');
        this.domicilioFormGroup.controls['cp'].setValue('');
        this.domicilioFormGroup.controls['idtipovia'].setValue('');
        this.domicilioFormGroup.controls['via'].setValue('');
        this.domicilioFormGroup.controls['codtiposvia'].setValue('');

        this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
        const dialogRef = this.dialog.open(DialogMunicipiosContribuyenteT, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.domicilioFormGroup.controls['idmunicipio2'].setValue(result.codmunicipio);
                this.domicilioFormGroup.controls['municipio'].setValue(result.municipio);
                this.botonCiudad = false;
            }
        });
    }

    /**
     * Abre el dialogo que muestra las localidades (ciudades) ligadas al municipio seleccionado previamente,
     * con opci??n a b??squeda especifica.
     */
    getCiudad(){
        this.domicilioFormGroup.controls['codasentamiento'].setValue('');
        this.domicilioFormGroup.controls['asentamiento'].setValue('');
        this.domicilioFormGroup.controls['idtipoasentamiento'].setValue('');
        this.domicilioFormGroup.controls['cp'].setValue('');
        this.domicilioFormGroup.controls['idtipovia'].setValue('');
        this.domicilioFormGroup.controls['via'].setValue('');
        this.domicilioFormGroup.controls['codtiposvia'].setValue('');

        this.dataDomicilio.idmunicipio2 = this.domicilioFormGroup.value.idmunicipio2;
        const dialogRef = this.dialog.open(DialogCiudadContribuyenteT, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado,
                    codMunicipio : this.dataDomicilio.idmunicipio2
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.botonAsentamiento = false;
                this.domicilioFormGroup.controls['idciudad'].setValue(result.codciudad);
                this.domicilioFormGroup.controls['ciudad'].setValue(result.ciudad);
            }
        });
    }

    /**
     * Abre el dialogo que muestra los asentamientos ligados a la ciudad
     */
    getAsentamiento(){
        this.domicilioFormGroup.controls['cp'].setValue('');
        this.domicilioFormGroup.controls['idtipovia'].setValue('');
        this.domicilioFormGroup.controls['via'].setValue('');
        this.domicilioFormGroup.controls['codtiposvia'].setValue('');

        this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
        this.dataDomicilio.idmunicipio = this.domicilioFormGroup.value.idmunicipio;
        this.dataDomicilio.idmunicipio2 = this.domicilioFormGroup.value.idmunicipio2;
        this.dataDomicilio.idciudad = (this.domicilioFormGroup.value.idciudad) ? this.domicilioFormGroup.value.idciudad : null;
        const dialogRef = this.dialog.open(DialogAsentamientoContribuyenteT, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado,
                    codMunicipio : this.dataDomicilio.idmunicipio,
                    codMunicipio2 : this.dataDomicilio.idmunicipio2,
                    codCiudad : this.dataDomicilio.idciudad
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.botonVia = false;
                this.domicilioFormGroup.controls['codasentamiento'].setValue(result.codasentamiento);
                this.domicilioFormGroup.controls['asentamiento'].setValue(result.asentamiento);
                this.domicilioFormGroup.controls['idtipoasentamiento'].setValue(result.codtiposasentamiento);
                this.domicilioFormGroup.controls['cp'].setValue(result.codigopostal);
            }
        });
    }

    /**
     * Abre el dialogo que muestra las v??as ligadas al asentamiento
     */
    getVia(){
        this.dataDomicilio.codasentamiento =  this.domicilioFormGroup.value.codasentamiento;
        const dialogRef = this.dialog.open(DialogViaContribuyenteT, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado,
                    codAsentamiento : this.dataDomicilio.codasentamiento
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.domicilioFormGroup.controls['codtiposvia'].setValue(result.codtiposvia);
                this.domicilioFormGroup.controls['idtipovia'].setValue(result.idvia);
                this.domicilioFormGroup.controls['via'].setValue(result.via);
            }
        });
    }
}

///////////////MUNICIPIOS//////////////////
export interface DataMunicipios{
    codmunicipio: number;
    codestado: number;
    municipio: string;
  }
  @Component({
    selector: 'app-dialog-municipios-contribuyente',
    templateUrl: 'app-dialog-municipios-contribuyente.html',
    styleUrls: ['./editart-contribuyente.component.css']
  })
  export class DialogMunicipiosContribuyenteT {
    endpoint = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['coloniaAsentamiento', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    optionColonia;
    loadingBuscaMun = false;
    dataSource = [];
    dataPaginate;
    httpOptions;
    buscaMunicipios;
    dataMunicipios: DataMunicipios = {} as DataMunicipios;
    @ViewChild('paginator') paginator: MatPaginator;
  
    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private spinner: NgxSpinnerService,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogMunicipiosContribuyenteT>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        dialogRef.disableClose = true;
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };
        this.obtenerMunicipios();
    }
  
      /**
       * Limpia los registros de la b??squeda especifica realizada y llama al metodo para obtener todos los municipios
       */
      cleanMunicipio(){
          this.pagina = 1;
          this.total = 0;
          this.dataSource = [];
          this.loadingBuscaMun = false;
          this.dataPaginate;
          this.buscaMunicipios = null;
          this.obtenerMunicipios();
      }
  
      /**
       * Obtiene los municipios de acuerdo al estado seleccionado.
       */
    obtenerMunicipios(){
        this.loadingBuscaMun = true;
        let criterio = '';
        let query = '';
        this.spinner.show();
        if(this.data.codEstado != 9){
            criterio = criterio + 'getMunicipiosByEstado';
            query = query + 'codEstado=' + this.data.codEstado;
        }else{
            criterio = '';
            query = '';
        }
  
        this.loadingBuscaMun = true;
        this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loadingBuscaMun = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingBuscaMun = false;
                }
            );
    }
  
      /**
       * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
       * @param evt Nos da la referencia de la pagina en la que se encuentra
       */
      paginado(evt): void{
          this.pagina = evt.pageIndex + 1;
          this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
      }
    
    /**
     * 
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por p??gina.
     * @param page_number Valor de la p??gina en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    /**
     * Se almacena los datos del municipio seleccionado que se motraran en el formulario.
     * @param element Arreglo de los datos del municipio seleccionado
     */
    selectMunicipios(element){

        this.dataMunicipios.codestado = element.CODESTADO;
        this.dataMunicipios.codmunicipio = element.CODMUNICIPIO;
        this.dataMunicipios.municipio = element.MUNICIPIO;
    }

    /**
     * Obtiene el municipio deseado por el criterio del nombre.
     */
    obtenerMunicipiosPorNombre(){
        this.spinner.show();
        this.loadingBuscaMun = true;
        let criterio = '';
        let query = '';

        if(this.data.codEstado != 9){
            criterio = criterio + 'getMunicipiosByNombre';
            query = query + 'codEstado=' + this.data.codEstado + '&municipio=' + this.buscaMunicipios;
        }else{
            criterio = '';
            query = '';
        }

        
        this.loadingBuscaMun = true;
        this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loadingBuscaMun = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingBuscaMun = false;
                }
            );
    }
}

///////////////CIUDAD//////////////////
export interface DataCiudad{
    codciudad: number;
    codestado: number;
    ciudad: string;
  }
  @Component({
    selector: 'app-dialog-ciudad-contribuyente',
    templateUrl: 'app-dialog-ciudad-contribuyente.html',
    styleUrls: ['./editart-contribuyente.component.css']
  })
  export class DialogCiudadContribuyenteT {
    endpoint = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['ciudad', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    optionColonia;
    loadingBuscaCiudad = false;
    dataSource = [];
    dataPaginate;
    httpOptions;
    buscaCiudad;
    dataCiudad: DataCiudad = {} as DataCiudad;
    @ViewChild('paginator') paginator: MatPaginator;
  
    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private spinner: NgxSpinnerService,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogCiudadContribuyenteT>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        dialogRef.disableClose = true;
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };
        this.obtenerCiudad();
        
    }
  
      /**
       * Limpia la b??squeda especifica realizada y llama al m??todo que obtiene todos los registros previamente mostrados.
       */
      cleanCiudad(){
          this.pagina = 1;
          this.total = 0;
          this.dataSource = [];
          this.loadingBuscaCiudad = false;
          this.dataPaginate;
          this.buscaCiudad = null;
          this.obtenerCiudad();
      }
  
        /**
         * Obtiene las localidades de acuerdo al estado y municipio seleccionado previamente.
         */
        obtenerCiudad(){
            this.spinner.show();
            this.loadingBuscaCiudad = true;
            let criterio = '';
            let query = '';
    
            if(this.data.codEstado != 9){
                criterio = criterio + 'getCiudadesByNombre';
                query = query + 'codEstado=' + this.data.codEstado + '&codMunicipio=' + this.data.codMunicipio;
            }else{
                criterio = '';
                query = '';
            }
    
            if(this.buscaCiudad){
                query = query + '&nombre=' + this.buscaCiudad;
            }
    
            
            this.loadingBuscaCiudad = true;
            this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
                .subscribe(
                    (res: any) => {
                        this.spinner.hide();
                        this.loadingBuscaCiudad = false;
                        this.dataSource = res;
                        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                        this.total = this.dataSource.length; 
                        this.paginator.pageIndex = 0;
                        
                    },
                    (error) => {
                        this.spinner.hide();
                        this.loadingBuscaCiudad = false;
                    }
                );
        }
  
      /**
       * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
       * @param evt Nos da la referencia de la pagina en la que se encuentra
       */
      paginado(evt): void{
          this.pagina = evt.pageIndex + 1;
          this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
      }
    
      /**
       * Regresa la posici??n del paginado de acuerdo a los par??metro enviados
       * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
       * @param page_size Valor de la cantidad de registros que se pintaran por p??gina.
       * @param page_number Valor de la p??gina en la cual se encuentra el paginado.
       * @returns 
       */
      paginate(array, page_size, page_number) {
          return array.slice((page_number - 1) * page_size, page_number * page_size);
      }
  
      /**
       * Obtiene el arreglo de la ciudad seleccionada y almacena los datos para utilizarlos en el registro del domicilio.
       * @param element Arreglo de los datos del registro seleccionado
       */
      selectCiudad(element){
          this.dataCiudad.ciudad = element.CIUDAD;
          this.dataCiudad.codciudad = element.CODCIUDAD;
          this.dataCiudad.codestado = element.CODESTADO;
      }
  
    // obtenerAsentamientoPorNombre(){
    //     this.loadingBuscaCiudad = true;
    //     let criterio = '';
    //     let query = '';
  
    //     if(this.data.codEstado != 9){
    //         criterio = criterio + 'getMunicipiosByEstado';
    //         query = query + 'codEstado=' + this.data.codEstado;
    //     }else{
    //         criterio = '';
    //         query = '';
    //     }
  

    //     this.loadingBuscaCiudad = true;
    //     this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
    //         .subscribe(
    //             (res: any) => {
    //                 this.loadingBuscaCiudad = false;
    //                 this.dataSource = res;
    //                 this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    //                 this.total = this.dataSource.length; 
    //                 this.paginator.pageIndex = 0;

    //             },
    //             (error) => {
    //                 this.loadingBuscaCiudad = false;
    //             }
    //         );
    // }
}

///////////////ASENTAMIENTO//////////////////
export interface DataAsentamiento{
    codasentamiento: string;
    asentamiento: string;
    codigopostal: string;
    codtiposasentamiento: string;
  }
  @Component({
    selector: 'app-dialog-asentamiento-contribuyente',
    templateUrl: 'app-dialog-asentamiento-contribuyente.html',
    styleUrls: ['./editart-contribuyente.component.css']
  })
  export class DialogAsentamientoContribuyenteT {
    endpoint = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['coloniaAsentamiento', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    optionColonia;
    loading = false;
    dataSource = [];
    dataPaginate;
    httpOptions;
    buscaAsentamiento;
    dataAsentamiento: DataAsentamiento = {} as DataAsentamiento;
    @ViewChild('paginator') paginator: MatPaginator;
  
    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private spinner: NgxSpinnerService,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogAsentamientoContribuyenteT>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        dialogRef.disableClose = true;
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };
        this.obtenerAsentamiento();
    }
  
      /**
       * Limpia la b??squeda especifica realizada y llama al m??todo que obtiene todos los registros previamente mostrados.
       */
      cleanAsentamiento(){
          this.pagina = 1;
          this.total = 0;
          this.dataSource = [];
          this.loading = false;
          this.dataPaginate;
          this.buscaAsentamiento = null;
          this.obtenerAsentamiento();
      }
  
    /**
     * Obtiene el asenteamiento de acuerdo al estado, municipio o ciudad.
     */
    obtenerAsentamiento(){
        this.spinner.show();
        this.loading = true;
        let criterio = '';
        let query = '';

        if(this.data.codEstado == 9){
            criterio = criterio + 'getColAsentByDelegacion';
            query = query + 'idDelegacion=' + this.data.codMunicipio;
        }else{
            criterio = criterio + 'getAsentamientoByEstado';
            query = 'codEstado=' + this.data.codEstado + '&codMunicipio=' + this.data.codMunicipio2;
            query = (this.data.codCiudad) ? query + '&codCiudad=' + this.data.codCiudad : query + '&codCiudad=';
        }

        this.loading = true;
        this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                },
                (error) => {
                    this.spinner.hide();
                    this.loading = false;
                }
            );
    }

    /**
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    /**
     * Regresa la posici??n del paginado de acuerdo a los par??metro enviados
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por p??gina.
     * @param page_number Valor de la p??gina en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    /**
     * Se almacenan los valores del registro seleccionado.
     * @param element Arreglo de los datos del asentamiento.
     */
    selectAsentamiento(element){
        if(element.IDDELEGACION){
            this.dataAsentamiento.codasentamiento = element.CODIGO;
            this.dataAsentamiento.asentamiento = element.DESCRIPCION;
            this.dataAsentamiento.codigopostal = element.CODIGOPOSTAL;
            this.dataAsentamiento.codtiposasentamiento = element.CODTIPOSASENTAMIENTO;
        }else if(element.codasentamiento){
            this.dataAsentamiento.codasentamiento = element.codasentamiento;
            this.dataAsentamiento.asentamiento = element.asentamiento;
            this.dataAsentamiento.codigopostal = element.codigopostal;
            this.dataAsentamiento.codtiposasentamiento = element.codtiposasentamiento;
        }else{
            this.dataAsentamiento.codasentamiento = element.CODASENTAMIENTO;
            this.dataAsentamiento.asentamiento = element.ASENTAMIENTO;
            this.dataAsentamiento.codigopostal = element.CODIGOPOSTAL;
            this.dataAsentamiento.codtiposasentamiento = element.CODTIPOSASENTAMIENTO;
        }
    }

    /**
     * Obtiene el asenteamiento de acuerdo al estado, municipio o ciudad.
     */
    obtenerAsentamientoByNombre(){
        this.loading = true;
        let criterio = '';
        let query = '';
        this.spinner.show();
        if(this.data.codEstado == 9){
            criterio = criterio + 'getColAsentByDelegacion';
            query = query + 'idDelegacion=' + this.data.codMunicipio + '&nombre=' + this.buscaAsentamiento;
        }else{
            criterio = 'getAsentamientoByNombre';
            query = query + 'nombre=' + this.buscaAsentamiento + '&codEstado=' + this.data.codEstado + '&codMunicipio=' + this.data.codMunicipio2;
            query = (this.data.codCiudad) ? query + '&codCiudad=' + this.data.codCiudad : query + '&codCiudad=';
        }
        
        this.loading = true;
        this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                },
                (error) => {
                    this.spinner.hide();
                    this.loading = false;
                }
            );
    }
}

///////////////VIA//////////////////
export interface dataVia{
    codtiposvia: number;
    idvia: number;
    via : string;
  }
  @Component({
    selector: 'app-dialog-via-contribuyente',
    templateUrl: 'app-dialog-via-contribuyente.html',
    styleUrls: ['./editart-contribuyente.component.css']
  })
  export class DialogViaContribuyenteT {
    endpoint = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['via', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    optionVia;
    loadingBuscaVia = false;
    dataSource = [];
    dataPaginate;
    httpOptions;
    buscaVia;
    dataVia: dataVia = {} as dataVia;
    @ViewChild('paginator') paginator: MatPaginator;
  
    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private spinner: NgxSpinnerService,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogViaContribuyenteT>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        dialogRef.disableClose = true;
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };
        this.obtenerVia();
    }
  
    /**
     * Limpia los registros de la b??squeda especifica realizada y llama al metodo para obtener todos los municipios
     */
    cleanVia(){
        this.pagina = 1;
        this.total = 0;
        this.dataSource = [];
        this.loadingBuscaVia = false;
        this.dataPaginate;
        this.buscaVia = null;
        this.obtenerVia();
    }

    /**
     * Obtiene las v??as de acuerdo al criterio del nombre o por el id de la colonia previamente seleccionada
     */
    obtenerVia(){
        this.spinner.show();
        this.loadingBuscaVia = true;
        let criterio = 'getViasByIdColonia';
        let query = '';

        if(this.buscaVia){
            query = query + 'nombre=' + this.buscaVia;
        }else{
            query = query + 'nombre';
        }

        if(this.data.codEstado != 9){
            query = query + '&idColonia=' + this.data.codAsentamiento;
        }else{
            query = query + '&idColonia=' + this.data.codAsentamiento;
        }


        this.loadingBuscaVia = true;
        this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loadingBuscaVia = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;

                },
                (error) => {
                    this.spinner.hide();
                    this.loadingBuscaVia = false;
                }
            );
    }

    /**
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    /**
     * Regresa la posici??n del paginado de acuerdo a los par??metro enviados
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por p??gina.
     * @param page_number Valor de la p??gina en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    /**
     * Obtiene los datos y almacena los datos de la v??a seleccionada.
     * @param element Arreglo de los datos del registro seleccionado
     */
    selectVia(element){
        
        this.dataVia.codtiposvia = element.codtiposvia;
        this.dataVia.idvia = element.idvia;
        this.dataVia.via = element.via;
    }

    /**
     * Obtiene los asentamientos por nombre
     */
    obtenerAsentamientoPorNombre(){
        this.loadingBuscaVia = true;
        let criterio = '';
        let query = '';
        this.spinner.show();
        if(this.data.codEstado != 9){
            criterio = criterio + 'getMunicipiosByEstado';
            query = query + 'codEstado=' + this.data.codEstado;
        }else{
            criterio = '';
            query = '';
        }

        
        this.loadingBuscaVia = true;
        this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loadingBuscaVia = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingBuscaVia = false;
                }
            );
    }
}

///////////////REPRESENTACION////////////////
@Component({
    selector: 'app-dialog-representacion',
    templateUrl: 'app-dialog-representacion.html',
    styleUrls: ['./editart-contribuyente.component.css']
})
export class DialogRepresentacionCT {
    endpoint = environment.endpoint + 'registro/';
    loading = false;
    bloqueo = true;
    httpOptions;
    tipoPersona = 'F';
    idPersonaRepresentacion;
    idDocumento;
    idRepresentacion;
    insertOrUpdate = null;
    insUp = false;
    fisicaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    dataRepresentacion: DataRepresentacion = {} as DataRepresentacion;
    isRequired = true;
    loadingDocumentos;
    documentoRepresentacionTipo;
    existedoctoRep = false;
    dataDocumentos: DocumentosIdentificativos[] = [];
    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        private spinner: NgxSpinnerService,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogRepresentacionCT>,
        private auth: AuthService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        
        dialogRef.disableClose = true;
        this.fisicaFormGroup = this._formBuilder.group({
            nombre: [null, [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            apaterno: [null, [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            amaterno: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            rfc: [null, []],
            curp: [null, []],
            ine: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            idDocIdent: ['', []],
            docIdent: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            fechaNacimiento: [null, []],
            fechaDefuncion: [null, []],
            celular: [null, [Validators.pattern("^\\w+(\\s+\\w+)*$")]],
            email: ['', [Validators.email, Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            texto: [null, []],
            fechaCaducidad: [null, []],
        });
    
        this.moralFormGroup = this._formBuilder.group({
            nombre: [null, [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            rfc: [null, [Validators.required]],
            actPreponderante: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            idTipoPersonaMoral: ['', []],
            fechaInicioOperacion: [null, []],
            idMotivo: ['', []],
            fechaCambio: [null, []],
            texto: [null, []],
            fechaCaducidad: [null, []],
        });
        
        
        if(data.dataRepresentante){
            this.setDataRepresentacion(data.dataRepresentante);
            this.idDocumento = data.dataRepresentante.IDDOCUMENTOREPRESENTACION;
            this.idRepresentacion = data.dataRepresentante.IDREPRESENTACION;
            this.insertOrUpdate = 2;
            this.insUp = true;
        }

        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };

        this.getDataDocumentos();
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
            },
            (error) => {
                this.spinner.hide();
                this.loadingDocumentos = false;
            }
        );
    }

    minDate = '';

    fechaTope(){
        this.fisicaFormGroup.controls['fechaDefuncion'].setValue(null);
        this.minDate = moment(this.fisicaFormGroup.controls['fechaNacimiento'].value).add(2, 'd').format('YYYY-MM-DD');  
    }

    /**
     * De acuerdo al campo seleccionado ser?? requerido el RFC, el CURP o ambos.
     * @param remove Valor del campo que se le retirara la validaci??n, puede ser CURP o RFC
     * @param add  Valor del campo que se le agregara a la validaci??n, puede ser CURP o RFC
     */
    changeRequired(remove, add): void {
        if(!this.fisicaFormGroup.value.rfc && !this.fisicaFormGroup.value.curp){????????????????????????
            this.isRequired = true;
        }???????????????????????? else {????????????????????????
            this.isRequired = false;
        }????????????????????????

        this.fisicaFormGroup.markAsTouched();
        this.fisicaFormGroup.updateValueAndValidity();
    }
  
    /**
     * Abre el dialogo para obtener un contribuyente previamente registrado, al cerrar se obtienen su informaci??n
     * para ser registrado en la representaci??n.
     */
    addPersona(): void {
        const dialogRef = this.dialog.open(DialogPersonaCT, {
            width: '700px',
            data: this.tipoPersona
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.tipoPersona = result.tipoPersona;
                this.idPersonaRepresentacion = result.id;
                if(this.tipoPersona == 'F') {
                    this.fisicaFormGroup.controls['nombre'].setValue(result.nombre);
                    this.fisicaFormGroup.controls['apaterno'].setValue(result.apaterno);
                    this.fisicaFormGroup.controls['amaterno'].setValue(result.amaterno);
                    this.fisicaFormGroup.controls['rfc'].setValue(result.rfc);
                    this.fisicaFormGroup.controls['curp'].setValue(result.curp);
                    this.fisicaFormGroup.controls['ine'].setValue(result.ine);
                    this.fisicaFormGroup.controls['idDocIdent'].setValue(result.idDocIdent);
                    this.fisicaFormGroup.controls['docIdent'].setValue(result.docIdent);
                    this.fisicaFormGroup.markAllAsTouched();
                } else {
                    this.moralFormGroup.controls['nombre'].setValue(result.apaterno);
                    this.moralFormGroup.controls['rfc'].setValue(result.rfc);
                    this.moralFormGroup.markAllAsTouched();
                }
                this.changeRequired(null, null);
            }
        });
    }

    /** 
     * Genera un salto autom??tico de un input al siguiente una vez que la longitud m??xima del input ha sido alcanzada
     */
    focusNextInput(event, input) {
        if(event.srcElement.value.length === event.srcElement.maxLength){
        input.focus();
        }
    }

    /**
     * Abre el dialogo para agregar los ficheros y datos relacionados su registro.
     */
    addDocumento(dataDocumento = null): void {
        const dialogRef = this.dialog.open(DialogDocumentoCT, {
            width: '700px',
            data: {idDocumento: this.idDocumento,
                    insertOrUpdate: this.insertOrUpdate
            },
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.dataRepresentacion.documentoRepresentacion = result;
            }
        });
    }
  
    /**
     * Retira el registro del documento antes de guardar
     */
    removeDocumento(){
          this.dataRepresentacion.documentoRepresentacion = undefined;
      }
  
    /**
     *  Obtiene los datos que se registraron en el formulario y guarda la representaci??n junto a todos los datos del documento,
     * representante y representado.
     * @returns Regresa el arreglo de los datos que fueron registrados en el formulario de la representaci??n.
     */
    getDataRepresentacion(): DataRepresentacion {
        this.spinner.show();
        this.loading = true;
        this.bloqueo = false;
        this.dataRepresentacion.tipoPersona = this.tipoPersona;
        if(this.tipoPersona == 'F'){
            this.dataRepresentacion.nombre = (this.fisicaFormGroup.value.nombre) ? this.fisicaFormGroup.value.nombre.toLocaleUpperCase() : null;
            this.dataRepresentacion.apaterno = (this.fisicaFormGroup.value.apaterno) ? this.fisicaFormGroup.value.apaterno.toLocaleUpperCase() : null;
            this.dataRepresentacion.amaterno = (this.fisicaFormGroup.value.amaterno) ? this.fisicaFormGroup.value.amaterno.toLocaleUpperCase() : null;
            this.dataRepresentacion.rfc = (this.fisicaFormGroup.value.rfc) ? this.fisicaFormGroup.value.rfc.toLocaleUpperCase() : null;
            this.dataRepresentacion.curp = (this.fisicaFormGroup.value.curp) ? this.fisicaFormGroup.value.curp.toLocaleUpperCase() : null;
            this.dataRepresentacion.ine = (this.fisicaFormGroup.value.ine) ? this.fisicaFormGroup.value.ine.toLocaleUpperCase() : null;
            this.dataRepresentacion.idDocIdent = this.fisicaFormGroup.value.idDocIdent;
            this.dataRepresentacion.docIdent = (this.fisicaFormGroup.value.docIdent) ? this.fisicaFormGroup.value.docIdent : null;
            this.dataRepresentacion.fechaNacimiento = (this.fisicaFormGroup.value.fechaNacimiento) ? this.fisicaFormGroup.value.fechaNacimiento : null;
            this.dataRepresentacion.fechaDefuncion = (this.fisicaFormGroup.value.fechaDefuncion) ? this.fisicaFormGroup.value.fechaDefuncion : null;
            this.dataRepresentacion.celular = (this.fisicaFormGroup.value.celular) ? this.fisicaFormGroup.value.celular : null;
            this.dataRepresentacion.email = (this.fisicaFormGroup.value.email) ? this.fisicaFormGroup.value.email : null;
            this.dataRepresentacion.texto = (this.fisicaFormGroup.value.texto) ? this.fisicaFormGroup.value.texto.toLocaleUpperCase() : null;
            this.dataRepresentacion.fechaCaducidad = (this.fisicaFormGroup.value.fechaCaducidad) ? this.fisicaFormGroup.value.fechaCaducidad : null;
        } else {
            this.dataRepresentacion.nombre = (this.moralFormGroup.value.nombre) ? this.moralFormGroup.value.nombre.toLocaleUpperCase() : null;
            this.dataRepresentacion.rfc = (this.moralFormGroup.value.rfc) ? this.moralFormGroup.value.rfc.toLocaleUpperCase() : null;
            this.dataRepresentacion.actPreponderante = (this.moralFormGroup.value.actPreponderante) ? this.moralFormGroup.value.actPreponderante.toLocaleUpperCase() : null;
            this.dataRepresentacion.idTipoPersonaMoral = this.moralFormGroup.value.idTipoPersonaMoral;
            this.dataRepresentacion.fechaInicioOperacion = (this.moralFormGroup.value.fechaInicioOperacion) ? this.moralFormGroup.value.fechaInicioOperacion : null;
            this.dataRepresentacion.idMotivo = this.moralFormGroup.value.idMotivo;
            this.dataRepresentacion.fechaCambio = (this.moralFormGroup.value.fechaCambio) ? this.moralFormGroup.value.fechaCambio : null;
            this.dataRepresentacion.texto = (this.moralFormGroup.value.texto) ? this.moralFormGroup.value.texto.toLocaleUpperCase() : null;
            this.dataRepresentacion.fechaCaducidad = (this.moralFormGroup.value.fechaCaducidad) ? this.moralFormGroup.value.fechaCaducidad : null;
        }
        this.idPersonaRepresentacion = (this.idPersonaRepresentacion) ? this.idPersonaRepresentacion : null;

        if(this.insertOrUpdate == 2){
            this.updateRepresentacion();            
        }else{
            const payload = {
                "representacion": {
                    textorepresentacion: this.dataRepresentacion.texto,
                    fechacaducidad: moment(this.dataRepresentacion.fechaCaducidad).format("DD-MM-YYYY")
                },
                "participantes": [
                    {
                        rol: "representante",
                        codtiposPersona: this.dataRepresentacion.tipoPersona,
                        idpersona: this.idPersonaRepresentacion,
                        nombre: this.dataRepresentacion.nombre,
                        rfc: this.dataRepresentacion.rfc,
                        apellidoPaterno: this.dataRepresentacion.apaterno,
                        apellidoMaterno: this.dataRepresentacion.amaterno,
                        curp: this.dataRepresentacion.curp,
                        ife: this.dataRepresentacion.ine,
                        iddocIdentif: this.dataRepresentacion.idDocIdent,
                        valdocIdentif: this.dataRepresentacion.docIdent,
                        fechaNacimiento: this.dataRepresentacion.fechaNacimiento,
                        fechaDefuncion: this.dataRepresentacion.fechaDefuncion,
                        celular: this.dataRepresentacion.celular,
                        email: this.dataRepresentacion.email,
                        activprincip: this.dataRepresentacion.actPreponderante,
                        idtipomoral: this.dataRepresentacion.idTipoPersonaMoral,
                        idmotivosmoral: this.dataRepresentacion.idMotivo,
                        fechainicioactiv: this.dataRepresentacion.fechaInicioOperacion,
                        fechacambiosituacion: this.dataRepresentacion.fechaCambio
                    },
                    {
                        rol:"representado",
                        codtiposPersona: this.data.datosPerito.tipoPersona,
                        idpersona: this.data.idPerito,
                        nombre: this.data.datosPerito.nombre,
                        rfc: this.data.datosPerito.rfc,
                        apellidoPaterno: this.data.datosPerito.apepaterno,
                        apellidoMaterno: this.data.datosPerito.apematerno,
                        curp: this.data.datosPerito.curp,
                        ife: this.data.datosPerito.ine,
                        iddocIdentif: this.data.datosPerito.identificacion,
                        valdocIdentif: this.data.datosPerito.idedato,
                        fechaNacimiento: this.data.datosPerito.fecha_naci,
                        fechaDefuncion: this.data.datosPerito.fecha_def,
                        celular: this.data.datosPerito.celular,
                        email: this.data.datosPerito.email,
                        activprincip: null,
                        idtipomoral: null,
                        idmotivosmoral: null,
                        fechainicioactiv: null,
                        fechacambiosituacion: null
                    }
                ],
                "documento": {
                    descripcion: this.dataRepresentacion.documentoRepresentacion.descripcion,        
                    codtipodocumento: this.dataRepresentacion.documentoRepresentacion.codtipodocumento,
                    fecha: moment(this.dataRepresentacion.documentoRepresentacion.fecha).format("DD-MM-YYYY"),
                    codTipoDocumentoJuridico: this.dataRepresentacion.documentoRepresentacion.codtipodocumentojuridico,        
                    lugar: this.dataRepresentacion.documentoRepresentacion.lugar,
                    idNotario: this.dataRepresentacion.documentoRepresentacion.idnotario,
                    noEscritura: this.dataRepresentacion.documentoRepresentacion.num_escritura,
                    documentos: this.dataRepresentacion.documentoRepresentacion.archivos
                }
            };
            
            this.http.post( this.endpoint + 'insertarRepresentacion', payload, this.httpOptions ). subscribe (
                (res: any) => {
                    this.spinner.hide();
                    Swal.fire(
                        {
                          title: 'CORRECTO',
                          text: "REGISTRO EXITOSO",
                          icon: 'success',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                    this.loading = false;
                    this.dialogRef.close(res);
                },
                (error) => {
                    this.spinner.hide();
                    this.dialogRef.close();
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                });
        }
        return this.dataRepresentacion;
    }

    /**
     * Actualiza la informaci??n de la representaci??n seleccionada.
     */
    updateRepresentacion(){
        this.spinner.show();
        let queryActRep = '';

        queryActRep = (this.dataRepresentacion.texto) ? queryActRep + 'textorepresentacion=' + this.dataRepresentacion.texto : queryActRep + 'textorepresentacion=';

        queryActRep = (this.dataRepresentacion.fechaCaducidad) ? queryActRep + '&fechacaducidad=' + moment(this.dataRepresentacion.fechaCaducidad).format("DD-MM-YYYY") : queryActRep + '&fechacaducidad=';

        queryActRep = queryActRep + '&idRepresentacion=' + this.idRepresentacion + '&idDocumentoDigital=' + this.idDocumento;

        this.http.post(this.endpoint + 'actualizarRepresentacion?' + queryActRep, '', this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                Swal.fire(
                    {
                      title: 'CORRECTO',
                      text: "SE HA ACTUALIZADO EL REPRESENTADO",
                      icon: 'success',
                      confirmButtonText: 'Cerrar'
                    }
                );
                let fin = true;
                this.dialogRef.close(fin);
            },
            (error) => {
                this.spinner.hide();
                this.dialogRef.close();
                Swal.fire(
                    {
                      title: 'SIN RESULTADO',
                      text: error.error.mensaje,
                      icon: 'warning',
                      confirmButtonText: 'Cerrar'
                    }
                );
            });
    }

    /**
     * Obtiene el arreglo de los datos  de la representaci??n seleccionada para editar.
     * @param dataRepresentacion Arreglo con los datos del registro seleccionado.
     */
    setDataRepresentacion(dataRepresentacion): void {
        (dataRepresentacion.RFC) ? this.changeRequired('curp', 'rfc') : this.changeRequired('rfc', 'curp');
        
        this.tipoPersona = dataRepresentacion.CODTIPOPERSONA;
        if(this.tipoPersona == 'F'){
            this.fisicaFormGroup.controls['nombre'].setValue(dataRepresentacion.NOMBRE);
            this.fisicaFormGroup.controls['apaterno'].setValue(dataRepresentacion.APELLIDOPATERNO);
            this.fisicaFormGroup.controls['amaterno'].setValue(dataRepresentacion.APELLIDOMATERNO);
            this.fisicaFormGroup.controls['rfc'].setValue(dataRepresentacion.RFC);
            this.fisicaFormGroup.controls['curp'].setValue(dataRepresentacion.CURP);
            this.fisicaFormGroup.controls['ine'].setValue(dataRepresentacion.CLAVEIFE);
            this.fisicaFormGroup.controls['idDocIdent'].setValue(dataRepresentacion.IDDOCIDENTIF);
            this.fisicaFormGroup.controls['docIdent'].setValue(dataRepresentacion.DESCDOCIDENTIF);
            this.fisicaFormGroup.controls['fechaNacimiento'].setValue((dataRepresentacion.FECHANACIMIENTO) ? new Date(dataRepresentacion.FECHANACIMIENTO) : null);
            this.fisicaFormGroup.controls['fechaDefuncion'].setValue((dataRepresentacion.FECHADEFUNCION) ? new Date(dataRepresentacion.FECHADEFUNCION) : null);
            this.fisicaFormGroup.controls['celular'].setValue(dataRepresentacion.CELULAR);
            this.fisicaFormGroup.controls['email'].setValue(dataRepresentacion.EMAIL);
            this.fisicaFormGroup.controls['texto'].setValue(dataRepresentacion.TEXTOREPRESENTACION);
            this.fisicaFormGroup.controls['fechaCaducidad'].setValue((dataRepresentacion.FECHACADUCIDAD) ? new Date(dataRepresentacion.FECHACADUCIDAD) : null);
            this.fisicaFormGroup.markAllAsTouched();
            this.fisicaFormGroup.updateValueAndValidity();
        } else {
            this.moralFormGroup.controls['nombre'].setValue(dataRepresentacion.APELLIDOPATERNO);
            this.moralFormGroup.controls['rfc'].setValue(dataRepresentacion.RFC);
            this.moralFormGroup.controls['actPreponderante'].setValue(dataRepresentacion.ACTIVPRINCIP);
            this.moralFormGroup.controls['idTipoPersonaMoral'].setValue(dataRepresentacion.IDTIPOMORAL);
            this.moralFormGroup.controls['fechaInicioOperacion'].setValue((dataRepresentacion.FECHAINICIOACTIV) ? new Date(dataRepresentacion.FECHAINICIOACTIV) : null);
            this.moralFormGroup.controls['idMotivo'].setValue(dataRepresentacion.IDMOTIVOSMORAL);
            this.moralFormGroup.controls['fechaCambio'].setValue((dataRepresentacion.FECHACAMBIOSITUACION) ? new Date(dataRepresentacion.FECHACAMBIOSITUACION) : null);
            this.moralFormGroup.controls['texto'].setValue(dataRepresentacion.TEXTOREPRESENTACION);
            this.moralFormGroup.controls['fechaCaducidad'].setValue((dataRepresentacion.FECHACADUCIDAD) ? new Date(dataRepresentacion.FECHACADUCIDAD) : null);
            this.moralFormGroup.markAllAsTouched();
            this.moralFormGroup.updateValueAndValidity();
        }
        this.changeRequired(null, null);
        
        this.dataRepresentacion.documentoRepresentacion = dataRepresentacion.DOCUMENTOS;
        this.documentoRepresentacionTipo = dataRepresentacion.DOCUMENTOS;
        this.existedoctoRep = true;
    }
}

///////////////REPRESENTADO////////////////
@Component({
    selector: 'app-dialog-representado',
    templateUrl: 'app-dialog-representado.html',
    styleUrls: ['./editart-contribuyente.component.css']
})
export class DialogRepresentadoCT {
    endpoint = environment.endpoint + 'registro/';
    loading = false;
    bloqueo = true;
    httpOptions;
    tipoPersona = 'F';
    fisicaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    idPersonaRepresentacion;
    fechaCaducidad;
    idDocumento;
    idRepresentacion;
    insertOrUpdate = null;
    insUp = false;
    dataRepresentacion: DataRepresentacion = {} as DataRepresentacion;
    isRequired = true;
    loadingDocumentos;
    documentoRepresentacionTipo;
    existedoctoRep = false;
    dataDocumentos: DocumentosIdentificativos[] = [];

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private spinner: NgxSpinnerService,
        private _formBuilder: FormBuilder,
        private auth: AuthService,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogRepresentadoCT>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };

        dialogRef.disableClose = true;
        this.fisicaFormGroup = this._formBuilder.group({
            nombre: [null, [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            apaterno: [null, [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            amaterno: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            rfc: [null, []],
            curp: [null, []],
            ine: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            idDocIdent: ['', []],
            docIdent: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            fechaNacimiento: [null, []],
            fechaDefuncion: [null, []],
            celular: [null, [Validators.pattern("^\\w+(\\s+\\w+)*$")]],
            email: ['', [Validators.email, Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            texto: [null, []],
            fechaCaducidad: [null, []],
        });
    
        this.moralFormGroup = this._formBuilder.group({
            nombre: [null, [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            rfc: [null, [Validators.required]],
            actPreponderante: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            idTipoPersonaMoral: ['', []],
            fechaInicioOperacion: [null, []],
            idMotivo: ['', []],
            fechaCambio: [null, []],
            texto: [null, []],
            fechaCaducidad: [null, []],
        });
  
        if(data.dataRepresentante){
            this.setDataRepresentacion(data.dataRepresentante);
            this.idDocumento = data.dataRepresentante.IDDOCUMENTOREPRESENTACION;
            this.idRepresentacion = data.dataRepresentante.IDREPRESENTACION;
            this.insertOrUpdate = 2;
            this.insUp = true;
        }

        this.getDataDocumentos();
    }

    minDate = '';

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
            },
            (error) => {
                this.spinner.hide();
                this.loadingDocumentos = false;
            }
        );
    }

    fechaTope(){
        this.fisicaFormGroup.controls['fechaDefuncion'].setValue(null);
        this.minDate = moment(this.fisicaFormGroup.controls['fechaNacimiento'].value).add(2, 'd').format('YYYY-MM-DD');  
    }
      
    /**
     * De acuerdo al campo seleccionado ser?? requerido el RFC, el CURP o ambos.
     * @param remove Valor del campo que se le retirara la validaci??n, puede ser CURP o RFC
     * @param add  Valor del campo que se le agregara a la validaci??n, puede ser CURP o RFC
     */
    changeRequired(remove, add): void {
        if(!this.fisicaFormGroup.value.rfc && !this.fisicaFormGroup.value.curp){????????????????????????
            this.isRequired = true;
        }???????????????????????? else {????????????????????????
            this.isRequired = false;
        }????????????????????????

        this.fisicaFormGroup.markAsTouched();
        this.fisicaFormGroup.updateValueAndValidity();
    }
  
    /**
     * Abre el dialogo para obtener un contribuyente previamente registrado, al cerrar se obtienen su informaci??n
     * para ser registrado en la representaci??n.
     */
    addPersona(): void {
        const dialogRef = this.dialog.open(DialogPersonaCT, {
            width: '700px',
            data: this.tipoPersona
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.tipoPersona = result.tipoPersona;
                this.idPersonaRepresentacion = result.id;
                if(this.tipoPersona == 'F') {
                    this.fisicaFormGroup.controls['nombre'].setValue(result.nombre);
                    this.fisicaFormGroup.controls['apaterno'].setValue(result.apaterno);
                    this.fisicaFormGroup.controls['amaterno'].setValue(result.amaterno);
                    this.fisicaFormGroup.controls['rfc'].setValue(result.rfc);
                    this.fisicaFormGroup.controls['curp'].setValue(result.curp);
                    this.fisicaFormGroup.controls['ine'].setValue(result.ine);
                    this.fisicaFormGroup.controls['idDocIdent'].setValue(result.idDocIdent);
                    this.fisicaFormGroup.controls['docIdent'].setValue(result.docIdent);
                    this.fisicaFormGroup.markAllAsTouched();
                } else {
                    this.moralFormGroup.controls['nombre'].setValue(result.apaterno);
                    this.moralFormGroup.controls['rfc'].setValue(result.rfc);
                    this.moralFormGroup.markAllAsTouched();
                }
                this.changeRequired(null, null);
            }
        });
    }
  
    /**
     * Abre el dialogo para agregar los ficheros y datos relacionados su registro.
     */
    addDocumento(dataDocumento = null): void {
        const dialogRef = this.dialog.open(DialogDocumentoCT, {
            width: '700px',
            data: {idDocumento: this.idDocumento,
                    insertOrUpdate: this.insertOrUpdate
            },
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.dataRepresentacion.documentoRepresentacion = result;
            }
        });
    }
  
    /**
     * Retira el registro del documento antes de guardar
     */
    removeDocumento(){
          this.dataRepresentacion.documentoRepresentacion = undefined;
    }
  
    /**
     *  Obtiene los datos que se registraron en el formulario y guarda la representaci??n junto a todos los datos del documento,
     * representante y representado.
     * @returns Regresa el arreglo de los datos que fueron registrados en el formulario de la representaci??n.
     */
    getDataRepresentacion(): DataRepresentacion {
        this.spinner.show();
        this.loading = true;
        this.bloqueo = false;
        this.dataRepresentacion.tipoPersona = this.tipoPersona;
        if(this.tipoPersona == 'F'){
            this.dataRepresentacion.nombre = (this.fisicaFormGroup.value.nombre) ? this.fisicaFormGroup.value.nombre.toLocaleUpperCase() : null;
            this.dataRepresentacion.apaterno = (this.fisicaFormGroup.value.apaterno) ? this.fisicaFormGroup.value.apaterno.toLocaleUpperCase() : null;
            this.dataRepresentacion.amaterno = (this.fisicaFormGroup.value.amaterno) ? this.fisicaFormGroup.value.amaterno.toLocaleUpperCase() : null;
            this.dataRepresentacion.rfc = (this.fisicaFormGroup.value.rfc) ? this.fisicaFormGroup.value.rfc.toLocaleUpperCase() : null;
            this.dataRepresentacion.curp = (this.fisicaFormGroup.value.curp) ? this.fisicaFormGroup.value.curp.toLocaleUpperCase() : null;
            this.dataRepresentacion.ine = (this.fisicaFormGroup.value.ine) ? this.fisicaFormGroup.value.ine.toLocaleUpperCase() : null;
            this.dataRepresentacion.idDocIdent = this.fisicaFormGroup.value.idDocIdent;
            this.dataRepresentacion.docIdent = (this.fisicaFormGroup.value.docIdent) ? this.fisicaFormGroup.value.docIdent : null;
            this.dataRepresentacion.fechaNacimiento = (this.fisicaFormGroup.value.fechaNacimiento) ? this.fisicaFormGroup.value.fechaNacimiento : null;
            this.dataRepresentacion.fechaDefuncion = (this.fisicaFormGroup.value.fechaDefuncion) ? this.fisicaFormGroup.value.fechaDefuncion : null;
            this.dataRepresentacion.celular = (this.fisicaFormGroup.value.celular) ? this.fisicaFormGroup.value.celular : null;
            this.dataRepresentacion.email = (this.fisicaFormGroup.value.email) ? this.fisicaFormGroup.value.email : null;
            this.dataRepresentacion.texto = (this.fisicaFormGroup.value.texto) ? this.fisicaFormGroup.value.texto.toLocaleUpperCase() : null;
            this.dataRepresentacion.fechaCaducidad = (this.fisicaFormGroup.value.fechaCaducidad) ? this.fisicaFormGroup.value.fechaCaducidad : null;
        } else {
            this.dataRepresentacion.nombre = (this.moralFormGroup.value.nombre) ? this.moralFormGroup.value.nombre.toLocaleUpperCase() : null;
            this.dataRepresentacion.rfc = (this.moralFormGroup.value.rfc) ? this.moralFormGroup.value.rfc.toLocaleUpperCase() : null;
            this.dataRepresentacion.actPreponderante = (this.moralFormGroup.value.actPreponderante) ? this.moralFormGroup.value.actPreponderante : null;
            this.dataRepresentacion.idTipoPersonaMoral = this.moralFormGroup.value.idTipoPersonaMoral;
            this.dataRepresentacion.fechaInicioOperacion = (this.moralFormGroup.value.fechaInicioOperacion) ? this.moralFormGroup.value.fechaInicioOperacion : null;
            this.dataRepresentacion.idMotivo = this.moralFormGroup.value.idMotivo;
            this.dataRepresentacion.fechaCambio = (this.moralFormGroup.value.fechaCambio) ? this.moralFormGroup.value.fechaCambio : null;
            this.dataRepresentacion.texto = (this.moralFormGroup.value.texto) ? this.moralFormGroup.value.texto.toLocaleUpperCase() : null;
            this.dataRepresentacion.fechaCaducidad = (this.moralFormGroup.value.fechaCaducidad) ? this.moralFormGroup.value.fechaCaducidad : null;
        }

        this.idPersonaRepresentacion = (this.idPersonaRepresentacion) ? this.idPersonaRepresentacion : null;
        
        if(this.insertOrUpdate == 2){
            this.updateRepresentacion();            
        }else{
            const payload = {
                "representacion": {
                    textorepresentacion: this.dataRepresentacion.texto,
                    fechacaducidad: moment(this.dataRepresentacion.fechaCaducidad).format("DD-MM-YYYY")
                },
                "participantes": [
                    {
                        rol: "representado",
                        codtiposPersona: this.dataRepresentacion.tipoPersona,
                        idpersona: this.idPersonaRepresentacion,
                        nombre: this.dataRepresentacion.nombre,
                        rfc: this.dataRepresentacion.rfc,
                        apellidoPaterno: this.dataRepresentacion.apaterno,
                        apellidoMaterno: this.dataRepresentacion.amaterno,
                        curp: this.dataRepresentacion.curp,
                        ife: this.dataRepresentacion.ine,
                        iddocIdentif: this.dataRepresentacion.idDocIdent,
                        valdocIdentif: this.dataRepresentacion.docIdent,
                        fechaNacimiento: this.dataRepresentacion.fechaNacimiento,
                        fechaDefuncion: this.dataRepresentacion.fechaDefuncion,
                        celular: this.dataRepresentacion.celular,
                        email: this.dataRepresentacion.email,
                        activprincip: this.dataRepresentacion.actPreponderante,
                        idtipomoral: this.dataRepresentacion.idTipoPersonaMoral,
                        idmotivosmoral: this.dataRepresentacion.idMotivo,
                        fechainicioactiv: this.dataRepresentacion.fechaInicioOperacion,
                        fechacambiosituacion: this.dataRepresentacion.fechaCambio
                    },
                    {
                        rol:"representante",
                        codtiposPersona: this.data.datosPerito.tipoPersona,
                        idpersona: this.data.idPerito,
                        nombre: this.data.datosPerito.nombre,
                        rfc: this.data.datosPerito.rfc,
                        apellidoPaterno: this.data.datosPerito.apepaterno,
                        apellidoMaterno: this.data.datosPerito.apematerno,
                        curp: this.data.datosPerito.curp,
                        ife: this.data.datosPerito.ine,
                        iddocIdentif: this.data.datosPerito.identificacion,
                        valdocIdentif: this.data.datosPerito.idedato,
                        fechaNacimiento: this.data.datosPerito.fecha_naci,
                        fechaDefuncion: this.data.datosPerito.fecha_def,
                        celular: this.data.datosPerito.celular,
                        email: this.data.datosPerito.email,
                        activprincip: null,
                        idtipomoral: null,
                        idmotivosmoral: null,
                        fechainicioactiv: null,
                        fechacambiosituacion: null
                    }
                ],
                "documento": {
                    descripcion: this.dataRepresentacion.documentoRepresentacion.descripcion,        
                    codtipodocumento: this.dataRepresentacion.documentoRepresentacion.codtipodocumento,
                    fecha: moment(this.dataRepresentacion.documentoRepresentacion.fecha).format("DD-MM-YYYY"),
                    codTipoDocumentoJuridico: this.dataRepresentacion.documentoRepresentacion.codtipodocumentojuridico,        
                    lugar: this.dataRepresentacion.documentoRepresentacion.lugar,
                    idNotario: this.dataRepresentacion.documentoRepresentacion.idnotario,
                    noEscritura: this.dataRepresentacion.documentoRepresentacion.num_escritura,
                    documentos: this.dataRepresentacion.documentoRepresentacion.archivos
                }
            };

            this.http.post( this.endpoint + 'insertarRepresentacion', payload, this.httpOptions ). subscribe (
                (res: any) => {
                    this.spinner.hide();
                    Swal.fire(
                        {
                          title: 'CORRECTO',
                          text: "Registro exitoso",
                          icon: 'success',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                    this.loading = false;
                    this.dialogRef.close(res);
                },
                (error) => {
                    this.spinner.hide();
                    this.dialogRef.close();
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                });
        }

        return this.dataRepresentacion;
    }

    /**
     * Actualiza la informaci??n de la representaci??n seleccionada.
     */
    updateRepresentacion(){
        this.spinner.show();
        let queryActRep = '';

        queryActRep = (this.dataRepresentacion.texto) ? queryActRep + 'textorepresentacion=' + this.dataRepresentacion.texto : queryActRep + 'textorepresentacion=';

        queryActRep = (this.dataRepresentacion.fechaCaducidad) ? queryActRep + '&fechacaducidad=' + moment(this.dataRepresentacion.fechaCaducidad).format("DD-MM-YYYY") : queryActRep + '&fechacaducidad=';

        queryActRep = queryActRep + '&idRepresentacion=' + this.idRepresentacion + '&idDocumentoDigital=' + this.idDocumento;

        this.http.post(this.endpoint + 'actualizarRepresentacion?' + queryActRep, '', this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                Swal.fire(
                    {
                      title: 'CORRECTO',
                      text: "SE HA ACTUALIZADO EL REPRESENTADO",
                      icon: 'success',
                      confirmButtonText: 'Cerrar'
                    }
                );
                let fin = true;
                this.dialogRef.close(fin);
            },
            (error) => {
                this.spinner.hide();
                this.dialogRef.close();
                Swal.fire(
                    {
                      title: 'SIN RESULTADO',
                      text: "ERROR INTENTELO M??S TARDE",
                      icon: 'error',
                      confirmButtonText: 'Cerrar'
                    }
                );
            });
    }

    /**
     * Obtiene el arreglo de los datos  de la representaci??n seleccionada para editar.
     * @param dataRepresentacion Arreglo con los datos del registro seleccionado.
     */
    setDataRepresentacion(dataRepresentacion): void {
        (dataRepresentacion.RFC) ? this.changeRequired('curp', 'rfc') : this.changeRequired('rfc', 'curp');
        
        this.tipoPersona = dataRepresentacion.CODTIPOPERSONA;
        if(this.tipoPersona == 'F'){
            this.fisicaFormGroup.controls['nombre'].setValue(dataRepresentacion.NOMBRE);
            this.fisicaFormGroup.controls['apaterno'].setValue(dataRepresentacion.APELLIDOPATERNO);
            this.fisicaFormGroup.controls['amaterno'].setValue(dataRepresentacion.APELLIDOMATERNO);
            this.fisicaFormGroup.controls['rfc'].setValue(dataRepresentacion.RFC);
            this.fisicaFormGroup.controls['curp'].setValue(dataRepresentacion.CURP);
            this.fisicaFormGroup.controls['ine'].setValue(dataRepresentacion.CLAVEIFE);
            this.fisicaFormGroup.controls['idDocIdent'].setValue(dataRepresentacion.IDDOCIDENTIF);
            this.fisicaFormGroup.controls['docIdent'].setValue(dataRepresentacion.DESCDOCIDENTIF);
            this.fisicaFormGroup.controls['fechaNacimiento'].setValue((dataRepresentacion.FECHANACIMIENTO) ? new Date(dataRepresentacion.FECHANACIMIENTO) : null);
            this.fisicaFormGroup.controls['fechaDefuncion'].setValue((dataRepresentacion.FECHADEFUNCION) ? new Date(dataRepresentacion.FECHADEFUNCION) : null);
            this.fisicaFormGroup.controls['celular'].setValue(dataRepresentacion.CELULAR);
            this.fisicaFormGroup.controls['email'].setValue(dataRepresentacion.EMAIL);
            this.fisicaFormGroup.controls['texto'].setValue(dataRepresentacion.TEXTOREPRESENTACION);
            this.fisicaFormGroup.controls['fechaCaducidad'].setValue((dataRepresentacion.FECHACADUCIDAD) ? new Date(dataRepresentacion.FECHACADUCIDAD) : null);
            this.fisicaFormGroup.markAllAsTouched();
            this.fisicaFormGroup.updateValueAndValidity();
        } else {
            this.moralFormGroup.controls['nombre'].setValue(dataRepresentacion.APELLIDOPATERNO);
            this.moralFormGroup.controls['rfc'].setValue(dataRepresentacion.RFC);
            this.moralFormGroup.controls['actPreponderante'].setValue(dataRepresentacion.ACTIVPRINCIP);
            this.moralFormGroup.controls['idTipoPersonaMoral'].setValue(dataRepresentacion.IDTIPOMORAL);
            this.moralFormGroup.controls['fechaInicioOperacion'].setValue((dataRepresentacion.FECHAINICIOACTIV) ? new Date(dataRepresentacion.FECHAINICIOACTIV) : null);
            this.moralFormGroup.controls['idMotivo'].setValue(dataRepresentacion.IDMOTIVOSMORAL);
            this.moralFormGroup.controls['fechaCambio'].setValue((dataRepresentacion.FECHACAMBIOSITUACION) ? new Date(dataRepresentacion.FECHACAMBIOSITUACION) : null);
            this.moralFormGroup.controls['texto'].setValue(dataRepresentacion.TEXTOREPRESENTACION);
            this.moralFormGroup.controls['fechaCaducidad'].setValue((dataRepresentacion.FECHACADUCIDAD) ? new Date(dataRepresentacion.FECHACADUCIDAD) : null);
            this.moralFormGroup.markAllAsTouched();
            this.moralFormGroup.updateValueAndValidity();
        }
        this.changeRequired(null, null);
        
        this.dataRepresentacion.documentoRepresentacion = dataRepresentacion.DOCUMENTOS;
        this.documentoRepresentacionTipo = dataRepresentacion.DOCUMENTOS;
        this.existedoctoRep = true;
        
    }
}

///////////////DOCUMENTO////////////////
@Component({
    selector: 'app-dialog-documento',
    templateUrl: 'app-dialog-documento.html',
    styleUrls: ['./editart-contribuyente.component.css']
})
export class DialogDocumentoCT {
    endpoint = environment.endpoint + 'registro/';
    loadingTiposDocumentoDigital = false;
    loadingTiposDocumentoJuridico = false;
    httpOptions;
    tiposDocumentoDigital;
    tiposDocumentoJuridico;
    selectTipoDoc = '1';
    idDocumento;
    insertOrUpdate;
    insUp = false;
    tiposDocumentoFormGroup: FormGroup;
    infoDocumentoFormGroup: FormGroup;
    archivosDocumentoFormGroup: FormGroup;
    dataDocumentoSet;
    fechaDocto;
    dataDoc = [];
    descargaFichero = [];
    displayedColumnsDoc: string[] = ['nombre','descripcion', 'download', 'eliminar'];
    dataDocumento: DataDocumentoRepresentacion = {} as DataDocumentoRepresentacion;
    canSend = false;
    
    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private spinner: NgxSpinnerService,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        private auth: AuthService,
        public dialogRef: MatDialogRef<DialogDocumentoCT>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {

        dialogRef.disableClose = true;

        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };

        this.tiposDocumentoFormGroup = this._formBuilder.group({
            codtipodocumento: ['', [Validators.required]],
            codtipodocumentojuridico: ['', [Validators.required]]
        });
  
        this.infoDocumentoFormGroup = this._formBuilder.group({
            fecha: [null, [Validators.required]],
            descripcion: [null, [Validators.required]],
            lugar: [null, [Validators.required]]
        });
  
        this.archivosDocumentoFormGroup = this._formBuilder.group({
            archivos: this._formBuilder.array([])
        });

        
        this.tiposDocumentoFormGroup.controls.codtipodocumentojuridico.valueChanges.subscribe(codtipodocumentojuridico => {
        if(codtipodocumentojuridico == 'PN') {
            this.infoDocumentoFormGroup.addControl('noNotario', new FormControl(null, Validators.required));
            this.infoDocumentoFormGroup.addControl('ciudadNotario', new FormControl(null, Validators.required));
            this.infoDocumentoFormGroup.addControl('nombreNotario', new FormControl(null, Validators.required));
            this.infoDocumentoFormGroup.addControl('num_escritura', new FormControl(null, Validators.required));
        } else {
            this.infoDocumentoFormGroup.removeControl('noNotario');
            this.infoDocumentoFormGroup.removeControl('ciudadNotario');
            this.infoDocumentoFormGroup.removeControl('nombreNotario');
            this.infoDocumentoFormGroup.removeControl('num_escritura');
        }
            this.infoDocumentoFormGroup.updateValueAndValidity();
        });
        if(data.idDocumento){
            this.setDataDocumento(data.idDocumento);
            this.insertOrUpdate = data.insertOrUpdate;
            this.idDocumento = data.idDocumento;
            this.insUp = true;
        }
    }
  
    /**
     * Obtiene los tipos de Documentos Digitales
     */
    getDataTiposDocumentoDigital(): void {
        this.spinner.show();
        this.loadingTiposDocumentoDigital = true;
        this.http.get(this.endpoint, this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.loadingTiposDocumentoDigital = false;
                this.tiposDocumentoDigital = res;
            },
            (error) => {
                this.spinner.hide();
                this.loadingTiposDocumentoDigital = false;
            }
        );
    }
  
    /**
     * Obtiene el valor y nombre de acuerdo al valor de la etiqueta option seleccionada.
     * @param event Contiene el nombre de la etiqueta option de acuerdo al valor de este en el select.
     */
    getDataTiposDocumentoJuridico(): void {
        this.loadingTiposDocumentoJuridico = true;
        this.spinner.show();
        this.http.get(this.endpoint, this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.loadingTiposDocumentoJuridico = false;
                this.tiposDocumentoJuridico = res;
            },
            (error) => {
                this.spinner.hide();
                this.loadingTiposDocumentoJuridico = false;
            }
        );
    }
  
    /**
     * Obtiene el valor y nombre de acuerdo al valor de la etiqueta option seleccionada.
     * @param event Contiene el nombre de la etiqueta option de acuerdo al valor de este en el select.
     */
    getTipoDocJuridico(event): void {
        this.dataDocumento.nombreTipoDocumentoJuridico = event.source.triggerValue;
    }
  
    /**
     * Abre el dialogo para registrar al notario en caso de ser un Poder notarial el documento.
     */
    addNotario(): void {
        const dialogRef = this.dialog.open(DialogNotarioCT, {
            width: '700px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.dataDocumento.idnotario = result.id;
                this.infoDocumentoFormGroup.controls['noNotario'].setValue(result.numero);
                this.infoDocumentoFormGroup.controls['ciudadNotario'].setValue(result.ciudad);
                this.infoDocumentoFormGroup.controls['nombreNotario'].setValue(result.nombre);
            }
        });
    }
  
    /**
     * Activa la validaci??n del fomulario ya agrega el fichero.
     * @param data Datos de los ficheros que activan la validaci??n del mismo en el formulario.
     * @returns 
     */
    createItem(data): FormGroup {
        return this._formBuilder.group(data);
    }
  
    /**
     * Remueve el fichero agregado
     * @param i N??mero del index del registro seleccionado.
     */
    removeItem(i) {
        this.archivos.removeAt(i);
      }
  
    get archivos(): FormArray {
        return this.archivosDocumentoFormGroup.get('archivos') as FormArray;
    };
  
    /**
     * 
     * @param event Arreglo de los ficheros seleccionados para su env??o.
     */
    getArchivos(event) {
        let files = event.target.files;
        if(files){
            for(let file of files){
                if(file.size < 5200123){
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        this.archivos.push(this.createItem({
                        nombre: file.name,
                        base64: reader.result
                        }));
                    };
                }else{
                    Swal.fire(
                        {
                          title: '??ATENCI??N!',
                          text: "Su archivo excede el tama??o permido de maximo 5MB",
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                    event.target.value = '';
                }
            }
        }
    }
  
    /**
     * Se almacenan los datos del registro del documento de acuerdo al seleccionado (Carta poder o Poder notarial),
     * en caso de ser una actualizaci??n llamara al m??todo correspondiente.
     */
    getDataDocumento(): void {
        this.dataDocumento.codtipodocumento = this.tiposDocumentoFormGroup.value.codtipodocumento;
        this.dataDocumento.codtipodocumentojuridico = this.tiposDocumentoFormGroup.value.codtipodocumentojuridico;
        if(this.tiposDocumentoFormGroup.value.codtipodocumentojuridico == 'PN'){
            this.dataDocumento.noNotario = (this.infoDocumentoFormGroup.value.noNotario) ? this.infoDocumentoFormGroup.value.noNotario : null;
            this.dataDocumento.ciudadNotario = (this.infoDocumentoFormGroup.value.ciudadNotario) ? this.infoDocumentoFormGroup.value.ciudadNotario.toLocaleUpperCase() : null;
            this.dataDocumento.nombreNotario = (this.infoDocumentoFormGroup.value.nombreNotario) ? this.infoDocumentoFormGroup.value.nombreNotario.toLocaleUpperCase() : null;
            this.dataDocumento.num_escritura = (this.infoDocumentoFormGroup.value.num_escritura) ? this.infoDocumentoFormGroup.value.num_escritura.toLocaleUpperCase() : null;
        }
        this.dataDocumento.fecha = (this.infoDocumentoFormGroup.value.fecha) ? this.infoDocumentoFormGroup.value.fecha : null;
        this.dataDocumento.descripcion = (this.infoDocumentoFormGroup.value.descripcion) ? this.infoDocumentoFormGroup.value.descripcion.toLocaleUpperCase() : null;
        this.dataDocumento.lugar = (this.infoDocumentoFormGroup.value.lugar) ? this.infoDocumentoFormGroup.value.lugar.toLocaleUpperCase() : null;
        this.dataDocumento.archivos = this.archivosDocumentoFormGroup.value.archivos;
    
        if(this.insertOrUpdate == 2){
            this.updateDocto();
        }else{
            this.canSend = true;
        }
    }
  
    /**
     * Obtiene la informaci??n del documento y el fichero.
     * @param idDocumento2 Valor del idDocumento utilizado para la b??squeda del mismo
     */
    setDataDocumento(idDocumento2): void {
        this.spinner.show();
        this.http.post(this.endpoint + 'infoDocumentos?idDocumentoDigital=' + idDocumento2, '', this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.dataDocumentoSet = res;
                this.setDoc();
            },
            (error) => {
                this.spinner.hide();
                Swal.fire(
                    {
                      title: 'SIN RESULTADO',
                      text: "ERROR INTENTELO M??S TARDE",
                      icon: 'error',
                      confirmButtonText: 'Cerrar'
                    }
                );
            });
    }

    /**
     * Se almacenan los datos relacionados con el documento cuando se ha seleccionado la opci??n de editar documento.
     */
    setDoc(){

        //this.tiposDocumentoFormGroup.controls['codtipodocumento'].setValue(1);
        this.tiposDocumentoFormGroup.controls['codtipodocumentojuridico'].setValue(this.dataDocumentoSet.infoDocumento[0].codtipodocumentojuridico);
        if(this.dataDocumentoSet.infoDocumento[0].codtipodocumentojuridico == 'PN'){
            this.dataDocumento.idnotario = this.dataDocumentoSet.infoNotario[0].idnotario;
            this.infoDocumentoFormGroup.controls['noNotario'].setValue(this.dataDocumentoSet.infoNotario[0].numnotario);
            this.infoDocumentoFormGroup.controls['ciudadNotario'].setValue(this.dataDocumentoSet.infoNotario[0].codestado);
            this.infoDocumentoFormGroup.controls['nombreNotario'].setValue(this.dataDocumentoSet.infoNotario[0].nombre);
            this.infoDocumentoFormGroup.controls['num_escritura'].setValue(this.dataDocumentoSet.infoDocumentoNotario[0].numprotocolo);
        }
        //this.dataDocumento.nombreTipoDocumentoJuridico = dataDocumento.nombreTipoDocumentoJuridico;
        this.infoDocumentoFormGroup.controls['fecha'].setValue(new Date(this.dataDocumentoSet.infoDocumento[0].fecha));
        this.infoDocumentoFormGroup.controls['descripcion'].setValue(this.dataDocumentoSet.infoDocumento[0].descripcion);
        this.infoDocumentoFormGroup.controls['lugar'].setValue(this.dataDocumentoSet.infoDocumento[0].lugar);

        this.dataDoc = this.dataDocumentoSet.infoFicheros;
    }

    /**
     * Realiza la consulta del fichero previamente guardado.
     * @param element Arreglo de los datos del registro seleccionado.
     */
    descargarDoc(element){
        this.spinner.show();

        this.http.get( this.endpoint + 'getFichero?idFichero=' + element.idficherodocumento, this.httpOptions ). subscribe (
            (res: any) => {
                this.spinner.hide();
                this.descargaFichero = res;
                this.convertirDoc();
            },
            (error) => {
                this.spinner.hide();
                Swal.fire(
                    {
                      title: 'SIN RESULTADO',
                      text: "ERROR INTENTELO M??S TARDE",
                      icon: 'error',
                      confirmButtonText: 'Cerrar'
                    }
                );
            });
    }

    /**
     * Convierte el base 64 del fichero guardado para su descarga en PDF.
     */
    convertirDoc(){
        let dataFichero = this.descargaFichero[0].binariodatos;
        dataFichero = dataFichero.split("data:application/pdf;base64,");
        const blob = this.b64toBlob(dataFichero[1], 'application/pdf');
        FileSaver.saveAs(blob, this.descargaFichero[0].nombre);
    }

    /**
     * 
     * @param b64Data El fichero en base 64.
     * @param contentType Tipo de fichero.
     * @param sliceSize 
     * @returns Regresa el fichero a descargar
     */
    b64toBlob(b64Data, contentType = '', sliceSize = 512): Blob {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

    /**
     * Elimina el fichero seleccionado
     * @param element Arreglo con los datos seleccionados del registro.
     * @param i Valor del index del registro seleccionado.
     */
    eliminarDoc(element, i){
        this.spinner.show();
        this.http.post( this.endpoint + 'borrarFichero?lista=' + element.idficherodocumento, '', this.httpOptions ). subscribe (
            (res: any) => {
                this.spinner.hide();
                Swal.fire(
                    {
                      title: 'CORRECTO',
                      text: "SE HA HA BORRADO EL DOCTO",
                      icon: 'success',
                      confirmButtonText: 'Cerrar'
                    }
                );
                this.dataDoc.splice(i,1);
            },
            (error) => {
                this.spinner.hide();
                Swal.fire(
                    {
                      title: 'SIN RESULTADO',
                      text: "ERROR INTENTELO M??S TARDE",
                      icon: 'error',
                      confirmButtonText: 'Cerrar'
                    }
                );
            });
    }

    /**
     * Actualiza los datos relacionados con el documento.
     */
    updateDocto(){
        this.spinner.show();
        this.canSend = true;
        const payload = {
            "documento": {
                idDocumetoDigital: this.idDocumento,
                descripcion: this.dataDocumento.descripcion,        
                fecha: moment(this.dataDocumento.fecha).format("DD-MM-YYYY"),
                lugar: this.dataDocumento.lugar,
                eliminados: null,
                documentos: this.dataDocumento.archivos
            }
        };
        
        this.http.post( this.endpoint + 'actualizarDocumentos', payload, this.httpOptions ). subscribe (
            (res: any) => {
                this.spinner.hide();
                if(res === true){
                    Swal.fire(
                        {
                          title: 'CORRECTO',
                          text: "SE HA ACTUALIZADO CORRECTAMENTE LA INFORMACI??N",
                          icon: 'success',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }else{
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: "ERROR INTENTELO M??S TARDE",
                          icon: 'error',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            },
            (error) => {
                this.spinner.hide();
                Swal.fire(
                    {
                      title: 'SIN RESULTADO',
                      text: "ERROR INTENTELO M??S TARDE",
                      icon: 'error',
                      confirmButtonText: 'Cerrar'
                    }
                );
            });
    }
}

///////////////NOTARIO////////////////
export interface Filtros {
    numnotario: string;
    estado: number;
    rfc: string;
    curp: string;
    claveife: string;
    nombre: string;
    filtroNombre: number;
    apellidoPaterno: string;
    filtroApellidoPaterno: number;
    apellidoMaterno: string;
    filtroApellidoMaterno: number;
}

export interface Notario {
    id: number;
    numero: string;
    ciudad: string;
    nombre: string;
}

@Component({
    selector: 'app-dialog-notario',
    templateUrl: 'app-dialog-notario.html',
    styleUrls: ['./editart-contribuyente.component.css']
})
export class DialogNotarioCT {
    endpoint = environment.endpoint + 'registro/';
    endpointCatalogos = environment.endpoint + 'registro/';
    pageSize = 15;
    pagina = 1;
    total = 0;
    loading = false;
    dataSource = [];
    dataNotarios = [];
    displayedColumns: string[] = ['numero', 'datos_personales', 'datos_identificativos', 'select'];
    httpOptions;
    filtros: Filtros = {} as Filtros;
    notario: Notario = {} as Notario;
    tipoBusqueda = 'DatosIdentificativos';
    optionNotario;
    isBusqueda;
    queryParamFiltros;
    loadingEstados = false;
    estados;
    @ViewChild('paginator') paginator: MatPaginator;
  
    constructor(
        private auth: AuthService,
        private spinner: NgxSpinnerService,
        private http: HttpClient,
        public dialogRef: MatDialogRef<DialogNotarioCT>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        dialogRef.disableClose = true;
  
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };

        this.getDataEstados();
    }

    /**
     * Obtiene el cat??logo de los estados de la rep??blica Mexicana.
     */
    getDataEstados(): void {
        this.spinner.show();
        this.loadingEstados = true;
        this.http.get(this.endpointCatalogos + 'getEstados', this.httpOptions).subscribe(
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
     * Obtiene los datos del notario de acuerdo a los parametros dados en la b??squeda.
     */
    getDataNotarios(): void {
        this.spinner.show();
        this.loading = true;
        this.isBusqueda = true;
        this.optionNotario = undefined;
        this.pagina = 1;
        this.queryParamFiltros = '';
        let metodoN = '';
        
        if(this.filtros.numnotario){
            this.queryParamFiltros = this.queryParamFiltros + '&numnotario=' + this.filtros.numnotario;
        }
        if(this.filtros.estado){
            this.queryParamFiltros = this.queryParamFiltros + '&estado=' + this.filtros.estado;
        }
        if(this.filtros.rfc){
            this.queryParamFiltros = this.queryParamFiltros + '&rfc=' + this.filtros.rfc.toLocaleUpperCase();
        }
        if(this.filtros.curp){
            this.queryParamFiltros = this.queryParamFiltros + '&curp=' + this.filtros.curp.toLocaleUpperCase();
        }
        if(this.filtros.claveife){
            this.queryParamFiltros = this.queryParamFiltros + '&claveife=' + this.filtros.claveife.toLocaleUpperCase();
        }
        if(this.filtros.nombre){
            this.queryParamFiltros = this.queryParamFiltros + '&nombre=' + this.filtros.nombre.toLocaleUpperCase() + '&filtroNombre=0';
        }
        if(this.filtros.apellidoPaterno){
            this.queryParamFiltros = this.queryParamFiltros + '&apellidoPaterno=' + this.filtros.apellidoPaterno.toLocaleUpperCase() + '&filtroApellidoPaterno=0';
        }
        if(this.filtros.apellidoMaterno){
            this.queryParamFiltros = this.queryParamFiltros + '&apellidoMaterno=' + this.filtros.apellidoMaterno.toLocaleUpperCase() + '&filtroApellidoMaterno=0';
        }
        
        if(this.filtros.nombre || this.filtros.apellidoPaterno || this.filtros.apellidoMaterno){
            metodoN = 'getNotariosByDatosPersonales';
        }else{
            metodoN = 'getNotariosByDatosIdentificativos';
        }
        
        this.http.get(this.endpoint + metodoN + '?' + this.queryParamFiltros, this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.loading = false;
                this.dataNotarios = res;
                this.dataSource = this.paginate(this.dataNotarios, this.pageSize, this.pagina);
                this.total = this.dataNotarios.length;
                this.paginator.pageIndex = 0;
            },
            (error) => {
                this.spinner.hide();
                this.loading = false;
                this.dataSource = [];
            });
    }
  
    /**
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataSource = this.paginate(this.dataNotarios, this.pageSize, this.pagina);
    }
  
    /**
     * 
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por p??gina.
     * @param page_number Valor de la p??gina en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }
      
    /**
     * Limpia los datos de la b??squeda y valores previamente definidos.
     */
    clean(): void {
        this.pagina = 1;
        this.total = 0;
        this.dataNotarios = [];
        this.filtros = {} as Filtros;
        this.notario = {} as Notario;
        this.optionNotario = undefined;
        this.isBusqueda = false;
    }
  
    /**
     * Obtiene y almacena el arreglo del norario seleccionado.
     * @param element Arreglo de los datos del registro seleccionado.
     */
    notarioSelected(element) {
        this.notario.id = element.IDPERSONA;
        this.notario.numero = element.NUMNOTARIO;
        this.notario.ciudad = element.ESTADO;
        this.notario.nombre = element.NOMBRE + ' ' + element.APELLIDOPATERNO + ' ' + element.APELLIDOMATERNO;
    }
}

///////////////PERSONA////////////////
export interface Filtros {
    apaterno: string;
    amaterno: string;
    nombre: string;
    rfc: string;
    curp: string;
    ine: string;
    idDocIdent: string;
    docIdent: string;
}
export interface Persona {
    tipoPersona: string;
    id: string;
    nombre: string;
    apaterno: string;
    amaterno: string;
    rfc: string;
    curp: string;
    ine: string;
    idDocIdent: number;
    docIdent: string;
}
@Component({
    selector: 'app-dialog-persona',
    templateUrl: 'app-dialog-persona.html',
    styleUrls: ['./editart-contribuyente.component.css']
})
export class DialogPersonaCT{
    endpoint = environment.endpoint + 'registro/';
    pageSize = 15;
    pagina = 1;
    total = 0;
    loading = false;
    dataSource = [];
    dataPersonas = [];    
    displayedColumns: string[] = ['nombre', 'datos_identificativos', 'select'];
    httpOptions;
    filtros: Filtros = {} as Filtros;
    persona: Persona = {} as Persona;
    tipoPersona;
    isIdentificativo;
    optionPersona;
    isBusqueda;
    queryParamFiltros;
    endpointBusqueda;
    @ViewChild('paginator') paginator: MatPaginator;
    loadingDocumentos;
    dataDocumentos: DocumentosIdentificativos[] = [];
    fisicaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    isRequired = false;
  
    constructor(
      private auth: AuthService,
      private http: HttpClient,
      private spinner: NgxSpinnerService,
      private _formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<DialogPersonaCT>,
      @Inject(MAT_DIALOG_DATA) public data: any
    ) {

        dialogRef.disableClose = true;
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };
        this.tipoPersona = data;

        this.fisicaFormGroup = this._formBuilder.group({
            rfc: [null, []],
            curp: [null, []],
            apaterno: [null, []],
            amaterno: [null, []],
            nombre: [null, []],
            ine: [null, []],
            idDocIdent: [null, []],
            docIdent: [null, []]
        });

        this.moralFormGroup = this._formBuilder.group({
            rfc: [null, []],
            nombre: [null, []]
        });

        this.getDataDocumentos();
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

            },
            (error) => {
                this.spinner.hide();
                this.loadingDocumentos = false;
            }
        );
    }
    
    /**
     * De acuerdo al parametro sea identificativo o personal se limpiaran los otros campos.
     * @param isIdentificativo Valor booleano
     */
    clearInputsIdentNoIdent(isIdentificativo): void {
        this.isIdentificativo = isIdentificativo;
        if(this.isIdentificativo){
            this.filtros.apaterno = null;
            this.filtros.amaterno = null;
            this.filtros.nombre = null;
        }else{
            this.filtros.rfc = null;
            this.filtros.curp = null;
            this.filtros.ine = null;
            this.filtros.idDocIdent = null;
            this.filtros.docIdent = null;
        }
    }
  
    /**
     * Obtiene a la persona sea f??sica o moral por datos identificativos o personales.
     */
    getDataPersonas(): void {
        this.spinner.show();
        this.loading = true;
        this.isBusqueda = true;
        this.optionPersona = undefined;
        this.pagina = 1;
        this.queryParamFiltros = '';
        this.endpointBusqueda = '';
        
        if(this.tipoPersona == 'M'){
            if(this.isIdentificativo){
                this.endpointBusqueda = this.endpoint + 'getMoralIdentificativos';
            if(this.filtros.rfc)
                this.queryParamFiltros = this.queryParamFiltros + '&rfc=' + this.filtros.rfc.toLocaleUpperCase() + '&codtipopersona=M';
            } else {
                this.endpointBusqueda = this.endpoint + 'getPersonaMoral';
            if(this.filtros.nombre)
                this.queryParamFiltros = this.queryParamFiltros + '&razonSocial=' + this.filtros.nombre.toLocaleUpperCase() 
                                        + '&filtroApellidoPaterno=0&codtipopersona=M';
            }
        } else {
            if(this.isIdentificativo){
                this.endpointBusqueda = this.endpoint + 'getIdentificativos';
                if(this.filtros.curp)
                    this.queryParamFiltros = this.queryParamFiltros + '&curp=' + this.filtros.curp.toLocaleUpperCase();
                if(this.filtros.rfc)
                    this.queryParamFiltros = this.queryParamFiltros + '&rfc=' + this.filtros.rfc.toLocaleUpperCase();
                if(this.filtros.ine)
                    this.queryParamFiltros = this.queryParamFiltros + '&claveife=' + this.filtros.ine.toLocaleUpperCase();
                if(this.filtros.idDocIdent)
                    this.queryParamFiltros = this.queryParamFiltros + '&iddocidentif=' + this.filtros.idDocIdent;
                if(this.filtros.docIdent)
                    this.queryParamFiltros = this.queryParamFiltros + '&valdocidentif=' + this.filtros.docIdent.toLocaleUpperCase();
        
                this.queryParamFiltros = this.queryParamFiltros + '&coincidenTodos=false&codtipopersona=F';        
            } else {
                this.endpointBusqueda = this.endpoint + 'getContribuyente';
                this.queryParamFiltros = (this.filtros.nombre) ? this.queryParamFiltros + '&nombre=' + this.filtros.nombre.toLocaleUpperCase() + '&filtroNombre=0' : this.queryParamFiltros + '&nombre=';
                this.queryParamFiltros = (this.filtros.apaterno) ? this.queryParamFiltros + '&apellidoPaterno=' + this.filtros.apaterno.toLocaleUpperCase() + '&filtroApellidoPaterno=0' : this.queryParamFiltros + '&apellidoPaterno=';
                this.queryParamFiltros = (this.filtros.amaterno) ? this.queryParamFiltros + '&apellidoMaterno=' + this.filtros.amaterno.toLocaleUpperCase() + '&filtroApellidoMaterno=0' : this.queryParamFiltros + '&apellidoMaterno=';
                this.queryParamFiltros = this.queryParamFiltros + '&codtipopersona=F';
            }
        }
  
        this.http.get(this.endpointBusqueda + '?' + this.queryParamFiltros, this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.loading = false;
                this.dataPersonas = res;
                this.dataSource = this.paginate(this.dataPersonas, this.pageSize, this.pagina);
                this.total = this.dataPersonas.length;
                this.paginator.pageIndex = 0;
            },
            (error) => {
                this.spinner.hide();
                this.loading = false;
                this.dataSource = [];
            }
        );
    }
  
    /**
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataSource = this.paginate(this.dataPersonas, this.pageSize, this.pagina);
    }
  
    /**
     * 
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por p??gina.
     * @param page_number Valor de la p??gina en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }
  
    /**
     * Reinicia los valores del paginado y la b??squeda.
     */
    clean(): void {
        this.pagina = 1;
        this.total = 0;
        this.dataPersonas = [];
        this.filtros = {} as Filtros;
        this.persona = {} as Persona;
        this.optionPersona = undefined;
        this.isBusqueda = false;
    }
  
    /**
     * Obtiene y almacena los datos de la persona moral o f??sca seleccinada.
     * @param element Arreglo de los datos de la persona seleccionada
     */
    personaSelected(element) {
        this.persona.tipoPersona = this.tipoPersona;
        this.persona.id = element.IDPERSONA;
        this.persona.nombre = element.NOMBRE;
        this.persona.apaterno = element.APELLIDOPATERNO;
        this.persona.amaterno = element.APELLIDOMATERNO;
        this.persona.rfc = element.RFC;
        this.persona.curp = element.CURP;
        this.persona.ine = element.CLAVEIFE;
        this.persona.idDocIdent = element.IDDOCIDENTIF;
        this.persona.docIdent = element.VALDOCIDENTIF;
    }
}

/////////////// DOMICILIOS HISTORICO ////////////////
export interface DataHistorico{
    fecha_desde: Date;
    fecha_hasta: Date;
}

@Component({
    selector: 'app-dialog-domicilio-historico-contribuyente',
    templateUrl: 'app-dialog-domicilio-historico-contribuyente.html',
    styleUrls: ['./editart-contribuyente.component.css']
  })
  export class DialogDomicilioHistoricoContribuyenteT {
    endpoint = environment.endpoint + 'registro/';
    httpOptions;
    idDireccion;
    displayedColumns: string[] = ['fecha', 'descripcion', 'numero_expediente', 'tipo_tramite', 'tipo_subtramite', 'detalle'];
    dataHistoricoModificaciones: DataHistorico = {} as DataHistorico;
    dataSource = [];
    pagina = 1;
    total = 0;
    pageSize = 10;
    dataPaginate;
    loading = true;
    
    constructor(
        private auth: AuthService,
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private spinner: NgxSpinnerService,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogDomicilioHistoricoContribuyenteT>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any) {
            dialogRef.disableClose = true;
            this.httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: this.auth.getSession().token
                })
            };
        
            this.idDireccion = data.idDireccion;
            this.getHistoricoModificaciones();
    
        }

    /**
     * Obtiene el historial de las modificaciones que han recibido los domicilios.
     */
    getHistoricoModificaciones(){
        let query = '';
        this.spinner.show();
        query = (this.dataHistoricoModificaciones.fecha_desde) ? query + '&fechaDesde=' + moment(this.dataHistoricoModificaciones.fecha_desde).format('DD-MM-YYYY') : query + '&fechaDesde=';
        query = (this.dataHistoricoModificaciones.fecha_hasta) ? query + '&fechaHasta=' + moment(this.dataHistoricoModificaciones.fecha_hasta).format('DD-MM-YYYY') : query + '&fechaHasta=';
        query = query + '&idDireccion=' + this.idDireccion;

        query = query.substr(1);

        this.loading = true;
        let metodo = 'getHistoricosDireccion';
        this.http.get(this.endpoint + metodo + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loading = false;
                    this.dataSource = res;
                    this.total = this.dataSource.length;
                    this.dataPaginate = this.paginate(this.dataSource, 10, this.pagina);
                },
                (error) => {
                    this.spinner.hide();
                    this.loading = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    /**
     * Regresa la posici??n del paginado de acuerdo a los par??metro enviados
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por p??gina.
     * @param page_number Valor de la p??gina en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    /**
     * Abre el dialogo que mostrar?? el domicilio especifico.
     * @param dataDomicilioEspecifico Valor del registro seleccionado.
     */
    viewHistoricoDomicilioEspecifico(dataDomicilioEspecifico): void {
        const dialogRef = this.dialog.open(DialogDomicilioHistoricoEspecificoContribuyenteT, {
            width: '700px',
            data: { dataDomicilioEspecifico:dataDomicilioEspecifico, idDireccion:this.idDireccion },
        });
        dialogRef.afterClosed().subscribe(result => {
                // this.getNotarioDirecciones();
        });
    }
}

/////////////// DOMICILIOS HISTORICO ESPECIFICO ////////////////
@Component({
    selector: 'app-dialog-domicilio-historico-especifico-contribuyente',
    templateUrl: 'app-dialog-domicilio-historico-especifico-contribuyente.html',
    styleUrls: ['./editart-contribuyente.component.css']
  })
  export class DialogDomicilioHistoricoEspecificoContribuyenteT {
    endpointCatalogos = environment.endpoint + 'registro/';
    //loadingTiposDireccion = false;
    loadingEstados = false;
    loadingMunicipios = false;
    loadingTiposAsentamiento = false;
    loadingTiposVia = false;
    loadingTiposLocalidad = false;
    httpOptions;
    tiposDireccion;
    estados;
    municipios;
    tiposAsentamiento;
    tiposVia;
    tiposLocalidad;
    optionCiudad;
    codtiposdireccion;
    idestadoNg
    idmunicipioNg
    idmunicipio2Ng
    municipioNg
    idciudadNg
    ciudadNg
    codasentamientoNg
    asentamientoNg
    idtipoasentamientoNg
    cpNg
    codtiposviaNg
    idtipoviaNg
    viaNg
    idtipolocalidadNg
    nexteriorNg
    entrecalle1Ng
    entrecalle2Ng
    andadorNg
    edificioNg
    seccionNg
    entradaNg
    ninteriorNg
    telefonoNg
    adicionalNg
    botonAsentamiento = true;
    botonCiudad = true;
    botonMunicipio = true;
    botonVia = true;
    buscaMunicipios;
    domicilioFormGroup: FormGroup;
    dataDomicilio: DataDomicilio = {} as DataDomicilio;
    dataDomicilioEspecifico: DataDomicilio = {} as DataDomicilio;
    loadingDireccionEspecifica = false;
    iddomicilio;
    idChs;
    idDireccion;

    constructor(
        private auth: AuthService,
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private spinner: NgxSpinnerService,
        public dialogRef: MatDialogRef<DialogDomicilioHistoricoEspecificoContribuyenteT>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any) {
            dialogRef.disableClose = true;
            this.httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: this.auth.getSession().token
                })
            };

            this.idChs = data.dataDomicilioEspecifico;
            this.idDireccion = data.idDireccion;
            this.codtiposdireccion = data.codtiposdireccion;
            this.dataDomicilio = {} as DataDomicilio;
            this.dataDomicilioEspecifico = {} as DataDomicilio;
            this.getDataEstados();
            this.getDireccionEspecifica();
                this.domicilioFormGroup = this._formBuilder.group({
                    ///idtipodireccion: ['', Validators.required],
                    idestado: ['', Validators.required],
                    delegacion: [null],
                    municipio: [null, Validators.required],
                    idciudad: [null],
                    ciudad: [null, Validators.required],
                    codasentamiento: [null, Validators.required],
                    asentamiento: [null, Validators.required],
                    idtipoasentamiento: [null],
                    codtiposvia: [null],
                    idtipovia: ['', Validators.required],
                    via: [null, Validators.required],
                    idtipolocalidad: [null],
                    cp: [null],
                    nexterior: [null, Validators.required],
                    entrecalle1: [null],
                    entrecalle2: [null],
                    andador: [null],
                    edificio: [null],
                    seccion: [null],
                    entrada: [null],
                    ninterior: [null],
                    telefono: [null],
                    adicional: [null],
                    id_direccion: [null]
                });
            
                this.domicilioFormGroup.controls.idestado.valueChanges.subscribe(idestado => {
                    if(idestado == 9) {
                        this.domicilioFormGroup.removeControl('municipio');
                        this.domicilioFormGroup.removeControl('idciudad');
                        this.domicilioFormGroup.removeControl('ciudad');
                        this.domicilioFormGroup.addControl('idmunicipio', new FormControl('', Validators.required));
                        this.domicilioFormGroup.removeControl('idmunicipio2');
                    } else {
                        this.domicilioFormGroup.removeControl('idmunicipio');
                        this.domicilioFormGroup.addControl('municipio', new FormControl(null, Validators.required));
                        this.domicilioFormGroup.addControl('idciudad', new FormControl(null, Validators.required));
                        this.domicilioFormGroup.addControl('ciudad', new FormControl(null, Validators.required));
                        this.domicilioFormGroup.addControl('idmunicipio2', new FormControl('', Validators.required));
                    }
                    this.domicilioFormGroup.updateValueAndValidity();
                });
        
                    if(data){
                        // this.domicilioFormGroup['cp'].disable();
                    }
                    this.getDataTiposAsentamiento();
                    this.getDataTiposVia();
                    this.getDataTiposLocalidad();
        }

    /**
     * Obtiene el domicilio seleccionado.
     */  
    getDireccionEspecifica(){
        this.spinner.show();
        this.loadingDireccionEspecifica = true;
        let metodo = 'getHistoricosDireccionDetalle';
        this.http.get(this.endpointCatalogos + metodo + '?idChs=' + this.idChs + '&idDireccion=' + this.idDireccion, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loadingDireccionEspecifica = false;
                    this.dataDomicilioEspecifico = res;
                    this.setDataDomicilio(this.dataDomicilioEspecifico[0]);
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingDireccionEspecifica = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Obtiene el valor y nombre de la etiqueta option seleccionado.
     * @param event Contiene el nombre de la etiqueta option de acuerdo al valor de este en el select.
     */
    getNombreDel(event): void {
        this.dataDomicilio.delegacion = event.source.triggerValue;
        this.botonAsentamiento = false;
        
    }

    /**
     * Obtiene el cat??logo de los estados de la rep??blica Mexicana.
     */
    getDataEstados(): void {
        this.spinner.show();
        this.loadingEstados = true;
        this.http.get(this.endpointCatalogos + 'getEstados', this.httpOptions).subscribe(
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
     * Obtiene los municipios de acuerdo al estado seleccionado
     * @param event Valor que se recibe para la obtenci??n de las alcaldias o municipios.
     */
    getDataMunicipios(event): void {
        this.botonMunicipio = false;
        let busquedaMunCol = '';
        this.spinner.show();
        // busquedaMunCol = 'getDelegaciones';
        busquedaMunCol = (event.value == 9) ? 'getDelegaciones' : 'getMunicipiosByEstado?codEstado=' + event.value;
        this.loadingMunicipios = true;
        this.http.get(this.endpointCatalogos + busquedaMunCol, this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.loadingMunicipios = false;
                this.municipios = res;
            },
            (error) => {
                this.spinner.hide();
                this.loadingMunicipios = false;
            }
        );
    }
    
    /**
     * Obtiene el cat??logo de los asentamientos.
     */
    getDataTiposAsentamiento(): void {
        this.loadingTiposAsentamiento = true;
        this.spinner.show();
        this.http.get(this.endpointCatalogos + 'getTiposAsentamiento', this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.loadingTiposAsentamiento = false;
                this.tiposAsentamiento = res;
            },
            (error) => {
                this.spinner.hide();
                this.loadingTiposAsentamiento = false;
            }
        );
    }
    
    /**
     * Obtiene el cat??logo de las v??as
     */
    getDataTiposVia(): void {
        this.spinner.show();
        this.loadingTiposVia = true;
        this.http.get(this.endpointCatalogos + 'getTiposVia', this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.loadingTiposVia = false;
                this.tiposVia = res;
            },
            (error) => {
                this.spinner.hide();
                this.loadingTiposVia = false;
            }
        );
    }
    
    /**
     * Obtiene el cat??logo de los tipos de localidad
     */
    getDataTiposLocalidad(): void {
        this.loadingTiposLocalidad = true;
        this.spinner.show();
        this.http.get(this.endpointCatalogos + 'getTiposLocalidad', this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.loadingTiposLocalidad = false;
                this.tiposLocalidad = res;
            },
            (error) => {
                this.spinner.hide();
                this.loadingTiposLocalidad = false;
            }
        );
    }

    /**
     * Obtiene el arreglo del domicilio previamente seleccionado y lo muestra en sus respectivos campos del fomulario.
     * @param data Arreglo con los datos del registro seleccionado.
     */
    setDataDomicilio(data): void {
       
        this.domicilioFormGroup.controls['idestado'].setValue(data.CODESTADO);
        this.getDataMunicipios({value: this.domicilioFormGroup.value.idestado});
        this.domicilioFormGroup.controls['codasentamiento'].setValue(data.IDCOLONIA);
        this.domicilioFormGroup.controls['idtipoasentamiento'].setValue(data.CODTIPOSASENTAMIENTO);
        this.domicilioFormGroup.controls['asentamiento'].setValue(data.COLONIA);
        this.domicilioFormGroup.controls['codtiposvia'].setValue(data.CODTIPOSVIA);
        this.domicilioFormGroup.controls['idtipovia'].setValue(data.IDVIA);
        this.domicilioFormGroup.controls['via'].setValue(data.VIA);
        this.domicilioFormGroup.controls['idtipolocalidad'].setValue(data.CODTIPOSLOCALIDAD);
        this.domicilioFormGroup.controls['cp'].setValue(data.CODIGOPOSTAL);
        this.domicilioFormGroup.controls['nexterior'].setValue(data.NUMEROEXTERIOR);
        this.domicilioFormGroup.controls['entrecalle1'].setValue(data.ENTRECALLE1);
        this.domicilioFormGroup.controls['entrecalle2'].setValue(data.ENTRECALLE2);
        this.domicilioFormGroup.controls['andador'].setValue(data.ANDADOR);
        this.domicilioFormGroup.controls['edificio'].setValue(data.EDIFICIO);
        this.domicilioFormGroup.controls['seccion'].setValue(data.SECCION);
        this.domicilioFormGroup.controls['entrada'].setValue(data.ENTRADA);
        this.domicilioFormGroup.controls['ninterior'].setValue(data.NUMEROINTERIOR);
        this.domicilioFormGroup.controls['telefono'].setValue(data.TELEFONO);
        this.domicilioFormGroup.controls['adicional'].setValue(data.INDICACIONESADICIONALES);
        this.domicilioFormGroup.controls['id_direccion'].setValue(data.IDDIRECCION);
    
        if(data.CODESTADO == 9){
            // alert('funciona');
            this.domicilioFormGroup.controls['idmunicipio'].setValue(data.IDDELEGACION);
        } else {
            this.domicilioFormGroup.controls['idmunicipio2'].setValue(data.CODMUNICIPIO);
            this.domicilioFormGroup.controls['municipio'].setValue(data.DELEGACION);
            this.domicilioFormGroup.controls['ciudad'].setValue(data.CIUDAD);
            this.domicilioFormGroup.controls['idciudad'].setValue(data.CODCIUDAD);
        }
    }

    /**
     * Abre el dialogo que muestra los municipios de acuerdo al estado,
     * con opci??n para b??squeda especifica.
     */
    getMunicipios(){
        this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
        const dialogRef = this.dialog.open(DialogMunicipiosContribuyenteT, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.domicilioFormGroup.controls['idmunicipio2'].setValue(result.codmunicipio);
                this.domicilioFormGroup.controls['municipio'].setValue(result.municipio);
                this.botonCiudad = false;
            }
        });
    }

    /**
     * Abre el dialogo que muestra las localidades (ciudades) ligadas al municipio seleccionado previamente,
     * con opci??n a b??squeda especifica.
     */
    getCiudad(){
        this.dataDomicilio.idmunicipio2 = this.domicilioFormGroup.value.idmunicipio2;
        const dialogRef = this.dialog.open(DialogCiudadContribuyenteT, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado,
                    codMunicipio : this.dataDomicilio.idmunicipio2
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.botonAsentamiento = false;
                this.domicilioFormGroup.controls['idciudad'].setValue(result.codciudad);
                this.domicilioFormGroup.controls['ciudad'].setValue(result.ciudad);
            }
        });
    }

    /**
     * Abre el dialogo que muestra los asentamientos ligados a la ciudad
     */
    getAsentamiento(){
        this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
        this.dataDomicilio.idmunicipio = this.domicilioFormGroup.value.idmunicipio;
        this.dataDomicilio.idmunicipio2 = this.domicilioFormGroup.value.idmunicipio2;
        this.dataDomicilio.idciudad = (this.domicilioFormGroup.value.idciudad) ? this.domicilioFormGroup.value.idciudad : null;
        const dialogRef = this.dialog.open(DialogAsentamientoContribuyenteT, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado,
                    codMunicipio : this.dataDomicilio.idmunicipio,
                    codMunicipio2 : this.dataDomicilio.idmunicipio2,
                    codCiudad : this.dataDomicilio.idciudad
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.botonVia = false;
                this.domicilioFormGroup.controls['codasentamiento'].setValue(result.codasentamiento);
                this.domicilioFormGroup.controls['asentamiento'].setValue(result.asentamiento);
                this.domicilioFormGroup.controls['idtipoasentamiento'].setValue(result.codtiposasentamiento);
                this.domicilioFormGroup.controls['cp'].setValue(result.codigopostal);
            }
        });
    }

    /**
     * Abre el dialogo que muestra las v??as ligadas al asentamiento
     */
    getVia(){
        this.dataDomicilio.codasentamiento =  this.domicilioFormGroup.value.codasentamiento;
        const dialogRef = this.dialog.open(DialogViaContribuyenteT, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado,
                    codAsentamiento : this.dataDomicilio.codasentamiento
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.domicilioFormGroup.controls['codtiposvia'].setValue(result.codtiposvia);
                this.domicilioFormGroup.controls['idtipovia'].setValue(result.idvia);
                this.domicilioFormGroup.controls['via'].setValue(result.via);
            }
        });
    }
}

/////////////// PERSONALES HISTORICO ////////////////
@Component({
    selector: 'app-dialog-personales-historico-contribuyente',
    templateUrl: 'app-dialog-personales-historico-contribuyente.html',
    styleUrls: ['./editart-contribuyente.component.css']
  })
  export class DialogPersonalesHistoricoContribuyenteT {
    endpoint = environment.endpoint + 'registro/';
    httpOptions;
    idPersona;
    displayedColumns: string[] = ['fecha', 'descripcion', 'numero_expediente', 'tipo_tramite', 'tipo_subtramite', 'detalle'];
    dataHistoricoModificaciones: DataHistorico = {} as DataHistorico;
    dataSource = [];
    pagina = 1;
    total = 0;
    pageSize = 10;
    dataPaginate;
    loading = true;
    
    constructor(
        private auth: AuthService,
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private spinner: NgxSpinnerService,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogPersonalesHistoricoContribuyenteT>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any) {
            dialogRef.disableClose = true;
            this.httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: this.auth.getSession().token
                })
            };
        
            this.idPersona = data.idPersona;
            this.getHistoricoModificaciones();
    
        }

        minDate2 = '';
        maxDate2 = '';
        maxDate = new Date((new Date().getTime()));
    
        fechaTope2(){
            this.dataHistoricoModificaciones.fecha_hasta = null;
            this.minDate2 = moment(this.dataHistoricoModificaciones.fecha_desde).add(1, 'd').format('YYYY-MM-DD');
            this.maxDate2 = moment(this.dataHistoricoModificaciones.fecha_hasta).add(31, 'd').format('YYYY-MM-DD');
        }

    /**
     * Obtiene el hist??rico de mofificaciones
     */
    getHistoricoModificaciones(){
        let query = '';
        this.spinner.show();
        query = (this.dataHistoricoModificaciones.fecha_desde) ? query + '&fechaDesde=' + moment(this.dataHistoricoModificaciones.fecha_desde).format('DD-MM-YYYY') : query + '&fechaDesde=';
        query = (this.dataHistoricoModificaciones.fecha_hasta) ? query + '&fechaHasta=' + moment(this.dataHistoricoModificaciones.fecha_hasta).format('DD-MM-YYYY') : query + '&fechaHasta=';
        query = query + '&idPersona=' + this.idPersona;

        query = query.substr(1);

        this.loading = true;
        let metodo = 'getHistoricosPersona';
        this.http.get(this.endpoint + metodo + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loading = false;
                    this.dataSource = res;
                    this.total = this.dataSource.length;
                    this.dataPaginate = this.paginate(this.dataSource, 10, this.pagina);
                },
                (error) => {
                    this.spinner.hide();
                    this.loading = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'warning',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    /**
     * Regresa la posici??n del paginado de acuerdo a los par??metro enviados
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por p??gina.
     * @param page_number Valor de la p??gina en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    /**
     * @param dataPersonalesEspecifico abre el modal que muestra como se ve??an la informaci??n antes de ser modificada
     */
    viewHistoricoPersonalesEspecifico(dataPersonalesEspecifico): void {
        const dialogRef = this.dialog.open(DialogPersonalesHistoricoEspecificoContribuyenteT, {
            width: '700px',
            data: { dataPersonalesEspecifico:dataPersonalesEspecifico, idPersona:this.idPersona },
        });
        dialogRef.afterClosed().subscribe(result => {
                // this.getNotarioDirecciones();
        });
    }

}

/////////////// PERSONALES HISTORICO ESPECIFICO ////////////////
@Component({
    selector: 'app-dialog-personales-historico-especifico-contribuyente',
    templateUrl: 'app-dialog-personales-historico-especifico-contribuyente.html',
    styleUrls: ['./editart-contribuyente.component.css']
  })
export class DialogPersonalesHistoricoEspecificoContribuyenteT {
    endpoint = environment.endpoint + 'registro/';
    loading = true;
    loadingDocumentos = false;
    idChs;
    idPersona;
    httpOptions;
    fisicaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    dataContribuyenteResultado;
    query;
    idContribuyente;
    contribuyente: DatosContribuyente = {} as DatosContribuyente;
    dataDocumentos: DocumentosIdentificativos[] = [];
    loadingDomicilios = false;
    dataDomicilioResultado;
    isIdentificativo;

    constructor(
        private auth: AuthService,
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private spinner: NgxSpinnerService,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogPersonalesHistoricoEspecificoContribuyenteT>,
        public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) {
        dialogRef.disableClose = true;
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };

        this.idChs = data.dataPersonalesEspecifico;
        this.idPersona = data.idPersona;

        this.fisicaFormGroup = this._formBuilder.group({
            nombre: [null, [Validators.required]],
            apepaterno: [null, [Validators.required]],
            apematerno: [null, []],
            rfc: [null, [Validators.required]],
            curp: [null, [Validators.required]],
            ine: [null, []],
            idDocIdent: ['', []],
            docIdent: [null, []],
            fecha_naci: [null, []],
            fecha_def: [null, []],
            celular: [null, []],
            email: [null, []],
        });

        this.moralFormGroup = this._formBuilder.group({
            nombre_moral: [null, [Validators.required]],
            rfc: [null, [Validators.required]],
            actPreponderante: [null, []],
            idTipoPersonaMoral: ['', []],
            fechaInicioOperacion: [null, []],
            idMotivo: ['', []],
            fechaCambio: [null, []],
        });

        this.getDataDocumentos();
        this.getContribuyenteDatos();
    }

    /**
     * Obtiene los documentos identificativos
     */
    getDataDocumentos(): void{
        this.spinner.show();
        this.loadingDocumentos = true;
        this.http.get(this.endpoint + 'getCatalogos', this.httpOptions).subscribe(
        (res: any) => {
            this.spinner.hide();
            this.loadingDocumentos = false;
            this.dataDocumentos = res.CatDocIdentificativos;
        },
        (error) => {
            this.spinner.hide();
            this.loadingDocumentos = false;
        }
        );
    }

    /**
     * Obtiene los datos del contribuyente
     */
    getContribuyenteDatos(){
        this.spinner.show();
        this.query = '&idPersona=' + this.idPersona + '&idChs=' + this.idChs; 
        this.loading = true;
        this.http.get(this.endpoint + 'getHistoricosPersonaDetalle?' + this.query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loading = false;
                    this.dataContribuyenteResultado = res;
                    this.datoDelContribuyente();
                },
                (error) => {
                    this.spinner.hide();
                    this.loading = false;
                    Swal.fire(
                        {
                        title: 'SIN RESULTADO',
                        text: error.error.mensaje,
                        icon: 'warning',
                        confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Asigna los datos de la consulta a variables
     */
    datoDelContribuyente(){
        this.contribuyente.tipoPersona = this.dataContribuyenteResultado[0].CODTIPOSPERSONA;
        this.contribuyente.nombre  = this.dataContribuyenteResultado[0].NOMBRE;
        this.contribuyente.nombre_moral  = this.dataContribuyenteResultado[0].APELLIDOPATERNO;
        this.contribuyente.apepaterno = this.dataContribuyenteResultado[0].APELLIDOPATERNO;
        this.contribuyente.apematerno = this.dataContribuyenteResultado[0].APELLIDOMATERNO;
        this.contribuyente.rfc = this.dataContribuyenteResultado[0].RFC;
        this.contribuyente.curp = this.dataContribuyenteResultado[0].CURP;
        this.contribuyente.ine = this.dataContribuyenteResultado[0].CLAVEIFE;
        this.contribuyente.identificacion = this.dataContribuyenteResultado[0].IDDOCIDENTIF;
        this.contribuyente.idedato = this.dataContribuyenteResultado[0].VALDOCIDENTIF;
        this.contribuyente.fecha_naci = (this.dataContribuyenteResultado[0].FECHANACIMIENTO) ? new Date(this.dataContribuyenteResultado[0].FECHANACIMIENTO) : null;
        this.contribuyente.fecha_def = (this.dataContribuyenteResultado[0].FECHADEFUNCION) ? new Date(this.dataContribuyenteResultado[0].FECHADEFUNCION) : null;
        this.contribuyente.celular = this.dataContribuyenteResultado[0].CELULAR;
        this.contribuyente.email = this.dataContribuyenteResultado[0].EMAIL;
        this.contribuyente.actPreponderante = this.dataContribuyenteResultado[0].ACTIVPRINCIP;
        this.contribuyente.idTipoPersonaMoral = this.dataContribuyenteResultado[0].IDTIPOMORAL;
        this.contribuyente.fechaInicioOperacion = (this.dataContribuyenteResultado[0].MD_FECHADESDE) ? new Date(this.dataContribuyenteResultado[0].MD_FECHADESDE) : null;
        this.contribuyente.idMotivo = this.dataContribuyenteResultado[0].IDMOTIVOSMORAL;
        this.contribuyente.fechaCambio = (this.dataContribuyenteResultado[0].MD_FECHAHASTA) ? new Date(this.dataContribuyenteResultado[0].MD_FECHAHASTA) : null;

    }

}

///////////////HISTORIAL DE REPRESENTACIONES////////////////
export interface DataHistoricoRep{
    fecha_desde: Date;
    fecha_hasta: Date;
}

@Component({
    selector: 'app-dialog-historialRep',
    templateUrl: 'app-dialog-historialRep.html',
    styleUrls: ['./editart-contribuyente.component.css']
})
export class DialogHistorialRepCT {
    endpoint = environment.endpoint + 'registro/';
    httpOptions;
    dataDoc = [];
    displayedColumns: string[] = ['fecha', 'descripcion', 'numero_expediente', 'tipo_tramite', 'tipo_subtramite', 'detalle'];
    dataHistoricoRep: DataHistoricoRep = {} as DataHistoricoRep;
    dataSource = [];
    pagina = 1;
    total = 0;
    pageSize = 10;
    dataPaginate;
    loadingH = true;
    idPersona;
    idChs;

    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        private spinner: NgxSpinnerService,
        public dialog: MatDialog,
        private auth: AuthService,
        public dialogRef: MatDialogRef<DialogHistorialRepCT>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {

        dialogRef.disableClose = true;

        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };

        this.idPersona = data;
        this.getHistorialRepresentacion();
    }

    /**
     * Obtiene el historial de las representaciones ligadas a la sociedad.
     */
    getHistorialRepresentacion(){
        let query = '';
        this.spinner.show();

        query = 'idPersona=' + this.idPersona;
        query = (this.dataHistoricoRep.fecha_desde) ? query + '&fechaDesde=' + moment(this.dataHistoricoRep.fecha_desde).format('DD-MM-YYYY') : query + '&fechaDesde=';
        query = (this.dataHistoricoRep.fecha_hasta) ? query + '&fechaHasta=' + moment(this.dataHistoricoRep.fecha_hasta).format('DD-MM-YYYY') : query + '&fechaHasta=';


        this.loadingH = true;
        let metodo = 'getHistoricosRepresentacion';
        this.http.get(this.endpoint + metodo + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loadingH = false;
                    this.dataSource = res;

                    this.total = this.dataSource.length;
                    this.dataPaginate = this.paginate(this.dataSource, 10, this.pagina);
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingH = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: "Ha ocurrido un problema al obtener el historial",
                          icon: 'error',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    /**
     * 
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por p??gina.
     * @param page_number Valor de la p??gina en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    /**
     * Recibe el id de la representaci??n y abre el dialogo que mostrar?? el resultado de la b??squeda solicitada.
     * @param element Id de la representcaci??n con la cual se realizar?? la b??squeda.
     */
    historicoDetalle(element){
        this.idChs = element;
        const dialogRef = this.dialog.open(DialogHistorialRepDetalleCT, {
            width: '700px',
            data: this.idChs
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
            }
        });
    }
  
}

///////////////HISTORIAL DE REPRESENTACIONES DETALLE////////////////
export interface DataHistoricoRep{
    fecha_desde: Date;
    fecha_hasta: Date;
}

@Component({
    selector: 'app-dialog-historialRepDetalle',
    templateUrl: 'app-dialog-historialRepDetalle.html',
    styleUrls: ['./editart-contribuyente.component.css']
})
export class DialogHistorialRepDetalleCT {
    endpoint = environment.endpoint + 'registro/';
    httpOptions;
    dataDoc = [];
    loadingH = false;
    insUp = true;
    idChs;
    fisicaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    dataRepresentacion;
    tipoPersonaRep;
    tipoPersonaRepdo;
    nombreR;
    apaternoR;
    amaternoR;
    rfcR;
    curpR;
    ineR;
    idDocIdentR;
    docIdentR;
    fechaNacimientoR;
    fechaDefuncionR;
    celularR;
    emailR;
    actPreponderanteR;
    idTipoPersonaMoralR;
    fechaInicioOperacionR;
    idMotivoR;
    fechaCambioR;
    nombreRdo;
    apaternoRdo;
    amaternoRdo;
    rfcRdo;
    curpRdo;
    ineRdo;
    idDocIdentRdo;
    docIdentRdo;
    fechaNacimientoRdo;
    fechaDefuncionRdo;
    celularRdo;
    emailRdo;
    actPreponderanteRdo;
    idTipoPersonaMoralRdo;
    fechaInicioOperacionRdo;
    idMotivoRdo;
    fechaCambioRdo;
    texto;
    fechaCaducidad;
    tipoDj;
    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        private spinner: NgxSpinnerService,
        public dialog: MatDialog,
        private auth: AuthService,
        public dialogRef: MatDialogRef<DialogHistorialRepDetalleCT>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {

        dialogRef.disableClose = true;

        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };

        this.idChs = data;
        this.getHistorialRepresentacionDetalle();
    }

    /**
     * Obtiene la informaci??n de la representaci??n solicitada.
     */
    getHistorialRepresentacionDetalle(){
        let query = '';
        this.spinner.show();
        query = 'idChs=' + this.idChs;

        this.loadingH = true;
        let metodo = 'getHistoricosRepresentacionDetalle';
        this.http.get(this.endpoint + metodo + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loadingH = false;
                    this.dataRepresentacion = res;
                    this.setDetalle();
                },
                (error) => {
                    this.spinner.hide();
                    this.loadingH = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: "Ha ocurrido un problema al obtener el detalle",
                          icon: 'error',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }

    /**
     * Almacena los datos de la b??squeda realizada para mostrar en el formulario.
     */
    setDetalle(){

            ///////////////// DATOS DEL DOCUMENTO ////////////////////////
            if(this.dataRepresentacion.infoDocumento.infoDocumento[0].codtipodocumentojuridico == "CP"){
                this.tipoDj = 'Carta Poder - ' + moment(this.dataRepresentacion.infoDocumento.infoDocumento[0].codtipodocumentojuridico.fecha).format("DD-MM-YYYY");
            }else{
                this.tipoDj = 'Poder Notarial - ' + moment(this.dataRepresentacion.infoDocumento.infoDocumento[0].codtipodocumentojuridico.fecha).format("DD-MM-YYYY");
            }
            this.texto = this.dataRepresentacion.infoRepresentacion[0].textorepresentacion;
            this.fechaCaducidad = ((this.dataRepresentacion.infoRepresentacion[0].fechacaducidad) ? new Date(this.dataRepresentacion.infoRepresentacion[0].fechacaducidad) : null);

            /////////////////////////////// REPRESENTANTE /////////////////////////////////
            this.tipoPersonaRep = this.dataRepresentacion.infoRepresentante[0].CODTIPOSPERSONA;
            if(this.tipoPersonaRep == 'F'){
                this.nombreR = this.dataRepresentacion.infoRepresentante[0].NOMBRE;
                this.apaternoR = this.dataRepresentacion.infoRepresentante[0].APELLIDOPATERNO;
                this.amaternoR = this.dataRepresentacion.infoRepresentante[0].APELLIDOMATERNO;
                this.rfcR = this.dataRepresentacion.infoRepresentante[0].RFC;
                this.curpR = this.dataRepresentacion.infoRepresentante[0].CURP;
                this.ineR = this.dataRepresentacion.infoRepresentante[0].CLAVEIFE;
                this.idDocIdentR = this.dataRepresentacion.infoRepresentante[0].IDDOCIDENTIF;
                this.docIdentR = this.dataRepresentacion.infoRepresentante[0].DESCDOCIDENTIF;
                this.fechaNacimientoR = ((this.dataRepresentacion.infoRepresentante[0].FECHANACIMIENTO) ? new Date(this.dataRepresentacion.infoRepresentante[0].FECHANACIMIENTO) : null);
                this.fechaDefuncionR = ((this.dataRepresentacion.infoRepresentante[0].FECHADEFUNCION) ? new Date(this.dataRepresentacion.infoRepresentante[0].FECHADEFUNCION) : null);
                this.celularR = this.dataRepresentacion.infoRepresentante[0].CELULAR;
                this.emailR = this.dataRepresentacion.infoRepresentante[0].EMAIL;
                
            } else {
                this.nombreR = this.dataRepresentacion.infoRepresentante[0].APELLIDOPATERNO;
                this.rfcR = this.dataRepresentacion.infoRepresentante[0].RFC;
                this.actPreponderanteR = this.dataRepresentacion.infoRepresentante[0].ACTIVPRINCIP;
                this.idTipoPersonaMoralR = this.dataRepresentacion.infoRepresentante[0].IDTIPOMORAL;
                this.fechaInicioOperacionR = ((this.dataRepresentacion.infoRepresentante[0].FECHAINICIOACTIV) ? new Date(this.dataRepresentacion.infoRepresentante[0].FECHAINICIOACTIV) : null);
                this.idMotivoR = this.dataRepresentacion.infoRepresentante[0].IDMOTIVOSMORAL;
                this.fechaCambioR = ((this.dataRepresentacion.infoRepresentante[0].FECHACAMBIOSITUACION) ? new Date(this.dataRepresentacion.infoRepresentante[0].FECHACAMBIOSITUACION) : null);
            }

            /////////////////////////////// REPRESENTADO /////////////////////////////////
            this.tipoPersonaRepdo = this.dataRepresentacion.infoRepresentado[0].CODTIPOSPERSONA;
            if(this.tipoPersonaRepdo == 'F'){
                this.nombreRdo = this.dataRepresentacion.infoRepresentado[0].NOMBRE;
                this.apaternoRdo = this.dataRepresentacion.infoRepresentado[0].APELLIDOPATERNO;
                this.amaternoRdo = this.dataRepresentacion.infoRepresentado[0].APELLIDOMATERNO;
                this.rfcRdo = this.dataRepresentacion.infoRepresentado[0].RFC;
                this.curpRdo = this.dataRepresentacion.infoRepresentado[0].CURP;
                this.ineRdo = this.dataRepresentacion.infoRepresentado[0].CLAVEIFE;
                this.idDocIdentRdo = this.dataRepresentacion.infoRepresentado[0].IDDOCIDENTIF;
                this.docIdentRdo = this.dataRepresentacion.infoRepresentado[0].DESCDOCIDENTIF;
                this.fechaNacimientoRdo = ((this.dataRepresentacion.infoRepresentado[0].FECHANACIMIENTO) ? new Date(this.dataRepresentacion.infoRepresentado[0].FECHANACIMIENTO) : null);
                this.fechaDefuncionRdo = ((this.dataRepresentacion.infoRepresentado[0].FECHADEFUNCION) ? new Date(this.dataRepresentacion.infoRepresentado[0].FECHADEFUNCION) : null);
                this.celularRdo = this.dataRepresentacion.infoRepresentado[0].CELULAR;
                this.emailRdo = this.dataRepresentacion.infoRepresentado[0].EMAIL;
                
            } else {
                this.nombreRdo = this.dataRepresentacion.infoRepresentado[0].APELLIDOPATERNO;
                this.rfcRdo = this.dataRepresentacion.infoRepresentado[0].RFC;
                this.actPreponderanteRdo = this.dataRepresentacion.infoRepresentado[0].ACTIVPRINCIP;
                this.idTipoPersonaMoralRdo = this.dataRepresentacion.infoRepresentado[0].IDTIPOMORAL;
                this.fechaInicioOperacionRdo = ((this.dataRepresentacion.infoRepresentado[0].FECHAINICIOACTIV) ? new Date(this.dataRepresentacion.infoRepresentado[0].FECHAINICIOACTIV) : null);
                this.idMotivoRdo = this.dataRepresentacion.infoRepresentado[0].IDMOTIVOSMORAL;
                this.fechaCambioRdo = ((this.dataRepresentacion.infoRepresentado[0].FECHACAMBIOSITUACION) ? new Date(this.dataRepresentacion.infoRepresentado[0].FECHACAMBIOSITUACION) : null);
            }
    }
}