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
import * as FileSaver from 'file-saver';
import pdfMake from "pdfmake/build/pdfmake";  
import pdfFonts from "pdfmake/build/vfs_fonts";  
pdfMake.vfs = pdfFonts.pdfMake.vfs; 
import { DialogConfirmacionComponent } from '@comp/dialog-confirmacion/dialog-confirmacion.component';

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
    dataContribuyenteResultado;
    query;
    idContribuyente;
    idChs;
    panelDomicilio = false;
    panelDomPredial = false;
    dataRepresentantes: DataRepresentacion[] = [];
    dataRepresentados: DataRepresentacion[] = [];
    dataActualizacion: DataActualizacion = {} as DataActualizacion;
    contribuyente: DatosContribuyente = {} as DatosContribuyente;
    dataDocumentos: DocumentosIdentificativos[] = [];
    dataDomicilios: DataDomicilio[] = [];
    dataDomicilioEspecifico: DataDomicilio[] = [];
    displayedColumnsDom: string[] = ['tipoDir','direccion', 'historial', 'editar'];
    displayedColumnsRepdo: string[] = ['representacion','texto','caducidad','editar','eliminar'];
    loadingDomicilios = false;
    paginaDom = 1;
    totalDom = 0;
    pageSizeDom = 15;
    dataDomicilioResultado;
    dataSourceDom = [];
    dataPaginateDom;
    endpointActualiza = environment.endpoint + 'registro/';
    isIdentificativo;
    idInmueble;
    loadingDireccionEspecifica = false;
    panelRepresentantes = false;
    panelRepresentados = false;
    loadingRepresentante = false;
    loadingRepresentado = false;
    panelPDF = false;
    actualizado = false;
    accionDomicilio = false;
    accionDomicilioBoletas = false;
    cambioPersona;
    actCambioPersona = true;
    isRequired = true;

    /*Paginado*/
    dataSource1 = [];
    total1 = 0;
    pagina1 = 1;
    dataPaginate1;
    dataSource2 = [];
    total2 = 0;
    pagina2 = 1;
    dataPaginate2;
    dataSource4 = [];
    total4 = 0;
    pagina4 = 1;
    dataPaginate4;
    dataSource5 = [];
    total5 = 0;
    pagina5 = 1;
    dataPaginate5;
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

        this.idContribuyente = this.route.snapshot.paramMap.get('idcontribuyente');
        this.getDataDocumentos();
        this.getContribuyenteDatos();
        this.getDomicilioContribuyente();
        this.getRepresentacion();
        this.getRepresentado();
    }

    actualizaPersona(event){
        console.log(event)
        this.actCambioPersona = (event == this.cambioPersona) ? true : false;
        console.log(this.actCambioPersona);
        if(this.contribuyente.tipoPersona == 'M'){
            this.contribuyente.nombre_moral = this.contribuyente.apepaterno + ' ' + this.contribuyente.apematerno + ' ' + this.contribuyente.nombre;
        }
        this.contribuyente.rfc = null;
    }

    changeRequired(): void {
        // this.fisicaFormGroup.controls[remove].setValue(null);
        // this.fisicaFormGroup.controls[remove].clearValidators();
        // this.fisicaFormGroup.controls[add].setValidators(Validators.required);
        // this.fisicaFormGroup.markAsUntouched();
        // this.fisicaFormGroup.updateValueAndValidity();
        if(this.fisicaFormGroup.value.rfc === ''){
            this.isRequired = true;
        } else {
            this.isRequired = false;
        }
    }

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

    getContribuyenteDatos(){
        this.query = '&idPersona=' + this.idContribuyente; 
        this.loading = true;
        console.log(this.endpoint);
        this.http.post(this.endpoint + 'getInfoContribuyente?' + this.query, '', this.httpOptions)
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
        
    }


    actualizarContribuyente(){
        //registro/actualizaContribuyente?codtipospersona=F&nombre=Jose Albert&activprincip&idtipomoral&idmotivosmoral&fechainicioactiv&fechacambiosituacion&rfc=RUFV891129R15&apellidopaterno=Hernandez&apellidomaterno=MESSIE&curp=PAGJ830626HMCLMN11&claveife=mmmmmm&iddocidentif=1&valdocidentif=888&fechanacimiento=02-02-1989&fechadefuncion=02-02-2020&celular=5555555&email=nuevo_mail@mail.com&idExpediente&idpersona=4485307
        console.log('Preparando actualización...');
        let query = '';
        this.loading = true;
        this.actualizado = false;

        query = (this.contribuyente.tipoPersona) ? query + '&codtipospersona=' + this.contribuyente.tipoPersona : query + '&codtipospersona=';
        query = (this.contribuyente.nombre) ? query + '&nombre=' + this.contribuyente.nombre : query + '&nombre=';
        query = (this.contribuyente.idTipoPersonaMoral) ? query + '&idtipomoral=' + this.contribuyente.idTipoPersonaMoral : query + '&idtipomoral=';
        query = (this.contribuyente.idMotivo) ? query + '&idmotivosmoral=' + this.contribuyente.idMotivo : query + '&idmotivosmoral=';
        query = (this.contribuyente.fechaInicioOperacion) ? query + '&fechainicioactiv=' + moment(this.contribuyente.fechaInicioOperacion).format('DD-MM-YYYY') : query + '&fechainicioactiv=';
        query = (this.contribuyente.fechaCambio) ? query + '&fechacambiosituacion=' + moment(this.contribuyente.fechaCambio).format('DD-MM-YYYY') : query + '&fechacambiosituacion=';
        query = (this.contribuyente.rfc) ? query + '&rfc=' + this.contribuyente.rfc : query + '&rfc=';
        // query = (this.contribuyente.apepaterno) ? query + '&apellidopaterno=' + this.contribuyente.apepaterno : query + '&apellidopaterno=';
        query = (this.contribuyente.apematerno) ? query + '&apellidomaterno=' + this.contribuyente.apematerno : query + '&apellidomaterno=';
        query = (this.contribuyente.curp) ? query + '&curp=' + this.contribuyente.curp : query + '&curp=';
        query = (this.contribuyente.ine) ? query + '&claveife=' + this.contribuyente.ine : query + '&claveife=';
        query = (this.contribuyente.identificacion) ? query + '&iddocidentif=' + this.contribuyente.identificacion : query + '&iddocidentif=';
        query = (this.contribuyente.idedato) ? query + '&valdocidentif=' + this.contribuyente.idedato : query + '&valdocidentif=';
        query = (this.contribuyente.fecha_naci) ? query + '&fechanacimiento=' + moment(this.contribuyente.fecha_naci).format('DD-MM-YYYY') : query + '&fechanacimiento=';
        query = (this.contribuyente.fecha_def) ? query + '&fechadefuncion=' + moment(this.contribuyente.fecha_def).format('DD-MM-YYYY') : query + '&fechadefuncion=';
        query = (this.contribuyente.celular) ? query + '&celular=' + this.contribuyente.celular : query + '&celular=';
        query = (this.contribuyente.email) ? query + '&email=' + this.contribuyente.email : query + '&email=';
        query = (this.contribuyente.actPreponderante) ? query + '&activprincip=' + this.contribuyente.actPreponderante : query + '&activprincip=';
        // query = (this.contribuyente.nombre_moral) ? query + '&apellidopaterno=' + this.contribuyente.nombre_moral : query + '&apellidopaterno=';

        if(this.contribuyente.tipoPersona === 'F'){
            query = (this.contribuyente.apepaterno) ? query + '&apellidopaterno=' + this.contribuyente.apepaterno : query + '&apellidopaterno=';
        } else {
            query = (this.contribuyente.nombre_moral) ? query + '&apellidopaterno=' + this.contribuyente.nombre_moral : query + '&apellidopaterno=';
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

    confirmaCambio(): void {
        const dialogRef = this.dialog.open(DialogConfirmacionComponent, {
            width: '700px'
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.cambiarTipoPersona();
            }
        });
    }
    
    cambiarTipoPersona(){
        console.log("ACA ESTAMOS CAMBIANDO LA PERSONA");
        let query = 'idpersona=' + this.idContribuyente;
        this.loading = true;
        this.actualizado = false;

        query = (this.contribuyente.tipoPersona) ? query + '&codtipospersona=' + this.contribuyente.tipoPersona : query + '&codtipospersona=';

        if(this.contribuyente.tipoPersona === 'F'){
            query = (this.contribuyente.apepaterno) ? query + '&apellidopaterno=' + this.contribuyente.apepaterno : query + '&apellidopaterno=';
            query = (this.contribuyente.apematerno) ? query + '&apellidomaterno=' + this.contribuyente.apematerno : query + '&apellidomaterno=';
            query = (this.contribuyente.nombre) ? query + '&nombreF=' + this.contribuyente.nombre : query + '&nombreF=';
            query = (this.contribuyente.rfc) ? query + '&rfcF=' + this.contribuyente.rfc : query + '&rfcF=';
        } else {
            query = (this.contribuyente.nombre_moral) ? query + '&nombreM=' + this.contribuyente.nombre_moral : query + '&nombreM=';
            query = (this.contribuyente.rfc) ? query + '&rfcM=' + this.contribuyente.rfc : query + '&rfcM=';
        }

        query = (this.contribuyente.curp) ? query + '&curp=' + this.contribuyente.curp : query + '&curp=';
        query = (this.contribuyente.ine) ? query + '&claveife=' + this.contribuyente.ine : query + '&claveife=';
        query = (this.contribuyente.identificacion) ? query + '&iddocidentif=' + this.contribuyente.identificacion : query + '&iddocidentif=';
        query = (this.contribuyente.idedato) ? query + '&valdocidentif=' + this.contribuyente.idedato : query + '&valdocidentif=';
        query = (this.contribuyente.fecha_naci) ? query + '&fechanacimiento=' + moment(this.contribuyente.fecha_naci).format('DD-MM-YYYY') : query + '&fechanacimiento=';
        query = (this.contribuyente.fecha_def) ? query + '&fechadefuncion=' + moment(this.contribuyente.fecha_def).format('DD-MM-YYYY') : query + '&fechadefuncion=';
        query = (this.contribuyente.celular) ? query + '&celular=' + this.contribuyente.celular : query + '&celular=';
        query = (this.contribuyente.email) ? query + '&email=' + this.contribuyente.email : query + '&email=';

        query = (this.contribuyente.actPreponderante) ? query + '&activprincip=' + this.contribuyente.actPreponderante : query + '&activprincip=';
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

      async generatePDF() {
        let docDefinition = {
          content: [
            {
                image: await this.getBase64ImageFromURL(
                "assets/img/logo_dependencia_rcon.PNG"
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
                "assets/img/logo_dependencia_rcon.PNG"
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

      async generatePDFDomicilio() {
        let docDefinition = {
          content: [
            {
                image: await this.getBase64ImageFromURL(
                "assets/img/logo_dependencia_rcon.PNG"
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
    

    getDomicilioContribuyente(){
        this.loadingDomicilios = true;
        let metodo = 'getDireccionesContribuyente';
        this.http.post(this.endpointActualiza + metodo + '?idPersona='+ this.idContribuyente, '', this.httpOptions)
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

    getDireccionEspecifica(iddireccion){
        this.loadingDireccionEspecifica = true;
        let metodo = 'getDireccionById';
        this.http.post(this.endpointActualiza + metodo + '?idDireccion='+ iddireccion, '', this.httpOptions)
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

    paginado1(evt): void{
        this.pagina1 = evt.pageIndex + 1;
        this.dataSource1 = this.paginate(this.dataSource1, 15, this.pagina1);
    }

    paginado2(evt): void{
        this.pagina1 = evt.pageIndex + 1;
        this.dataSource1 = this.paginate(this.dataSource1, 15, this.pagina1);
    }

    paginate(array, page_size, page_number) {
      return array.slice((page_number - 1) * page_size, page_number * page_size);
    }


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
            
            }
            this.getDomicilioContribuyente();
        });
    }


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
            
            }
            this.getDomicilioContribuyente();
        });
    }


    editDomicilio(dataDomicilioEspecifico): void {
        const dialogRef = this.dialog.open(DialogDomicilioContribuyente, {
            width: '700px',
            data: {dataDomicilioEspecifico:dataDomicilioEspecifico, idContribuyente: this.idContribuyente},
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
            
            }
            this.getDomicilioContribuyente();
        });
    }


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
            this.getDomicilioContribuyente();
        });
    }


    viewHistoricoDomicilio(idDireccion): void {
        const dialogRef = this.dialog.open(DialogDomicilioHistoricoContribuyente, {
            width: '700px',
            data: {idDireccion},
        });
        dialogRef.afterClosed().subscribe(result => {
                // this.getNotarioDirecciones();
        });
    }

    viewHistoricoDatosPersonales(idPersona): void {
        const dialogRef = this.dialog.open(DialogPersonalesHistoricoContribuyente, {
            width: '700px',
            data: {idPersona},
        });
        dialogRef.afterClosed().subscribe(result => {
                // this.getNotarioDirecciones();
        });
    }

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
                }, 1000);
            }
        });
    }

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
                }, 1000);
            }
        });
    }

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

    getRepresentacion(){
        this.loadingRepresentante = true;
        let queryRep = 'rep=Representantes&idPersona=' + this.idContribuyente;
        this.http.post(this.endpointActualiza + 'getRepresentacionContribuyente?' + queryRep, '', this.httpOptions)
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

    paginado4(evt): void{
        this.pagina4 = evt.pageIndex + 1;
        this.dataSource4 = this.paginate(this.dataSource4, 15, this.pagina4);
    }

    getRepresentado(){
        this.loadingRepresentado = true;
        let queryRepdo = 'rep=Representado&idPersona=' + this.idContribuyente;
        console.log(this.endpointActualiza + 'getRepresentacionContribuyente?' + queryRepdo);
        this.http.post(this.endpointActualiza + 'getRepresentacionContribuyente?' + queryRepdo, '', this.httpOptions)
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

    paginado5(evt): void{
        this.pagina5 = evt.pageIndex + 1;
        this.dataSource5 = this.paginate(this.dataSource5, 15, this.pagina5);
    }

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
  dataMovimientoDomicilio: DataMovimientoDomicilio = {} as DataMovimientoDomicilio;
  loadingDireccionEspecifica = false;
  iddomicilio;
  iddireccion;
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
            this.getDireccionEspecifica();
            
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
    
            //   if(data){
            //       this.setDataDomicilio(data);
            //   }
            if(data){
                console.log(data.dataDomicilioEspecifico);
                console.log("recibimos data seteado1");
                //console.log(data.dataDomicilioEspecifico[0]);
                // this.domicilioFormGroup.controls['cp'].val('11111');
            }
            this.getDataTiposAsentamiento();
            this.getDataTiposVia();
            this.getDataTiposLocalidad();
        }
  
    getDireccionEspecifica(){
        this.loadingDireccionEspecifica = true;
        let metodo = 'getDireccionById';
        this.http.post(this.endpointCatalogos + metodo + '?idDireccion='+ this.iddireccion, '', this.httpOptions)
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
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }

    getNombreDel(event): void {
        this.dataDomicilio.delegacion = event.source.triggerValue;
        this.botonAsentamiento = false;
    }

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

        this.dataDomicilio.id_direccion = (this.domicilioFormGroup.value.id_direccion) ? this.domicilioFormGroup.value.id_direccion : null;
        
        if(this.domicilioFormGroup.value.idestado == 9){
            this.dataDomicilio.idmunicipio = this.domicilioFormGroup.value.idmunicipio;
            // alert(this.dataDomicilio.idmunicipio);
            //this.dataDomicilio.delegacion = this.domicilioFormGroup.value.delegacion;
        } else {
            this.dataDomicilio.idmunicipio2 = this.domicilioFormGroup.value.idmunicipio2;
            this.dataDomicilio.municipio = (this.domicilioFormGroup.value.municipio) ? this.domicilioFormGroup.value.municipio : null;
            this.dataDomicilio.ciudad = (this.domicilioFormGroup.value.ciudad) ? this.domicilioFormGroup.value.ciudad : null;
            this.dataDomicilio.idciudad = (this.domicilioFormGroup.value.idciudad) ? this.domicilioFormGroup.value.idciudad : null;
        }


            // alert(this.dataDomicilio.id_direccion);
            if(this.domicilioFormGroup.value.id_direccion == null){
                // alert('guardar');
                this.guardaDomicilio();
            } else{
                // alert('actualizar');
                this.actualizarDomicilio();
            }

        
    

        //console.log('AQUEI EL FORM VALID');
        // console.log(this.domicilioFormGroup);
        ///retu
    }
      

    guardaDomicilio(){
      
        let query = 'insertarDireccion?idPersona=' + this.data.idContribuyente;

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
        //insertarDireccion?idPersona=4485239&codtiposvia=1&idvia=686&via=DR LAVISTA&numeroexterior=144&entrecalle1&entrecalle2&andador&edificio&seccion&entrada&codtiposlocalidad=1&codtiposasentamiento=9&idcolonia=8&codasentamiento=&colonia=DOCTORES&codigopostal=06720&codciudad=&ciudad&iddelegacion=5&codmunicipio=15&delegacion=CUAUHTEMOC&telefono&codestado=9&codtiposdireccion=N&indicacionesadicionales&numerointerior=
        
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

                    this.snackBar.open('Registro exitoso', 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                },
                (error) => {
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }


    actualizarDomicilio(){
        
        let query = 'actualizarDireccion?idPersona=' + this.data.idContribuyente + '&idDireccion=' + this.iddireccion;

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
    
        console.log('Actualizacion de Direcciones...');
        console.log(query);
    
        //localhost:8000/api/v1/registro/actualizarDireccion?idPersona=4353312&idDireccion=3597172&codtiposvia=1&idvia=2568&via=ABRAHAM SANCHEZ&numeroexterior=21&entrecalle1&entrecalle2&andador&edificio&seccion&entrada&codtiposlocalidad=1&numerointerior=&codtiposasentamiento=9&idcolonia=8&codasentamiento=&colonia=DOCTORES&codigopostal=06720&codciudad&ciudad&iddelegacion=5&codmunicipio=15&delegacion=CUAUHTEMOC&telefono&codestado=9&codtiposdireccion=&indicacionesadicionales

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

                    this.dialogRef.close(this.dataMovimientoDomicilio);

                    this.snackBar.open('Actualización Correcta', 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                },
                (error) => {
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }

  setDataDomicilio(data): void {
    console.log("ACA EL COD DATA ESPE");
    console.log(data);
    // console.log("ACA EL COD ESTADO SETEADO"+data.dataDomicilioEspecifico.CODESTADO);
    //this.domicilioFormGroup.controls['idtipodireccion'].setValue(dataDomicilio.idtipodireccion);
   
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

  cleanAsentamiento(){
      this.pagina = 1;
      this.total = 0;
      this.dataSource = [];
      this.loadingBuscaMun = false;
      this.dataPaginate;
      this.obtenerMunicipios();
  }

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

  paginado(evt): void{
      this.pagina = evt.pageIndex + 1;
      this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
  }
  
  paginate(array, page_size, page_number) {
      return array.slice((page_number - 1) * page_size, page_number * page_size);
  }

  selectMunicipios(element){
      console.log(element);
      this.dataMunicipios.codestado = element.CODESTADO;
      this.dataMunicipios.codmunicipio = element.CODMUNICIPIO;
      this.dataMunicipios.municipio = element.MUNICIPIO;
  }

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

  cleanAsentamiento(){
      this.pagina = 1;
      this.total = 0;
      this.dataSource = [];
      this.loadingBuscaCiudad = false;
      this.dataPaginate;
      this.obtenerCiudad();
  }

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

  paginado(evt): void{
      this.pagina = evt.pageIndex + 1;
      this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
  }
  
  paginate(array, page_size, page_number) {
      return array.slice((page_number - 1) * page_size, page_number * page_size);
  }

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
  //     this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
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

  cleanAsentamiento(){
      this.pagina = 1;
      this.total = 0;
      this.dataSource = [];
      this.loading = false;
      this.dataPaginate;
      this.obtenerAsentamiento();
  }

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

  paginado(evt): void{
      this.pagina = evt.pageIndex + 1;
      this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
  }
  
  paginate(array, page_size, page_number) {
      return array.slice((page_number - 1) * page_size, page_number * page_size);
  }

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

  // obtenerAsentamientoPorNombre(){
  //     this.loading = true;
  //     let criterio = 'getAsentamientoByNombre';
  //     let query = '';
      
  //     query = 'nombre=' + this.buscaAsentamiento + '&codEstado=' + this.data.codEstado + '&codMunicipio=' + this.data.codMunicipio;

  //     query = (this.data.codCiudad) ? query + '&codCiudad=' + this.data.codCiudad : query + '&codCiudad=';

  //     console.log('ASENTAMIENTOSSSS'+this.endpoint + '?' + query);
  //     this.loading = true;
  //     this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
  //         .subscribe(
  //             (res: any) => {
  //                 this.loading = false;
  //                 this.dataSource = res;
  //                 this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
  //                 this.total = this.dataSource.length; 
  //                 this.paginator.pageIndex = 0;
  //                 console.log(this.dataSource);
  //             },
  //             (error) => {
  //                 this.loading = false;
  //             }
  //         );
  // }
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

  cleanAsentamiento(){
      this.pagina = 1;
      this.total = 0;
      this.dataSource = [];
      this.loadingBuscaVia = false;
      this.dataPaginate;
      this.obtenerVia();
  }

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

  paginado(evt): void{
      this.pagina = evt.pageIndex + 1;
      this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
  }
  
  paginate(array, page_size, page_number) {
      return array.slice((page_number - 1) * page_size, page_number * page_size);
  }

  selectVia(element){
      console.log(element);
      this.dataVia.codtiposvia = element.codtiposvia;
      this.dataVia.idvia = element.idvia;
      this.dataVia.via = element.via;
  }

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
    }

    changeRequired(remove, add): void {
        this.fisicaFormGroup.controls[remove].setValue(null);
        this.fisicaFormGroup.controls[remove].clearValidators();
        this.fisicaFormGroup.controls[add].setValidators(Validators.required);
        this.fisicaFormGroup.markAsUntouched();
        this.fisicaFormGroup.updateValueAndValidity();
    }
  
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
                } else {
                    this.moralFormGroup.controls['nombre'].setValue(result.apaterno);
                    this.moralFormGroup.controls['rfc'].setValue(result.rfc);
                }
            }
        });
    }
  
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
  
    removeDocumento(){
          this.dataRepresentacion.documentoRepresentacion = undefined;
      }
  
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
        }
        return this.dataRepresentacion;
    }

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
            this.idRepresentacion = data.dataRepresentante.IDREPRESENTACION;
            this.insertOrUpdate = 2;
            this.insUp = true;
        }
    }
      
    changeRequired(remove, add): void {
        this.fisicaFormGroup.controls[remove].setValue(null);
        this.fisicaFormGroup.controls[remove].clearValidators();
        this.fisicaFormGroup.controls[add].setValidators(Validators.required);
        this.fisicaFormGroup.markAsUntouched();
        this.fisicaFormGroup.updateValueAndValidity();
    }
  
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
                } else {
                    this.moralFormGroup.controls['nombre'].setValue(result.apaterno);
                    this.moralFormGroup.controls['rfc'].setValue(result.rfc);
                }
            }
        });
    }
  
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
  
    removeDocumento(){
          this.dataRepresentacion.documentoRepresentacion = undefined;
    }
  
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
                    noEscritura: this.dataRepresentacion.documentoRepresentacion.noNotario,
                    documentos: this.dataRepresentacion.documentoRepresentacion.archivos
                }
            };

            console.log(JSON.stringify(payload));
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
            this.insertOrUpdate = data.insertOrUpdate;
            this.idDocumento = data.idDocumento;
            this.insUp = true;
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
  
    getTipoDocJuridico(event): void {
        this.dataDocumento.nombreTipoDocumentoJuridico = event.source.triggerValue;
    }
  
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
  
    createItem(data): FormGroup {
        return this._formBuilder.group(data);
    }
  
    removeItem(i) {
        this.archivos.removeAt(i);
      }
  
    get archivos(): FormArray {
        return this.archivosDocumentoFormGroup.get('archivos') as FormArray;
    };
  
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
    
        if(this.insertOrUpdate == 2){
            this.updateDocto();
        }else{
            this.canSend = true;
        }
    }
  
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
    }

    descargarDoc(element){

        console.log("ACA EL DESCARGAR FICHERO");
        console.log(element);

        this.http.post( this.endpoint + 'getFichero?idFichero=' + element.idficherodocumento, '', this.httpOptions ). subscribe (
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

    convertirDoc(){
        let dataFichero = this.descargaFichero[0].binariodatos;
        dataFichero = dataFichero.split("data:application/pdf;base64,");
        console.log("split");
        console.log(dataFichero);
        //return;
        const blob = this.b64toBlob(dataFichero[1], 'application/pdf');
        FileSaver.saveAs(blob, this.descargaFichero[0].nombre);
    }

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
    styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogPersonaC {
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
        console.log("aca el tipo person " + data);
        console.log(this.tipoPersona);
      }
  
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
  
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataSource = this.paginate(this.dataPersonas, this.pageSize, this.pagina);
    }
  
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }
  
    clean(): void {
        this.pagina = 1;
        this.total = 0;
        this.dataPersonas = [];
        this.filtros = {} as Filtros;
        this.persona = {} as Persona;
        this.optionPersona = undefined;
        this.isBusqueda = false;
    }
  
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

    getHistoricoModificaciones(){
        let query = '';
      
        query = (this.dataHistoricoModificaciones.fecha_desde) ? query + '&fechaDesde=' + moment(this.dataHistoricoModificaciones.fecha_desde).format('DD-MM-YYYY') : query + '&fechaDesde=';
        query = (this.dataHistoricoModificaciones.fecha_hasta) ? query + '&fechaHasta=' + moment(this.dataHistoricoModificaciones.fecha_hasta).format('DD-MM-YYYY') : query + '&fechaHasta=';
        query = query + '&idDireccion=' + this.idDireccion;

        query = query.substr(1);

        this.loading = true;
        let metodo = 'getHistoricosDireccion';
        this.http.post(this.endpoint + metodo + '?' + query, '', this.httpOptions)
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

    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

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

    getDireccionEspecifica(){
        console.log('entro');
        this.loadingDireccionEspecifica = true;
        let metodo = 'getHistoricosDireccionDetalle';
        this.http.post(this.endpointCatalogos + metodo + '?idChs=' + this.idChs + '&idDireccion=' + this.idDireccion, '', this.httpOptions)
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

    getNombreDel(event): void {
        this.dataDomicilio.delegacion = event.source.triggerValue;
        this.botonAsentamiento = false;
        
    }

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

    getDataMunicipios(event): void {
        this.botonMunicipio = false;
        let busquedaMunCol = '';
        // busquedaMunCol = 'getDelegaciones';
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

    getHistoricoModificaciones(){
        let query = '';
      
        query = (this.dataHistoricoModificaciones.fecha_desde) ? query + '&fechaDesde=' + moment(this.dataHistoricoModificaciones.fecha_desde).format('DD-MM-YYYY') : query + '&fechaDesde=';
        query = (this.dataHistoricoModificaciones.fecha_hasta) ? query + '&fechaHasta=' + moment(this.dataHistoricoModificaciones.fecha_hasta).format('DD-MM-YYYY') : query + '&fechaHasta=';
        query = query + '&idPersona=' + this.idPersona;

        query = query.substr(1);

        this.loading = true;
        let metodo = 'getHistoricosPersona';
        this.http.post(this.endpoint + metodo + '?' + query, '', this.httpOptions)
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

    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

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

    getContribuyenteDatos(){
        this.query = '&idPersona=' + this.idPersona + '&idChs=' + this.idChs; 
        this.loading = true;
        console.log(this.endpoint);
        this.http.post(this.endpoint + 'getHistoricosPersonaDetalle?' + this.query, '', this.httpOptions)
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

    getHistorialRepresentacion(){
        let query = '';
      

        query = 'idPersona=' + this.idPersona;
        query = (this.dataHistoricoRep.fecha_desde) ? query + '&fechaDesde=' + moment(this.dataHistoricoRep.fecha_desde).format('DD-MM-YYYY') : query + '&fechaDesde=';
        query = (this.dataHistoricoRep.fecha_hasta) ? query + '&fechaHasta=' + moment(this.dataHistoricoRep.fecha_hasta).format('DD-MM-YYYY') : query + '&fechaHasta=';


        this.loadingH = true;
        let metodo = 'getHistoricosRepresentacion';
        this.http.post(this.endpoint + metodo + '?' + query, '', this.httpOptions)
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

    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

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

    getHistorialRepresentacionDetalle(){
        let query = '';

        query = 'idChs=' + this.idChs;

        this.loadingH = true;
        let metodo = 'getHistoricosRepresentacionDetalle';
        this.http.post(this.endpoint + metodo + '?' + query, '', this.httpOptions)
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