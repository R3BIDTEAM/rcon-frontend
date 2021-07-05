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

export interface DatosContribuyente {
    codtipopersona: string;
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
    fechacambiosituacion: Date;
    fechainicioactiv: Date;
    idmotivosmoral: string;
    idtipomoral: string;
    activprincip: string;
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
export interface DataDocumentoRepresentacion {
    codtipodocumento: number;
    nombreTipoDocumento: string;
    codtipodocumentojuridico: number;
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

export interface DocumentosIdentificativos{
    id_documento: number;
    documento: string;
}

@Component({
    selector: 'app-alta-contribuyente',
    templateUrl: './alta-contribuyente.component.html',
    styleUrls: ['./alta-contribuyente.component.css']
})
export class AltaContribuyenteComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/';
    loading = false;
    loadingDocumentos = false;
    httpOptions;
    dataPaginate;
    idPersona;
    idChs;
    // tipoPersona = 'F';
    fisicaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    datosContribuyente: DatosContribuyente = {} as DatosContribuyente;
    dataDomicilios: DataDomicilio[] = [];
    dataRepresentantes: DataRepresentacion[] = [];
    dataRepresentados: DataRepresentacion[] = [];
    contribuyente: DataRepresentacion = {} as DataRepresentacion;
    dataDocumentos: DocumentosIdentificativos[] = [];
    loadingDomicilios = false;
    domInsertCont = false;
    panelRepresentantes = false;
    panelRepresentados = false;
    resultadoAlta;
    inserto = false;
    isRequired = true;

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
    dataSource4 = [];
    total4 = 0;
    pagina4= 1;
    dataPaginate4;
    dataSource5 = [];
    total5 = 0;
    pagina5= 1;
    dataPaginate5;
    /*PAGINADOS*/

    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private http: HttpClient,
        private auth: AuthService,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        private route: ActivatedRoute,
    ) { 
        this.contribuyente.tipoPersona = 'F';
    }

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

    this.moralFormGroup = this._formBuilder.group({
        nombre: [null, [Validators.required]],
        rfc: [null, [Validators.required]],
        actPreponderante: [null, []],
        idTipoPersonaMoral: ['', []],
        fechaInicioOperacion: [null, []],
        idMotivo: ['', []],
        fechaCambio: [null, []],
    });

    this.getDataDocumentos();
}

    clean(){
        this.fisicaFormGroup.controls['nombre'].setValue(null);
        this.fisicaFormGroup.controls['apaterno'].setValue(null);
        this.fisicaFormGroup.controls['amaterno'].setValue(null);
        this.fisicaFormGroup.controls['rfc'].setValue(null);
        this.fisicaFormGroup.controls['curp'].setValue(null);
        this.fisicaFormGroup.controls['ine'].setValue(null);
        this.fisicaFormGroup.controls['idDocIdent'].setValue(null);
        this.fisicaFormGroup.controls['docIdent'].setValue(null);
        this.fisicaFormGroup.controls['fechaNacimiento'].setValue(null);
        this.fisicaFormGroup.controls['fechaDefuncion'].setValue(null);
        this.fisicaFormGroup.controls['celular'].setValue(null);
        this.fisicaFormGroup.controls['email'].setValue(null);
        this.moralFormGroup.controls['nombre'].setValue(null);
        this.moralFormGroup.controls['rfc'].setValue(null);
        this.moralFormGroup.controls['actPreponderante'].setValue(null);
        this.moralFormGroup.controls['idTipoPersonaMoral'].setValue(null);
        this.moralFormGroup.controls['fechaInicioOperacion'].setValue(null);
        this.moralFormGroup.controls['idMotivo'].setValue(null);
        this.moralFormGroup.controls['fechaCambio'].setValue(null);
        this.inserto = false;
    }

    // checkRequired(){
    //     if(this.fisicaFormGroup.value.rfc === '' && this.fisicaFormGroup.value.curp === ''){
    //         this.isRequired = true;
    //     } else {
    //         this.isRequired = false;
    //     }
    // }

    changeRequired(remove, add): void {
        this.fisicaFormGroup.controls[remove].setValue(null);
        this.fisicaFormGroup.controls[remove].clearValidators();
        this.fisicaFormGroup.controls[add].setValidators(Validators.required);
        this.fisicaFormGroup.markAsUntouched();
        this.fisicaFormGroup.updateValueAndValidity();
        if(this.fisicaFormGroup.value.add === ''){
            this.isRequired = true;
        } else {
            this.isRequired = false;
        }
    }

    getHistorialDatosGenerales(): void {
        console.log("hola");
    }

    /** 
    * Obtiene los Documentos Identificativos para llenar el Select de Documentos Identificativos
    */
    getDataDocumentos(): void{
        this.loadingDocumentos = true;
        this.http.post(this.endpoint + 'getCatalogos', '', this.httpOptions).subscribe(
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

    consulta_previa(){
        let query = '';
        let busquedaDatos = 'getContribuyentesSimilares';

        //query = (this.contribuyente.nombre) ? query + 'nombre=' + this.contribuyente.nombre : query + 'nombre=';
        query = query + 'nombre=&filtroNombre=';

        //query = (this.contribuyente.apaterno) ? query + '&apellidopaterno=' + this.contribuyente.apaterno : query + '&apellidopaterno=' + this.contribuyente.nombre_moral;
        query = query + '&apellidopaterno=&filtroApellidoPaterno=';

        //query = (this.contribuyente.amaterno) ? query + '&apellidomaterno=' + this.contribuyente.amaterno : query + '&apellidomaterno=';
        query = query + '&apellidomaterno=&filtroApellidoMaterno=';

        query = (this.contribuyente.rfc) ? query + '&rfc=' + this.contribuyente.rfc : query + '&rfc=';

        query = (this.contribuyente.curp) ? query + '&curp=' + this.contribuyente.curp : query + '&curp=';

        query = (this.contribuyente.ine) ? query + '&claveife=' + this.contribuyente.ine : query + '&claveife=';

        query = (this.contribuyente.actPreponderante) ? query + '&actividadPrincip=' + this.contribuyente.actPreponderante : query + '&actividadPrincip=';

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
                        this.guardarContribuyente();
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
                bandeja: 1
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log(result);
                this.guardarContribuyente();
            }
        });
    }

    guardarContribuyente(){
        console.log("Sirve");
        // registro/insertarContribuyente?codtipospersona=F&nombre=JONATHAN GIOVANNI&activprincip&idtipomoral&idmotivosmoral&fechainicioactiv&fechacambiosituacion=&rfc=PAGJ830626&apellidopaterno=PALACIOS&apellidomaterno=GOMEZ&curp=PAGJ830626HMCLMN06&claveife=PLGMJN83062615H500&iddocidentif=1&valdocidentif&fechanacimiento=&fechadefuncion&celular=&email=jpalacios@mail.com&idExpediente=36
        // insertarContribuyente?codtipospersona=M&nombre=&activprincip=RRRRR&idtipomoral=&idmotivosmoral=&fechainicioactiv=22-02-2002&fechacambio&rfc=PAGJ830626aaa&apellidopaterno=JON SAa&apellidomaterno=DA45545&curp=&claveife=&iddocidentif=1&valdocidentif&fechanacimiento=&fechadefuncion&celular=&email=&idExpediente=
        // insertarContribuyente?&codtipospersona=F&nombre=JOEL&activprincip=&idtipomoral=&idmotivosmoral=&fechainicioactiv=&fechacambiosituacion=&rfc=HEVH900629HD5&apellidopaterno=HERRERA&apellidomaterno=VALADEZ&curp=&claveife=&iddocidentif=&valdocidentif=&fechanacimiento=29-06-1990&fechadefuncion=&celular=566566455&email=hj@mail.com&activprincip=&idExpediente
        let query = '';
        this.loading = true;

        query = (this.contribuyente.tipoPersona) ? query + '&codtipospersona=' + this.contribuyente.tipoPersona : query + '&codtipospersona=';
        query = (this.contribuyente.nombre) ? query + '&nombre=' + this.contribuyente.nombre : query + '&nombre=';
        query = (this.contribuyente.idTipoPersonaMoral) ? query + '&idtipomoral=' + this.contribuyente.idTipoPersonaMoral : query + '&idtipomoral=';
        query = (this.contribuyente.idMotivo) ? query + '&idmotivosmoral=' + this.contribuyente.idMotivo : query + '&idmotivosmoral=';
        query = (this.contribuyente.fechaInicioOperacion) ? query + '&fechainicioactiv=' + moment(this.contribuyente.fechaInicioOperacion).format('DD-MM-YYYY') : query + '&fechainicioactiv=';
        query = (this.contribuyente.fechaCambio) ? query + '&fechacambiosituacion=' + moment(this.contribuyente.fechaCambio).format('DD-MM-YYYY') : query + '&fechacambiosituacion=';
        query = (this.contribuyente.rfc) ? query + '&rfc=' + this.contribuyente.rfc : query + '&rfc=';
        query = (this.contribuyente.apaterno) ? query + '&apellidopaterno=' + this.contribuyente.apaterno : query + '&apellidopaterno=' + this.contribuyente.nombre_moral;
        query = (this.contribuyente.amaterno) ? query + '&apellidomaterno=' + this.contribuyente.amaterno : query + '&apellidomaterno=';
        query = (this.contribuyente.curp) ? query + '&curp=' + this.contribuyente.curp : query + '&curp=';
        query = (this.contribuyente.ine) ? query + '&claveife=' + this.contribuyente.ine : query + '&claveife=';
        query = (this.contribuyente.idDocIdent) ? query + '&iddocidentif=' + this.contribuyente.idDocIdent : query + '&iddocidentif=';
        query = (this.contribuyente.docIdent) ? query + '&valdocidentif=' + this.contribuyente.docIdent : query + '&valdocidentif=';
        query = (this.contribuyente.fechaNacimiento) ? query + '&fechanacimiento=' + moment(this.contribuyente.fechaNacimiento).format('DD-MM-YYYY') : query + '&fechanacimiento=';
        query = (this.contribuyente.fechaDefuncion) ? query + '&fechadefuncion=' + moment(this.contribuyente.fechaDefuncion).format('DD-MM-YYYY') : query + '&fechadefuncion=';
        query = (this.contribuyente.celular) ? query + '&celular=' + this.contribuyente.celular : query + '&celular=';
        query = (this.contribuyente.email) ? query + '&email=' + this.contribuyente.email : query + '&email=';
        query = (this.contribuyente.actPreponderante) ? query + '&activprincip=' + this.contribuyente.actPreponderante : query + '&activprincip=';
        // query = (this.contribuyente.nombre_moral) ? query + '&apellidopaterno=' + this.contribuyente.nombre_moral : query + '&apellidopaterno=';
        query = query + '&idExpediente';

        this.http.post(this.endpoint + 'insertarContribuyente' + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    console.log("CONTRIBUYENTE GUARDADO");
                    console.log(res);
                    this.domInsertCont = true;
                    this.inserto = true
                    this.idPersona = res[0].idpersona;
                    this.idChs = res[0].idchs;
                    this.resultadoAlta = res;
                    console.log(res[0].idpersona);
                    console.log(this.idChs);
                    this.setDatosContribuyente();
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
    * Genera el comprobante de algún movimiento realizado
    */
    printComprobante(){
        let query = '';
        this.loading = true;

        query = '&idPersona=' + this.idPersona + '&idChs=' + this.idChs;

        this.http.post(this.endpoint + 'infoComprobante' + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    console.log("Generando PDF");
                    console.log(res);
                    this.resultadoAlta = res;
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
    * Setea los valores encontrados en los campos del formulario
    */
    setDatosContribuyente(){
        this.datosContribuyente.nombre = this.resultadoAlta[0].nombre;
        this.datosContribuyente.apepaterno = this.resultadoAlta[0].apellidopaterno;
        this.datosContribuyente.apematerno = this.resultadoAlta[0].apellidomaterno;
        this.datosContribuyente.rfc = this.resultadoAlta[0].rfc;
        this.datosContribuyente.curp = this.resultadoAlta[0].curp;
        this.datosContribuyente.ine = this.resultadoAlta[0].claveife;
        this.datosContribuyente.fecha_naci = this.resultadoAlta[0].fechanacimiento;
        this.datosContribuyente.fecha_def = this.resultadoAlta[0].fechadefuncion;
        this.datosContribuyente.identificacion = this.resultadoAlta[0].iddocidentif;
        this.datosContribuyente.idedato = this.resultadoAlta[0].descdocidentif;
        this.datosContribuyente.celular = this.resultadoAlta[0].celular;
        this.datosContribuyente.email = this.resultadoAlta[0].email;
        this.datosContribuyente.activprincip = this.resultadoAlta[0].activprincip;
        this.datosContribuyente.fechainicioactiv = this.resultadoAlta[0].fechainicioactiv;
        this.datosContribuyente.idtipomoral = this.resultadoAlta[0].idtipomoral;
        this.datosContribuyente.idmotivosmoral = this.resultadoAlta[0].idmotivosmoral;
        this.datosContribuyente.fechacambiosituacion = this.resultadoAlta[0].fechacambiosituacion;
        this.datosContribuyente.codtipopersona = this.resultadoAlta[0].codtipopersona;
        console.log("ACA LA SET DEL DATOS CONTRI");
        console.log(this.datosContribuyente);
    }

    //////////////////// DOMICILIO ///////////////////////////
    addDomicilio(i = -1, dataDomicilio = null): void {
        let codtiposdireccion = '';
        const dialogRef = this.dialog.open(DialogDomicilioAlta, {
            width: '700px',
            data: {dataDomicilio:dataDomicilio, idPerito: this.idPersona,
                    codtiposdireccion: codtiposdireccion
            },
        });
        dialogRef.afterClosed().subscribe(result => {
                this.getDomicilioPerito();
        });
    }

    addDomicilioBoleta(i = -1, dataDomicilio = null): void {
        let codtiposdireccion = 'N';
        const dialogRef = this.dialog.open(DialogDomicilioAlta, {
            width: '700px',
            data: {dataDomicilio:dataDomicilio, idPerito: this.idPersona,
                codtiposdireccion: codtiposdireccion 
            },
        });
        dialogRef.afterClosed().subscribe(result => {
            this.getDomicilioPerito();
        });
    }

    getDomicilioPerito(){
        this.loadingDomicilios = true;
        let metodo = 'getDireccionesContribuyente';
        this.http.post(this.endpoint + metodo + '?idPersona='+ this.idPersona, '', this.httpOptions)
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
        this.pagina2 = evt.pageIndex + 1;
        this.dataSource2 = this.paginate(this.dataSource2, 15, this.pagina2);
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

    viewHistorial(i, domicilio): void {
        console.log(i + " " + domicilio);
    }

    ///////////////////REPRESENTACIÓN//////////////////////////////
    addRepresentante(i = -1, dataRepresentante = null): void {
        const dialogRef = this.dialog.open(DialogRepresentacionAltaC, {
            width: '700px',
            data: {dataRepresentante : dataRepresentante,
                    datosPerito : this.datosContribuyente,
                    idPerito : this.idPersona
            },
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                if(i != -1){
                    this.dataRepresentantes[i] = result;
                }else{
                    this.dataRepresentantes.push(result);
                }
            }
        });
    }

    addRepresentado(i = -1, dataRepresentante = null): void {
        const dialogRef = this.dialog.open(DialogRepresentadoAltaC, {
            width: '700px',
            data: {dataRepresentante : dataRepresentante,
                    datosPerito: this.datosContribuyente,
                    idPerito : this.idPersona
            },
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                if(i != -1){
                    this.dataRepresentantes[i] = result;
                }else{
                    this.dataRepresentantes.push(result);
                }
            }
        });
    }

    removeRepresentante(i){
		this.dataRepresentantes.splice(i, 1);
	}

}

///////////////DOMICILIO////////////////
@Component({
    selector: 'app-dialog-domicilio',
    templateUrl: 'app-dialog-domicilio.html',
    styleUrls: ['./alta-contribuyente.component.css']
})
export class DialogDomicilioAlta {
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
    botonAsentamiento = true;
    botonCiudad = true;
    botonMunicipio = true;
    botonVia = true;
    buscaMunicipios;
    domicilioFormGroup: FormGroup;
    dataDomicilio: DataDomicilio = {} as DataDomicilio;

    constructor(
        private auth: AuthService,
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogDomicilioAlta>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        dialogRef.disableClose = true;
        this.httpOptions = {
            headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: this.auth.getSession().token
            })
        };

        this.codtiposdireccion = data.codtiposdireccion;
        this.dataDomicilio = {} as DataDomicilio
        this.getDataEstados();
        
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
            this.setDataDomicilio(data);
        }
        this.getDataTiposAsentamiento();
        this.getDataTiposVia();
        this.getDataTiposLocalidad();
    }
  
    getNombreDel(event): void {
        this.dataDomicilio.delegacion = event.source.triggerValue;
        this.botonAsentamiento = false;
    }

    /** 
    * Obtiene el nombre de los Estados para llenar el el Select de Estados
    */
    getDataEstados(): void {
        this.loadingEstados = true;
        this.http.post(this.endpointCatalogos + 'getEstados', '', this.httpOptions).subscribe(
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
    * Obtiene el nombre de los Municipios de cada estado, o los de las delegaciones si es la CDMX
    */
    getDataMunicipios(event): void {
        this.botonMunicipio = false;
        let busquedaMunCol = '';
        busquedaMunCol = (event.value == 9) ? 'getDelegaciones' : 'getMunicipiosByEstado?codEstado=' + event.value;
        this.loadingMunicipios = true;
        this.http.post(this.endpointCatalogos + busquedaMunCol, '', this.httpOptions).subscribe(
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
    * Obtiene el nombre de las colonias dependiendo de la delegación o municipio
    */
    getDataTiposAsentamiento(): void {
        this.loadingTiposAsentamiento = true;
        this.http.post(this.endpointCatalogos + 'getTiposAsentamiento', '', this.httpOptions).subscribe(
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
    * Obtiene el nombre de las calles dependiendo la colonia seleccionada
    */
    getDataTiposVia(): void {
        this.loadingTiposVia = true;
        this.http.post(this.endpointCatalogos + 'getTiposVia', '', this.httpOptions).subscribe(
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
    * Obtiene el tipo de localidades que existen para llenar el combo select
    */
    getDataTiposLocalidad(): void {
        this.loadingTiposLocalidad = true;
        this.http.post(this.endpointCatalogos + 'getTiposLocalidad', '', this.httpOptions).subscribe(
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
    * Obtiene la información de los domicilios
    */
    getDataDomicilio(): void {
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
        
        if(this.domicilioFormGroup.value.idestado == 9){
            this.dataDomicilio.idmunicipio = this.domicilioFormGroup.value.idmunicipio;
            //this.dataDomicilio.delegacion = this.domicilioFormGroup.value.delegacion;
        } else {
            this.dataDomicilio.idmunicipio2 = this.domicilioFormGroup.value.idmunicipio2;
            this.dataDomicilio.municipio = (this.domicilioFormGroup.value.municipio) ? this.domicilioFormGroup.value.municipio : null;
            this.dataDomicilio.ciudad = (this.domicilioFormGroup.value.ciudad) ? this.domicilioFormGroup.value.ciudad : null;
            this.dataDomicilio.idciudad = (this.domicilioFormGroup.value.idciudad) ? this.domicilioFormGroup.value.idciudad : null;
        }
        this.guardaDomicilio();
        //console.log('AQUEI EL FORM VALID');
        // console.log(this.domicilioFormGroup);
        ///retu
    }

    /** 
    * Guarda el domicilio que se agrega
    */
    guardaDomicilio(){
        
        let query = 'insertarDireccion?idPersona=' + this.data.idPerito;

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
        
        console.log('EL SUPER QUERY!!!!!!');
        console.log(query);
        //insertarDireccion?idPersona=4485239&codtiposvia=1&idvia=686&via=DR LAVISTA&numeroexterior=144&entrecalle1&entrecalle2&andador&edificio&seccion&entrada
            //&codtiposlocalidad=1&codtiposasentamiento=9&idcolonia=8&codasentamiento=&colonia=DOCTORES&codigopostal=06720
            //&codciudad=&ciudad&iddelegacion=5&codmunicipio=15&delegacion=CUAUHTEMOC&telefono&codestado=9&codtiposdireccion=N&indicacionesadicionales&numerointerior=
        this.http.post(this.endpointCatalogos + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    console.log(res);
                    if(res.original.mensaje){
                        this.snackBar.open('Ocurrio un error al Insertar la dirección, intente nuevemente', 'Cerrar', {
                            duration: 10000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                    }else{
                        this.snackBar.open('Registro exitoso', 'Cerrar', {
                            duration: 10000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                    }
                    //this.dialogRef.close();
                },
                (error) => {
                }
            );
    }

    /** 
    * @param dataDomicilio setea los valores encontrados en la consulta en el formulario
    */
    setDataDomicilio(dataDomicilio): void {
        //this.domicilioFormGroup.controls['idtipodireccion'].setValue(dataDomicilio.idtipodireccion);
        this.domicilioFormGroup.controls['idestado'].setValue(dataDomicilio.idestado);
        this.getDataMunicipios({value: this.domicilioFormGroup.value.idestado});
        this.domicilioFormGroup.controls['codasentamiento'].setValue(dataDomicilio.codasentamiento);
        this.domicilioFormGroup.controls['idtipoasentamiento'].setValue(dataDomicilio.idtipoasentamiento);
        this.domicilioFormGroup.controls['asentamiento'].setValue(dataDomicilio.asentamiento);
        this.domicilioFormGroup.controls['codtiposvia'].setValue(dataDomicilio.codtiposvia);
        this.domicilioFormGroup.controls['idtipovia'].setValue(dataDomicilio.idtipovia);
        this.domicilioFormGroup.controls['via'].setValue(dataDomicilio.via);
        this.domicilioFormGroup.controls['idtipolocalidad'].setValue(dataDomicilio.idtipolocalidad);
        this.domicilioFormGroup.controls['cp'].setValue(dataDomicilio.cp);
        this.domicilioFormGroup.controls['nexterior'].setValue(dataDomicilio.nexterior);
        this.domicilioFormGroup.controls['entrecalle1'].setValue(dataDomicilio.entrecalle1);
        this.domicilioFormGroup.controls['entrecalle2'].setValue(dataDomicilio.entrecalle2);
        this.domicilioFormGroup.controls['andador'].setValue(dataDomicilio.andador);
        this.domicilioFormGroup.controls['edificio'].setValue(dataDomicilio.edificio);
        this.domicilioFormGroup.controls['seccion'].setValue(dataDomicilio.seccion);
        this.domicilioFormGroup.controls['entrada'].setValue(dataDomicilio.entrada);
        this.domicilioFormGroup.controls['ninterior'].setValue(dataDomicilio.ninterior);
        this.domicilioFormGroup.controls['telefono'].setValue(dataDomicilio.telefono);
        this.domicilioFormGroup.controls['adicional'].setValue(dataDomicilio.adicional);
    
        if(dataDomicilio.idestado == 9){
            this.domicilioFormGroup.controls['idmunicipio'].setValue(dataDomicilio.idmunicipio);
        } else {
            this.domicilioFormGroup.controls['idmunicipio2'].setValue(dataDomicilio.idmunicipio);
            this.domicilioFormGroup.controls['municipio'].setValue(dataDomicilio.municipio);
            this.domicilioFormGroup.controls['ciudad'].setValue(dataDomicilio.ciudad);
        }
    }

    /** 
    * Obtiene los municipios
    */
    getMunicipios(){
        this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
        const dialogRef = this.dialog.open(DialogMunicipiosAlta, {
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
    * Obtiene las ciudades dependiendo del municipio seleccionado
    */
    getCiudad(){
        this.dataDomicilio.idmunicipio2 = this.domicilioFormGroup.value.idmunicipio2;
        const dialogRef = this.dialog.open(DialogCiudadAlta, {
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
    * Obtiene las colonias dependiendo de la ciudad seleccionada
    */
    getAsentamiento(){
        this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
        this.dataDomicilio.idmunicipio = this.domicilioFormGroup.value.idmunicipio;
        this.dataDomicilio.idmunicipio2 = this.domicilioFormGroup.value.idmunicipio2;
        this.dataDomicilio.idciudad = (this.domicilioFormGroup.value.idciudad) ? this.domicilioFormGroup.value.idciudad : null;
        const dialogRef = this.dialog.open(DialogAsentamientoAlta, {
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
    * Obtiene las calles dependiendo la colonia seleccionada
    */
    getVia(){
        this.dataDomicilio.codasentamiento =  this.domicilioFormGroup.value.codasentamiento;
        const dialogRef = this.dialog.open(DialogViaAlta, {
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
    selector: 'app-dialog-municipios',
    templateUrl: 'app-dialog-municipios.html',
    styleUrls: ['./alta-contribuyente.component.css']
})
export class DialogMunicipiosAlta {
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
        public dialogRef: MatDialogRef<DialogMunicipiosAlta>,
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

    cleanAsentamiento(){
        this.pagina = 1;
        this.total = 0;
        this.dataSource = [];
        this.loadingBuscaMun = false;
        this.dataPaginate;
        this.obtenerMunicipios();
    }

    /** 
    * Obtiene los municipios
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
        this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
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
    * @param element despliega los municipios dependiendo el estado seleccionado
    */
    selectMunicipios(element){
        console.log(element);
        this.dataMunicipios.codestado = element.CODESTADO;
        this.dataMunicipios.codmunicipio = element.CODMUNICIPIO;
        this.dataMunicipios.municipio = element.MUNICIPIO;
    }

    /**
    * Obtiene los nombres de los municipios
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
        this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
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
    selector: 'app-dialog-ciudad',
    templateUrl: 'app-dialog-ciudad.html',
    styleUrls: ['./alta-contribuyente.component.css']
})
export class DialogCiudadAlta {
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
        public dialogRef: MatDialogRef<DialogCiudadAlta>,
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

    cleanAsentamiento(){
        this.pagina = 1;
        this.total = 0;
        this.dataSource = [];
        this.loadingBuscaCiudad = false;
        this.dataPaginate;
        this.obtenerCiudad();
    }

    /**
    * Obtiene las sociedades
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
        this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
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
    * @element despliega las ciudades segun el municpio seleccionado
    */
    selectCiudad(element){
        console.log(element);
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
    styleUrls: ['./alta-contribuyente.component.css']
})
export class DialogAsentamientoAlta {
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
        public dialogRef: MatDialogRef<DialogAsentamientoAlta>,
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

    cleanAsentamiento(){
        this.pagina = 1;
        this.total = 0;
        this.dataSource = [];
        this.loading = false;
        this.dataPaginate;
        this.obtenerAsentamiento();
    }

    /**
    * Obtiene las colonias
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

        if(this.buscaAsentamiento){
            query = query + '&nombre=' + this.buscaAsentamiento;
        }

        console.log('ASENTAMIENTOSSSS'+this.endpoint + '?' + query);
        this.loading = true;
        this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
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
    * Obtiene las colonias segun el municipio seleccionado
    */
    selectAsentamiento(element){
        console.log(element);
        if(element.IDDELEGACION){
            this.dataAsentamiento.codasentamiento = element.CODIGO;
            this.dataAsentamiento.asentamiento = element.DESCRIPCION;
            this.dataAsentamiento.codigopostal = element.CODIGOPOSTAL;
            this.dataAsentamiento.codtiposasentamiento = element.CODTIPOSASENTAMIENTO;
        }else{
            this.dataAsentamiento.codasentamiento = element.codasentamiento;
            this.dataAsentamiento.asentamiento = element.asentamiento;
            this.dataAsentamiento.codigopostal = element.codigopostal;
            this.dataAsentamiento.codtiposasentamiento = element.codtiposasentamiento;
        }
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
    styleUrls: ['./alta-contribuyente.component.css']
})
export class DialogViaAlta {
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
        public dialogRef: MatDialogRef<DialogViaAlta>,
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

    cleanAsentamiento(){
        this.pagina = 1;
        this.total = 0;
        this.dataSource = [];
        this.loadingBuscaVia = false;
        this.dataPaginate;
        this.obtenerVia();
    }

    /**
    * Obtiene las calles
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
        this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
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
    * Obtiene las calles segun la colonia seleccionada
    */
    selectVia(element){
        console.log(element);
        this.dataVia.codtiposvia = element.codtiposvia;
        this.dataVia.idvia = element.idvia;
        this.dataVia.via = element.via;
    }

    /**
    * Obtiene las colonias por nombre
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
        this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
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
    styleUrls: ['./alta-contribuyente.component.css']
})
export class DialogRepresentacionAltaC {
    endpoint = environment.endpoint + 'registro/';
    loading = false;
    httpOptions;
    tipoPersona = 'F';
    idPersonaRepresentacion;
    idDocumento;
    fisicaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    dataRepresentacion: DataRepresentacion = {} as DataRepresentacion;
  
    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogRepresentacionAltaC>,
        private auth: AuthService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        
        dialogRef.disableClose = true;
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
            texto: [null, []],
            fechaCaducidad: [null, []],
        });
    
        this.moralFormGroup = this._formBuilder.group({
            nombre: [null, [Validators.required]],
            rfc: [null, [Validators.required]],
            actPreponderante: [null, []],
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
        }

        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };
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
    * Abre el dialogo para obtener un contribuyente previamente registrado, al cerrar se obtienen su información para ser registrado en la representación.
    */
    addPersona(): void {
        const dialogRef = this.dialog.open(DialogPersonaAltaC, {
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
                } else {
                    this.moralFormGroup.controls['nombre'].setValue(result.apaterno);
                    this.moralFormGroup.controls['rfc'].setValue(result.rfc);
                }
            }
        });
    }
  
    /**
    * Abre el dialogo para agregar los ficheros y datos relacionados su registro.
    */
    addDocumento(dataDocumento = null): void {
        const dialogRef = this.dialog.open(DialogDocumentoAltaC, {
            width: '700px',
            data: {idDocumento: this.idDocumento},
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
            this.dataRepresentacion.nombre = (this.fisicaFormGroup.value.nombre) ? this.fisicaFormGroup.value.nombre : null;
            this.dataRepresentacion.apaterno = (this.fisicaFormGroup.value.apaterno) ? this.fisicaFormGroup.value.apaterno : null;
            this.dataRepresentacion.amaterno = (this.fisicaFormGroup.value.amaterno) ? this.fisicaFormGroup.value.amaterno : null;
            this.dataRepresentacion.rfc = (this.fisicaFormGroup.value.rfc) ? this.fisicaFormGroup.value.rfc : null;
            this.dataRepresentacion.curp = (this.fisicaFormGroup.value.curp) ? this.fisicaFormGroup.value.curp : null;
            this.dataRepresentacion.ine = (this.fisicaFormGroup.value.ine) ? this.fisicaFormGroup.value.ine : null;
            this.dataRepresentacion.idDocIdent = this.fisicaFormGroup.value.idDocIdent;
            this.dataRepresentacion.docIdent = (this.fisicaFormGroup.value.docIdent) ? this.fisicaFormGroup.value.docIdent : null;
            this.dataRepresentacion.fechaNacimiento = (this.fisicaFormGroup.value.fechaNacimiento) ? this.fisicaFormGroup.value.fechaNacimiento : null;
            this.dataRepresentacion.fechaDefuncion = (this.fisicaFormGroup.value.fechaDefuncion) ? this.fisicaFormGroup.value.fechaDefuncion : null;
            this.dataRepresentacion.celular = (this.fisicaFormGroup.value.celular) ? this.fisicaFormGroup.value.celular : null;
            this.dataRepresentacion.email = (this.fisicaFormGroup.value.email) ? this.fisicaFormGroup.value.email : null;
            this.dataRepresentacion.texto = (this.fisicaFormGroup.value.texto) ? this.fisicaFormGroup.value.texto : null;
            this.dataRepresentacion.fechaCaducidad = (this.fisicaFormGroup.value.fechaCaducidad) ? this.fisicaFormGroup.value.fechaCaducidad : null;
        } else {
            this.dataRepresentacion.nombre = (this.moralFormGroup.value.nombre) ? this.moralFormGroup.value.nombre : null;
            this.dataRepresentacion.rfc = (this.moralFormGroup.value.rfc) ? this.moralFormGroup.value.rfc : null;
            this.dataRepresentacion.actPreponderante = (this.moralFormGroup.value.actPreponderante) ? this.moralFormGroup.value.actPreponderante : null;
            this.dataRepresentacion.idTipoPersonaMoral = this.moralFormGroup.value.idTipoPersonaMoral;
            this.dataRepresentacion.fechaInicioOperacion = (this.moralFormGroup.value.fechaInicioOperacion) ? this.moralFormGroup.value.fechaInicioOperacion : null;
            this.dataRepresentacion.idMotivo = this.moralFormGroup.value.idMotivo;
            this.dataRepresentacion.fechaCambio = (this.moralFormGroup.value.fechaCambio) ? this.moralFormGroup.value.fechaCambio : null;
            this.dataRepresentacion.texto = (this.moralFormGroup.value.texto) ? this.moralFormGroup.value.texto : null;
            this.dataRepresentacion.fechaCaducidad = (this.moralFormGroup.value.fechaCaducidad) ? this.moralFormGroup.value.fechaCaducidad : null;
        }
        this.idPersonaRepresentacion = (this.idPersonaRepresentacion) ? this.idPersonaRepresentacion : null;

        console.log('AQUIII EL JSON');
        console.log(this.dataRepresentacion);
        //console.log(JSON.stringify(this.dataRepresentacion));
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
                    codtiposPersona: this.data.codtipopersona,
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
                    activprincip: this.data.datosPerito.activprincip,
                    idtipomoral: this.data.datosPerito.idtipomoral,
                    idmotivosmoral: this.data.datosPerito.idmotivosmoral,
                    fechainicioactiv: this.data.datosPerito.fechainicioactiv,
                    fechacambiosituacion: this.data.datosPerito.fechacambiosituacion
                }
            ],
            "documento": {
                descripcion: this.dataRepresentacion.documentoRepresentacion.descripcion,        
                codtipodocumento: this.dataRepresentacion.documentoRepresentacion.codtipodocumento,
                fecha: moment(this.dataRepresentacion.documentoRepresentacion.fecha).format("DD-MM-YYYY"),
                codTipoDocumentoJuridico: this.dataRepresentacion.documentoRepresentacion.codtipodocumentojuridico,        
                lugar: this.dataRepresentacion.documentoRepresentacion.lugar,
                idNotario: this.dataRepresentacion.documentoRepresentacion.idnotario,
                noEscritura: this.dataRepresentacion.documentoRepresentacion.noNotario,
                documentos: this.dataRepresentacion.documentoRepresentacion.archivos
            }
        };
        
        console.log(JSON.stringify(payload));
        this.http.post( this.endpoint + 'insertarRepresentacion', payload, this.httpOptions ). subscribe (
            (res: any) => {
                this.snackBar.open('SE HA INSERTADO TODO', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
                console.log("AQUI ENTRO LAS RESPUESTA DEL PUT REPRESENTECIÓN");
                console.log(res);
            },
            (error) => {
                this.snackBar.open('ERROR INTENTELO MÁS TARDE', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
            });
        
        return this.dataRepresentacion;
    }
  
    /**
    * Obtiene el arreglo de los datos  de la representación seleccionada para editar.
    * @param dataRepresentacion Arreglo con los datos del registro seleccionado.
    */
    setDataRepresentacion(dataRepresentacion): void {
        this.tipoPersona = dataRepresentacion.tipoPersona;
        if(this.tipoPersona == 'F'){
            this.fisicaFormGroup.controls['nombre'].setValue(dataRepresentacion.nombre);
            this.fisicaFormGroup.controls['apaterno'].setValue(dataRepresentacion.apaterno);
            this.fisicaFormGroup.controls['amaterno'].setValue(dataRepresentacion.amaterno);
            this.fisicaFormGroup.controls['rfc'].setValue(dataRepresentacion.rfc);
            this.fisicaFormGroup.controls['curp'].setValue(dataRepresentacion.curp);
            this.fisicaFormGroup.controls['ine'].setValue(dataRepresentacion.ine);
            this.fisicaFormGroup.controls['idDocIdent'].setValue(dataRepresentacion.idDocIdent);
            this.fisicaFormGroup.controls['docIdent'].setValue(dataRepresentacion.docIdent);
            this.fisicaFormGroup.controls['fechaNacimiento'].setValue(dataRepresentacion.fechaNacimiento);
            this.fisicaFormGroup.controls['fechaDefuncion'].setValue(dataRepresentacion.fechaDefuncion);
            this.fisicaFormGroup.controls['celular'].setValue(dataRepresentacion.celular);
            this.fisicaFormGroup.controls['email'].setValue(dataRepresentacion.email);
            this.fisicaFormGroup.controls['texto'].setValue(dataRepresentacion.texto);
            this.fisicaFormGroup.controls['fechaCaducidad'].setValue(dataRepresentacion.fechaCaducidad);
        } else {
            this.moralFormGroup.controls['nombre'].setValue(dataRepresentacion.nombre);
            this.moralFormGroup.controls['rfc'].setValue(dataRepresentacion.rfc);
            this.moralFormGroup.controls['actPreponderante'].setValue(dataRepresentacion.actPreponderante);
            this.moralFormGroup.controls['idTipoPersonaMoral'].setValue(dataRepresentacion.idTipoPersonaMoral);
            this.moralFormGroup.controls['fechaInicioOperacion'].setValue(dataRepresentacion.fechaInicioOperacion);
            this.moralFormGroup.controls['idMotivo'].setValue(dataRepresentacion.idMotivo);
            this.moralFormGroup.controls['fechaCambio'].setValue(dataRepresentacion.fechaCambio);
            this.moralFormGroup.controls['texto'].setValue(dataRepresentacion.texto);
            this.moralFormGroup.controls['fechaCaducidad'].setValue(dataRepresentacion.fechaCaducidad);
        }
  
        this.dataRepresentacion.documentoRepresentacion = dataRepresentacion.documentoRepresentacion;
    }
}

///////////////REPRESENTADO////////////////
@Component({
    selector: 'app-dialog-representado',
    templateUrl: 'app-dialog-representado.html',
    styleUrls: ['./alta-contribuyente.component.css']
})
export class DialogRepresentadoAltaC {
    endpoint = environment.endpoint + 'registro/';
    loading = false;
    httpOptions;
    tipoPersona = 'F';
    fisicaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    idPersonaRepresentacion;
    fechaCaducidad;
    idDocumento;
    insertOrUpdate = null;
    dataRepresentacion: DataRepresentacion = {} as DataRepresentacion;

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private _formBuilder: FormBuilder,
        private auth: AuthService,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogRepresentadoAltaC>,
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
            texto: [null, []],
            fechaCaducidad: [null, []],
        });
    
        this.moralFormGroup = this._formBuilder.group({
            nombre: [null, [Validators.required]],
            rfc: [null, [Validators.required]],
            actPreponderante: [null, []],
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
            this.insertOrUpdate = 2;
        }
    }
      
    /**
     * * Al cambio en el llenado de curp o rfc se activará o desactivará uno de los dos validadores de requerido.
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
     * Abre el dialogo para obtener un contribuyente previamente registrado, al cerrar se obtienen su información para ser registrado en la representación.
     */
    addPersona(): void {
        const dialogRef = this.dialog.open(DialogPersonaAltaC, {
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
                } else {
                    this.moralFormGroup.controls['nombre'].setValue(result.apaterno);
                    this.moralFormGroup.controls['rfc'].setValue(result.rfc);
                }
            }
        });
    }
  
    /**
     * Abre el dialogo para agregar los ficheros y datos relacionados su registro.
     */
    addDocumento(dataDocumento = null): void {
        const dialogRef = this.dialog.open(DialogDocumentoAltaC, {
            width: '700px',
            data: {idDocumento: this.idDocumento},
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
            this.dataRepresentacion.nombre = (this.fisicaFormGroup.value.nombre) ? this.fisicaFormGroup.value.nombre : null;
            this.dataRepresentacion.apaterno = (this.fisicaFormGroup.value.apaterno) ? this.fisicaFormGroup.value.apaterno : null;
            this.dataRepresentacion.amaterno = (this.fisicaFormGroup.value.amaterno) ? this.fisicaFormGroup.value.amaterno : null;
            this.dataRepresentacion.rfc = (this.fisicaFormGroup.value.rfc) ? this.fisicaFormGroup.value.rfc : null;
            this.dataRepresentacion.curp = (this.fisicaFormGroup.value.curp) ? this.fisicaFormGroup.value.curp : null;
            this.dataRepresentacion.ine = (this.fisicaFormGroup.value.ine) ? this.fisicaFormGroup.value.ine : null;
            this.dataRepresentacion.idDocIdent = this.fisicaFormGroup.value.idDocIdent;
            this.dataRepresentacion.docIdent = (this.fisicaFormGroup.value.docIdent) ? this.fisicaFormGroup.value.docIdent : null;
            this.dataRepresentacion.fechaNacimiento = (this.fisicaFormGroup.value.fechaNacimiento) ? this.fisicaFormGroup.value.fechaNacimiento : null;
            this.dataRepresentacion.fechaDefuncion = (this.fisicaFormGroup.value.fechaDefuncion) ? this.fisicaFormGroup.value.fechaDefuncion : null;
            this.dataRepresentacion.celular = (this.fisicaFormGroup.value.celular) ? this.fisicaFormGroup.value.celular : null;
            this.dataRepresentacion.email = (this.fisicaFormGroup.value.email) ? this.fisicaFormGroup.value.email : null;
            this.dataRepresentacion.texto = (this.fisicaFormGroup.value.texto) ? this.fisicaFormGroup.value.texto : null;
            this.dataRepresentacion.fechaCaducidad = (this.fisicaFormGroup.value.fechaCaducidad) ? this.fisicaFormGroup.value.fechaCaducidad : null;
        } else {
            this.dataRepresentacion.nombre = (this.moralFormGroup.value.nombre) ? this.moralFormGroup.value.nombre : null;
            this.dataRepresentacion.rfc = (this.moralFormGroup.value.rfc) ? this.moralFormGroup.value.rfc : null;
            this.dataRepresentacion.actPreponderante = (this.moralFormGroup.value.actPreponderante) ? this.moralFormGroup.value.actPreponderante : null;
            this.dataRepresentacion.idTipoPersonaMoral = this.moralFormGroup.value.idTipoPersonaMoral;
            this.dataRepresentacion.fechaInicioOperacion = (this.moralFormGroup.value.fechaInicioOperacion) ? this.moralFormGroup.value.fechaInicioOperacion : null;
            this.dataRepresentacion.idMotivo = this.moralFormGroup.value.idMotivo;
            this.dataRepresentacion.fechaCambio = (this.moralFormGroup.value.fechaCambio) ? this.moralFormGroup.value.fechaCambio : null;
            this.dataRepresentacion.texto = (this.moralFormGroup.value.texto) ? this.moralFormGroup.value.texto : null;
            this.dataRepresentacion.fechaCaducidad = (this.moralFormGroup.value.fechaCaducidad) ? this.moralFormGroup.value.fechaCaducidad : null;
        }

        this.idPersonaRepresentacion = (this.idPersonaRepresentacion) ? this.idPersonaRepresentacion : null;
        console.log('AQUIII EL JSON');
        console.log(this.dataRepresentacion);
        //console.log(JSON.stringify(this.dataRepresentacion));
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
                    codtiposPersona: this.data.codtipopersona,
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
                    activprincip: this.data.datosPerito.activprincip,
                    idtipomoral: this.data.datosPerito.idtipomoral,
                    idmotivosmoral: this.data.datosPerito.idmotivosmoral,
                    fechainicioactiv: this.data.datosPerito.fechainicioactiv,
                    fechacambiosituacion: this.data.datosPerito.fechacambiosituacion
                }
            ],
            "documento": {
                descripcion: this.dataRepresentacion.documentoRepresentacion.descripcion,        
                codtipodocumento: this.dataRepresentacion.documentoRepresentacion.codtipodocumento,
                fecha: moment(this.dataRepresentacion.documentoRepresentacion.fecha).format("DD-MM-YYYY"),
                codTipoDocumentoJuridico: this.dataRepresentacion.documentoRepresentacion.codtipodocumentojuridico,        
                lugar: this.dataRepresentacion.documentoRepresentacion.lugar,
                idNotario: this.dataRepresentacion.documentoRepresentacion.idnotario,
                noEscritura: this.dataRepresentacion.documentoRepresentacion.noNotario,
                documentos: this.dataRepresentacion.documentoRepresentacion.archivos
            }
        };
        console.log(JSON.stringify(payload));
        if(this.insertOrUpdate == 2){
            this.updateRepresentacion(payload);            
        }else{
            //this.insertRepresentacion(payload);
            this.http.post( this.endpoint + 'insertarRepresentacion', payload, this.httpOptions ). subscribe (
                (res: any) => {
                    this.snackBar.open('SE HA INSERTADO EL REPRESENTADO', 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                    console.log("AQUI ENTRO LAS RESPUESTA DEL PUT REPRESENTADO");
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

        return this.dataRepresentacion;
    }

    /**
     * Inserta un registro de representación.
     */
    insertRepresentacion(payload){
        
        console.log(payload);
        console.log("INSERTA");
        //return;
        this.http.post( this.endpoint + 'insertarRepresentacion', payload, this.httpOptions ). subscribe (
            (res: any) => {
                this.snackBar.open('SE HA INSERTADO EL REPRESENTADO', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
                console.log("AQUI ENTRO LAS RESPUESTA DEL PUT REPRESENTADO");
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
     * Actualiza la información de la representación seleccionada.
     */
    updateRepresentacion(payload){
        console.log("ACTUALIZA");
        return;
        console.log(JSON.stringify(payload));
        this.http.post(this.endpoint + 'insertarRepresentacion' + payload, '', this.httpOptions).subscribe(
            (res: any) => {
                this.snackBar.open('SE HA INSERTADO TODO', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
                console.log("AQUI ENTRO LAS RESPUESTA DEL PUT REPRESENTECIÓN");
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
            this.moralFormGroup.controls['nombre'].setValue(dataRepresentacion.NOMBRE);
            this.moralFormGroup.controls['rfc'].setValue(dataRepresentacion.RFC);
            this.moralFormGroup.controls['actPreponderante'].setValue(dataRepresentacion.ACTIVPRINCIP);
            this.moralFormGroup.controls['idTipoPersonaMoral'].setValue(dataRepresentacion.IDTIPOMORAL);
            this.moralFormGroup.controls['fechaInicioOperacion'].setValue((dataRepresentacion.FECHAINICIOACTIV) ? new Date(dataRepresentacion.FECHAINICIOACTIV) : null);
            this.moralFormGroup.controls['idMotivo'].setValue(dataRepresentacion.IDMOTIVOSMORAL);
            this.moralFormGroup.controls['fechaCambio'].setValue((dataRepresentacion.FECHACAMBIOSITUACION) ? new Date(dataRepresentacion.FECHACAMBIOSITUACION) : null);
            this.moralFormGroup.controls['texto'].setValue(dataRepresentacion.TEXTOREPRESENTACION);
            this.moralFormGroup.controls['fechaCaducidad'].setValue((dataRepresentacion.FECHACADUCIDAD) ? new Date(dataRepresentacion.FECHACADUCIDAD) : null);
        }
        
        this.dataRepresentacion.documentoRepresentacion = dataRepresentacion.documentoRepresentacion;
        
    }
}
  
///////////////DOCUMENTO////////////////
@Component({
    selector: 'app-dialog-documento',
    templateUrl: 'app-dialog-documento.html',
    styleUrls: ['./alta-contribuyente.component.css']
})
export class DialogDocumentoAltaC {
    endpoint = environment.endpoint + 'registro/';
    loadingTiposDocumentoDigital = false;
    loadingTiposDocumentoJuridico = false;
    httpOptions;
    tiposDocumentoDigital;
    tiposDocumentoJuridico;
    selectTipoDoc = '1';
    idDocumento;
    tiposDocumentoFormGroup: FormGroup;
    infoDocumentoFormGroup: FormGroup;
    archivosDocumentoFormGroup: FormGroup;
    dataDocumentoSet;
    fechaDocto;
    dataDoc = [];
    displayedColumnsDoc: string[] = ['nombre','descripcion', 'download', 'eliminar'];
    dataDocumento: DataDocumentoRepresentacion = {} as DataDocumentoRepresentacion;
    canSend = false;
    
    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        private auth: AuthService,
        public dialogRef: MatDialogRef<DialogDocumentoAltaC>,
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
            descripcion: [null, []],
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
        }
        console.log("ACA EL DATA DEL DOCU DIALOG");
        console.log(data);
    }
  
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
        const dialogRef = this.dialog.open(DialogNotarioAltaC, {
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
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    this.archivos.push(this.createItem({
                    nombre: file.name,
                    base64: reader.result
                    }));
                };
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
            this.dataDocumento.ciudadNotario = (this.infoDocumentoFormGroup.value.ciudadNotario) ? this.infoDocumentoFormGroup.value.ciudadNotario : null;
            this.dataDocumento.nombreNotario = (this.infoDocumentoFormGroup.value.nombreNotario) ? this.infoDocumentoFormGroup.value.nombreNotario : null;
            this.dataDocumento.num_escritura = (this.infoDocumentoFormGroup.value.num_escritura) ? this.infoDocumentoFormGroup.value.num_escritura : null;
        }
        this.dataDocumento.fecha = (this.infoDocumentoFormGroup.value.fecha) ? this.infoDocumentoFormGroup.value.fecha : null;
        this.dataDocumento.descripcion = (this.infoDocumentoFormGroup.value.descripcion) ? this.infoDocumentoFormGroup.value.descripcion : null;
        this.dataDocumento.lugar = (this.infoDocumentoFormGroup.value.lugar) ? this.infoDocumentoFormGroup.value.lugar : null;
        this.dataDocumento.archivos = this.archivosDocumentoFormGroup.value.archivos;
    
        this.canSend = true;
    }
  
    /**
     * Obtiene la información del documento y el fichero.
     * @param idDocumento Valor del idDocumento utilizado para la búsqueda del mismo
     */
    setDataDocumento(idDocumento): void {

        this.http.post(this.endpoint + 'infoDocumentos?idDocumentoDigital=' + idDocumento, '', this.httpOptions).subscribe(
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
            this.infoDocumentoFormGroup.controls['num_escritura'].setValue('');
        }
        //this.dataDocumento.nombreTipoDocumentoJuridico = dataDocumento.nombreTipoDocumentoJuridico;
        this.infoDocumentoFormGroup.controls['fecha'].setValue(new Date(this.dataDocumentoSet.infoDocumento[0].fecha));
        this.infoDocumentoFormGroup.controls['descripcion'].setValue(this.dataDocumentoSet.infoDocumento[0].descripcion);
        this.infoDocumentoFormGroup.controls['lugar'].setValue(this.dataDocumentoSet.infoDocumento[0].lugar);

        console.log(this.fechaDocto);    
        this.dataDoc = this.dataDocumentoSet.infoFicheros;
        if(this.dataDocumentoSet.infoFicheros){
            for(let archivo of this.dataDocumentoSet.infoFicheros){
            this.archivos.push(this.createItem({
                nombre: archivo.nombre,
                base64: archivo.base64
            }));
            }
        }
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
    styleUrls: ['./alta-contribuyente.component.css']
})
export class DialogNotarioAltaC {
    endpoint = environment.endpoint + 'registro/getNotariosByDatosIdentificativos';
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
        public dialogRef: MatDialogRef<DialogNotarioAltaC>,
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
        this.http.post(this.endpointCatalogos + 'getEstados', '', this.httpOptions).subscribe(
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
        
        if(this.filtros.numnotario){
            this.queryParamFiltros = this.queryParamFiltros + '&numnotario=' + this.filtros.numnotario;
        }
        if(this.filtros.estado){
            this.queryParamFiltros = this.queryParamFiltros + '&estado=' + this.filtros.estado;
        }
        if(this.filtros.rfc){
            this.queryParamFiltros = this.queryParamFiltros + '&rfc=' + this.filtros.rfc;
        }
        if(this.filtros.curp){
            this.queryParamFiltros = this.queryParamFiltros + '&curp=' + this.filtros.curp;
        }
        if(this.filtros.claveife){
            this.queryParamFiltros = this.queryParamFiltros + '&claveife=' + this.filtros.claveife;
        }
        if(this.filtros.nombre){
            this.queryParamFiltros = this.queryParamFiltros + '&nombre=' + this.filtros.nombre + '&filtroNombre=0';
        }
        if(this.filtros.apellidoPaterno){
            this.queryParamFiltros = this.queryParamFiltros + '&apellidoPaterno=' + this.filtros.apellidoPaterno + '&filtroApellidoPaterno=0';
        }
        if(this.filtros.apellidoMaterno){
            this.queryParamFiltros = this.queryParamFiltros + '&apellidoMaterno=' + this.filtros.apellidoMaterno + '&filtroApellidoMaterno=0';
        }
        
        this.http.post(this.endpoint + '?' + this.queryParamFiltros, '', this.httpOptions).subscribe(
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
  
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataSource = this.paginate(this.dataNotarios, this.pageSize, this.pagina);
    }
  
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }
      
    clean(): void {
        this.pagina = 1;
        this.total = 0;
        this.dataNotarios = [];
        this.filtros = {} as Filtros;
        this.notario = {} as Notario;
        this.optionNotario = undefined;
        this.isBusqueda = false;
    }
  
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
    styleUrls: ['./alta-contribuyente.component.css']
})
export class DialogPersonaAltaC {
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
  
    constructor(
      private auth: AuthService,
      private http: HttpClient,
      public dialogRef: MatDialogRef<DialogPersonaAltaC>,
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
        console.log("aca el tipo person " + data);
        console.log(this.tipoPersona);
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
                this.queryParamFiltros = this.queryParamFiltros + '&rfc=' + this.filtros.rfc;
            } else {
                this.endpointBusqueda = this.endpoint + 'getPersonaMoral';
            if(this.filtros.nombre)
                this.queryParamFiltros = this.queryParamFiltros + '&razonSocial=' + this.filtros.nombre + '&filtroApellidoPaterno=0';
            }
        } else {
            if(this.isIdentificativo){
                this.endpointBusqueda = this.endpoint + 'getIdentificativos';
                if(this.filtros.curp)
                    this.queryParamFiltros = this.queryParamFiltros + '&curp=' + this.filtros.curp;
                if(this.filtros.rfc)
                    this.queryParamFiltros = this.queryParamFiltros + '&rfc=' + this.filtros.rfc;
                if(this.filtros.ine)
                    this.queryParamFiltros = this.queryParamFiltros + '&claveife=' + this.filtros.ine;
                if(this.filtros.idDocIdent)
                    this.queryParamFiltros = this.queryParamFiltros + '&iddocidentif=' + this.filtros.idDocIdent;
                if(this.filtros.docIdent)
                    this.queryParamFiltros = this.queryParamFiltros + '&valdocidentif=' + this.filtros.docIdent;
        
                this.queryParamFiltros = this.queryParamFiltros + '&coincidenTodos=false';        
            } else {
                this.endpointBusqueda = this.endpoint + 'getContribuyente';
                if(this.filtros.nombre)
                    this.queryParamFiltros = this.queryParamFiltros + '&nombre=' + this.filtros.nombre + '&filtroNombre=0';
                if(this.filtros.apaterno)
                    this.queryParamFiltros = this.queryParamFiltros + '&apellidoPaterno=' + this.filtros.apaterno + '&filtroApellidoPaterno=0';
                if(this.filtros.amaterno)
                    this.queryParamFiltros = this.queryParamFiltros + '&apellidoMaterno=' + this.filtros.amaterno + '&filtroApellidoMaterno=0';
            }
        }
  
        this.http.post(this.endpointBusqueda + '?' + this.queryParamFiltros, '', this.httpOptions).subscribe(
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