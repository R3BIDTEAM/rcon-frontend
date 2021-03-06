import { Component, OnInit, Inject, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import * as FileSaver from 'file-saver';
import { DialogConfirmacionComponent } from '@comp/dialog-confirmacion/dialog-confirmacion.component';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

export interface DatosPeritos {
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
    tipoPersona: string;
    actPreponderante: string;
    idTipoPersonaMoral: number;
    fechaInicioOperacion: Date;
    idMotivo: number;
    fechaCambio: Date;
    nombre_moral: string;
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

export interface DataRepresentacion {
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
    documentoRepresentacion: DataDocumentoRepresentacion;
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

export interface DataSociedadAsociada{
    razonSocial: string;
    registro: string;
    rfc: string;
    idsociedad: number;
}

export interface DocumentosIdentificativos{
    id_documento: number;
    documento: string;
}

@Component({
    selector: 'app-editar-peritos',
    templateUrl: './editar-peritos.component.html',
    styleUrls: ['./editar-peritos.component.css'],
    //changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditarPeritosComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/getPerito';
    displayedColumns: string[] = ['nombre','registro', 'rfc', 'elimina'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    loading = false;
    dataPeritoResultado;
    dataSource;
    dataPaginate;
    httpOptions;
    search = false;
    query;
    idPerito;
    datoPeritos: DatosPeritos = {} as DatosPeritos;
    dataDomicilios: DataDomicilio[] = [];
    dataDomicilioEspecifico: DataDomicilio[] = [];
    dataRepresentantes: DataRepresentacion[] = [];
    dataRepresentados: DataRepresentacion[] = [];
    dataSociedadAsociada: DataSociedadAsociada[] = [];
    panelDomicilio = false;
    panelDomPredial = false;
    panelBienes = false;
    panelRepresentantes = false;
    panelRepresentados = false;
    panelEspecifico = false;
    panelSociedades = false;
    panelDatosRepre = false;
    botonEdit = false;
    peritoPersonaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    loadingDatosPerito = false;
    loadingRepresentante = false;
    loadingRepresentado = false;
    loadingDomicilios = false;
    loadingInmuebles = false;
    loadingDireccionEspecifica = false;
    selectDisabled = false;
    selectCedula = false;
    selectPasaporte = false;
    selectLicencia = false;
    selectNSS = false;
    displayedColumnsDom: string[] = ['tipoDir','direccion', 'historial', 'modificar'];
    displayedColumnsInm: string[] = ['inmueble','direccion','domicilio','descripcion','sujeto'];
    displayedColumnsRepdo: string[] = ['representacion','texto','caducidad','editar','eliminar'];
    displayedColumnsDataRep: string[] = ['fechaCaducidad','texto','caducidad'];
    paginaDom = 1;
    totalDom = 0;
    pageSizeDom = 15;
    dataDomicilioResultado;
    dataSourceDom = [];
    dataPaginateDom;
    endpointActualiza = environment.endpoint + 'registro/';
    isIdentificativo;
    idInmueble;
    cambioPersona;
    actCambioPersona = true;
    isRequired = true;
    mensajeConfirma;
    documentos: DocumentosIdentificativos[] = [];
    loadingDocumentosIdentificativos = false;
    minDate;

    /*PAGINADOS*/
    dataSource1 = [];
    total1 = 0;
    pagina1= 1;
    dataPaginate1;
    dataSource2 = [];
    total2 = 0;
    pagina2= 1;
    dataPaginate2;
    dataSource3 = [];
    total3 = 0;
    pagina3= 1;
    dataPaginate3;
    dataSource4;
    total4 = 0;
    pagina4= 1;
    dataPaginate4;
    dataSource5 = [];
    total5 = 0;
    pagina5= 1;
    dataPaginate5;
    total6 = 0;
    pagina6= 1;
    dataPaginate6;
    total7 = 0;
    pagina7= 1;
    dataPaginate7;
    /*PAGINADOS*/

    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        private auth: AuthService,
        private route: ActivatedRoute,
        private spinner: NgxSpinnerService
    ) {
        this.peritoPersonaFormGroup = this._formBuilder.group({
            apellidopaterno: ['', [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            apellidomaterno: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            nombre: ['', [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            rfc: [null],
            curp: [null],
            ine: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            identificacion: [null],
            idedato: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            fechaNacimiento: [null],
            fechaDefuncion: [null],
            celular: [null, [Validators.pattern("^\\w+(\\s+\\w+)*$")]],
            email: ['', [Validators.email, Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
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
    }

     /**
     * Valida la sesi??n del usuario y llama a los metodos necesarios para mostrar en la pantalla la informaci??n.
     */
    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };
        this.idPerito = this.route.snapshot.paramMap.get('idperito');
        this.getDataDocumentosIdentificativos();
        this.getPeritoDatos();
        this.getDomicilioPerito();
        this.getidInmuebles();
        this.getRepresentacion();
        this.getRepresentado();
    }

    /** 
    * Obtiene los Documentos Identificativos para llenar el Select de Documentos Identificativos
    */
     getDataDocumentosIdentificativos(): void{
        this.spinner.show();
        this.loadingDocumentosIdentificativos = true;
        this.http.get(this.endpointActualiza + 'getCatalogos', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingDocumentosIdentificativos = false;
                this.documentos = res.CatDocIdentificativos;
                this.spinner.hide();
            },
            (error) => {
                this.loadingDocumentosIdentificativos = false;
                this.spinner.hide();
            }
        );
    }

    /**
     *  Si se selecciona alguna opci??n desbloquear?? el input del n??mero del documento.
     * @param event Valor del option
     */
     seleccionaDocto(){
        this.selectDisabled = true;
        this.selectCedula = false;
        this.selectPasaporte = false;
        this.selectLicencia = false;
        this.selectNSS = false;

        if(this.datoPeritos.identificacion == 1){
            this.selectCedula = true;
        }

        if(this.datoPeritos.identificacion == 2){
            this.selectPasaporte = true;
        }

        if(this.datoPeritos.identificacion == 3){
            this.selectLicencia = true;
        }

        if(this.datoPeritos.identificacion == 6){
            this.selectNSS = true;
        }

        this.peritoPersonaFormGroup.markAsTouched();
        this.peritoPersonaFormGroup.updateValueAndValidity();
    }

    /**
     * Borra de los inputs de los datos del perito y activa el boton de busqueda de contribuyente
     */
    cleanPerito(){
        this.datoPeritos.apepaterno = null;
        this.datoPeritos.apematerno = null;
        this.datoPeritos.nombre  = null;
        this.datoPeritos.rfc = null;
        this.datoPeritos.curp = null;
        this.datoPeritos.ine = null;
        this.datoPeritos.identificacion = null;
        this.datoPeritos.idedato = null;
        this.datoPeritos.fecha_naci = null;
        this.datoPeritos.fecha_def = null;
        this.datoPeritos.celular = null;
        this.datoPeritos.email = null;
        this.botonEdit = true;
    }

    /**
     * De acuerdo al campo seleccionado ser?? requerido el RFC, el CURP o ambos.
     */
    changeRequired(): void {
        if(!this.datoPeritos.rfc && !this.datoPeritos.curp){????????????????????????
            this.isRequired = true;
        }???????????????????????? else {????????????????????????
            this.isRequired = false;
        }????????????????????????

        this.peritoPersonaFormGroup.markAsTouched();
        this.peritoPersonaFormGroup.updateValueAndValidity();
    }

    /**
     * Obtiene los datos del perito consultado.
     */
    getPeritoDatos(){
        this.spinner.show();
        this.query = 'obtenerSociedades=1&idPerito=' + this.idPerito; 
        this.loadingDatosPerito = true;
        this.http.get(this.endpoint + '?' + this.query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDatosPerito = false;
                    this.dataPeritoResultado = res.dsPeritos[0];
                    this.dataSource = res.dsPeritos[0].Sociedades;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataPaginate.length; 
                    this.paginator.pageIndex = 0;
                    this.datoDelPerito();
                    this.spinner.hide();
                },
                (error) => {
                    this.loadingDatosPerito = false;
                    // this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'ERROR',
                        text: error.error.mensaje,
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
                    this.spinner.hide();
                }
            );
    }

    /**
     * Almacena los valores recibidos de la consulta realizada.
     */
    datoDelPerito(){
        this.cambioPersona = this.dataPeritoResultado.CODTIPOSPERSONA;
        this.datoPeritos.tipoPersona = this.dataPeritoResultado.CODTIPOSPERSONA;
        this.datoPeritos.apepaterno = this.dataPeritoResultado.APELLIDOPATERNO;
        this.datoPeritos.apematerno = this.dataPeritoResultado.APELLIDOMATERNO;
        this.datoPeritos.nombre  = this.dataPeritoResultado.NOMBRE;
        this.datoPeritos.rfc = this.dataPeritoResultado.RFC;
        this.datoPeritos.curp = this.dataPeritoResultado.CURP;
        this.datoPeritos.ine = this.dataPeritoResultado.CLAVEIFE;
        this.datoPeritos.identificacion = this.dataPeritoResultado.IDDOCIDENTIF;
        this.datoPeritos.idedato = this.dataPeritoResultado.VALDOCIDENTIF;
        this.datoPeritos.fecha_naci = (this.dataPeritoResultado.FECHANACIMIENTO) ? new Date(this.dataPeritoResultado.FECHANACIMIENTO) : null;
        this.datoPeritos.fecha_def = (this.dataPeritoResultado.FECHADEFUNCION) ? new Date(this.dataPeritoResultado.FECHADEFUNCION) : null;
        this.datoPeritos.celular = this.dataPeritoResultado.CELULAR;
        this.datoPeritos.email = this.dataPeritoResultado.EMAIL;
        this.datoPeritos.registro = this.dataPeritoResultado.REGISTRO;
        this.datoPeritos.fecha_alta = (new Date(this.dataPeritoResultado.FECHAALTA)) ? new Date(new Date(this.dataPeritoResultado.FECHAALTA)) : null;
        this.datoPeritos.fecha_baja = (this.dataPeritoResultado.FECHABAJA) ? new Date(this.dataPeritoResultado.FECHABAJA) : null;
        
        if(this.dataPeritoResultado.INDEPENDIENTE === 'S'){
            this.datoPeritos.independiente = true;
        }else{
            this.datoPeritos.independiente = false;
        }

        if(this.datoPeritos.identificacion == 1){
            this.selectCedula = true;
        }

        if(this.datoPeritos.identificacion == 2){
            this.selectPasaporte = true;
        }

        if(this.datoPeritos.identificacion == 3){
            this.selectLicencia = true;
        }

        if(this.datoPeritos.identificacion == 6){
            this.selectNSS = true;
        }

        this.minDate = (moment(this.datoPeritos.fecha_naci).add(2, 'd').format('YYYY-MM-DD'));
        this.changeRequired();
        this.spinner.hide();
    }


    fechaTope(){
        this.peritoPersonaFormGroup.controls['fechaDefuncion'].setValue(null);
        this.minDate = moment(this.peritoPersonaFormGroup.controls['fechaNacimiento'].value).add(2, 'd').format('YYYY-MM-DD');  
    }

    /**
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataSource = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }

    /**
     * Al realizar el cambio de persona almacena el tipo de persona actual, el nuevo tipo para evaluar que sea un cambio de tipo persona
     * y nos muestre el formulario necesario.
     * @param event El el parametro que se recibe para evaluar si se ha realizado un cambio en el tipo de la persona,
    *  el valor puede ser F de F??sica o M de moral.
     */
    actualizaPersona(event){
        this.actCambioPersona = (event == this.cambioPersona) ? true : false;
        if(this.datoPeritos.tipoPersona == 'M'){
            this.datoPeritos.nombre_moral = this.datoPeritos.apepaterno + ' ' + this.datoPeritos.apematerno + ' ' + this.datoPeritos.nombre;
        }
        this.datoPeritos.rfc = null;
    }

    /**
     * Obtiene los domicilios registrados del perito domicilios particulares y para recibir notificaciones.
     */
    getDomicilioPerito(){
        this.loadingDomicilios = true;
        let metodo = 'getDireccionesContribuyente';
        this.http.get(this.endpointActualiza + metodo + '?idPersona='+ this.idPerito, this.httpOptions)
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
                    // this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
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
     * Regresa la posici??n del paginado de acuerdo a los par??metro enviados
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por p??gina.
     * @param page_number Valor de la p??gina en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }
    /*PAGINADOS*/

    /**
     * Obtiene los inmuebles de la persona
     */
    getidInmuebles(){
        this.loadingInmuebles = true;
        this.http.get(this.endpointActualiza + 'getInmuebles' + '?idPersona='+ this.idPerito, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingInmuebles = false;

                    this.dataSource3 = res;
                    this.dataPaginate3 = this.paginate(this.dataSource3, 15, this.pagina3);
                    this.total = this.dataSource3.length; 
                    this.paginator.pageIndex = 0;

                },
                (error) => {
                    this.loadingInmuebles = false;
                    // this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
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
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
     paginado3(evt): void{
        this.pagina3 = evt.pageIndex + 1;
        this.dataPaginate3 = this.paginate(this.dataSource3, 15, this.pagina3);
    }

    actualizarPerito(){
        let query = '';

        query = 'codtipospersona=F';

        query = (this.datoPeritos.nombre) ? query + '&nombre=' + this.datoPeritos.nombre.toLocaleUpperCase().trim() : query + '&nombre=';

        query = query + '&activprincip&idtipomoral&idmotivosmoral&fechainicioactiv&fechacambiosituacion';
        
        query = (this.datoPeritos.rfc) ? query + '&rfc=' + this.datoPeritos.rfc.toLocaleUpperCase().trim() : query + '&rfc=';

        query = (this.datoPeritos.apepaterno) ? query + '&apellidopaterno=' + this.datoPeritos.apepaterno.toLocaleUpperCase().trim() : query + '&apellidopaterno=';

        query = (this.datoPeritos.apematerno) ? query + '&apellidomaterno=' + this.datoPeritos.apematerno.toLocaleUpperCase().trim() : query + '&apellidomaterno=';
            
        query = (this.datoPeritos.curp) ? query + '&curp=' + this.datoPeritos.curp.toLocaleUpperCase().trim() : query + '&curp=';
            
        query = (this.datoPeritos.ine) ? query + '&claveife=' + this.datoPeritos.ine.toLocaleUpperCase().trim() : query + '&claveife=';
            
        query = (this.datoPeritos.identificacion && this.datoPeritos.idedato) ? query + '&iddocidentif=' + this.datoPeritos.identificacion 
                + '&valdocidentif=' + this.datoPeritos.idedato.toLocaleUpperCase().trim() : query + '&iddocidentif=&valdocidentif=';

        query = (this.datoPeritos.fecha_naci) ? query + '&fechanacimiento=' + moment(this.datoPeritos.fecha_naci).format('DD-MM-YYYY') : query + '&fechanacimiento=';

        query = (this.datoPeritos.fecha_def) ? query + '&fechadefuncion=' + moment(this.datoPeritos.fecha_def).format('DD-MM-YYYY') : query + '&fechadefuncion=';

        query = (this.datoPeritos.celular) ? query + '&celular=' + this.datoPeritos.celular : query + '&celular=';

        query = (this.datoPeritos.email) ? query + '&email=' + this.datoPeritos.email : query + '&email=';

        query = query + '&idExpediente&idpersona=' + this.idPerito;

        this.query = 'codtipospersona=F&' + this.idPerito; 
        this.loadingDatosPerito = true;
        this.http.post(this.endpointActualiza + 'actualizaContribuyente?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    if(res.idpersona){
                        this.loadingDatosPerito = false;
                        // this.snackBar.open('Guardado exitoso', 'Cerrar', {
                        //     duration: 10000,
                        //     horizontalPosition: 'end',
                        //     verticalPosition: 'top'
                        // });
                        Swal.fire({
                            title: 'CORRECTO',
                            text: 'Guardado exitoso',
                            icon: 'success',
                            confirmButtonText: 'Cerrar'
                        });
                    }else{
                        // this.snackBar.open(res.error.mensaje, 'Cerrar', {
                        //     duration: 10000,
                        //     horizontalPosition: 'end',
                        //     verticalPosition: 'top'
                        // });
                        Swal.fire({
                            title: 'ERROR',
                            text: res.error.mensaje,
                            icon: 'error',
                            confirmButtonText: 'Cerrar'
                        });
                    }                    
                },
                (error) => {
                    this.loadingDatosPerito = false;
                    // this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'ERROR',
                        text: error.error.mensaje,
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
                }
            );
    }

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
                    case 2:
                        this.eliminarPeritoSoicedad(element);
                        break;
                    case 3:
                        this.eliminarPeritoSoicedadTodos();
                        break;
                    case 4:
                        this.eliminarRepresentacion(element, tipo);
                        break;
                    default:
                        break;
                }
            }
        });
    }

    cambiarTipoPersona(){
        let query = 'idpersona=' + this.idPerito;
        this.loadingDatosPerito = true;
        
        query = (this.datoPeritos.tipoPersona) ? query + '&codtipospersona=' + this.datoPeritos.tipoPersona : query + '&codtipospersona=';

        if(this.datoPeritos.tipoPersona === 'F'){
            query = (this.datoPeritos.apepaterno) ? query + '&apellidopaterno=' + this.datoPeritos.apepaterno : query + '&apellidopaterno=';
            query = (this.datoPeritos.apematerno) ? query + '&apellidomaterno=' + this.datoPeritos.apematerno : query + '&apellidomaterno=';
            query = (this.datoPeritos.nombre) ? query + '&nombreF=' + this.datoPeritos.nombre : query + '&nombreF=';
            query = (this.datoPeritos.rfc) ? query + '&rfcF=' + this.datoPeritos.rfc : query + '&rfcF=';
        } else {
            query = (this.datoPeritos.nombre_moral) ? query + '&apellidopaterno=' + this.datoPeritos.nombre_moral : query + '&apellidopaterno=';
            query = (this.datoPeritos.nombre) ? query + '&nombreM=' + this.datoPeritos.nombre : query + '&nombreM=';
            query = (this.datoPeritos.rfc) ? query + '&rfcM=' + this.datoPeritos.rfc : query + '&rfcM=';
        }
        
        query = (this.datoPeritos.curp) ? query + '&curp=' + this.datoPeritos.curp : query + '&curp=';
        query = (this.datoPeritos.ine) ? query + '&claveife=' + this.datoPeritos.ine : query + '&claveife=';
        query = (this.datoPeritos.identificacion) ? query + '&iddocidentif=' + this.datoPeritos.identificacion : query + '&iddocidentif=';
        query = (this.datoPeritos.idedato) ? query + '&valdocidentif=' + this.datoPeritos.idedato : query + '&valdocidentif=';
        query = (this.datoPeritos.fecha_naci) ? query + '&fechanacimiento=' + moment(this.datoPeritos.fecha_naci).format('DD-MM-YYYY') : query + '&fechanacimiento=';
        query = (this.datoPeritos.fecha_def) ? query + '&fechadefuncion=' + moment(this.datoPeritos.fecha_def).format('DD-MM-YYYY') : query + '&fechadefuncion=';
        query = (this.datoPeritos.celular) ? query + '&celular=' + this.datoPeritos.celular : query + '&celular=';
        query = (this.datoPeritos.email) ? query + '&email=' + this.datoPeritos.email : query + '&email=';

        query = (this.datoPeritos.actPreponderante) ? query + '&activprincip=' + this.datoPeritos.actPreponderante : query + '&activprincip=';
        query = (this.datoPeritos.idTipoPersonaMoral) ? query + '&idtipomoral=' + this.datoPeritos.idTipoPersonaMoral : query + '&idtipomoral=';
        query = (this.datoPeritos.idMotivo) ? query + '&idmotivosmoral=' + this.datoPeritos.idMotivo : query + '&idmotivosmoral=';
        query = (this.datoPeritos.fechaInicioOperacion) ? query + '&fechainicioactiv=' + moment(this.datoPeritos.fechaInicioOperacion).format('DD-MM-YYYY') : query + '&fechainicioactiv=';
        query = (this.datoPeritos.fechaCambio) ? query + '&fechacambiosituacion=' + moment(this.datoPeritos.fechaCambio).format('DD-MM-YYYY') : query + '&fechacambiosituacion=';

        this.http.post(this.endpointActualiza + 'cambioTipoPersona' + '?' + query, '', this.httpOptions)
        .subscribe(
            (res: any) => {
                this.loadingDatosPerito = false;
                if(res){
                    // this.snackBar.open('Actualizaci??n correcta', 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'CORRECTO',
                        text: 'Actualizaci??n correcta',
                        icon: 'success',
                        confirmButtonText: 'Cerrar'
                    });
                }else{
                    // this.snackBar.open('Se ha presentado un problema intente m??s tarde', 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'ERROR',
                        text: 'Se ha presentado un problema intente m??s tarde',
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
                }
            },
            (error) => {
                this.loadingDatosPerito = false;
                // this.snackBar.open('Se ha presentado un problema intente m??s tarde', 'Cerrar', {
                //     duration: 10000,
                //     horizontalPosition: 'end',
                //     verticalPosition: 'top'
                // });
                Swal.fire({
                    title: 'ERROR',
                    text: 'Se ha presentado un problema intente m??s tarde',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                });
            }
        );
    }

    isIndependiente(dato){
        if(dato.checked){
            this.datoPeritos.independienteAct = 'S';
        }else{
            this.datoPeritos.independienteAct = 'N';
        }
    }

    actualizaPeritoEspecifico(){
        this.spinner.show();
        this.loadingDatosPerito  = true;
        let queryAcPeritoEsp = '';
        let checkIndi = '';
        if(this.datoPeritos.independiente == true && this.datoPeritos.independienteAct == undefined){
            checkIndi = 'S';
        }else if(this.datoPeritos.independiente == false && this.datoPeritos.independienteAct == undefined){
            checkIndi = 'N';
        }else if(this.datoPeritos.independiente == true && this.datoPeritos.independienteAct == 'S'){
            checkIndi = 'S';
        }else{
            checkIndi = 'N';
        }

        queryAcPeritoEsp = queryAcPeritoEsp + 'idPerito=' + this.idPerito;

        queryAcPeritoEsp = (this.datoPeritos.registro) ? queryAcPeritoEsp + '&registro=' + this.datoPeritos.registro.toLocaleUpperCase() : queryAcPeritoEsp + '&registro=';

        queryAcPeritoEsp = queryAcPeritoEsp + '&independiente=' + checkIndi;

        queryAcPeritoEsp = (this.datoPeritos.fecha_baja) ? queryAcPeritoEsp + '&fechaBaja=' + moment(this.datoPeritos.fecha_baja).format('YYYY-MM-DD') : queryAcPeritoEsp + '&fechaBaja';

        this.http.post(this.endpointActualiza + 'actualizarPerito?' + queryAcPeritoEsp, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDatosPerito = false;
                    if(res.idPerito !== null || res.idPerito !== ''){
                        Swal.fire({
                            title: 'CORRECTO',
                            text: 'Guardado correcto',
                            icon: 'success',
                            confirmButtonText: 'Cerrar'
                        });
                        this.spinner.hide();
                    }
                },
                (error) => {
                    this.loadingDatosPerito = false;
                    Swal.fire({
                        title: 'ERROR',
                        text: error.error.mensaje,
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
                    this.spinner.hide();
                }
            );
    }

    /**
     * Abre el dialogo que registrara un nuevo domicilio
     */
    addDomicilio(i = -1, dataDomicilio = null): void {
        this.spinner.show();
        let codtiposdireccion = '';
        const dialogRef = this.dialog.open(DialogDomicilioPerito, {
            width: '700px',
            data: {dataDomicilio:dataDomicilio, idPerito: this.idPerito,
                    codtiposdireccion: codtiposdireccion
            },
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.loadingDomicilios = true;
                this.getDomicilioPerito();
            }
        });
    }

    /**
     * Recibe el id direcci??n que enviar?? al dialog para realizar la b??squeda del domicilio.
     * @param dataDomicilioEspecifico Valor que se enviar?? para la obtenci??n del registro a editar.
     */
    editDomicilio(dataDomicilioEspecifico): void {
        let codtiposdireccion = '';
            const dialogRef = this.dialog.open(DialogDomicilioPerito, {
                width: '700px',
                data: {dataDomicilioEspecifico:dataDomicilioEspecifico, idNotario: this.idPerito},
            });
            dialogRef.afterClosed().subscribe(result => {
                if(result){
                    this.loadingDomicilios = true;
                    this.getDomicilioPerito();
                }
            });
      }

      /**
     * Abre el dialogo que nos permitira ver el historial de los domicilios
     * @param idDireccion Valor del idDirecci??n de la cual se obtendran los registros de los domicilios de la representaci??n
     */
    viewHistoricoDomicilio(idDireccion): void {
        const dialogRef = this.dialog.open(DialogDomicilioHistoricoPerito, {
            width: '700px',
            data: {idDireccion},
        });
        dialogRef.afterClosed().subscribe(result => {
                // this.getNotarioDirecciones();
        });
    }

    /**
     * Abre el dialogo que registrara un nuevo domicilio con notificaci??n
     */
    addDomicilioBoleta(i = -1, dataDomicilio = null): void {
        this.spinner.show();
        let codtiposdireccion = 'N';
        const dialogRef = this.dialog.open(DialogDomicilioPerito, {
            width: '700px',
            data: {dataDomicilio:dataDomicilio, idPerito: this.idPerito,
                codtiposdireccion: codtiposdireccion 
            },
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.loadingDomicilios = true;
                this.getDomicilioPerito();
            }
        });
    }

    /**
     * Abre el dialogo para relizar el registro de la representaci??n o edici??n de la misma.
     * @param dataRepresentante Arreglo de los datos de la representaci??n seleccionada
     */
    addRepresentante(i = -1, dataRepresentante = null): void {
        this.spinner.show();
        const dialogRef = this.dialog.open(DialogRepresentacionPeritos, {
            width: '700px',
            data: {dataRepresentante : dataRepresentante,
                    datosPerito : this.datoPeritos,
                    idPerito : this.idPerito
            },
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.loadingRepresentante = true;
                setTimeout (() => {
                    this.getRepresentacion();
                }, 2000);
            }
        });
    }

    /**
     * Abre el dialogo para relizar el registro de la representaci??n o edici??n de la misma.
     * @param dataRepresentante Arreglo de los datos de la representaci??n seleccionada
     */
    addRepresentado(i = -1, dataRepresentante = null): void {
        this.spinner.show();
        const dialogRef = this.dialog.open(DialogRepresentadoPeritos, {
            width: '700px',
            data: {dataRepresentante : dataRepresentante,
                    datosPerito: this.datoPeritos,
                    idPerito : this.idPerito
            },
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.loadingRepresentado = true;
                setTimeout (() => {
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
        let queryDelRep = 'idRepresentacion=' + element.IDREPRESENTACION;
        this.http.post(this.endpointActualiza + 'deleteRepresentacion?' + queryDelRep, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    if(res){
                        if(tipo == 1){
                            this.loadingRepresentado = false;
                            this.getRepresentacion();
                        }else{
                            this.loadingRepresentante = false;
                            this.getRepresentado();
                        }
                        // this.snackBar.open("Se ha eliminado la representaci??n", 'Cerrar', {
                        //     duration: 10000,
                        //     horizontalPosition: 'end',
                        //     verticalPosition: 'top'
                        // });
                        Swal.fire({
                            title: 'CORRECTO',
                            text: 'Se ha eliminado la representaci??n',
                            icon: 'success',
                            confirmButtonText: 'Cerrar'
                        });
                        
                    }else{
                        // this.snackBar.open("Ocorrio un error al eliminar, intentelo nuevamente", 'Cerrar', {
                        //     duration: 10000,
                        //     horizontalPosition: 'end',
                        //     verticalPosition: 'top'
                        // });
                        Swal.fire({
                            title: 'ERROR',
                            text: 'Ocurri?? un error al eliminar, intentelo nuevamente',
                            icon: 'error',
                            confirmButtonText: 'Cerrar'
                        });
                    }
                },
                (error) => {
                    // this.snackBar.open("Ocorrio un error al eliminar, intentelo nuevamente", 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'ERROR',
                        text: 'Ocurri?? un error al eliminar, intentelo nuevamente',
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
                }
            );
    }

    /**
     * Abre el dialogo para realizar la b??squeda de un contribuyente existente.
     * Al cierre del dialogo almacena los datos del registro seleccionado.
     */
    buscarPeritoPersona(){
        const dialogRef = this.dialog.open(DialogBuscaPerito, {
            width: '700px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.datoPeritos.apepaterno = result.apepaterno;
                this.datoPeritos.apematerno = result.apematerno;
                this.datoPeritos.nombre  = result.nombre;
                this.datoPeritos.rfc = result.rfc;
                this.datoPeritos.curp = result.curp;
                this.datoPeritos.ine = result.ine;
                this.datoPeritos.identificacion = result.identificacion;
                this.datoPeritos.idedato = result.idedato;
                this.datoPeritos.fecha_naci = (result.fecha_naci) ? new Date(result.fecha_naci) : null;
                this.datoPeritos.fecha_def = (result.fecha_def) ? new Date(result.fecha_def) : null;
                this.datoPeritos.celular = result.celular;
                this.datoPeritos.email = result.email;
                this.botonEdit = false;
                //document.getElementById("apepaterno").focus();
                this.changeRequired();
            }
        });
    }

    /**
     * Obtiene las representaci??nes de la sociedad.
     */
    getRepresentacion(){
        this.loadingRepresentante = true;
        let queryRep = 'rep=Representantes&idPersona=' + this.idPerito;
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
                    // this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
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
        let queryRepdo = 'rep=Representado&idPersona=' + this.idPerito;
        this.http.get(this.endpointActualiza + 'getRepresentacionContribuyente?' + queryRepdo, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingRepresentado = false;
                    this.dataSource5 = res;
                    this.total5 = this.dataSource5.length;
                    this.dataPaginate5 = this.paginate(this.dataSource5, 15, this.pagina5);
                },
                (error) => {
                    this.loadingRepresentado = false;
                    // this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
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
        const dialogRef = this.dialog.open(DialogHistorialRep, {
            width: '700px',
            data: this.idPerito,
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                setTimeout (() => {
                    
                }, 1000);
            }
        });
    }

    ///////////////////////// DATOS ESPECIFICOS //////////////////
    /**
     * Abre el dialogo para realizar las b??squeda de la sociedad que se asociar?? al perito.
     */
    agregaSociedadEditar(){
        const dialogRef = this.dialog.open(DialogSociedadAsociada, {
            width: '700px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.dataSociedadAsociada.push(result);
                this.insertaPeritoSociedad();
            }
        });
    }

    /**
     * Registra la sociedad previamente consultada al perito.
     */
    insertaPeritoSociedad(){
        this.spinner.show();
        this.loadingDatosPerito = true;
        let queryPS = 'idPersona=' + this.idPerito + '&idSociedad=' + this.dataSociedadAsociada[0].idsociedad;
        this.http.post(this.endpointActualiza + 'insertarPeritoSoci?' + queryPS, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    //this.loadingDatosPerito = false;
                    this.getPeritoDatos();
                    this.dataSociedadAsociada.pop()
                },
                (error) => {
                    this.loadingDatosPerito = false;
                    // this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'ERROR',
                        text: error.error.mensaje,
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
                    this.spinner.hide();
                }
            );     
    }

    /**
     * Elimina la asociaci??n de la sociedad con el perito.
     * @param element Datos del registro seleccionado.
     */
    eliminarPeritoSoicedad(element){
        this.loadingDatosPerito = true;
        let queryEPS = 'idPersona=' + this.idPerito + '&idSociedad=' + element.idsociedad;
        this.http.post(this.endpointActualiza + 'borrarPeritoSoci' + '?' + queryEPS, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    //this.loadingDatosPerito = false;
                    this.getPeritoDatos();
                },
                (error) => {
                    this.loadingDatosPerito = false;
                }
            );
    }

    /**
     * Elimina todas las asociaciones de las sociedades con el perito.
     */
    eliminarPeritoSoicedadTodos(){
        this.loadingDatosPerito = true;
        let queryEPS = 'idPersona=' + this.idPerito;
        this.http.post(this.endpointActualiza + 'borrarPeritoSociTodos' + '?' + queryEPS, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    //this.loadingDatosPerito = false;
                    this.getPeritoDatos();
                },
                (error) => {
                    this.loadingDatosPerito = false;
                }
            );
    }
}

///////////////BUSCAR PERSONA PERITO////////////////
export interface DatosPeritoPersona {
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
    activprincip: string;
}
@Component({
    selector: 'app-dialog-buscaPerito',
    templateUrl: 'app-dialog-buscaPerito.html',
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogBuscaPerito {
    endpoint = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['nombre', 'datos', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    loading = false;
    dataSource = [];
    dataPaginate;
    httpOptions;
    nombrePerito;
    filtroNombre;
    search = false;
    appaterno;
    apmaterno
    nombre;
    rfc;
    curp;
    ine;
    registro;
    identificacion;
    idedato;
    isIdentificativo;
    optionPeritoPersona;
    idperito: number;
    datoPeritoPersona: DatosPeritoPersona = {} as DatosPeritoPersona;
    @ViewChild('paginator') paginator: MatPaginator;
    loadingDocumentosIdentificativos
    dataDocumentos: DocumentosIdentificativos[] = [];

    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogBuscaPerito>,
        @Inject(MAT_DIALOG_DATA) public data: any){
            dialogRef.disableClose = true;
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
        this.loadingDocumentosIdentificativos= true;
        this.http.get(this.endpoint + 'getCatalogos', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingDocumentosIdentificativos= false;
                this.dataDocumentos = res.CatDocIdentificativos;
            },
            (error) => {
                this.loadingDocumentosIdentificativos = false;
            }
        );
    }

    /**
     * Valida que exista un dato para activar el b??ton de b??squeda.
     */
    validateSearchBuscaP(){
        this.search = (
            this.appaterno ||
            this.apmaterno ||
            this.nombre ||
            this.rfc ||
            this.curp ||
            this.ine ||
            this.registro ||
            this.identificacion ||
            this.idedato
        ) ? true : false;
    }

    /**
     * De acuerdo al parametro sea identificativo o personal se limpiaran los otros campos.
     * @param isIdentificativo Valor que nos indica que campos utilizaremos para realizar la busqueda
     */
    clearInputsIdentNoIdent2(isIdentificativo): void {
        this.isIdentificativo = isIdentificativo;
        if(this.isIdentificativo){
            this.appaterno = null;
            this.apmaterno = null;
            this.nombre = null;            
        }else{
            this.rfc = null;
            this.curp = null;
            this.ine = null;
            this.registro = null;
            this.identificacion = null;
            this.idedato = null;
        }
    }

    /**
     * Reinicia los valores del paginado y la b??squeda.
     */
    cleanBusca(): void{
        this.pagina = 1;
        this.total = 0;
        this.dataSource = [];
        this.loading = false;
        this.dataPaginate;
    }

    /**
     * Realiza la b??squeda del perito a asociar con la sociedad.
     */
    getPerito2(){
        let query = '';
        let busquedaDatos = '';

        if(this.nombre){
            query = query + '&nombre=' + this.nombre.toLocaleUpperCase() + '&filtroNombre=0';
        }
        if(this.appaterno){
            query = query + '&apellidoPaterno=' + this.appaterno.toLocaleUpperCase() + '&filtroApellidoPaterno=0';
        }
        if(this.apmaterno){
            query = query + '&apellidoMaterno=' + this.apmaterno.toLocaleUpperCase() + '&filtroApellidoMaterno=0';
        }
        if(this.curp){
            query = query + '&curp=' + this.curp.toLocaleUpperCase();
        }
        if(this.rfc){
            query = query + '&rfc=' + this.rfc.toLocaleUpperCase();
        }
        if(this.ine){
            query = query + '&ine=' + this.ine.toLocaleUpperCase();
        }
        if(this.registro){
            query = query + '&registro=' + this.registro.toLocaleUpperCase();
        }
        if(this.identificacion && this.idedato){
            query = query + '&iddocidentif=' + this.identificacion + '&valdocidentif=' + this.idedato.toLocaleUpperCase();
        }

        if( this.isIdentificativo ){
            busquedaDatos = busquedaDatos + 'getIdentificativos';
            query = query + '&coincidenTodos=false';
        }else{
            busquedaDatos = busquedaDatos + 'getContribuyente';
        }

        query = query.substr(1);

        this.loading = true;
        this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                },
                (error) => {
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
     * Obtiene y almacena los datos del perito seleccionado para al cerrar el dialogo se puedan utilizar.
     * @param element Arreglo de los datos del perito seleccionado.
     */
    peritoPersonaSelected(element){
        this.idperito = element.IDPERITO;
        this.datoPeritoPersona.nombre = element.NOMBRE;
        this.datoPeritoPersona.apepaterno = element.APELLIDOPATERNO;
        this.datoPeritoPersona.apematerno = element.APELLIDOMATERNO;
        this.datoPeritoPersona.rfc = element.RFC;
        this.datoPeritoPersona.curp = element.CURP;
        this.datoPeritoPersona.ine = element.CLAVEIFE;
        this.datoPeritoPersona.identificacion = element.IDDOCIDENTIF;
        this.datoPeritoPersona.idedato = element.DESCDOCIDENTIF;
        this.datoPeritoPersona.fecha_naci = element.FECHANACIMIENTO;
        this.datoPeritoPersona.fecha_def = element.FECHADEFUNCION;
        this.datoPeritoPersona.celular = element.CELULAR;
        this.datoPeritoPersona.email = element.EMAIL;
        this.datoPeritoPersona.activprincip = element.ACTIVPRINCIP;
    }
}

///////////////DOMICILIO////////////////
@Component({
    selector: 'app-dialog-domicilio',
    templateUrl: 'app-dialog-domicilio.html',
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogDomicilioPerito {
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
    botonAsentamiento = true;
    botonCiudad = true;
    botonMunicipio = true;
    botonVia = true;
    buscaMunicipios;
    domicilioFormGroup: FormGroup;
    dataDomicilio: DataDomicilio = {} as DataDomicilio;
    dataDomicilioEspecifico: DataDomicilio = {} as DataDomicilio;
    loadingDireccionEspecifica = false;
    blockButtons = true;
    iddomicilio;
    iddireccion;

    constructor(
        private auth: AuthService,
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private spinner: NgxSpinnerService,
        public dialogRef: MatDialogRef<DialogDomicilioPerito>,
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
                setTimeout(() => {
                    this.getDireccionEspecifica();
                }, 5000);
            }
        }
    
    /** 
     * Realiza la b??squeda del domicilio por el id Direcci??n
     * */       
    getDireccionEspecifica(){

        let metodo = 'getDireccionById';
        this.http.get(this.endpointCatalogos + metodo + '?idDireccion='+ this.iddireccion, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDireccionEspecifica = false;
                    this.dataDomicilioEspecifico = res;
                    setTimeout(() => {
                        this.setDataDomicilio(this.dataDomicilioEspecifico[0]);    
                    }, 500);
                },
                (error) => {
                    this.loadingDireccionEspecifica = false;
                    // this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
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
     * Obtiene el cat??logo de la alcaldia.
     */
     getAlcaldia(){
        let busquedaMunCol = 'getDelegaciones';
        this.loadingMunicipios = true;
        this.http.get(this.endpointCatalogos + busquedaMunCol, this.httpOptions).subscribe(
            (res: any) => {
                this.loadingMunicipios = false;
                this.municipios = res;
                this.spinner.hide();
            },
            (error) => {
                this.loadingMunicipios = false;
                this.spinner.hide();
            }
        );
    }

    /**
     * Obtiene los municipios de acuerdo al estado seleccionado
     * @param event Valor que se recibe para la obtenci??n de las alcaldias o municipios.
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
            },
            (error) => {
                this.loadingMunicipios = false;
            }
        );
    }
    
    /**
     * Obtiene el cat??logo de los asentamientos.
     */
    getDataTiposAsentamiento(): void {
        this.loadingTiposAsentamiento = true;
        this.http.get(this.endpointCatalogos + 'getTiposAsentamiento', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposAsentamiento = false;
                this.tiposAsentamiento = res;
            },
            (error) => {
                this.loadingTiposAsentamiento = false;
            }
        );
    }
  
    /**
     * Obtiene el cat??logo de las v??as
     */
    getDataTiposVia(): void {
        this.loadingTiposVia = true;
        this.http.get(this.endpointCatalogos + 'getTiposVia', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposVia = false;
                this.tiposVia = res;
            },
            (error) => {
                this.loadingTiposVia = false;
            }
        );
    }
  
    /**
     * Obtiene el cat??logo de los tipos de localidad
     */
    getDataTiposLocalidad(): void {
        this.loadingTiposLocalidad = true;
        this.http.get(this.endpointCatalogos + 'getTiposLocalidad', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposLocalidad = false;
                this.tiposLocalidad = res;
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
        this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
        this.dataDomicilio.codasentamiento = this.domicilioFormGroup.value.codasentamiento;
        this.dataDomicilio.idtipoasentamiento = this.domicilioFormGroup.value.idtipoasentamiento;
        this.dataDomicilio.asentamiento = (this.domicilioFormGroup.value.asentamiento) ? this.domicilioFormGroup.value.asentamiento : null;
        this.dataDomicilio.codtiposvia = (this.domicilioFormGroup.value.codtiposvia) ? this.domicilioFormGroup.value.codtiposvia : null;
        this.dataDomicilio.idtipovia = this.domicilioFormGroup.value.idtipovia;
        this.dataDomicilio.via = (this.domicilioFormGroup.value.via) ? this.domicilioFormGroup.value.via : null;
        this.dataDomicilio.idtipolocalidad = this.domicilioFormGroup.value.idtipolocalidad;
        this.dataDomicilio.cp = (this.domicilioFormGroup.value.cp) ? this.domicilioFormGroup.value.cp : null;
        this.dataDomicilio.nexterior = (this.domicilioFormGroup.value.nexterior) ? this.domicilioFormGroup.value.nexterior.toLocaleUpperCase() : null;
        this.dataDomicilio.entrecalle1 = (this.domicilioFormGroup.value.entrecalle1) ? this.domicilioFormGroup.value.entrecalle1.toLocaleUpperCase() : null;
        this.dataDomicilio.entrecalle2 = (this.domicilioFormGroup.value.entrecalle2) ? this.domicilioFormGroup.value.entrecalle2.toLocaleUpperCase() : null;
        this.dataDomicilio.andador = (this.domicilioFormGroup.value.andador) ? this.domicilioFormGroup.value.andador.toLocaleUpperCase() : null;
        this.dataDomicilio.edificio = (this.domicilioFormGroup.value.edificio) ? this.domicilioFormGroup.value.edificio.toLocaleUpperCase() : null;
        this.dataDomicilio.seccion = (this.domicilioFormGroup.value.seccion) ? this.domicilioFormGroup.value.seccion.toLocaleUpperCase() : null;
        this.dataDomicilio.entrada = (this.domicilioFormGroup.value.entrada) ? this.domicilioFormGroup.value.entrada.toLocaleUpperCase() : null;
        this.dataDomicilio.ninterior = (this.domicilioFormGroup.value.ninterior) ? this.domicilioFormGroup.value.ninterior.toLocaleUpperCase() : null;
        this.dataDomicilio.telefono = (this.domicilioFormGroup.value.telefono) ? this.domicilioFormGroup.value.telefono : null;
        this.dataDomicilio.adicional = (this.domicilioFormGroup.value.adicional) ? this.domicilioFormGroup.value.adicional.toLocaleUpperCase() : null;

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
        this.spinner.show();
        let query = 'insertarDireccion?idPersona=' + this.data.idPerito;

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
 

        this.http.post(this.endpointCatalogos + query, '', this.httpOptions)
            .subscribe( 
                (res: any) => {
                    // this.snackBar.open('Registro exitoso', 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'CORRECTO',
                        text: 'Registro exitoso',
                        icon: 'success',
                        confirmButtonText: 'Cerrar'
                    });
                    this.dialogRef.close(res.idpersona);
                    this.loadingEstados = false;
                    this.spinner.hide();
                },
                (error) => {
                    this.dialogRef.close();
                    // this.snackBar.open('Ocurrio un error al Insertar la direcci??n, intente nuevemente', 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'ERROR',
                        text: 'Ocurrio un error al Insertar la direcci??n, intente nuevamente',
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
                    this.spinner.hide();
                }
            );
    }

    /**
     * Actualiza el domicilio seleccionado.
     */
    actualizarDomicilio(){
        
        let query = 'actualizarDireccion?idPersona=' + this.data.idNotario + '&idDireccion=' + this.iddireccion;

        query = (this.dataDomicilio.codtiposvia) ? query + '&codtiposvia=' + this.dataDomicilio.codtiposvia : query + '&codtiposvia=';
        query = (this.dataDomicilio.idtipovia) ? query + '&idvia=' + this.dataDomicilio.idtipovia : query + '&idvia=';
        query = (this.dataDomicilio.via) ? query + '&via=' + this.dataDomicilio.via : query + '&via=';
        query = (this.dataDomicilio.nexterior) ? query + '&numeroexterior=' + this.dataDomicilio.nexterior : query + '&numeroexterior=';
        query = (this.dataDomicilio.entrecalle1) ? query + '&entrecalle1='  + this.dataDomicilio.entrecalle1 : query + '&entrecalle1';
        query = (this.dataDomicilio.entrecalle2) ? query + '&entrecalle2='  + this.dataDomicilio.entrecalle2 : query + '&entrecalle2';
        query = (this.dataDomicilio.andador) ? query + '&andador=' + this.dataDomicilio.andador : query + '&andador';
        query = (this.dataDomicilio.edificio) ? query + '&edificio=' + this.dataDomicilio.edificio : query + '&edificio';
        query = (this.dataDomicilio.seccion) ? query + '&seccion=' + this.dataDomicilio.seccion : query + '&seccion=';
        query = (this.dataDomicilio.entrada) ? query + '&entrada=' + this.dataDomicilio.entrada : query + '&entrada=';
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
        query = (this.dataDomicilio.adicional) ? query + '&indicacionesadicionales=' + this.dataDomicilio.adicional : query + '&indicacionesadicionales=';
        query = (this.dataDomicilio.ninterior) ? query + '&numerointerior=' + this.dataDomicilio.ninterior : query + '&numerointerior=';
        
        
        this.http.post(this.endpointCatalogos + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    // this.snackBar.open('Actualizaci??n Correcta', 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'CORRECTO',
                        text: 'Actualizaci??n Correcta',
                        icon: 'success',
                        confirmButtonText: 'Cerrar'
                    });
                    this.dialogRef.close(res.idpersona);
                    this.loadingEstados = false;
                },
                (error) => {
                    this.dialogRef.close();
                    // this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
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
        const dialogRef = this.dialog.open(DialogMunicipios, {
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
        const dialogRef = this.dialog.open(DialogCiudad, {
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
        const dialogRef = this.dialog.open(DialogAsentamiento, {
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
        const dialogRef = this.dialog.open(DialogVia, {
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
    selector: 'app-dialog-municipios',
    templateUrl: 'app-dialog-municipios.html',
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogMunicipios {
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
    btnAceptar = true;
    dataMunicipios: DataMunicipios = {} as DataMunicipios;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogMunicipios>,
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
                    this.loadingBuscaMun = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                },
                (error) => {
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
     * Se almacena los datos del municipio seleccionado que se motraran en el formulario.
     * @param element Arreglo de los datos del municipio seleccionado
     */
    selectMunicipios(element){
        this.btnAceptar = false;
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
        if(this.data.codEstado != 9){
            criterio = criterio + 'getMunicipiosByNombre';
            query = query + 'codEstado=' + this.data.codEstado + '&municipio=' + this.buscaMunicipios.toLocaleUpperCase();
        }else{
            criterio = '';
            query = '';
        }

        this.loadingBuscaMun = true;
        this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingBuscaMun = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
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
    selector: 'app-dialog-ciudad',
    templateUrl: 'app-dialog-ciudad.html',
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogCiudad {
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
    btnAceptar = true;
    dataCiudad: DataCiudad = {} as DataCiudad;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogCiudad>,
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
            query = query + '&nombre=' + this.buscaCiudad.toLocaleUpperCase();
        }

        this.loadingBuscaCiudad = true;
        this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingBuscaCiudad = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                },
                (error) => {
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
        this.btnAceptar = false;
        this.dataCiudad.ciudad = element.CIUDAD;
        this.dataCiudad.codciudad = element.CODCIUDAD;
        this.dataCiudad.codestado = element.CODESTADO;
    }

    
}

///////////////ASENTAMIENTO//////////////////
export interface DataAsentamiento{
    codasentamiento: string;
    asentamiento: string;
    codigopostal: string;
    codtiposasentamiento: string;
}
@Component({
    selector: 'app-dialog-asentamiento',
    templateUrl: 'app-dialog-asentamiento.html',
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogAsentamiento {
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
    btnAceptar = true;
    dataAsentamiento: DataAsentamiento = {} as DataAsentamiento;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogAsentamiento>,
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
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                },
                (error) => {
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
        this.btnAceptar = false;
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
        
        this.loading = true;
        this.http.get(this.endpoint + criterio + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
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
    selector: 'app-dialog-via',
    templateUrl: 'app-dialog-via.html',
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogVia {
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
    btnAceptar = true;
    dataVia: dataVia = {} as dataVia;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogVia>,
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
        this.loadingBuscaVia = true;
        let criterio = 'getViasByIdColonia';
        let query = '';

        if(this.buscaVia){
            query = query + 'nombre=' + this.buscaVia.toLocaleUpperCase();
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
                    this.loadingBuscaVia = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                },
                (error) => {
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
        this.btnAceptar = false;
        this.dataVia.codtiposvia = element.codtiposvia;
        this.dataVia.idvia = element.idvia;
        this.dataVia.via = element.via;
    }
}

///////////////REPRESENTACION////////////////
@Component({
    selector: 'app-dialog-representacion',
    templateUrl: 'app-dialog-representacion.html',
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogRepresentacionPeritos {
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
    noHistorico = true;
    dataRepresentacion: DataRepresentacion = {} as DataRepresentacion;
    isRequired = true;
    loadingDocumentosIdentificativos;
    documentoRepresentacionTipo;
    existedoctoRep = false;
    dataDocumentos: DocumentosIdentificativos[] = [];
  
    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogRepresentacionPeritos>,
        private auth: AuthService,
        private spinner: NgxSpinnerService,
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


    minDate = '';

    /** 
    * Obtiene los Documentos Identificativos para llenar el Select de Documentos Identificativos
    */
    getDataDocumentos(): void{
        this.spinner.show();
        this.loadingDocumentosIdentificativos = true;
        this.http.get(this.endpoint + 'getCatalogos', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingDocumentosIdentificativos = false;
                this.dataDocumentos = res.CatDocIdentificativos;
                this.spinner.hide();
            },
            (error) => {
                this.loadingDocumentosIdentificativos = false;
                this.spinner.hide();
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
        const dialogRef = this.dialog.open(DialogPersonaPeritos, {
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
                    this.fisicaFormGroup.controls['email'].setValue(result.email);
                    this.fisicaFormGroup.controls['celular'].setValue(result.celular);
                    this.fisicaFormGroup.markAllAsTouched();
                } else {
                    this.moralFormGroup.controls['nombre'].setValue(result.apaterno);
                    this.moralFormGroup.controls['rfc'].setValue(result.rfc);
                    this.moralFormGroup.controls['actPreponderante'].setValue(result.activprincip);
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
        const dialogRef = this.dialog.open(DialogDocumentoPerito, {
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
            this.dataRepresentacion.docIdent = (this.fisicaFormGroup.value.docIdent) ? this.fisicaFormGroup.value.docIdent.toLocaleUpperCase() : null;
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
                        fechaNacimiento: moment(this.dataRepresentacion.fechaNacimiento).format("DD-MM-YYYY"),
                        fechaDefuncion: moment(this.dataRepresentacion.fechaDefuncion).format("DD-MM-YYYY"),
                        celular: this.dataRepresentacion.celular,
                        email: this.dataRepresentacion.email,
                        activprincip: this.dataRepresentacion.actPreponderante,
                        idtipomoral: this.dataRepresentacion.idTipoPersonaMoral,
                        idmotivosmoral: this.dataRepresentacion.idMotivo,
                        fechainicioactiv: moment(this.dataRepresentacion.fechaInicioOperacion).format("DD-MM-YYYY"),
                        fechacambiosituacion: moment(this.dataRepresentacion.fechaCambio).format("DD-MM-YYYY")
                    },
                    {
                        rol:"representado",
                        codtiposPersona: "F",
                        idpersona: this.data.idPerito,
                        nombre: this.data.datosPerito.nombre,
                        rfc: this.data.datosPerito.rfc,
                        apellidoPaterno: this.data.datosPerito.apepaterno,
                        apellidoMaterno: this.data.datosPerito.apematerno,
                        curp: this.data.datosPerito.curp,
                        ife: this.data.datosPerito.ine,
                        iddocIdentif: this.data.datosPerito.identificacion,
                        valdocIdentif: this.data.datosPerito.idedato,
                        fechaNacimiento: moment(this.data.datosPerito.fecha_naci).format("DD-MM-YYYY"),
                        fechaDefuncion: moment(this.data.datosPerito.fecha_def).format("DD-MM-YYYY"),
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
                    // this.snackBar.open('REGISTRO EXITOSO', 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'CORRECTO',
                        text: 'REGISTRO EXITOSO',
                        icon: 'success',
                        confirmButtonText: 'Cerrar'
                    });
                    this.loading = false;
                    this.dialogRef.close(res);
                    this.spinner.hide();
                },
                (error) => {
                    // this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'ERROR',
                        text: error.error.mensaje,
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
                    this.spinner.hide();
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
                // this.snackBar.open('SE HA ACTUALIZADO EL REPRESENTADO', 'Cerrar', {
                //     duration: 10000,
                //     horizontalPosition: 'end',
                //     verticalPosition: 'top'
                // });
                Swal.fire({
                    title: 'CORRECTO',
                    text: 'SE HA ACTUALIZADO EL REPRESENTADO',
                    icon: 'success',
                    confirmButtonText: 'Cerrar'
                });
                let fin = true;
                this.dialogRef.close(fin);
                this.spinner.hide();
            },
            (error) => {
                this.dialogRef.close();
                // this.snackBar.open('ERROR INTENTELO M??S TARDE', 'Cerrar', {
                //     duration: 10000,
                //     horizontalPosition: 'end',
                //     verticalPosition: 'top'
                // });
                Swal.fire({
                    title: 'ERROR',
                    text: 'ERROR INTENTELO M??S TARDE',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                });
                this.spinner.hide();
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
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogRepresentadoPeritos {
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
    loadingDocumentosIdentificativos;
    documentoRepresentacionTipo;
    existedoctoRep = false;
    dataDocumentos: DocumentosIdentificativos[] = [];

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private _formBuilder: FormBuilder,
        private auth: AuthService,
        public dialog: MatDialog,
        private spinner: NgxSpinnerService,
        public dialogRef: MatDialogRef<DialogRepresentadoPeritos>,
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

    /** 
    * Obtiene los Documentos Identificativos para llenar el Select de Documentos Identificativos
    */
    getDataDocumentos(): void{
        this.loadingDocumentosIdentificativos = true;
        this.http.get(this.endpoint + 'getCatalogos', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingDocumentosIdentificativos = false;
                this.dataDocumentos = res.CatDocIdentificativos;
                this.spinner.hide();
            },
            (error) => {
                this.loadingDocumentosIdentificativos = false;
                this.spinner.hide();
            }
        );
    }

    minDate = '';

    fechaTope(){
        this.fisicaFormGroup.controls['fechaDefuncion'].setValue(null);
        this.minDate = moment(this.fisicaFormGroup.controls['fechaNacimiento'].value).add(2, 'd').format('YYYY-MM-DD');  
    }

    /**
     * * Al cambio en el llenado de curp o rfc se activar?? o desactivar?? uno de los dos validadores de requerido.
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
        const dialogRef = this.dialog.open(DialogPersonaPeritos, {
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
                    this.fisicaFormGroup.controls['email'].setValue(result.email);
                    this.fisicaFormGroup.controls['celular'].setValue(result.celular);
                    this.fisicaFormGroup.markAllAsTouched();
                } else {
                    this.moralFormGroup.controls['nombre'].setValue(result.apaterno);
                    this.moralFormGroup.controls['rfc'].setValue(result.rfc);
                    this.fisicaFormGroup.controls['actPreponderante'].setValue(result.activprincip);
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
        const dialogRef = this.dialog.open(DialogDocumentoPerito, {
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
            this.dataRepresentacion.docIdent = (this.fisicaFormGroup.value.docIdent) ? this.fisicaFormGroup.value.docIdent.toLocaleUpperCase() : null;
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
                        fechaNacimiento: moment(this.dataRepresentacion.fechaNacimiento).format("DD-MM-YYYY"),
                        fechaDefuncion: moment(this.dataRepresentacion.fechaDefuncion).format("DD-MM-YYYY"),
                        celular: this.dataRepresentacion.celular,
                        email: this.dataRepresentacion.email,
                        activprincip: this.dataRepresentacion.actPreponderante,
                        idtipomoral: this.dataRepresentacion.idTipoPersonaMoral,
                        idmotivosmoral: this.dataRepresentacion.idMotivo,
                        fechainicioactiv: moment(this.dataRepresentacion.fechaInicioOperacion).format("DD-MM-YYYY"),
                        fechacambiosituacion: moment(this.dataRepresentacion.fechaCambio).format("DD-MM-YYYY")
                    },
                    {
                        rol:"representante",
                        codtiposPersona: "F",
                        idpersona: this.data.idPerito,
                        nombre: this.data.datosPerito.nombre,
                        rfc: this.data.datosPerito.rfc,
                        apellidoPaterno: this.data.datosPerito.apepaterno,
                        apellidoMaterno: this.data.datosPerito.apematerno,
                        curp: this.data.datosPerito.curp,
                        ife: this.data.datosPerito.ine,
                        iddocIdentif: this.data.datosPerito.identificacion,
                        valdocIdentif: this.data.datosPerito.idedato,
                        fechaNacimiento: moment(this.data.datosPerito.fecha_naci).format("DD-MM-YYYY"),
                        fechaDefuncion: moment(this.data.datosPerito.fecha_def).format("DD-MM-YYYY"),
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
                    // this.snackBar.open('REGISTRO EXITOSO', 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'CORRECTO',
                        text: 'REGISTRO EXITOSO',
                        icon: 'success',
                        confirmButtonText: 'Cerrar'
                    });
                    this.loading = false;
                    this.dialogRef.close(res);
                    this.spinner.hide();
                },
                (error) => {
                    this.dialogRef.close()
                    // this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'ERROR',
                        text: error.error.mensaje,
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
                    this.spinner.hide();
                });
        }

        return this.dataRepresentacion;
    }

    /**
     * Actualiza la informaci??n de la representaci??n seleccionada.
     */
    updateRepresentacion(){

        let queryActRep = '';

        queryActRep = (this.dataRepresentacion.texto) ? queryActRep + 'textorepresentacion=' + this.dataRepresentacion.texto : queryActRep + 'textorepresentacion=';

        queryActRep = (this.dataRepresentacion.fechaCaducidad) ? queryActRep + '&fechacaducidad=' + moment(this.dataRepresentacion.fechaCaducidad).format("DD-MM-YYYY") : queryActRep + '&fechacaducidad=';

        queryActRep = queryActRep + '&idRepresentacion=' + this.idRepresentacion + '&idDocumentoDigital=' + this.idDocumento;


        this.http.post(this.endpoint + 'actualizarRepresentacion?' + queryActRep, '', this.httpOptions).subscribe(
            (res: any) => {
                // this.snackBar.open('SE HA ACTUALIZADO EL REPRESENTADO', 'Cerrar', {
                //     duration: 10000,
                //     horizontalPosition: 'end',
                //     verticalPosition: 'top'
                // });
                Swal.fire({
                    title: 'CORRECTO',
                    text: 'SE HA ACTUALIZADO EL REPRESENTADO',
                    icon: 'success',
                    confirmButtonText: 'Cerrar'
                });
               
                let fin = true;
                this.dialogRef.close(fin);
            },
            (error) => {
                this.dialogRef.close();
                // this.snackBar.open('ERROR INTENTELO M??S TARDE', 'Cerrar', {
                //     duration: 10000,
                //     horizontalPosition: 'end',
                //     verticalPosition: 'top'
                // });
                Swal.fire({
                    title: 'ERROR',
                    text: 'ERROR INTENTELO M??S TARDE',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                });
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
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogDocumentoPerito {
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
        public dialogRef: MatDialogRef<DialogDocumentoPerito>,
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
        const dialogRef = this.dialog.open(DialogNotarioPeritos, {
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
                    // this.snackBar.open('Su archivo excede el tama??o permido de maximo 5MB', 'Cerrar', {
                    //     duration: 5000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'ERROR',
                        text: 'Su archivo excede el tama??o permido de maximo 5MB',
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
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

        this.http.post(this.endpoint + 'infoDocumentos?idDocumentoDigital=' + idDocumento2, '', this.httpOptions).subscribe(
            (res: any) => {
                this.dataDocumentoSet = res;
                this.setDoc();
            },
            (error) => {
                // this.snackBar.open('ERROR INTENTELO M??S TARDE', 'Cerrar', {
                //     duration: 10000,
                //     horizontalPosition: 'end',
                //     verticalPosition: 'top'
                // });
                Swal.fire({
                    title: 'ERROR',
                    text: 'ERROR INTENTELO M??S TARDE',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                });
            });
    }

    /**
     * Se almacenan los datos relacionados con el documento cuando se ha seleccionado la opci??n de editar documento.
     */
    setDoc(){

        this.tiposDocumentoFormGroup.controls['codtipodocumentojuridico'].setValue(this.dataDocumentoSet.infoDocumento[0].codtipodocumentojuridico);
        if(this.dataDocumentoSet.infoDocumento[0].codtipodocumentojuridico == 'PN'){
            this.dataDocumento.idnotario = this.dataDocumentoSet.infoNotario[0].idnotario;
            this.infoDocumentoFormGroup.controls['noNotario'].setValue(this.dataDocumentoSet.infoNotario[0].numnotario);
            this.infoDocumentoFormGroup.controls['ciudadNotario'].setValue(this.dataDocumentoSet.infoNotario[0].codestado);
            this.infoDocumentoFormGroup.controls['nombreNotario'].setValue(this.dataDocumentoSet.infoNotario[0].nombre);
            this.infoDocumentoFormGroup.controls['num_escritura'].setValue(this.dataDocumentoSet.infoDocumentoNotario[0].numprotocolo);
        }

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

        this.http.get( this.endpoint + 'getFichero?idFichero=' + element.idficherodocumento, this.httpOptions ). subscribe (
            (res: any) => {
                this.descargaFichero = res;
                this.convertirDoc();
            },
            (error) => {
                // this.snackBar.open('ERROR INTENTELO M??S TARDE', 'Cerrar', {
                //     duration: 10000,
                //     horizontalPosition: 'end',
                //     verticalPosition: 'top'
                // });
                Swal.fire({
                    title: 'ERROR',
                    text: 'ERROR INTENTELO M??S TARDE',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                });
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

        this.http.post( this.endpoint + 'borrarFichero?lista=' + element.idficherodocumento, '', this.httpOptions ). subscribe (
            (res: any) => {
                // this.snackBar.open('SE HA HA BORRADO EL DOCTO', 'Cerrar', {
                //     duration: 10000,
                //     horizontalPosition: 'end',
                //     verticalPosition: 'top'
                // });
                Swal.fire({
                    title: 'CORRECTO',
                    text: 'SE HA HA BORRADO EL DOCUMENTO',
                    icon: 'success',
                    confirmButtonText: 'Cerrar'
                });
                this.dataDoc.splice(i,1);
            },
            (error) => {
                // this.snackBar.open('ERROR INTENTELO M??S TARDE', 'Cerrar', {
                //     duration: 10000,
                //     horizontalPosition: 'end',
                //     verticalPosition: 'top'
                // });
                Swal.fire({
                    title: 'ERROR',
                    text: 'ERROR INTENTELO M??S TARDE',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
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
        
        this.http.post( this.endpoint + 'actualizarDocumentos', payload, this.httpOptions ). subscribe (
            (res: any) => {
                if(res === true){
                    // this.snackBar.open('SE HA ACTUALIZADO CORRECTAMENTE LA INFORMACI??N', 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'CORRECTO',
                        text: 'SE HA ACTUALIZADO CORRECTAMENTE LA INFORMACI??N',
                        icon: 'success',
                        confirmButtonText: 'Cerrar'
                    });
                }else{
                    // this.snackBar.open('ERROR INTENTELO M??S TARDE', 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'ERROR',
                        text: 'ERROR INTENTELO M??S TARDE',
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
                }
            },
            (error) => {
                // this.snackBar.open('ERROR INTENTELO M??S TARDE', 'Cerrar', {
                //     duration: 10000,
                //     horizontalPosition: 'end',
                //     verticalPosition: 'top'
                // });
                Swal.fire({
                    title: 'ERROR',
                    text: 'ERROR INTENTELO M??S TARDE',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
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
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogNotarioPeritos {
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
        private spinner: NgxSpinnerService,
        public dialogRef: MatDialogRef<DialogNotarioPeritos>,
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
     * Obtiene el cat??logo de los estados de la rep??blica Mexicana
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
                this.loading = false;
                this.dataNotarios = res;
                this.dataSource = this.paginate(this.dataNotarios, this.pageSize, this.pagina);
                this.total = this.dataNotarios.length;
                this.paginator.pageIndex = 0;
                this.spinner.hide();
            },
            (error) => {
                this.loading = false;
                this.dataSource = [];
                this.spinner.hide();
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
    email: string;
    celular: string;
    activprincip: string;
}
@Component({
    selector: 'app-dialog-persona',
    templateUrl: 'app-dialog-persona.html',
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogPersonaPeritos {
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
    loadingDocumentosIdentificativos
    dataDocumentos: DocumentosIdentificativos[] = [];
    fisicaFormGroup: FormGroup;
    moralFormGroup: FormGroup;

    constructor(
      private auth: AuthService,
      private http: HttpClient,
      private _formBuilder: FormBuilder,
      private spinner: NgxSpinnerService,
      public dialogRef: MatDialogRef<DialogPersonaPeritos>,
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
        this.loadingDocumentosIdentificativos= true;
        this.http.get(this.endpoint + 'getCatalogos', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingDocumentosIdentificativos= false;
                this.dataDocumentos = res.CatDocIdentificativos;
                this.spinner.hide();
            },
            (error) => {
                this.loadingDocumentosIdentificativos = false;
                this.spinner.hide();
            }
        );
    }
    /**
     * De acuerdo al parametro sea identificativo o personal se limpiaran los otros campos.
     * @param isIdentificativo Valor que nos indica que campos utilizaremos para realizar la busqueda
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
                this.loading = false;
                this.dataPersonas = res;
                this.dataSource = this.paginate(this.dataPersonas, this.pageSize, this.pagina);
                this.total = this.dataPersonas.length;
                this.paginator.pageIndex = 0;
                this.spinner.hide();
            },
            (error) => {
                this.loading = false;
                this.dataSource = [];
                this.spinner.hide();
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
        this.persona.email = element.EMAIL;
        this.persona.celular = element.CELULAR;
        this.persona.activprincip = element.ACTIVPRINCIP;
    }
}

////////// SOCIEDADES ASOCIADAS ////////////////
export interface DataSociedadAsociadaDialog{
    razonSocial: string;
    registro: string;
    rfc: string;
    idsociedad: number;
}

@Component({
    selector: 'app-dialog-sociedadAsociada',
    templateUrl: 'app-dialog-sociedadAsociada.html',
    styleUrls: ['./editar-peritos.component.css']
})

export class DialogSociedadAsociada {
    endpoint = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['razon','registro', 'rfc', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    loading = false;
    dataSource = [];
    dataPaginate = [];
    httpOptions;
    razonSocial;
    rfc;
    registro;
    idSociedad;
    search;
    isIdentificativo;
    optionSociedad;
    dataSociedadAsociadaDialog: DataSociedadAsociadaDialog = {} as DataSociedadAsociadaDialog;
    resultSociedadAsociada = [];
    @ViewChild('paginator') paginator: MatPaginator;
  
    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private spinner: NgxSpinnerService,
        public dialogRef: MatDialogRef<DialogSociedadAsociada>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        dialogRef.disableClose = true;
  
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };

    }

    /**
     * Reinicia los valores del paginado y b??squeda.
     */
    clean(): void{
        this.loading = false;
        this.pagina = 1;
        this.total = 0;
        this.pageSize = 15;
        this.dataSource = [];
        this.dataPaginate;
        this.optionSociedad = undefined;
    }

    /**
     * Valida que exista un dato para activar el b??ton de b??squeda.
     */
    validateSearch(){
        this.search = (
            this.razonSocial ||
            this.rfc ||
            this.registro
        ) ? true : false;
    }

    /**
     * De acuerdo al parametro sea identificativo o personal se limpiaran los otros campos.
     * @param isIdentificativo Valor que nos indica que campos utilizaremos para realizar la busqueda
     */
    clearInputsIdentNoIdent(isIdentificativo): void {
        this.isIdentificativo = isIdentificativo;
        if(this.isIdentificativo){
            this.razonSocial = null;
        }else{
            this.rfc = null;
            this.registro = null;
        }
    }

    /**
     * Obtiene la sociedad de acuerdo al cr??terio de b??squeda que puede ser datos identificativos o personales.
     */
    getSociedad(){
        this.spinner.show();
        let query = '';
        let busquedaDatos = '';
        if( this.razonSocial ){
            busquedaDatos = busquedaDatos + 'getSocValuacionByDatosPersonales';
        }else{
            busquedaDatos = busquedaDatos + 'getSocValuacionByDatosIdentificativos';
        }

        if( this.razonSocial ){
            query = query + '&razonSocial=' + this.razonSocial.toLocaleUpperCase() + '&filtroRazon=1';
        }
        if(this.rfc){
            query = query + '&rfc=' + this.rfc.toLocaleUpperCase();
        }
        if(this.registro){
            query = query + '&registro=' + this.registro.toLocaleUpperCase();
        }

        query = query.substr(1);

        this.loading = true;
        this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    this.spinner.hide();
                },
                (error) => {
                    this.loading = false;
                    this.spinner.hide();
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
     * Obtiene y almacena los datos de la sociedad seleccionada.
     * @param element Arreglo de los datos de la sociedad seleccionada
     * @returns Regresa el arreglo de la sociedad.
     */
    sociedadSelected(element): DataSociedadAsociadaDialog {
        this.dataSociedadAsociadaDialog.rfc = element.RFC;
        this.dataSociedadAsociadaDialog.registro = element.REGISTRO;
        this.dataSociedadAsociadaDialog.razonSocial = element.RAZONSOCIAL;
        this.dataSociedadAsociadaDialog.idsociedad = element.IDSOCIEDAD;
        return;
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
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogHistorialRep {
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
        public dialogRef: MatDialogRef<DialogHistorialRep>,
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
     * Obtiene el historial de las representaciones ligadas al perito.
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
                    this.total = this.dataSource.length;
                    this.dataPaginate = this.paginate(this.dataSource, 10, this.pagina);
                },
                (error) => {
                    this.loadingH = false;
                    // this.snackBar.open("Ha ocurrido un problema al obtener el historial", 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'ERROR',
                        text: 'Ha ocurrido un problema al obtener el historial',
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
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
     * Recibe el id de la representaci??n y abre el dialogo que mostrar?? el resultado de la b??squeda solicitada.
     * @param element Id de la representcaci??n con la cual se realizar?? la b??squeda.
     */
    historicoDetalle(element){
        this.idChs = element;
        const dialogRef = this.dialog.open(DialogHistorialRepDetalle, {
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
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogHistorialRepDetalle {
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
        public dialogRef: MatDialogRef<DialogHistorialRepDetalle>,
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

        query = 'idChs=' + this.idChs;

        this.loadingH = true;
        let metodo = 'getHistoricosRepresentacionDetalle';
        this.http.get(this.endpoint + metodo + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingH = false;
                    this.dataRepresentacion = res;
                    this.setDetalle();
                },
                (error) => {
                    this.loadingH = false;
                    // this.snackBar.open("Ha ocurrido un problema al obtener el detalle", 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'ERROR',
                        text: 'Ha ocurrido un problema al obtener el detalle',
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
                }
            );
    }

    /**
     * Almacena los datos de la b??squeda realizada para mostrar en el formulario.
     */
    setDetalle(){
            //(this.dataRepresentacion.infoRepresentante[0].RFC) ? this.changeRequired('curp', 'rfc') : this.changeRequired('rfc', 'curp');

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

/////////////// DOMICILIOS HISTORICO ////////////////
export interface DataHistorico{
    fecha_desde: Date;
    fecha_hasta: Date;
}

@Component({
    selector: 'app-dialog-domicilio-historico-perito',
    templateUrl: 'app-dialog-domicilio-historico-perito.html',
    styleUrls: ['./editar-peritos.component.css']
  })
  export class DialogDomicilioHistoricoPerito {
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
        public dialogRef: MatDialogRef<DialogDomicilioHistoricoPerito>,
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
                    this.total = this.dataSource.length;
                    this.dataPaginate = this.paginate(this.dataSource, 10, this.pagina);
                },
                (error) => {
                    this.loading = false;
                    // this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
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
        const dialogRef = this.dialog.open(DialogDomicilioHistoricoEspecificoPerito, {
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
    selector: 'app-dialog-domicilio-historico-especifico-perito',
    templateUrl: 'app-dialog-domicilio-historico-especifico-perito.html',
    styleUrls: ['./editar-peritos.component.css']
  })
  export class DialogDomicilioHistoricoEspecificoPerito {
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
        public dialogRef: MatDialogRef<DialogDomicilioHistoricoEspecificoPerito>,
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
        this.loadingDireccionEspecifica = true;
        let metodo = 'getHistoricosDireccionDetalle';
        this.http.get(this.endpointCatalogos + metodo + '?idChs=' + this.idChs + '&idDireccion=' + this.idDireccion, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDireccionEspecifica = false;
                    this.dataDomicilioEspecifico = res;
                    this.setDataDomicilio(this.dataDomicilioEspecifico[0]);
                },
                (error) => {
                    this.loadingDireccionEspecifica = false;
                    // this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
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
     * @param event Valor que se recibe para la obtenci??n de las alcaldias o municipios.
     */
    getDataMunicipios(event): void {
        this.botonMunicipio = false;
        let busquedaMunCol = '';
        busquedaMunCol = (event.value == 9) ? 'getDelegaciones' : 'getMunicipiosByEstado?codEstado=' + event.value;
        this.loadingMunicipios = true;
        this.http.get(this.endpointCatalogos + busquedaMunCol, this.httpOptions).subscribe(
            (res: any) => {
                this.loadingMunicipios = false;
                this.municipios = res;
            },
            (error) => {
                this.loadingMunicipios = false;
            }
        );
    }
    
    /**
     * Obtiene el cat??logo de los asentamientos.
     */
    getDataTiposAsentamiento(): void {
        this.loadingTiposAsentamiento = true;
        this.http.get(this.endpointCatalogos + 'getTiposAsentamiento', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposAsentamiento = false;
                this.tiposAsentamiento = res;
            },
            (error) => {
                this.loadingTiposAsentamiento = false;
            }
        );
    }
    
    /**
     * Obtiene el cat??logo de las v??as
     */
    getDataTiposVia(): void {
        this.loadingTiposVia = true;
        this.http.get(this.endpointCatalogos + 'getTiposVia', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposVia = false;
                this.tiposVia = res;
            },
            (error) => {
                this.loadingTiposVia = false;
            }
        );
    }
    
    /**
     * Obtiene el cat??logo de los tipos de localidad
     */
    getDataTiposLocalidad(): void {
        this.loadingTiposLocalidad = true;
        this.http.get(this.endpointCatalogos + 'getTiposLocalidad', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposLocalidad = false;
                this.tiposLocalidad = res;
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
        const dialogRef = this.dialog.open(DialogMunicipios, {
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
        const dialogRef = this.dialog.open(DialogCiudad, {
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
        const dialogRef = this.dialog.open(DialogAsentamiento, {
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
        const dialogRef = this.dialog.open(DialogVia, {
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