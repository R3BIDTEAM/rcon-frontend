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
}


@Component({
  selector: 'app-editar-contribuyente',
  templateUrl: './editar-contribuyente.component.html',
  styleUrls: ['./editar-contribuyente.component.css']
})

export class EditarContribuyenteComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/';
    loading = false;
    loadingDocumentos = false;
    httpOptions;
    fisicaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    cuentaFormGroup: FormGroup;
    dataContribuyenteResultado;
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
    displayedColumnsDom: string[] = ['tipoDir','direccion', 'historial', 'editar'];
    displayedColumnsDomInm: string[] = ['radio','direccion'];
    displayedColumnsRepdo: string[] = ['representacion','texto','caducidad','editar','eliminar'];
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
    accionDomicilio = false;
    accionDomicilioBoletas = false;
    cambioPersona;
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
    ) {
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };
     }

    ngOnInit(): void {
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
        });

        this.moralFormGroup = this._formBuilder.group({
            nombre_moral: [null, [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            rfc: [null, [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            actPreponderante: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            idTipoPersonaMoral: ['', []],
            fechaInicioOperacion: [null, []],
            idMotivo: ['', []],
            fechaCambio: [null, []],
        });

        this.cuentaFormGroup = this._formBuilder.group({
            porcentanje: [null, []],
            cuenta: [null, []],
            tipoDerecho: [null, []],
        });

        this.idContribuyente = this.route.snapshot.paramMap.get('idcontribuyente');
        this.getTipoDerecho();
        this.getDataDocumentos();
        this.getContribuyenteDatos();
        this.getDomicilioContribuyente();
        this.getRepresentacion();
        this.getRepresentado();
        

        // this.minDate = moment(this.dataContribuyenteResultado[0].FECHANACIMIENTO).format('YYYY-MM-DD');
        // alert('hola');
        
    }

    /** 
     * @param event detecta cuando se presiona una tecla, esta funcion sólo permite que se tecleen valores alfanuméricos, los demás son bloqueados
     */
    keyPressAlphaNumeric(event) {
        console.log(event);
        var inp = String.fromCharCode(event.keyCode);
        if (/[a-zA-Z0-9]/.test(inp)) {
            return true;
        } else {
        event.preventDefault();
            return false;
        }
    }

    /**
     * Obtiene el catálogo del tipo de derecho
     */
    getTipoDerecho(){
        this.loadingDerecho = true;
        this.http.get(this.endpoint + 'getCatTiposDerecho', this.httpOptions)
            .subscribe(
                (res: any) => {
                    //this.loadingDerecho = false;
                    this.dataTipoDerecho = res;
                    console.log("DERECHO");
                    console.log(this.dataTipoDerecho);
                    this.getInfoPersonaInmueble();
                },
                (error) => {
                    this.loadingDerecho = false;
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }

    /**
     * Obtiene la información del inmueble de la persona
     */
    getInfoPersonaInmueble(){
        this.loadingDerecho = true;
        this.http.get(this.endpoint + 'getCasPersonaInmueble?idPersona=' + this.idContribuyente, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDerecho = false;
                    this.personaInmueble = res;
                    console.log("DERECHO DATOS");
                    console.log(this.personaInmueble);
                },
                (error) => {
                    this.loadingDerecho = false;
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }

    /**
     * Actualiza la información del inmueble.
     */
    actualizaPersonaInmueble(i,idpersonainmueble){
        console.log("INMUEBLES INPUTS");
        console.log(this.personaInmueble[i].porcentajeparticipacion);
        console.log(this.personaInmueble[i].codtipoderecho);
        
        this.loadingDerecho = true;
        console.log(this.personaInmueble);
        let varPorcentaje = (this.personaInmueble[i].porcentajeparticipacion) ? this.personaInmueble[i].porcentajeparticipacion : '';
        let queryP = 'idPersona=' + this.idContribuyente + '&codTipoDerecho=' + this.personaInmueble[i].codtipoderecho 
                    + '&porcentajeParticipacion=' + varPorcentaje + '&idPersonaInmueble=' + idpersonainmueble;
        console.log(this.endpoint + 'updatePersonaInmueble?');
        this.http.post(this.endpoint + 'updatePersonaInmueble' + '?' + queryP, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDerecho = false;
                    if(res == "Actualizado"){
                        this.snackBar.open("Actualización correcta", 'Cerrar', {
                            duration: 10000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                        this.getDomicilioContribuyente();
                    }
                    
                },
                (error) => {
                    this.loadingDerecho = false;
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }

    /**
     * Actualiza la información del inmueble.
     */
    desasociarCuenta(idpersonainmueble){
        console.log("BORRAR INMUEBLES INPUTS");
        console.log(idpersonainmueble);
        
        this.loadingDerecho = true;
        console.log(this.personaInmueble);
        let queryP = 'idpersonainmueble=' + idpersonainmueble;
        console.log(this.endpoint + 'borrarAsociaCuentaContrib?');
        this.http.post(this.endpoint + 'borrarAsociaCuentaContrib' + '?' + queryP, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDerecho = false;
                    if(res == "Actualizado"){
                        this.snackBar.open("Actualización correcta", 'Cerrar', {
                            duration: 10000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                        this.getTipoDerecho();
                    }
                    
                },
                (error) => {
                    this.loadingDerecho = false;
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
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
            console.log(result);
            if(result != false){
                this.asociarCuenta(result);
            }
        });
    }

    asociarCuenta(dataCuenta){
        this.loadingDerecho = true;
        console.log("ACÁ EL QUERY DE LA CUENTA");
        let queryP = 'idPersona=' + this.idContribuyente + '&region=' + dataCuenta.region + '&manzana=' + dataCuenta.manzana 
                    + '&lote=' + dataCuenta.lote + '&unidadPrivativa=' + dataCuenta.unidad
                    + '&digitoVerificador=' + dataCuenta.digito + '&codtipoderecho=' + dataCuenta.codDerecho + '&porcenparticipacion=' + dataCuenta.porcentaje;
        console.log(this.endpoint + 'insertAsociaCuentaContrib?');
        console.log(queryP);
        this.http.post(this.endpoint + 'insertAsociaCuentaContrib' + '?' + queryP, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    
                    if(res == "Actualizado"){
                        this.snackBar.open("Actualización correcta", 'Cerrar', {
                            duration: 10000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                        this.getTipoDerecho();
                    }else{
                        this.snackBar.open("Error al actualizar, intente nuevamente.", 'Cerrar', {
                            duration: 10000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                        this.loadingDerecho = false;
                    }
                    
                },
                (error) => {
                    this.loadingDerecho = false;
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }

    /**
     * Muestra el dialogo de advertencia para realizar el cambio de tipo de persona.
     * @param event Variable que contiene el valor del tipo de persona actual.
     */
    actualizaPersona(event){
        console.log(event)
        this.actCambioPersona = (event == this.cambioPersona) ? true : false;
        console.log(this.actCambioPersona);
        const dialogRef = this.dialog.open(DialogsCambiaPersona, {
            width: '700px',
            data: this.actCambioPersona
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result === true){
                this.confirmaCambiaPersona();
            }else{
                this.contribuyente.tipoPersona = this.cambioPersona;
                console.log("ACA EL ACT CAMBIO PERSONA")
                console.log(this.contribuyente.tipoPersona);
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
        console.log("TIPO DE PERSONA CAMBIO");
        console.log(this.contribuyente.tipoPersona);
    }

    /**
     *  Si se selecciona alguna opción desbloqueará el input del número del documento.
     * @param event Valor del option
     */
     seleccionaDocto(event){
        this.selectDisabled = true;
        this.selectCedula = false;
        this.selectPasaporte = false;
        this.selectLicencia = false;
        this.selectNSS = false;

        console.log("LO QUE SE SELECCIONO "+this.contribuyente.identificacion);

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
    }

    /**
     * De acuerdo al campo seleccionado será requerido el RFC, el CURP o ambos.
     */
    changeRequired(): void {
        if((!this.contribuyente.rfc && !this.contribuyente.curp)){​​​​​​​​
            this.isRequired = true;
        }​​​​​​​​ else {​​​​​​​​
            this.isRequired = false;
        }​​​​​​​​

        console.log(this.fisicaFormGroup.value.rfc);
        this.fisicaFormGroup.markAsTouched();
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

        console.log(this.contribuyente.nombre_moral);

        this.minDate = (moment(this.contribuyente.fecha_naci).add(2, 'd').format('YYYY-MM-DD'));
        // alert(moment(this.contribuyente.fecha_naci).format('YYYY-MM-DD'));
        this.changeRequired();
    }

    /**
     * Validación para las fechas, fecha defunción no puede ser menor a la de nacimiento.
     */
    fechaTope(){
        this.fisicaFormGroup.controls['fecha_def'].setValue(null);
        this.minDate = moment(this.fisicaFormGroup.controls['fecha_naci'].value).add(2, 'd').format('YYYY-MM-DD');  
    }

    /** 
    * Actualiza los datos del contribuyente
    */
    actualizarContribuyente(){
        //registro/actualizaContribuyente?codtipospersona=F&nombre=Jose Albert&activprincip&idtipomoral&idmotivosmoral&fechainicioactiv&fechacambiosituacion&rfc=RUFV891129R15&apellidopaterno=Hernandez&apellidomaterno=MESSIE&curp=PAGJ830626HMCLMN11&claveife=mmmmmm&iddocidentif=1&valdocidentif=888&fechanacimiento=02-02-1989&fechadefuncion=02-02-2020&celular=5555555&email=nuevo_mail@mail.com&idExpediente&idpersona=4485307
        console.log('Preparando actualización...');
        let query = '';
        this.loading = true;
        this.actualizado = false;

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
        // query = (this.contribuyente.nombre_moral) ? query + '&apellidopaterno=' + this.contribuyente.nombre_moral : query + '&apellidopaterno=';

        if(this.contribuyente.tipoPersona === 'F'){
            query = (this.contribuyente.apepaterno) ? query + '&apellidopaterno=' + this.contribuyente.apepaterno.toLocaleUpperCase().trim() : query + '&apellidopaterno=';
        } else {
            query = (this.contribuyente.nombre_moral) ? query + '&apellidopaterno=' + this.contribuyente.nombre_moral.toLocaleUpperCase().trim() : query + '&apellidopaterno=';
        }

        query = query + '&idExpediente&idpersona='  + this.idContribuyente;

        this.http.post(this.endpoint + 'actualizaContribuyente' + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    console.log("CONTRIBUYENTE ACTUALIZADO");
                    console.log(res);
            
                        this.dataActualizacion.after_CP = res.after_CP;
                        this.dataActualizacion.after_Col = res.after_Col;
                        this.dataActualizacion.after_Direccion = res.after_Direccion;
                        this.dataActualizacion.after_Nombre = res.after_Nombre;
                        this.dataActualizacion.after_RFC = res.after_RFC;
                        this.dataActualizacion.area = res.area;
                        this.dataActualizacion.at = res.at;
                        this.dataActualizacion.before_CP = res.before_CP;
                        this.dataActualizacion.before_Col = res.before_Col;
                        this.dataActualizacion.before_Direccion = res.before_Direccion;
                        this.dataActualizacion.before_Nombre = res.before_Nombre;
                        this.dataActualizacion.before_RFC = res.before_RFC;
                        this.dataActualizacion.cuentaP = res.cuentaP;
                        this.dataActualizacion.fechaConsulta = res.fechaConsulta;
                        this.dataActualizacion.folio = res.folio;
                        this.dataActualizacion.idpersona = res.idpersona;
                        this.dataActualizacion.usuario = res.usuario;

                        this.actualizado = true;
                        this.accionDomicilio = false;
                        this.accionDomicilioBoletas = false;

                    console.log(this.dataActualizacion);
                    this.snackBar.open('guardado correcto', 'Cerrar', {
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

    /** 
    * Abre el dialogo que mostrarrá un mensaje de confirmación según sea el caso
    * @param evento Es el parametro que recibe el método para elegir en el switch que acción realizar.
    * @param element Pude ser un solo dato o un array dependiendo el metodo del swtich.
    * @param tipo Utilizado en el método de eliminarRepresentación para diferenciar entre un representante o representado
    * con valor de 1 y 2 respectivamente.
    */
    confirmaCambio(evento = null, element = null, tipo = null): void {
        this.mensajeConfirma = evento;
        console.log(this.mensajeConfirma);
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
                    default:
                        break;
                }
            }
        });
    }
    
    /**
     * Cambia el tipo de persona de Físca a Moral o viceversa.
     */
    cambiarTipoPersona(){
        console.log("ACA ESTAMOS CAMBIANDO LA PERSONA");
        let query = 'idpersona=' + this.idContribuyente;
        this.loading = true;
        this.actualizado = false;

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
        //cambioTipoPersona?idpersona=4493942&apellidopaterno=Palacios&apellidomaterno=Garcia&nombreF=Telesforo&rfcF=PAGT830626AE0&curp&claveife=&iddocidentif&valdocidentif&fechanacimiento=26-06-1983&fechadefuncion
        //&codtipospersona=M&nombreM=Telesforo Palacios Garcia&activprincipM&idtipomoral&idmotivosmoral&fechainicioactiv&fechacambiosituacion&rfcM=GEC8501014I5&celular&email=
        this.http.post(this.endpoint + 'cambioTipoPersona' + '?' + query, '', this.httpOptions)
        .subscribe(
            (res: any) => {
                this.loading = false;
                console.log("Cambio de persona");
                console.log(res);
                if(res){
                    this.snackBar.open('Actualización correcta', 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                    this.dataActualizacion.after_CP = res.after_CP;
                    this.dataActualizacion.after_Col = res.after_Col;
                    this.dataActualizacion.after_Direccion = res.after_Direccion;
                    this.dataActualizacion.after_Nombre = res.after_Nombre;
                    this.dataActualizacion.after_RFC = res.after_RFC;
                    this.dataActualizacion.area = res.area;
                    this.dataActualizacion.at = res.at;
                    this.dataActualizacion.before_CP = res.before_CP;
                    this.dataActualizacion.before_Col = res.before_Col;
                    this.dataActualizacion.before_Direccion = res.before_Direccion;
                    this.dataActualizacion.before_Nombre = res.before_Nombre;
                    this.dataActualizacion.before_RFC = res.before_RFC;
                    this.dataActualizacion.cuentaP = res.cuentaP;
                    this.dataActualizacion.fechaConsulta = res.fechaConsulta;
                    this.dataActualizacion.folio = res.folio;
                    this.dataActualizacion.idpersona = res.idpersona;
                    this.dataActualizacion.usuario = res.usuario;

                    this.actualizado = true;
                    this.accionDomicilio = false;
                    this.accionDomicilioBoletas = false;
                    this.actCambioPersona = true;
                }else{
                    this.snackBar.open('Se ha presentado un problema intente más tarde', 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
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

    /**
     * Genera el PDF de cambio de datos personales
     */
    async generatePDF() {

        this.dataActualizacion.cuentaP = ((this.dataActualizacion.cuentaP) ? this.dataActualizacion.cuentaP : '');
        let docDefinition = {
          content: [
            {
                image: await this.getBase64ImageFromURL(
                "assets/img/logo_dependencia_rcon.png"
              ),
              width: 450,
              alignment: 'center',
            }, 
            {  
                text: 'COMPROBANTE DE AVISO DE MODIFICACIÓN A LOS DATOS ADMINISTRATIVOS DEL PADRÓN DE CONTRIBUYENTES DEL IMPUESTO PREDIAL',  
                fontSize: 9,  
                alignment: 'center',  
                color: '#000'  
            }, 
            {  
                text: 'ADMINISTRACIÓN TRIBUTARIA: ' + this.dataActualizacion.at,  
                fontSize: 9,  
                alignment: 'left',  
                color: '#000'  
            }, 
            {  
                text: 'NUMERO DE CUENTA PREDIAL: ' + this.dataActualizacion.cuentaP,  
                fontSize: 9,  
                alignment: 'left',  
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
            {  
                layout: 'noBorders',
                table: {  
                    headerRows: 1,  
                    widths: ['30%', '10%', '30%', '30%'],  
                    body: [  
                        ['', '', { text: 'ANTES', bold: true, alignment: 'right', fontSize: 9 }, { text: 'DESPUÉS', bold: true, fontSize: 9 }],  
                        [ '', '', { text: 'Datos del contribuyente', bold: true, alignment: 'right', fontSize: 9 }, { text: 'Datos del contribuyente', bold: true, fontSize: 9 } ],
                        [ { text: 'Nombre del contribuyente:', fontSize: 9 }, '', { text: this.dataActualizacion.before_Nombre, fontSize: 9, alignment: 'right' }, { text: this.dataActualizacion.after_Nombre, fontSize: 9 } ],
                        [ { text: 'RFC (para personas morales)', fontSize: 9 }, '', { text: this.dataActualizacion.before_RFC, fontSize: 9, alignment: 'right' }, { text: this.dataActualizacion.after_RFC, fontSize: 9 } ] 
                    ]  
                }  
            },
            {
                canvas: [
                    {
                        type: 'line',
                        x1: 525,
                        y1: 20,
                        x2: 150,
                        y2: 20,
                        lineWidth: 0.5
                    }
                ]
            },
            {  
                layout: 'noBorders',
                table: {  
                    headerRows: 1,  
                    widths: ['30%', '70%'],  
                    body: [  
                        ['', { text: 'NOMBRE Y FIRMA DE CONFORMIDAD DEL CONTRIBUYENTE O REPRESENTANTE LEGAL', bold: true, alignment: 'center', fontSize: 8 }],    
                    ]  
                }   
            },
            {
                canvas: [
                    {
                        type: 'line',
                        color: 'white',
                        x1: 0,
                        y1: 20,
                        x2: 250,
                        y2: 20,
                        lineWidth: 0.5
                    }
                ]
            },
            {  
                layout: 'noBorders',
                table: {  
                    headerRows: 1,  
                    widths: ['20%', '80%'],  
                    body: [  
                        [{ text: 'Nombre de usuario:', fontSize: 9 }, { text: this.dataActualizacion.usuario, fontSize: 9 }],  
                        [{ text: 'Área de consulta:', fontSize: 9 }, { text: this.dataActualizacion.area, fontSize: 9 }],    
                        [{ text: 'Fecha de consulta:', fontSize: 9 }, { text: this.dataActualizacion.fechaConsulta, fontSize: 9 }],  
                        [{ text: 'Folio:', fontSize: 9 }, { text: this.dataActualizacion.folio, fontSize: 9 }],    
                    ]  
                }  
            },
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
            {  
                table: {  
                    headerRows: 1,  
                    widths: ['100%'],  
                    body: [  
                        [{ text: 'DE CONFORMIDAD CON EL ÚLTIMO PÁRRAFO DEL ARTÍCULO 126 DEL CÓDIGO FISCAL PARA LA CIUDAD DE MÉXICO, LOS DATOS CATASTRALES O ADMINISTRATIVOS, CUALESQUIERA QUE ÉSTOS SEAN, SÓLO PRODUCIRÁN EFECTOS FISCALES O CATASTRALES Y NO DE PROPIEDAD.', fontSize: 9 }]    
                    ]  
                }  
            },
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
            {
                image: await this.getBase64ImageFromURL(
                "assets/img/logo_dependencia_rcon.png"
              ),
              width: 450,
              alignment: 'center',
            }, 
            {  
                text: 'COMPROBANTE DE AVISO DE MODIFICACIÓN A LOS DATOS ADMINISTRATIVOS DEL PADRÓN DE CONTRIBUYENTES DEL IMPUESTO PREDIAL',  
                fontSize: 9,  
                alignment: 'center',  
                color: '#000'  
            }, 
            {  
                text: 'ADMINISTRACIÓN TRIBUTARIA: ' + this.dataActualizacion.at,  
                fontSize: 9,  
                alignment: 'left',  
                color: '#000'  
            }, 
            {  
                text: 'NUMERO DE CUENTA PREDIAL: ' + this.dataActualizacion.cuentaP,  
                fontSize: 9,  
                alignment: 'left',  
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
            {  
                layout: 'noBorders',
                table: {  
                    headerRows: 1,  
                    widths: ['30%', '10%', '30%', '30%'],  
                    body: [  
                        ['', '', { text: 'ANTES', bold: true, alignment: 'right', fontSize: 9 }, { text: 'DESPUÉS', bold: true, fontSize: 9 }],  
                        [ '', '', { text: 'Datos del contribuyente', bold: true, alignment: 'right', fontSize: 9 }, { text: 'Datos del contribuyente', bold: true, fontSize: 9 } ],
                        [ { text: 'Nombre del contribuyente:', fontSize: 9 }, '', { text: this.dataActualizacion.before_Nombre, fontSize: 9, alignment: 'right' }, { text: this.dataActualizacion.after_Nombre, fontSize: 9 } ],
                        [ { text: 'RFC (para personas morales)', fontSize: 9 }, '', { text: this.dataActualizacion.before_RFC, fontSize: 9, alignment: 'right' }, { text: this.dataActualizacion.after_RFC, fontSize: 9 } ] 
                    ]  
                }  
            },
            {
                canvas: [
                    {
                        type: 'line',
                        x1: 525,
                        y1: 20,
                        x2: 150,
                        y2: 20,
                        lineWidth: 0.5
                    }
                ]
            },
            {  
                layout: 'noBorders',
                table: {  
                    headerRows: 1,  
                    widths: ['30%', '70%'],  
                    body: [  
                        ['', { text: 'NOMBRE Y FIRMA DE CONFORMIDAD DEL CONTRIBUYENTE O REPRESENTANTE LEGAL', bold: true, alignment: 'center', fontSize: 8 }],    
                    ]  
                }   
            },
            {
                canvas: [
                    {
                        type: 'line',
                        color: 'white',
                        x1: 0,
                        y1: 20,
                        x2: 250,
                        y2: 20,
                        lineWidth: 0.5
                    }
                ]
            },
            {  
                layout: 'noBorders',
                table: {  
                    headerRows: 1,  
                    widths: ['20%', '80%'],  
                    body: [  
                        [{ text: 'Nombre de usuario:', fontSize: 9 }, { text: this.dataActualizacion.usuario, fontSize: 9 }],  
                        [{ text: 'Área de consulta:', fontSize: 9 }, { text: this.dataActualizacion.area, fontSize: 9 }],    
                        [{ text: 'Fecha de consulta:', fontSize: 9 }, { text: this.dataActualizacion.fechaConsulta, fontSize: 9 }],  
                        [{ text: 'Folio:', fontSize: 9 }, { text: this.dataActualizacion.folio, fontSize: 9 }],    
                    ]  
                }  
            },
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
            {  
                table: {  
                    headerRows: 1,  
                    widths: ['100%'],  
                    body: [  
                        [{ text: 'DE CONFORMIDAD CON EL ÚLTIMO PÁRRAFO DEL ARTÍCULO 126 DEL CÓDIGO FISCAL PARA LA CIUDAD DE MÉXICO, LOS DATOS CATASTRALES O ADMINISTRATIVOS, CUALESQUIERA QUE ÉSTOS SEAN, SÓLO PRODUCIRÁN EFECTOS FISCALES O CATASTRALES Y NO DE PROPIEDAD.', fontSize: 9 }]    
                    ]  
                }  
            },
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
      * Genera el PDF de cambio de Domicilio
      */
      async generatePDFDomicilio() {
        let docDefinition = {
          content: [
            {
                image: await this.getBase64ImageFromURL(
                "assets/img/logo_dependencia_rcon.png"
              ),
              width: 450,
              alignment: 'center',
            }, 
            {  
                text: 'COMPROBANTE DE AVISO DE MODIFICACIÓN AL PADRÓN DE CONTRIBUYENTES DEL IMPUESTO PREDIAL',  
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
                        y1: 10,
                        x2: 250,
                        y2: 10,
                        lineWidth: 0.5
                    }
                ]
            },
            {  
                text: 'ADMINISTRACIÓN TRIBUTARIA: ' + this.dataActualizacion.at,  
                fontSize: 9,  
                alignment: 'left',  
                color: '#000'  
            }, 
            {  
                text: 'NUMERO DE CUENTA PREDIAL: ' + this.dataActualizacion.cuentaP,  
                fontSize: 9,  
                alignment: 'left',  
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
            {  
                layout: 'noBorders',
                table: {  
                    headerRows: 1,  
                    widths: ['30%', '10%', '30%', '30%'],  
                    body: [  
                        ['', '', { text: 'ANTES', bold: true, alignment: 'right', fontSize: 9 }, { text: 'DESPUÉS', bold: true, fontSize: 9 }],  
                        [ '', '', { text: 'Datos del contribuyente', bold: true, alignment: 'right', fontSize: 9 }, { text: 'Datos del contribuyente', bold: true, fontSize: 9 } ],
                        [ { text: 'Nombre del contribuyente:', fontSize: 9 }, '', { text: this.dataActualizacion.before_Nombre, fontSize: 9, alignment: 'right' }, { text: this.dataActualizacion.after_Nombre, fontSize: 9 } ],
                        [ { text: 'RFC', fontSize: 9 }, '', { text: this.dataActualizacion.before_RFC, fontSize: 9, alignment: 'right' }, { text: this.dataActualizacion.after_RFC, fontSize: 9 } ],
                        ['', '', { text: 'Datos Administrativos del Inmueble', bold: true, alignment: 'right', fontSize: 9 }, { text: 'Datos Administrativos del Inmueble', bold: true, fontSize: 9 }],
                        [ { text: 'Domicilio de notificación:', fontSize: 9 }, '', { text: this.dataActualizacion.before_Direccion, fontSize: 9, alignment: 'right' }, { text: this.dataActualizacion.after_Direccion, fontSize: 9 } ],
                        [ { text: 'Colonia:', fontSize: 9 }, '', { text: this.dataActualizacion.before_Col, fontSize: 9, alignment: 'right' }, { text: this.dataActualizacion.after_Col, fontSize: 9 } ],
                        [ { text: 'C.P:', fontSize: 9 }, '', { text: this.dataActualizacion.before_CP, fontSize: 9, alignment: 'right' }, { text: this.dataActualizacion.after_CP, fontSize: 9 } ],
                    ]  
                }  
            },
            {
                canvas: [
                    {
                        type: 'line',
                        x1: 525,
                        y1: 20,
                        x2: 150,
                        y2: 20,
                        lineWidth: 0.5
                    }
                ]
            },
            {  
                layout: 'noBorders',
                table: {  
                    headerRows: 1,  
                    widths: ['30%', '70%'],  
                    body: [  
                        ['', { text: 'NOMBRE Y FIRMA DE CONFORMIDAD DEL CONTRIBUYENTE O REPRESENTANTE LEGAL', bold: true, alignment: 'center', fontSize: 8 }],    
                    ]  
                }   
            },
            {
                canvas: [
                    {
                        type: 'line',
                        color: 'white',
                        x1: 0,
                        y1: 20,
                        x2: 250,
                        y2: 20,
                        lineWidth: 0.5
                    }
                ]
            },
            {  
                layout: 'noBorders',
                table: {  
                    headerRows: 1,  
                    widths: ['20%', '80%'],  
                    body: [  
                        [{ text: 'Nombre de usuario:', fontSize: 9 }, { text: this.dataActualizacion.usuario, fontSize: 9 }],  
                        [{ text: 'Área de consulta:', fontSize: 9 }, { text: this.dataActualizacion.area, fontSize: 9 }],    
                        [{ text: 'Fecha de consulta:', fontSize: 9 }, { text: this.dataActualizacion.fechaConsulta, fontSize: 9 }],  
                        [{ text: 'Folio:', fontSize: 9 }, { text: this.dataActualizacion.folio, fontSize: 9 }],    
                    ]  
                }  
            },
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
            {  
                layout: 'noBorders',
                table: {  
                    headerRows: 1,  
                    widths: ['100%'],  
                    body: [  
                        [{ text: 'Contribuyente: De conformidad con el artículo 56, inciso b) párrafo segundo del Código Fiscal del Distrito Federal, los avisos que se presenten en forma extemporánea, surtirán sus efectos a partir de la fecha en que sean presentados. Asímismo, se le recuerda que, conforme con el artículo 73, fracción VII, las autoridades competentes a fin de cerciorarse del cumplimiento de las disposiciones que rigen la materia y comprobar infracciones a las mismas, están facultadas para realizar la verificación física, clasificación, valuación o comprobación de toda clase de bienes relacionados con las obligaciones fiscales establecidas en el mencionado Código.', fontSize: 8, alignment: "justify" }]    
                    ]  
                }  
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
    
    /**
     * Obtiene los domicilios registrados de la sociedad domicilios particulares y para recibir notificaciones.
     */
    getDomicilioContribuyente(){
        this.loadingDomicilios = true;
        this.loadingInmuebles = true;
        let metodo = 'getDireccionesContribuyente';
        this.http.get(this.endpointActualiza + metodo + '?idPersona='+ this.idContribuyente, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDomicilios = false;
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
        this.http.get(this.endpointActualiza + 'getInmuebles' + '?idPersona='+ this.idContribuyente, this.httpOptions)
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
     * Almacena la variable con el id seleccionado en la tabla. 
     * @param direccionID Variable con el valor del id de la dirección
     */
    setIdDireccion(direccionID){
        console.log("ACÁ EL ID DE LA DIRECCIÓN");
        console.log(direccionID);
        this.idDireccionI = direccionID;
        this.selectIdDireccion = false;
    }

    /**
     * Almacena las variables del inmueble seleccionado para insertar o actualizar la información del inmuble.
     * @param inmueblePersonaID Variable con el valor del id del inmueblePersona.
     * @param domicilioFPId Variable con el valor de id del domicilio fiscal predial.
     */
    setIdInmueble(inmueblePersonaID,domicilioFPId){
        console.log("ACÁ EL ID DEL INMUEBLE");
        console.log(inmueblePersonaID);
        console.log(domicilioFPId);
        this.idPersonaInmueble = inmueblePersonaID;
        this.idDomicilioFP = domicilioFPId;
        this.selectIdPersonaI = false;
    }

    verificaDomicilioInmueble(){
        if(this.idDomicilioFP){
            this.actualizaDomicilioInmueble();
            console.log("ACÁ SI EXISTE EL" + this.idDomicilioFP);
        }else{
            this.insertaDomicilioInmueble();
            console.log("ACÁ NO EXISTE EL" + this.idDomicilioFP);
        }
    }
    
    /**
     * Inserta la nueva dirección fiscal del inmuble.
     */
    insertaDomicilioInmueble(){
        this.loadingDomicilios = true;
        this.loadingInmuebles = true;
        let queryDPI = 'idPersona=' + this.idContribuyente + '&idDireccion=' + this.idDireccionI + '&idPersonaInmueble=' + this.idPersonaInmueble;
        console.log("INSERTAR LA DIRECCIÓN DEL INMUEBLE");
        console.log(this.endpoint + 'InsertarInmuebleDomicilioFiscal' + '?' + queryDPI);
        this.http.post(this.endpoint + 'InsertarInmuebleDomicilioFiscal' + '?' + queryDPI, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    if(res.length > 0){
                        this.getDomicilioContribuyente();
                        this.snackBar.open('Actualización correcta', 'Cerrar', {
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
                    console.log(res);
                },
                (error) => {
                    this.loadingDomicilios = false;
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
     * Inserta la nueva dirección fiscal del inmuble.
     */
    actualizaDomicilioInmueble(){
        this.snackBar.open('El inmueble ya cuenta con una dirección registrada.', 'Cerrar', {
            duration: 10000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
        });
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
     * @param iddireccion obtiene la direccion especifica con el id que recibe
     */
    getDireccionEspecifica(iddireccion){
        this.loadingDireccionEspecifica = true;
        let metodo = 'getDireccionById';
        this.http.get(this.endpointActualiza + metodo + '?idDireccion='+ iddireccion, this.httpOptions)
            .subscribe(
                (res: any) => {
                    // alert('entro');
                    this.loadingDireccionEspecifica = false;
                    this.dataDomicilioEspecifico = res;
                    this.editDomicilio(this.dataDomicilioEspecifico);
                    console.log('domicilio único encontrado');
                    console.log(this.dataDomicilioEspecifico);
                },
                (error) => {
                    this.loadingDireccionEspecifica = false;
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
    paginate(array, page_size, page_number) {
      return array.slice((page_number - 1) * page_size, page_number * page_size);
    }


    /**
     * Abre el dialogo que registrara un nuevo domicilio
     */
    addDomicilio(i = -1, dataDomicilio = null): void {
        let codtiposdireccion = '';
        const dialogRef = this.dialog.open(DialogDomicilioContribuyente, {
            width: '700px',
            data: {dataDomicilio:dataDomicilio, idContribuyente: this.idContribuyente, codtiposdireccion: codtiposdireccion},
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log(result);

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
                
                console.log(this.dataActualizacion.after_CP);
                console.log(this.dataActualizacion.after_Nombre);

                this.accionDomicilio = true;
                this.accionDomicilioBoletas = false;
                this.actualizado = false;
                this.loadingDomicilios = true;
                setTimeout (() => {
                    this.getDomicilioContribuyente();
                }, 1500);
            }
            
        });
    }

    /**
     * Abre el dialogo que registrara un nuevo domicilio con notificación
     */
    addDomicilioBoleta(i = -1, dataDomicilio = null): void {
        let codtiposdireccion = 'N';
        const dialogRef = this.dialog.open(DialogDomicilioContribuyente, {
            width: '700px',
            data: {dataDomicilio:dataDomicilio, idContribuyente: this.idContribuyente, codtiposdireccion: codtiposdireccion},
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log(result);

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
                
                console.log(this.dataActualizacion.after_CP);
                console.log(this.dataActualizacion.after_Nombre);

                this.accionDomicilio = false;
                this.accionDomicilioBoletas = true;
                this.actualizado = false;
                setTimeout (() => {
                    this.getDomicilioContribuyente();
                }, 1500);
            }
            
        });
    }

    /**
     * Recibe el id dirección que enviará al dialog para realizar la búsqueda del domicilio.
     * @param dataDomicilioEspecifico Valor que se enviará para la obtención del registro a editar.
     */
    editDomicilio(dataDomicilioEspecifico): void {
        const dialogRef = this.dialog.open(DialogDomicilioContribuyente, {
            width: '700px',
            data: {dataDomicilioEspecifico:dataDomicilioEspecifico, idContribuyente: this.idContribuyente},
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log("ACA ESTAMOS!!!!!!!!!!!!!!!!");
            console.log(result);
            if(result){
                console.log(result);

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
                
                console.log(this.dataActualizacion.after_CP);
                console.log(this.dataActualizacion.after_Nombre);

                this.accionDomicilio = true;
                this.accionDomicilioBoletas = false;
                this.actualizado = false;
                this.loadingDomicilios = true;
                setTimeout (() => {
                    this.getDomicilioContribuyente();
                }, 1500);
            }
        });
    }

    /**
     * Recibe el id dirección que enviará al dialog para realizar la búsqueda del domicilio.
     * @param dataDomicilioEspecifico Valor que se enviará para la obtención del registro a editar.
     */
    editDomicilioBoleta(dataDomicilioEspecifico): void {
        let codtiposdireccion = 'N';
        const dialogRef = this.dialog.open(DialogDomicilioContribuyente, {
            width: '700px',
            data: {dataDomicilioEspecifico:dataDomicilioEspecifico, idContribuyente: this.idContribuyente, codtiposdireccion: codtiposdireccion},
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log(result);

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
                
                console.log(this.dataActualizacion.after_CP);
                console.log(this.dataActualizacion.after_Nombre);

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
     * @param idDireccion Valor que se enviará para la obtención de los movimientos sobre ese domicilio
     */
    viewHistoricoDomicilio(idDireccion): void {
        const dialogRef = this.dialog.open(DialogDomicilioHistoricoContribuyente, {
            width: '700px',
            data: {idDireccion},
        });
        dialogRef.afterClosed().subscribe(result => {
                // this.getNotarioDirecciones();
        });
    }

    /**
     * @param idPersona Valor que se enviará para la obtención de los movimientos sobre esa persona
     */
    viewHistoricoDatosPersonales(idPersona): void {
        const dialogRef = this.dialog.open(DialogPersonalesHistoricoContribuyente, {
            width: '700px',
            data: {idPersona},
        });
        dialogRef.afterClosed().subscribe(result => {
                // this.getNotarioDirecciones();
        });
    }

    /**
     * Abre el dialogo para relizar el registro de la representación o edición de la misma.
     * @param dataRepresentante Arreglo de los datos de la representación seleccionada
     */
    addRepresentante(i = -1, dataRepresentante = null): void {
        const dialogRef = this.dialog.open(DialogRepresentacionC, {
            width: '700px',
            data: {dataRepresentante : dataRepresentante,
                    datosPerito : this.contribuyente,
                    idPerito : this.idContribuyente
            },
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                setTimeout (() => {
                    this.loadingRepresentante = true;
                    this.getRepresentacion();
                }, 2000);
            }
        });
    }

    /**
     * Abre el dialogo para relizar el registro de la representación o edición de la misma.
     * @param dataRepresentante Arreglo de los datos de la representación seleccionada
     */
    addRepresentado(i = -1, dataRepresentante = null): void {
        const dialogRef = this.dialog.open(DialogRepresentadoC, {
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
     * Elimina la representación seleccionada
     * @param element Datos de la representación a eliminar
     * @param tipo Valor del tipo de representación de acuerdo al valor seleccionara el método correspondiente.
     */
    eliminarRepresentacion(element,tipo){
        let queryDelRep = 'idRepresentacion=' + element.IDREPRESENTACION;
        console.log(element);
        console.log(this.endpointActualiza + 'deleteRepresentacion?' + queryDelRep);
        this.http.post(this.endpointActualiza + 'deleteRepresentacion?' + queryDelRep, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    console.log("ELIMINADO");
                    console.log(res);
                    if(res){
                        if(tipo == 1){
                            this.getRepresentacion();
                        }else{
                            this.getRepresentado();
                        }
                        this.snackBar.open("Se ha eliminado la representación", 'Cerrar', {
                            duration: 10000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                        
                    }else{
                        this.snackBar.open("Ocorrio un error al eliminar, intentelo nuevamente", 'Cerrar', {
                            duration: 10000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                    }
                },
                (error) => {
                    this.snackBar.open("Ocorrio un error al eliminar, intentelo nuevamente", 'Cerrar', {
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
        this.http.get(this.endpointActualiza + 'getRepresentacionContribuyente?' + queryRep, this.httpOptions)
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
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado4(evt): void{
        this.pagina4 = evt.pageIndex + 1;
        this.dataSource4 = this.paginate(this.dataSource4, 15, this.pagina4);
    }

    /**
     * Obtienen los representados de la sociedad.
     */
    getRepresentado(){
        this.loadingRepresentado = true;
        let queryRepdo = 'rep=Representado&idPersona=' + this.idContribuyente;
        console.log(this.endpointActualiza + 'getRepresentacionContribuyente?' + queryRepdo);
        this.http.get(this.endpointActualiza + 'getRepresentacionContribuyente?' + queryRepdo, this.httpOptions)
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
    paginado5(evt): void{
        this.pagina5 = evt.pageIndex + 1;
        this.dataSource5 = this.paginate(this.dataSource5, 15, this.pagina5);
    }

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
     paginado6(evt): void{
        this.pagina5 = evt.pageIndex + 1;
        this.dataSource5 = this.paginate(this.dataSource5, 15, this.pagina5);
    }

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
     paginado7(evt): void{
        this.pagina5 = evt.pageIndex + 1;
        this.dataSource5 = this.paginate(this.dataSource5, 15, this.pagina5);
    }

    /**
     * Abre el dialogo que nos mostrará el historial de las representaciones.
     */
    historialRepresentacion(){
        const dialogRef = this.dialog.open(DialogHistorialRepC, {
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
  styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogDomicilioContribuyente {
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
  blockButtons = true;
  lafinal: DataMovimientoDomicilio[] = [];

    constructor(
        private auth: AuthService,
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogDomicilioContribuyente>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any) {
            console.log(data);
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
                console.log("recibimos data seteado1"+data.dataDomicilioEspecifico);
                this.loadingDireccionEspecifica = true;
                setTimeout(() => {
                    this.getDireccionEspecifica();
                }, 5000);
            }
        }
  
    /** 
     * Realiza la búsqueda del domicilio por el id Dirección
     * */  
    getDireccionEspecifica(){
        
        let metodo = 'getDireccionById';
        this.http.get(this.endpointCatalogos + metodo + '?idDireccion='+ this.iddireccion, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDireccionEspecifica = false;
                    this.dataDomicilioEspecifico = res;
                    console.log('domicilio único encontrado');
                    console.log(this.dataDomicilioEspecifico);
                    setTimeout(() => {
                        this.setDataDomicilio(this.dataDomicilioEspecifico[0]);    
                    }, 500);
                    
                },
                (error) => {
                    this.loadingDireccionEspecifica = false;
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
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
     * Obtiene el catálogo de estados de la república mexicana. 
     */
    getDataEstados(): void {
        this.loadingEstados = true;
        this.http.get(this.endpointCatalogos + 'getEstados', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingEstados = false;
                this.estados = res;
                this.getAlcaldia();
            },
            (error) => {
                this.loadingEstados = false;
            }
        );
    }

    /**
     * Obtiene el catálogo de la alcaldia.
     */
     getAlcaldia(){
        let busquedaMunCol = 'getDelegaciones';
        this.loadingMunicipios = true;
        this.http.get(this.endpointCatalogos + busquedaMunCol, this.httpOptions).subscribe(
            (res: any) => {
                this.loadingMunicipios = false;
                this.municipios = res;
                console.log('GETDELEG');
                console.log(res);
            },
            (error) => {
                this.loadingMunicipios = false;
            }
        );
    }

    /**
     * Obtiene los municipios de acuerdo al estado seleccionado
     * @param event Valor que se recibe para la obtención de las alcaldias o municipios.
     */
     getDataMunicipios(event): void {
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
                this.loadingMunicipios = false;
                this.municipios = res;
                console.log('GETDELEG');
                console.log(res);
            },
            (error) => {
                this.loadingMunicipios = false;
            }
        );
    }
    
    /**
     * Obtiene el catálogo de los asentamientos.
     */
    getDataTiposAsentamiento(): void {
        this.loadingTiposAsentamiento = true;
        this.http.get(this.endpointCatalogos + 'getTiposAsentamiento', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposAsentamiento = false;
                this.tiposAsentamiento = res;
                console.log('AQUI EL ASENTAMIENTO SELECT');
                console.log(this.tiposAsentamiento);
            },
            (error) => {
                this.loadingTiposAsentamiento = false;
            }
        );
    }

    /**
     * Obtiene el catálogo de las vías
     */
    getDataTiposVia(): void {
        this.loadingTiposVia = true;
        this.http.get(this.endpointCatalogos + 'getTiposVia', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposVia = false;
                this.tiposVia = res;
                console.log('AQUI EL TIPOS VIA SELECT');
                console.log(this.tiposVia);
                console.log(this.codtiposdireccion);
            },
            (error) => {
                this.loadingTiposVia = false;
            }
        );
    }

    /**
     * Obtiene el catálogo de los tipos de localidad
     */
    getDataTiposLocalidad(): void {
        this.loadingTiposLocalidad = true;
        this.http.get(this.endpointCatalogos + 'getTiposLocalidad', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposLocalidad = false;
                this.tiposLocalidad = res;
                console.log('AQUI EL TIPOS LOCALIDAD');
                console.log(this.tiposLocalidad);
            },
            (error) => {
                this.loadingTiposLocalidad = false;
            }
        );
    }

    /**
     * Almacena los datos del formulario del domicilio y de acuerdo al valor inserta o actualiza
     */
    getDataDomicilio(): void {
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
      
        console.log('EL SUPER QUERY!!!!!!');
        console.log(query);
        
        this.http.post(this.endpointCatalogos + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    console.log("Aquí se inserta una nueva Dirección");
                    console.log(res);
                    console.log(this.codtiposdireccion);

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

                    this.dialogRef.close(this.dataMovimientoDomicilio);
                    this.loadingEstados = false;
                    this.snackBar.open('Registro exitoso', 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                },
                (error) => {
                    this.dialogRef.close();
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
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
    
        console.log('Actualizacion de Direcciones...');
        console.log(query);
    
        this.http.post(this.endpointCatalogos + query, '', this.httpOptions)
            .subscribe(
            
                (res: any) => {
                    console.log("AQUI ACTUALIZO");
                    console.log(res);
                    console.log(this.codtiposdireccion);

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
                    console.log("AQUI dataMovimientoDomicilio");
                    console.log(this.dataMovimientoDomicilio);

                    this.snackBar.open('Actualización Correcta', 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                    this.dialogRef.close(this.dataMovimientoDomicilio);
                    this.loadingEstados = false;
                },
                (error) => {
                    this.dialogRef.close();
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }

    /**
     * Recibe los datos del domicilio previamente seleccionado para su edición
     * @param data Arreglo con los datos del registro seleccionado.
     */
    setDataDomicilio(data): void {
        console.log("ACA EL COD DATA ESPE");
        console.log(data);
    
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
     * con opción para búsqueda especifica.
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
        const dialogRef = this.dialog.open(DialogMunicipiosContribuyente, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log("MUNICIPIOS!!!!!!!");
                console.log(result);
                this.domicilioFormGroup.controls['idmunicipio2'].setValue(result.codmunicipio);
                this.domicilioFormGroup.controls['municipio'].setValue(result.municipio);
                this.botonCiudad = false;
            }
        });
    }

    /**
     * Abre el dialogo que muestra las localidades (ciudades) ligadas al municipio seleccionado previamente,
     * con opción a búsqueda especifica.
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
        const dialogRef = this.dialog.open(DialogCiudadContribuyente, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado,
                    codMunicipio : this.dataDomicilio.idmunicipio2
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.botonAsentamiento = false;
                console.log("CIUDAD!!!!!!!");
                console.log(result);
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
        const dialogRef = this.dialog.open(DialogAsentamientoContribuyente, {
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
                console.log("ASENTAMIENTO!!!!!!!");
                console.log(result);
                this.domicilioFormGroup.controls['codasentamiento'].setValue(result.codasentamiento);
                this.domicilioFormGroup.controls['asentamiento'].setValue(result.asentamiento);
                this.domicilioFormGroup.controls['idtipoasentamiento'].setValue(result.codtiposasentamiento);
                this.domicilioFormGroup.controls['cp'].setValue(result.codigopostal);
            }
        });
    }

    /**
     * Abre el dialogo que muestra las vías ligadas al asentamiento
     */
    getVia(){
        this.dataDomicilio.codasentamiento =  this.domicilioFormGroup.value.codasentamiento;
        const dialogRef = this.dialog.open(DialogViaContribuyente, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado,
                    codAsentamiento : this.dataDomicilio.codasentamiento
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log("VIA!!!!!!!");
                console.log(result);
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
  styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogMunicipiosContribuyente {
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
      public dialog: MatDialog,
      public dialogRef: MatDialogRef<DialogMunicipiosContribuyente>,
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
      console.log(data);
  }

    /**
     * Limpia los registros de la búsqueda especifica realizada y llama al metodo para obtener todos los municipios
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

      if(this.data.codEstado != 9){
          criterio = criterio + 'getMunicipiosByEstado';
          query = query + 'codEstado=' + this.data.codEstado;
      }else{
          criterio = '';
          query = '';
      }

      console.log('ASENTAMIENTOSSSS'+this.endpoint + '?' + query);
      this.loadingBuscaMun = true;
      this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
          .subscribe(
              (res: any) => {
                  this.loadingBuscaMun = false;
                  this.dataSource = res;
                  this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                  this.total = this.dataSource.length; 
                  this.paginator.pageIndex = 0;
                  console.log(this.dataSource);
              },
              (error) => {
                  this.loadingBuscaMun = false;
              }
          );
  }

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
  
    /**
     * 
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por página.
     * @param page_number Valor de la página en la cual se encuentra el paginado.
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
        console.log(element);
        this.dataMunicipios.codestado = element.CODESTADO;
        this.dataMunicipios.codmunicipio = element.CODMUNICIPIO;
        this.dataMunicipios.municipio = element.MUNICIPIO;
    }

    /**
     * Obtiene el municipio deseado por el criterio del nombre.
     */
    obtenerMunicipiosPorNombre(){
        this.loadingBuscaMun = true;
        let criterio = '';
        let query = '';
        console.log(this.buscaMunicipios);
        if(this.data.codEstado != 9){
            criterio = criterio + 'getMunicipiosByNombre';
            query = query + 'codEstado=' + this.data.codEstado + '&municipio=' + this.buscaMunicipios;
        }else{
            criterio = '';
            query = '';
        }

        console.log('ASENTAMIENTOSSSS'+this.endpoint + '?' + query);
        this.loadingBuscaMun = true;
        this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingBuscaMun = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    console.log(this.dataSource);
                },
                (error) => {
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
  styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogCiudadContribuyente {
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
      private _formBuilder: FormBuilder,
      public dialog: MatDialog,
      public dialogRef: MatDialogRef<DialogCiudadContribuyente>,
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
      console.log(data);
  }

    /**
     * Limpia la búsqueda especifica realizada y llama al método que obtiene todos los registros previamente mostrados.
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

        console.log('CIUDAD!!!!!'+this.endpoint + '?' + query);
        this.loadingBuscaCiudad = true;
        this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingBuscaCiudad = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    console.log(this.dataSource);
                },
                (error) => {
                    this.loadingBuscaCiudad = false;
                }
            );
    }

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
  
    /**
     * Regresa la posición del paginado de acuerdo a los parámetro enviados
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por página.
     * @param page_number Valor de la página en la cual se encuentra el paginado.
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
        console.log(element);
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

  //     console.log('ASENTAMIENTOSSSS'+this.endpoint + '?' + query);
  //     this.loadingBuscaCiudad = true;
  //     this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
  //         .subscribe(
  //             (res: any) => {
  //                 this.loadingBuscaCiudad = false;
  //                 this.dataSource = res;
  //                 this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
  //                 this.total = this.dataSource.length; 
  //                 this.paginator.pageIndex = 0;
  //                 console.log(this.dataSource);
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
  styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogAsentamientoContribuyente {
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
      private _formBuilder: FormBuilder,
      public dialog: MatDialog,
      public dialogRef: MatDialogRef<DialogAsentamientoContribuyente>,
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
      console.log(data);
  }

    /**
     * Limpia la búsqueda especifica realizada y llama al método que obtiene todos los registros previamente mostrados.
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

        console.log('ASENTAMIENTOSSSS'+this.endpoint + '?' + query);
        this.loading = true;
        this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
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
                }
            );
    }

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
  
    /**
     * Regresa la posición del paginado de acuerdo a los parámetro enviados
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por página.
     * @param page_number Valor de la página en la cual se encuentra el paginado.
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
        console.log(element);
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
  
        if(this.data.codEstado == 9){
            criterio = criterio + 'getColAsentByDelegacion';
            query = query + 'idDelegacion=' + this.data.codMunicipio + '&nombre=' + this.buscaAsentamiento;
        }else{
            criterio = 'getAsentamientoByNombre';
            query = query + 'nombre=' + this.buscaAsentamiento + '&codEstado=' + this.data.codEstado + '&codMunicipio=' + this.data.codMunicipio2;
            query = (this.data.codCiudad) ? query + '&codCiudad=' + this.data.codCiudad : query + '&codCiudad=';
        }
        
        console.log('ASENTAMIENTOSSSS'+this.endpoint + '?' + query);
        this.loading = true;
        this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
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
  styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogViaContribuyente {
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
      private _formBuilder: FormBuilder,
      public dialog: MatDialog,
      public dialogRef: MatDialogRef<DialogViaContribuyente>,
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
      console.log(data);
  }

    /**
     * Limpia los registros de la búsqueda especifica realizada y llama al metodo para obtener todos los municipios
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
     * Obtiene las vías de acuerdo al criterio del nombre o por el id de la colonia previamente seleccionada
     */
    obtenerVia(){
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

        console.log('VIA!!!!!'+this.endpoint + '?' + query);
        this.loadingBuscaVia = true;
        this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingBuscaVia = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    console.log(this.dataSource);
                },
                (error) => {
                    this.loadingBuscaVia = false;
                }
            );
    }

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
  
    /**
     * Regresa la posición del paginado de acuerdo a los parámetro enviados
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por página.
     * @param page_number Valor de la página en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    /**
     * Obtiene los datos y almacena los datos de la vía seleccionada.
     * @param element Arreglo de los datos del registro seleccionado
     */
    selectVia(element){
        console.log(element);
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

        if(this.data.codEstado != 9){
            criterio = criterio + 'getMunicipiosByEstado';
            query = query + 'codEstado=' + this.data.codEstado;
        }else{
            criterio = '';
            query = '';
        }

        console.log('ASENTAMIENTOSSSS'+this.endpoint + '?' + query);
        this.loadingBuscaVia = true;
        this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingBuscaVia = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    console.log(this.dataSource);
                },
                (error) => {
                    this.loadingBuscaVia = false;
                }
            );
    }
}

///////////////REPRESENTACION////////////////
@Component({
    selector: 'app-dialog-representacion',
    templateUrl: 'app-dialog-representacion.html',
    styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogRepresentacionC {
    endpoint = environment.endpoint + 'registro/';
    loading = false;
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
    dataDocumentos: DocumentosIdentificativos[] = [];
    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogRepresentacionC>,
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
        console.log("ACA LA DATA DEL DIALOG REPRESENTACION");
        console.log(data);
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

    minDate = '';

    fechaTope(){
        this.fisicaFormGroup.controls['fechaDefuncion'].setValue(null);
        this.minDate = moment(this.fisicaFormGroup.controls['fechaNacimiento'].value).add(2, 'd').format('YYYY-MM-DD');  
    }

    /**
     * De acuerdo al campo seleccionado será requerido el RFC, el CURP o ambos.
     * @param remove Valor del campo que se le retirara la validación, puede ser CURP o RFC
     * @param add  Valor del campo que se le agregara a la validación, puede ser CURP o RFC
     */
    changeRequired(remove, add): void {
        if(!this.fisicaFormGroup.value.rfc && !this.fisicaFormGroup.value.curp){​​​​​​​​
            this.isRequired = true;
        }​​​​​​​​ else {​​​​​​​​
            this.isRequired = false;
        }​​​​​​​​

        console.log(this.fisicaFormGroup.value.rfc);
        this.fisicaFormGroup.markAsTouched();
        this.fisicaFormGroup.updateValueAndValidity();
    }
  
    /**
     * Abre el dialogo para obtener un contribuyente previamente registrado, al cerrar se obtienen su información
     * para ser registrado en la representación.
     */
    addPersona(): void {
        const dialogRef = this.dialog.open(DialogPersonaC, {
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
  * Genera un salto automático de un input al siguiente una vez que la longitud máxima del input ha sido alcanzada
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
        const dialogRef = this.dialog.open(DialogDocumentoC, {
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
     *  Obtiene los datos que se registraron en el formulario y guarda la representación junto a todos los datos del documento,
     * representante y representado.
     * @returns Regresa el arreglo de los datos que fueron registrados en el formulario de la representación.
     */
    getDataRepresentacion(): DataRepresentacion {
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

        console.log('AQUIII EL JSON');
        console.log(this.dataRepresentacion);
        //console.log(JSON.stringify(this.dataRepresentacion));
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
            
            console.log(JSON.stringify(payload));
            this.http.post( this.endpoint + 'insertarRepresentacion', payload, this.httpOptions ). subscribe (
                (res: any) => {
                    this.snackBar.open('REGISTRO EXITOSO', 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                    console.log("AQUI ENTRO LAS RESPUESTA DEL PUT REPRESENTECIÓN");
                    console.log(res);
                },
                (error) => {
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                });
        }
        return this.dataRepresentacion;
    }

    /**
     * Actualiza la información de la representación seleccionada.
     */
    updateRepresentacion(){
        console.log("ACTUALIZA");
        let queryActRep = '';

        queryActRep = (this.dataRepresentacion.texto) ? queryActRep + 'textorepresentacion=' + this.dataRepresentacion.texto : queryActRep + 'textorepresentacion=';

        queryActRep = (this.dataRepresentacion.fechaCaducidad) ? queryActRep + '&fechacaducidad=' + moment(this.dataRepresentacion.fechaCaducidad).format("DD-MM-YYYY") : queryActRep + '&fechacaducidad=';

        queryActRep = queryActRep + '&idRepresentacion=' + this.idRepresentacion + '&idDocumentoDigital=' + this.idDocumento;

        //actualizarRepresentaciontextorepresentacion=Texto Representacion Prueba 33&fechacaducidad=Fri Dec 31 2021 00:00:00 GMT-0600 (hora estándar central)&idRepresentacion=14&idDocumentoDigital=17646226
        console.log("QUERY ACTUALIZA");
        console.log(queryActRep);
        //return;
        this.http.post(this.endpoint + 'actualizarRepresentacion?' + queryActRep, '', this.httpOptions).subscribe(
            (res: any) => {
                this.snackBar.open('SE HA ACTUALIZADO EL REPRESENTADO', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
                console.log("AQUI ENTRO LAS RESPUESTA DEL POST ACT REPRESENTADO");
                console.log(res);
            },
            (error) => {
                this.snackBar.open('ERROR INTENTELO MÁS TARDE', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
            });
    }

    /**
     * Obtiene el arreglo de los datos  de la representación seleccionada para editar.
     * @param dataRepresentacion Arreglo con los datos del registro seleccionado.
     */
    setDataRepresentacion(dataRepresentacion): void {
        console.log("ACA ENTRO EL SLECCIONADO REPRESENTACION");
        console.log(dataRepresentacion);
        (dataRepresentacion.RFC) ? this.changeRequired('curp', 'rfc') : this.changeRequired('rfc', 'curp');
        
        this.tipoPersona = dataRepresentacion.CODTIPOPERSONA;
        if(this.tipoPersona == 'F'){
            this.fisicaFormGroup.controls['nombre'].setValue(dataRepresentacion.NOMBRE);
            this.fisicaFormGroup.controls['apaterno'].setValue(dataRepresentacion.APELLIDOMATERNO);
            this.fisicaFormGroup.controls['amaterno'].setValue(dataRepresentacion.APELLIDOPATERNO);
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
        }
        
        //this.dataRepresentacion.documentoRepresentacion = dataRepresentacion.documentoRepresentacion;
        
    }
}

///////////////REPRESENTADO////////////////
@Component({
    selector: 'app-dialog-representado',
    templateUrl: 'app-dialog-representado.html',
    styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogRepresentadoC {
    endpoint = environment.endpoint + 'registro/';
    loading = false;
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
    dataDocumentos: DocumentosIdentificativos[] = [];

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private _formBuilder: FormBuilder,
        private auth: AuthService,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogRepresentadoC>,
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

    fechaTope(){
        this.fisicaFormGroup.controls['fechaDefuncion'].setValue(null);
        this.minDate = moment(this.fisicaFormGroup.controls['fechaNacimiento'].value).add(2, 'd').format('YYYY-MM-DD');  
    }
      
    /**
     * De acuerdo al campo seleccionado será requerido el RFC, el CURP o ambos.
     * @param remove Valor del campo que se le retirara la validación, puede ser CURP o RFC
     * @param add  Valor del campo que se le agregara a la validación, puede ser CURP o RFC
     */
    changeRequired(remove, add): void {
        if(!this.fisicaFormGroup.value.rfc && !this.fisicaFormGroup.value.curp){​​​​​​​​
            this.isRequired = true;
        }​​​​​​​​ else {​​​​​​​​
            this.isRequired = false;
        }​​​​​​​​

        console.log(this.fisicaFormGroup.value.rfc);
        this.fisicaFormGroup.markAsTouched();
        this.fisicaFormGroup.updateValueAndValidity();
    }
  
    /**
     * Abre el dialogo para obtener un contribuyente previamente registrado, al cerrar se obtienen su información
     * para ser registrado en la representación.
     */
    addPersona(): void {
        const dialogRef = this.dialog.open(DialogPersonaC, {
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
        const dialogRef = this.dialog.open(DialogDocumentoC, {
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
     *  Obtiene los datos que se registraron en el formulario y guarda la representación junto a todos los datos del documento,
     * representante y representado.
     * @returns Regresa el arreglo de los datos que fueron registrados en el formulario de la representación.
     */
    getDataRepresentacion(): DataRepresentacion {
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
        console.log('AQUIII EL JSON DEL REPRESENTADO');
        // console.log(this.dataRepresentacion);
        // console.log(JSON.stringify(this.dataRepresentacion));
        
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

            console.log(JSON.stringify(payload));
            //this.insertRepresentacion(payload);
            this.http.post( this.endpoint + 'insertarRepresentacion', payload, this.httpOptions ). subscribe (
                (res: any) => {
                    this.snackBar.open('REGISTRO EXITOSO', 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                    console.log("AQUI ENTRO LAS RESPUESTA DEL PUT REPRESENTADO");
                    console.log(res);
                },
                (error) => {
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                });
        }

        return this.dataRepresentacion;
    }

    /**
     * Actualiza la información de la representación seleccionada.
     */
    updateRepresentacion(){
        console.log("ACTUALIZA");
        let queryActRep = '';

        queryActRep = (this.dataRepresentacion.texto) ? queryActRep + 'textorepresentacion=' + this.dataRepresentacion.texto : queryActRep + 'textorepresentacion=';

        queryActRep = (this.dataRepresentacion.fechaCaducidad) ? queryActRep + '&fechacaducidad=' + moment(this.dataRepresentacion.fechaCaducidad).format("DD-MM-YYYY") : queryActRep + '&fechacaducidad=';

        queryActRep = queryActRep + '&idRepresentacion=' + this.idRepresentacion + '&idDocumentoDigital=' + this.idDocumento;

        //actualizarRepresentaciontextorepresentacion=Texto Representacion Prueba 33&fechacaducidad=Fri Dec 31 2021 00:00:00 GMT-0600 (hora estándar central)&idRepresentacion=14&idDocumentoDigital=17646226
        console.log("QUERY ACTUALIZA");
        console.log(queryActRep);
        //return;
        this.http.post(this.endpoint + 'actualizarRepresentacion?' + queryActRep, '', this.httpOptions).subscribe(
            (res: any) => {
                this.snackBar.open('SE HA ACTUALIZADO EL REPRESENTADO', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
                console.log("AQUI ENTRO LAS RESPUESTA DEL POST ACT REPRESENTADO");
                console.log(res);
            },
            (error) => {
                this.snackBar.open('ERROR INTENTELO MÁS TARDE', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
            });
    }

    /**
     * Obtiene el arreglo de los datos  de la representación seleccionada para editar.
     * @param dataRepresentacion Arreglo con los datos del registro seleccionado.
     */
    setDataRepresentacion(dataRepresentacion): void {
        console.log("ACA ENTRO EL SLECCIONADO REPRESENTACION");
        console.log(dataRepresentacion);
        (dataRepresentacion.RFC) ? this.changeRequired('curp', 'rfc') : this.changeRequired('rfc', 'curp');
        
        this.tipoPersona = dataRepresentacion.CODTIPOPERSONA;
        if(this.tipoPersona == 'F'){
            this.fisicaFormGroup.controls['nombre'].setValue(dataRepresentacion.NOMBRE);
            this.fisicaFormGroup.controls['apaterno'].setValue(dataRepresentacion.APELLIDOMATERNO);
            this.fisicaFormGroup.controls['amaterno'].setValue(dataRepresentacion.APELLIDOPATERNO);
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
        }
        
        //this.dataRepresentacion.documentoRepresentacion = dataRepresentacion.documentoRepresentacion;
        
    }
}
  
///////////////DOCUMENTO////////////////
@Component({
    selector: 'app-dialog-documento',
    templateUrl: 'app-dialog-documento.html',
    styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogDocumentoC {
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
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        private auth: AuthService,
        public dialogRef: MatDialogRef<DialogDocumentoC>,
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
        console.log(this.tiposDocumentoFormGroup.controls.codtipodocumentojuridico);
        if(data.idDocumento){
            this.setDataDocumento(data.idDocumento);
            this.insertOrUpdate = data.insertOrUpdate;
            this.idDocumento = data.idDocumento;
            this.insUp = true;
        }
        console.log("ACA EL DATA DEL DOCU DIALOG");
        console.log(data);
    }
  
    /**
     * Obtiene los tipos de Documentos Digitales
     */
    getDataTiposDocumentoDigital(): void {
        this.loadingTiposDocumentoDigital = true;
        this.http.get(this.endpoint, this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposDocumentoDigital = false;
                this.tiposDocumentoDigital = res;
            },
            (error) => {
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
        this.http.get(this.endpoint, this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposDocumentoJuridico = false;
                this.tiposDocumentoJuridico = res;
            },
            (error) => {
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
        const dialogRef = this.dialog.open(DialogNotarioC, {
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
     * Activa la validación del fomulario ya agrega el fichero.
     * @param data Datos de los ficheros que activan la validación del mismo en el formulario.
     * @returns 
     */
    createItem(data): FormGroup {
        return this._formBuilder.group(data);
    }
  
    /**
     * Remueve el fichero agregado
     * @param i Número del index del registro seleccionado.
     */
    removeItem(i) {
        this.archivos.removeAt(i);
      }
  
    get archivos(): FormArray {
        return this.archivosDocumentoFormGroup.get('archivos') as FormArray;
    };
  
    /**
     * 
     * @param event Arreglo de los ficheros seleccionados para su envío.
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
                    this.snackBar.open('Su archivo excede el tamaño permido de maximo 5MB', 'Cerrar', {
                        duration: 5000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                    event.target.value = '';
                }
            }
        }
    }
  
    /**
     * Se almacenan los datos del registro del documento de acuerdo al seleccionado (Carta poder o Poder notarial),
     * en caso de ser una actualización llamara al método correspondiente.
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
     * Obtiene la información del documento y el fichero.
     * @param idDocumento2 Valor del idDocumento utilizado para la búsqueda del mismo
     */
    setDataDocumento(idDocumento2): void {

        this.http.post(this.endpoint + 'infoDocumentos?idDocumentoDigital=' + idDocumento2, '', this.httpOptions).subscribe(
            (res: any) => {
                console.log("AQUI ENTRO EL RESULTADO DEL DOCUMENTO");
                this.dataDocumentoSet = res;
                console.log(this.dataDocumentoSet.infoDocumento[0].iddocumentodigital);
                console.log(res);
                this.setDoc();
            },
            (error) => {
                this.snackBar.open('ERROR INTENTELO MÁS TARDE', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
            });
    }

    /**
     * Se almacenan los datos relacionados con el documento cuando se ha seleccionado la opción de editar documento.
     */
    setDoc(){
        console.log("LA FECHA NO SE DEJA");
        console.log(this.fechaDocto);

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

        console.log(this.fechaDocto);    
        this.dataDoc = this.dataDocumentoSet.infoFicheros;
    }

    /**
     * Realiza la consulta del fichero previamente guardado.
     * @param element Arreglo de los datos del registro seleccionado.
     */
    descargarDoc(element){

        console.log("ACA EL DESCARGAR FICHERO");
        console.log(element);

        this.http.get( this.endpoint + 'getFichero?idFichero=' + element.idficherodocumento, this.httpOptions ). subscribe (
            (res: any) => {
                this.descargaFichero = res;
                console.log("EL RES DEL FICHERO");
                console.log(this.descargaFichero);
                console.log(this.descargaFichero[0].binariodatos);
                this.convertirDoc();
            },
            (error) => {
                this.snackBar.open('ERROR INTENTELO MÁS TARDE', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
            });
    }

    /**
     * Convierte el base 64 del fichero guardado para su descarga en PDF.
     */
    convertirDoc(){
        let dataFichero = this.descargaFichero[0].binariodatos;
        dataFichero = dataFichero.split("data:application/pdf;base64,");
        console.log("split");
        console.log(dataFichero);
        //return;
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
        console.log("ACA EL ELIMINAR FICHERO");
        console.log(element);

        

        this.http.post( this.endpoint + 'borrarFichero?lista=' + element.idficherodocumento, '', this.httpOptions ). subscribe (
            (res: any) => {
                this.snackBar.open('SE HA HA BORRADO EL DOCTO', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
                this.dataDoc.splice(i,1);
                console.log("AQUI ENTRO LAS RESPUESTA DEL BORRADO");
                console.log(res);
            },
            (error) => {
                this.snackBar.open('ERROR INTENTELO MÁS TARDE', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
            });
    }

    /**
     * Actualiza los datos relacionados con el documento.
     */
    updateDocto(){
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
        
        
        console.log(JSON.stringify(payload));
        this.http.post( this.endpoint + 'actualizarDocumentos', payload, this.httpOptions ). subscribe (
            (res: any) => {
                if(res === true){
                    this.snackBar.open('SE HA ACTUALIZADO CORRECTAMENTE LA INFORMACIÓN', 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                    console.log("RESPUESTA DE LA ACTUALIZACIÓN");
                    console.log(res);
                }else{
                    this.snackBar.open('ERROR INTENTELO MÁS TARDE', 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            },
            (error) => {
                this.snackBar.open('ERROR INTENTELO MÁS TARDE', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
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
    styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogNotarioC {
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
        private http: HttpClient,
        public dialogRef: MatDialogRef<DialogNotarioC>,
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
     * Obtiene el catálogo de los estados de la república Mexicana.
     */
    getDataEstados(): void {
        this.loadingEstados = true;
        this.http.get(this.endpointCatalogos + 'getEstados', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingEstados = false;
                this.estados = res;
            },
            (error) => {
                this.loadingEstados = false;
            }
        );
    }

    /**
     * Obtiene los datos del notario de acuerdo a los parametros dados en la búsqueda.
     */
    getDataNotarios(): void {
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
                this.loading = false;
                this.dataNotarios = res;
                this.dataSource = this.paginate(this.dataNotarios, this.pageSize, this.pagina);
                this.total = this.dataNotarios.length;
                this.paginator.pageIndex = 0;
            },
            (error) => {
                this.loading = false;
                this.dataSource = [];
            });
    }
  
    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataSource = this.paginate(this.dataNotarios, this.pageSize, this.pagina);
    }
  
    /**
     * 
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por página.
     * @param page_number Valor de la página en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }
      
    /**
     * Limpia los datos de la búsqueda y valores previamente definidos.
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
    styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogPersonaC{
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
      private _formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<DialogPersonaC>,
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
     * Obtiene a la persona sea física o moral por datos identificativos o personales.
     */
    getDataPersonas(): void {
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
                this.queryParamFiltros = this.queryParamFiltros + '&rfc=' + this.filtros.rfc.toLocaleUpperCase();
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
        
                this.queryParamFiltros = this.queryParamFiltros + '&coincidenTodos=false';        
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
                this.loading = false;
                this.dataPersonas = res;
                this.dataSource = this.paginate(this.dataPersonas, this.pageSize, this.pagina);
                this.total = this.dataPersonas.length;
                this.paginator.pageIndex = 0;
            },
            (error) => {
                this.loading = false;
                this.dataSource = [];
            }
        );
    }
  
    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataSource = this.paginate(this.dataPersonas, this.pageSize, this.pagina);
    }
  
    /**
     * 
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por página.
     * @param page_number Valor de la página en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }
  
    /**
     * Reinicia los valores del paginado y la búsqueda.
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
     * Obtiene y almacena los datos de la persona moral o físca seleccinada.
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
    styleUrls: ['./editar-contribuyente.component.css']
  })
  export class DialogDomicilioHistoricoContribuyente {
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
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogDomicilioHistoricoContribuyente>,
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
      
        query = (this.dataHistoricoModificaciones.fecha_desde) ? query + '&fechaDesde=' + moment(this.dataHistoricoModificaciones.fecha_desde).format('DD-MM-YYYY') : query + '&fechaDesde=';
        query = (this.dataHistoricoModificaciones.fecha_hasta) ? query + '&fechaHasta=' + moment(this.dataHistoricoModificaciones.fecha_hasta).format('DD-MM-YYYY') : query + '&fechaHasta=';
        query = query + '&idDireccion=' + this.idDireccion;

        query = query.substr(1);

        this.loading = true;
        let metodo = 'getHistoricosDireccion';
        this.http.get(this.endpoint + metodo + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    console.log(this.dataSource);
                    this.total = this.dataSource.length;
                    this.dataPaginate = this.paginate(this.dataSource, 10, this.pagina);
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
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    /**
     * Regresa la posición del paginado de acuerdo a los parámetro enviados
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por página.
     * @param page_number Valor de la página en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    /**
     * Abre el dialogo que mostrará el domicilio especifico.
     * @param dataDomicilioEspecifico Valor del registro seleccionado.
     */
    viewHistoricoDomicilioEspecifico(dataDomicilioEspecifico): void {
        const dialogRef = this.dialog.open(DialogDomicilioHistoricoEspecificoContribuyente, {
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
    styleUrls: ['./editar-contribuyente.component.css']
  })
  export class DialogDomicilioHistoricoEspecificoContribuyente {
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
        public dialogRef: MatDialogRef<DialogDomicilioHistoricoEspecificoContribuyente>,
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
            console.log(this.idChs);
            console.log(this.idDireccion);
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
                        console.log(data.dataDomicilioEspecifico);
                        console.log("recibimos data seteado1");
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
        console.log('entro');
        this.loadingDireccionEspecifica = true;
        let metodo = 'getHistoricosDireccionDetalle';
        this.http.get(this.endpointCatalogos + metodo + '?idChs=' + this.idChs + '&idDireccion=' + this.idDireccion, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDireccionEspecifica = false;
                    this.dataDomicilioEspecifico = res;
                    this.setDataDomicilio(this.dataDomicilioEspecifico[0]);
                    console.log('domicilio único encontrado');
                    console.log(this.dataDomicilioEspecifico);
                },
                (error) => {
                    this.loadingDireccionEspecifica = false;
                    console.log('no furula');
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
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
     * Obtiene el catálogo de los estados de la república Mexicana.
     */
    getDataEstados(): void {
        this.loadingEstados = true;
        this.http.get(this.endpointCatalogos + 'getEstados', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingEstados = false;
                this.estados = res;
            },
            (error) => {
                this.loadingEstados = false;
            }
        );
    }

    /**
     * Obtiene los municipios de acuerdo al estado seleccionado
     * @param event Valor que se recibe para la obtención de las alcaldias o municipios.
     */
    getDataMunicipios(event): void {
        this.botonMunicipio = false;
        let busquedaMunCol = '';
        // busquedaMunCol = 'getDelegaciones';
        busquedaMunCol = (event.value == 9) ? 'getDelegaciones' : 'getMunicipiosByEstado?codEstado=' + event.value;
        this.loadingMunicipios = true;
        this.http.get(this.endpointCatalogos + busquedaMunCol, this.httpOptions).subscribe(
            (res: any) => {
                this.loadingMunicipios = false;
                this.municipios = res;
                console.log('GETDELEG');
                console.log(res);
            },
            (error) => {
                this.loadingMunicipios = false;
            }
        );
    }
    
    /**
     * Obtiene el catálogo de los asentamientos.
     */
    getDataTiposAsentamiento(): void {
        this.loadingTiposAsentamiento = true;
        this.http.get(this.endpointCatalogos + 'getTiposAsentamiento', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposAsentamiento = false;
                this.tiposAsentamiento = res;
                console.log('AQUI EL ASENTAMIENTO SELECT');
                console.log(this.tiposAsentamiento);
            },
            (error) => {
                this.loadingTiposAsentamiento = false;
            }
        );
    }
    
    /**
     * Obtiene el catálogo de las vías
     */
    getDataTiposVia(): void {
        this.loadingTiposVia = true;
        this.http.get(this.endpointCatalogos + 'getTiposVia', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposVia = false;
                this.tiposVia = res;
                console.log('AQUI EL TIPOS VIA SELECT');
                console.log(this.tiposVia);
                console.log(this.codtiposdireccion);
            },
            (error) => {
                this.loadingTiposVia = false;
            }
        );
    }
    
    /**
     * Obtiene el catálogo de los tipos de localidad
     */
    getDataTiposLocalidad(): void {
        this.loadingTiposLocalidad = true;
        this.http.get(this.endpointCatalogos + 'getTiposLocalidad', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposLocalidad = false;
                this.tiposLocalidad = res;
                console.log('AQUI EL TIPOS LOCALIDAD');
                console.log(this.tiposLocalidad);
            },
            (error) => {
                this.loadingTiposLocalidad = false;
            }
        );
    }

    /**
     * Obtiene el arreglo del domicilio previamente seleccionado y lo muestra en sus respectivos campos del fomulario.
     * @param data Arreglo con los datos del registro seleccionado.
     */
    setDataDomicilio(data): void {
        console.log("ACA EL COD DATA ESPE");
        console.log(data);
        // console.log("ACA EL COD ESTADO SETEADO"+data.dataDomicilioEspecifico.CODESTADO);
       
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
     * con opción para búsqueda especifica.
     */
    getMunicipios(){
        this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
        const dialogRef = this.dialog.open(DialogMunicipiosContribuyente, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log("MUNICIPIOS!!!!!!!");
                console.log(result);
                this.domicilioFormGroup.controls['idmunicipio2'].setValue(result.codmunicipio);
                this.domicilioFormGroup.controls['municipio'].setValue(result.municipio);
                this.botonCiudad = false;
            }
        });
    }

    /**
     * Abre el dialogo que muestra las localidades (ciudades) ligadas al municipio seleccionado previamente,
     * con opción a búsqueda especifica.
     */
    getCiudad(){
        this.dataDomicilio.idmunicipio2 = this.domicilioFormGroup.value.idmunicipio2;
        const dialogRef = this.dialog.open(DialogCiudadContribuyente, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado,
                    codMunicipio : this.dataDomicilio.idmunicipio2
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.botonAsentamiento = false;
                console.log("CIUDAD!!!!!!!");
                console.log(result);
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
        const dialogRef = this.dialog.open(DialogAsentamientoContribuyente, {
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
                console.log("ASENTAMIENTO!!!!!!!");
                console.log(result);
                this.domicilioFormGroup.controls['codasentamiento'].setValue(result.codasentamiento);
                this.domicilioFormGroup.controls['asentamiento'].setValue(result.asentamiento);
                this.domicilioFormGroup.controls['idtipoasentamiento'].setValue(result.codtiposasentamiento);
                this.domicilioFormGroup.controls['cp'].setValue(result.codigopostal);
            }
        });
    }

    /**
     * Abre el dialogo que muestra las vías ligadas al asentamiento
     */
    getVia(){
        this.dataDomicilio.codasentamiento =  this.domicilioFormGroup.value.codasentamiento;
        const dialogRef = this.dialog.open(DialogViaContribuyente, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado,
                    codAsentamiento : this.dataDomicilio.codasentamiento
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log("VIA!!!!!!!");
                console.log(result);
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
    styleUrls: ['./editar-contribuyente.component.css']
  })
  export class DialogPersonalesHistoricoContribuyente {
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
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogPersonalesHistoricoContribuyente>,
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

    /**
     * Obtiene el histórico de mofificaciones
     */
    getHistoricoModificaciones(){
        let query = '';
      
        query = (this.dataHistoricoModificaciones.fecha_desde) ? query + '&fechaDesde=' + moment(this.dataHistoricoModificaciones.fecha_desde).format('DD-MM-YYYY') : query + '&fechaDesde=';
        query = (this.dataHistoricoModificaciones.fecha_hasta) ? query + '&fechaHasta=' + moment(this.dataHistoricoModificaciones.fecha_hasta).format('DD-MM-YYYY') : query + '&fechaHasta=';
        query = query + '&idPersona=' + this.idPersona;

        query = query.substr(1);

        this.loading = true;
        let metodo = 'getHistoricosPersona';
        this.http.get(this.endpoint + metodo + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    console.log(this.dataSource);
                    this.total = this.dataSource.length;
                    this.dataPaginate = this.paginate(this.dataSource, 10, this.pagina);
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
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    /**
     * Regresa la posición del paginado de acuerdo a los parámetro enviados
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por página.
     * @param page_number Valor de la página en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    /**
     * @param dataPersonalesEspecifico abre el modal que muestra como se veían la información antes de ser modificada
     */
    viewHistoricoPersonalesEspecifico(dataPersonalesEspecifico): void {
        const dialogRef = this.dialog.open(DialogPersonalesHistoricoEspecificoContribuyente, {
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
    styleUrls: ['./editar-contribuyente.component.css']
  })
export class DialogPersonalesHistoricoEspecificoContribuyente {
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
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogPersonalesHistoricoEspecificoContribuyente>,
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
    console.log(this.idChs);
    console.log(this.idPersona);

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
 * Obtiene los datos del contribuyente
 */
getContribuyenteDatos(){
    this.query = '&idPersona=' + this.idPersona + '&idChs=' + this.idChs; 
    this.loading = true;
    console.log(this.endpoint);
    this.http.get(this.endpoint + 'getHistoricosPersonaDetalle?' + this.query, this.httpOptions)
        .subscribe(
            (res: any) => {
                this.loading = false;
                this.dataContribuyenteResultado = res;
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

    console.log(this.contribuyente.tipoPersona);
    
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
    styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogHistorialRepC {
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
        public dialog: MatDialog,
        private auth: AuthService,
        public dialogRef: MatDialogRef<DialogHistorialRepC>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {

        dialogRef.disableClose = true;

        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };

        console.log("ACA EL EL HISTORIAL");
        console.log(data);
        this.idPersona = data;
        this.getHistorialRepresentacion();
    }

    /**
     * Obtiene el historial de las representaciones ligadas a la sociedad.
     */
    getHistorialRepresentacion(){
        let query = '';
      

        query = 'idPersona=' + this.idPersona;
        query = (this.dataHistoricoRep.fecha_desde) ? query + '&fechaDesde=' + moment(this.dataHistoricoRep.fecha_desde).format('DD-MM-YYYY') : query + '&fechaDesde=';
        query = (this.dataHistoricoRep.fecha_hasta) ? query + '&fechaHasta=' + moment(this.dataHistoricoRep.fecha_hasta).format('DD-MM-YYYY') : query + '&fechaHasta=';


        this.loadingH = true;
        let metodo = 'getHistoricosRepresentacion';
        this.http.get(this.endpoint + metodo + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingH = false;
                    this.dataSource = res;
                    console.log(this.dataSource);
                    this.total = this.dataSource.length;
                    this.dataPaginate = this.paginate(this.dataSource, 10, this.pagina);
                },
                (error) => {
                    this.loadingH = false;
                    this.snackBar.open("Ha ocurrido un problema al obtener el historial", 'Cerrar', {
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
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    /**
     * 
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por página.
     * @param page_number Valor de la página en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    /**
     * Recibe el id de la representación y abre el dialogo que mostrará el resultado de la búsqueda solicitada.
     * @param element Id de la representcación con la cual se realizará la búsqueda.
     */
    historicoDetalle(element){
        console.log("ACA EL IDCSH");
        console.log(element);
        this.idChs = element;
        const dialogRef = this.dialog.open(DialogHistorialRepDetalleC, {
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
    styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogHistorialRepDetalleC {
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
        public dialog: MatDialog,
        private auth: AuthService,
        public dialogRef: MatDialogRef<DialogHistorialRepDetalleC>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {

        dialogRef.disableClose = true;

        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };

        console.log("ACA EL EL HISTORIAL");
        console.log(data);
        this.idChs = data;
        this.getHistorialRepresentacionDetalle();
    }

    /**
     * Obtiene la información de la representación solicitada.
     */
    getHistorialRepresentacionDetalle(){
        let query = '';

        query = 'idChs=' + this.idChs;

        this.loadingH = true;
        let metodo = 'getHistoricosRepresentacionDetalle';
        this.http.get(this.endpoint + metodo + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingH = false;
                    console.log("RESULTADO DEL DETALLE REP");
                    console.log(res);
                    this.dataRepresentacion = res;
                    console.log(this.dataRepresentacion.infoRepresentante.CAUSA);
                    console.log(this.dataRepresentacion.infoRepresentante[0].CAUSA);
                    this.setDetalle();
                },
                (error) => {
                    this.loadingH = false;
                    this.snackBar.open("Ha ocurrido un problema al obtener el detalle", 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }

    /**
     * Almacena los datos de la búsqueda realizada para mostrar en el formulario.
     */
    setDetalle(){
            console.log("ACA ENTRO EL SLECCIONADO REPRESENTACION");
            console.log(this.dataRepresentacion.infoDocumento.infoDocumento[0].codtipodocumentojuridico);

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
                this.apaternoR = this.dataRepresentacion.infoRepresentante[0].APELLIDOMATERNO;
                this.amaternoR = this.dataRepresentacion.infoRepresentante[0].APELLIDOPATERNO;
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
                this.apaternoRdo = this.dataRepresentacion.infoRepresentado[0].APELLIDOMATERNO;
                this.amaternoRdo = this.dataRepresentacion.infoRepresentado[0].APELLIDOPATERNO;
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