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

export interface DatosSociedad {
    razonSocial: string;
    rfc: string;
    acta: string;
    tipoMoral: string;
    fechaInicio: Date;
    motivoCambio: string;
    fechaCambio: Date;
    registro: string;
    fecha_alta: Date;
    fecha_baja: Date;
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

@Component({
    selector: 'app-editar-sociedad',
    templateUrl: './editar-sociedad.component.html',
    styleUrls: ['./editar-sociedad.component.css']
})
export class EditarSociedadComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/getSociedadValuacion';
    endpointTable = environment.endpoint + 'registro/getPeritoBySociedad';
    endpointActualiza = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['nombre','registro', 'rfc'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    loading = false;
    dataSocedadResultado;
    dataSource;
    dataPaginate;
    httpOptions;
    search = false;
    query;
    idSociedad;
    panelDomicilio = false;
    panelEspecifico = false;
    panelSociedades = false;
    panelRepresentantes = false;
    panelRepresentados = false;
    botonEdit = false;
    datosSociedad: DatosSociedad = {} as DatosSociedad;
    dataDomicilios: DataDomicilio[] = [];
    displayedColumnsDom: string[] = ['tipoDir','direccion', 'historial'];
    loadingDomicilios = false;
    paginaDom = 1;
    totalDom = 0;
    pageSizeDom = 15;
    dataDomicilioResultado;
    dataSourceDom = [];
    dataPaginateDom;
    dataRepresentantes: DataRepresentacion[] = [];
    dataRepresentados: DataRepresentacion[] = [];
    @ViewChild('paginator') paginator: MatPaginator;

    /*Paginado*/
   dataSource1 = [];
   total1 = 0;
   pagina1= 1;
   dataPaginate1;
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
        this.idSociedad = this.route.snapshot.paramMap.get('idsociedad');
        console.log(this.idSociedad);
        this.getSociedadDatos();
        this.getDomicilioSociedad();
    }

    getSociedadDatos(){
        this.query = 'idSociedad=' + this.idSociedad; 
        this.loading = true;
        console.log(this.endpoint);
        this.http.post(this.endpoint + '?' + this.query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    //this.loading = false;
                    this.dataSocedadResultado = res[0];
                    console.log("AQUI ENTRO EL RES");
                    console.log(this.dataSocedadResultado);
                    this.getPeritosSociedad();
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

    getPeritosSociedad(){
        this.http.post(this.endpointTable + '?' + 'idSociedad=' + this.idSociedad + '&idPerito', '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataPaginate.length; 
                    this.paginator.pageIndex = 0;
                    console.log("OTRO RES");
                    console.log(this.total);
                    this.datosDeLaSociedad();
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

    guardaSociedad(){
        let query = 'codtipospersona=M&nombre=';
        this.loading = true;
        
        //codtipospersona=M&nombre=&activprincip=diez&idtipomoral&idmotivosmoral&fechainicioactiv=22-01-2000&fechacambiosituacion=22-02-2002&rfc=RUFV891129R1&apellidopaterno=Veracruzana II&apellidomaterno=&curp=&claveife=&iddocidentif=&valdocidentif=&fechanacimiento=&fechadefuncion=&celular=&email=&idExpediente&idpersona=4485346
        query = (this.datosSociedad.acta) ? query + '&activprincip=' + this.datosSociedad.acta : query + '&activprincip=';

        query = (this.datosSociedad.tipoMoral) ? query + '&idtipomoral=' + this.datosSociedad.tipoMoral : query + '&idtipomoral=';

        query = (this.datosSociedad.motivoCambio) ? query + '&idmotivosmoral=' + this.datosSociedad.motivoCambio : query + '&idmotivosmoral=';

        query = (this.datosSociedad.fechaInicio) ? query + '&fechainicioactiv=' + moment(this.datosSociedad.fechaInicio).format('DD-MM-YYYY') : query + '&fechainicioactiv=';
        
        query = (this.datosSociedad.fechaCambio) ? query + '&fechacambiosituacion=' + moment(this.datosSociedad.fechaCambio).format('DD-MM-YYYY') : query + '&fechacambiosituacion=';
        
        query = (this.datosSociedad.rfc) ? query + '&rfc=' + this.datosSociedad.rfc : query + '&rfc=';

        query = (this.datosSociedad.razonSocial) ? query + '&apellidopaterno=' + this.datosSociedad.razonSocial : query + '&apellidopaterno=';

        query = query + '&apellidomaterno=&curp=&claveife=&iddocidentif=&valdocidentif=&fechanacimiento=&fechadefuncion=&celular=&email=&idExpediente';

        query = query + '&idpersona=' + this.idSociedad;
        //this.datoPeritos.independiente
        console.log(this.endpointActualiza + 'actualizaContribuyente' + '?' + query);
        //return;
        this.http.post(this.endpointActualiza + 'actualizaContribuyente' + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    console.log("AQUI ACTUALIZO");
                    console.log(res);
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

    datosDeLaSociedad(){
        this.datosSociedad.razonSocial  = this.dataSocedadResultado.RAZONSOCIAL;
        this.datosSociedad.rfc = this.dataSocedadResultado.RFC;
        this.datosSociedad.registro = this.dataSocedadResultado.REGISTRO;
        this.datosSociedad.fecha_alta = (this.dataSocedadResultado.FECHAALTA) ? new Date(this.dataSocedadResultado.FECHAALTA) : null;
        this.datosSociedad.fecha_baja = (this.dataSocedadResultado.FECHABAJA) ? new Date(this.dataSocedadResultado.FECHABAJA) : null;
        this.datosSociedad.acta = this.dataSocedadResultado.ACTIVPRINCIP;
        this.datosSociedad.fechaInicio = (this.dataSocedadResultado.FECHAINICIOACTIV) ? new Date(this.dataSocedadResultado.FECHAINICIOACTIV) : null;
        this.datosSociedad.fechaCambio = (this.dataSocedadResultado.FECHACAMBIOSITUACION) ? new Date(this.dataSocedadResultado.FECHACAMBIOSITUACION) : null;
        this.datosSociedad.tipoMoral = this.dataSocedadResultado.IDTIPOMORAL;
        this.datosSociedad.motivoCambio = this.dataSocedadResultado.IDMOTIVOSMORAL;

    }
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataSource = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    actualizaSociedad(){
        let query = '';

        query = 'idPersona=' + this.idSociedad;

        query = ( this.datosSociedad.registro ) ? query + '&registro=' + this.datosSociedad.registro : query + '&registro=';
        
        query = (this.datosSociedad.fecha_alta) ? query + '&fechaAlta=' + moment(this.datosSociedad.fecha_alta).format('DD-MM-YYYY')
                                                : query + '&fechaAlta=';

        query = (this.datosSociedad.fecha_baja) ? query + '&fechaBaja=' + moment(this.datosSociedad.fecha_baja).format('DD-MM-YYYY')
                                                : query + '&fechaBaja=';

        console.log(this.endpointActualiza + 'actualizarSociedad' + '?' + query);
        this.http.post(this.endpointActualiza + 'actualizarSociedad' + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    console.log(res);
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


    getDomicilioSociedad(){
        this.loadingDomicilios = true;
        let metodo = 'getDireccionesContribuyente';
        this.http.post(this.endpointActualiza + metodo + '?idPersona='+ this.idSociedad, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDomicilios = false;

                    this.dataSource1 = res.filter(element => element.CODTIPOSDIRECCION !== "N");
                    // this.dataSource2 = res.filter(element => element.CODTIPOSDIRECCION === "N");
                    this.total1 = this.dataSource1.length;
                    // this.total2 = this.dataSource2.length;
                    this.dataPaginate1 = this.paginate(this.dataSource1, 15, this.pagina1);
                    // this.dataPaginate2 = this.paginate(this.dataSource2, 15, this.pagina2);
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

    paginado1(evt): void{
        this.pagina1 = evt.pageIndex + 1;
        this.dataSource1 = this.paginate(this.dataSource1, 15, this.pagina1);
    }

    addDomicilio(i = -1, dataDomicilio = null): void {
      let codtiposdireccion = '';
      const dialogRef = this.dialog.open(DialogDomicilioSociedad, {
          width: '700px',
          data: {dataDomicilio:dataDomicilio, idSociedad: this.idSociedad,
                  codtiposdireccion: codtiposdireccion
          },
      });
      dialogRef.afterClosed().subscribe(result => {
              this.getDomicilioSociedad();
      });
    }

    buscarSociedadPersona(){
        const dialogRef = this.dialog.open(DialogBuscaSociedad, {
            width: '700px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log("RESULTADO DEL NUEVO NOMBRE SOCIEDAD");
                console.log(result);
                console.log(result.apepaterno);
                this.datosSociedad.razonSocial = result.razonSocial;
                this.datosSociedad.rfc = result.rfc;
                this.datosSociedad.acta = result.acta;
                this.datosSociedad.tipoMoral = result.tipoMoral;
                this.datosSociedad.fechaInicio = result.fechaInicio;
                this.datosSociedad.motivoCambio = result.motivoCambio;
                this.datosSociedad.fechaCambio = result.fechaCambio;
                this.datosSociedad.registro = result.registro;
                this.datosSociedad.fecha_alta = result.fecha_alta;
                this.datosSociedad.fecha_baja = result.fecha_baja;
                this.botonEdit = false;
                document.getElementById("apepaterno").focus();
            }
        });
    }

    cleanSociedad(){
        this.datosSociedad.razonSocial = null;
        this.datosSociedad.rfc = null;
        this.datosSociedad.acta = null;
        this.datosSociedad.tipoMoral = null;
        this.datosSociedad.fechaInicio = null;
        this.datosSociedad.motivoCambio = null;
        this.datosSociedad.fechaCambio = null;
        this.datosSociedad.registro = null;
        this.datosSociedad.fecha_alta = null;
        this.datosSociedad.fecha_baja = null;
        this.botonEdit = true;
    }

    buscarPeritoPersona(){
        const dialogRef = this.dialog.open(DialogSociedadPerito, {
            width: '700px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log("RESULTADO DEL NUEVO NOMBRE");
                console.log(result);
                console.log(result.apepaterno);
                // this.datoPeritos.apepaterno = result.apepaterno;
                // this.datoPeritos.apematerno = result.apematerno;
                // this.datoPeritos.nombre  = result.nombre;
                // this.datoPeritos.rfc = result.rfc;
                // this.datoPeritos.curp = result.curp;
                // this.datoPeritos.ine = result.ine;
                // this.datoPeritos.identificacion = result.identificacion;
                // this.datoPeritos.idedato = result.idedato;
                // this.datoPeritos.fecha_naci = result.fecha_naci;
                // this.datoPeritos.fecha_def = result.fecha_def;
                // this.datoPeritos.celular = result.celular;
                // this.datoPeritos.email = result.email;
                this.botonEdit = false;
            }
        });
    }

    addRepresentante(i = -1, dataRepresentante = null): void {
        const dialogRef = this.dialog.open(DialogRepresentacionSociedad, {
            width: '700px',
            data: {dataRepresentante : dataRepresentante,
                    datosSociedad : this.datosSociedad,
                    idSociedad : this.idSociedad
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
        const dialogRef = this.dialog.open(DialogRepresentadoSociedad, {
            width: '700px',
            data: {dataRepresentante : dataRepresentante,
                    datosSociedad: this.datosSociedad,
                    idSociedad : this.idSociedad
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
}

///////////////BUSCAR PERSONA MORAL////////////////
export interface DatosSociedadPersona {
    razonSocial: string;
    rfc: string;
    acta: string;
    tipoMoral: string;
    fechaInicio: string;
    motivoCambio: string;
    fechaCambio: string;
    registro: string;
    fecha_alta: Date;
    fecha_baja: Date;
    idSociedad: number;
}
@Component({
    selector: 'app-dialog-buscaSociedad',
    templateUrl: 'app-dialog-buscaSociedad.html',
    styleUrls: ['./editar-sociedad.component.css']
})
export class DialogBuscaSociedad {
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
    search;
    isIdentificativo;
    idSociedad;
    optionSociedadPersona;
    datosSociedadPersona: DatosSociedadPersona = {} as DatosSociedadPersona;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogBuscaSociedad>,
        @Inject(MAT_DIALOG_DATA) public data: any){
            dialogRef.disableClose = true;
            this.httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: this.auth.getSession().token
                })
            };
    }

    cleanBusca(): void{
        this.loading = false;
        this.pagina = 1;
        this.total = 0;
        this.pageSize = 15;
        this.dataSource = [];
        this.dataPaginate;
    }

    validateSearch(){
        this.search = (
            this.razonSocial ||
            this.rfc ||
            this.registro
        ) ? true : false;
    }

    clearInputsIdentNoIdent(isIdentificativo): void {
        this.isIdentificativo = isIdentificativo;
        if(this.isIdentificativo){
            this.razonSocial = null;
        }else{
            this.rfc = null;
            this.registro = null;
        }
    }

    getSociedad(){
        let query = '';
        let busquedaDatos = '';
        if( this.razonSocial ){
            busquedaDatos = busquedaDatos + 'getSocValuacionByDatosPersonales';
        }else{
            busquedaDatos = busquedaDatos + 'getSocValuacionByDatosIdentificativos';
        }

        if( this.razonSocial ){
            query = query + '&razonSocial=' + this.razonSocial + '&filtroRazon=1';
        }
        if(this.rfc){
            query = query + '&rfc=' + this.rfc;
        }
        if(this.registro){
            query = query + '&registro=' + this.registro;
        }

        query = query.substr(1);

        this.loading = true;
        console.log(this.endpoint);
        this.http.post(this.endpoint + busquedaDatos + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    console.log(res);
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

    sociedadPersonaSelected(element){
        console.log(element);
        this.datosSociedadPersona.idSociedad = element.IDSOCIEDAD;
        this.datosSociedadPersona.razonSocial = element.RAZONSOCIAL;
        this.datosSociedadPersona.rfc = element.RFC;
        this.datosSociedadPersona.acta = element.ACTIVPRINCIP;
        this.datosSociedadPersona.tipoMoral = element.TIPOMORAL;
        this.datosSociedadPersona.fechaInicio = element.FECHAINICIOACTIV;
        this.datosSociedadPersona.motivoCambio = element.IDMOTIVOSMORAL;
        this.datosSociedadPersona.fechaCambio = element.FECHACAMBIOSITUACION;
        this.datosSociedadPersona.registro = element.REGISTRO;
        this.datosSociedadPersona.fecha_alta = element.FECHAALTA;
        this.datosSociedadPersona.fecha_baja = element.FECHABAJA;
    }
}

///////////////DOMICILIO////////////////
@Component({
    selector: 'app-dialog-domicilio-sociedad',
    templateUrl: 'app-dialog-domicilio-sociedad.html',
    styleUrls: ['./editar-sociedad.component.css']
})
export class DialogDomicilioSociedad {
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
    constructor(
        private auth: AuthService,
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogDomicilioSociedad>,
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
        
    guardaDomicilio(){
        
        let query = 'insertarDireccion?idPersona=' + this.data.idSociedad;
  
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
                    if(res.length > 0){
                      this.snackBar.open('Registro exitoso', 'Cerrar', {
                            duration: 10000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                    }else{
                        this.snackBar.open('Ocurrio un error al Insertar la dirección, intente nuevemente', 'Cerrar', {
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
  
    getMunicipios(){
        this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
        const dialogRef = this.dialog.open(DialogMunicipiosSociedad, {
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
        const dialogRef = this.dialog.open(DialogCiudadSociedad, {
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
        const dialogRef = this.dialog.open(DialogAsentamientoSociedad, {
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
        const dialogRef = this.dialog.open(DialogViaSociedad, {
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
    selector: 'app-dialog-municipios-sociedad',
    templateUrl: 'app-dialog-municipios-sociedad.html',
    styleUrls: ['./editar-sociedad.component.css']
})
 export class DialogMunicipiosSociedad {
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
        public dialogRef: MatDialogRef<DialogMunicipiosSociedad>,
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
    selector: 'app-dialog-ciudad-sociedad',
    templateUrl: 'app-dialog-ciudad-sociedad.html',
    styleUrls: ['./editar-sociedad.component.css']
})
export class DialogCiudadSociedad {
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
        public dialogRef: MatDialogRef<DialogCiudadSociedad>,
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
  
   
}
  
///////////////ASENTAMIENTO//////////////////
export interface DataAsentamiento{
    codasentamiento: string;
    asentamiento: string;
    codigopostal: string;
    codtiposasentamiento: string;
}
@Component({
    selector: 'app-dialog-asentamiento-sociedad',
    templateUrl: 'app-dialog-asentamiento-sociedad.html',
    styleUrls: ['./editar-sociedad.component.css']
})
export class DialogAsentamientoSociedad {
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
        public dialogRef: MatDialogRef<DialogAsentamientoSociedad>,
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
  
}
  
///////////////VIA//////////////////
export interface dataVia{
    codtiposvia: number;
    idvia: number;
    via : string;
}
@Component({
    selector: 'app-dialog-via-sociedad',
    templateUrl: 'app-dialog-via-sociedad.html',
    styleUrls: ['./editar-sociedad.component.css']
})
export class DialogViaSociedad {
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
        public dialogRef: MatDialogRef<DialogViaSociedad>,
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
    styleUrls: ['./editar-sociedad.component.css']
})
export class DialogRepresentacionSociedad {
    endpoint = environment.endpoint + 'registro/';
    loading = false;
    httpOptions;
    tipoPersona = 'F';
    idPersonaRepresentacion;
    fisicaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    dataRepresentacion: DataRepresentacion = {} as DataRepresentacion;
  
    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogRepresentacionSociedad>,
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
      }
      
    changeRequired(remove, add): void {
        this.fisicaFormGroup.controls[remove].setValue(null);
        this.fisicaFormGroup.controls[remove].clearValidators();
        this.fisicaFormGroup.controls[add].setValidators(Validators.required);
        this.fisicaFormGroup.markAsUntouched();
        this.fisicaFormGroup.updateValueAndValidity();
    }
  
    addPersona(): void {
        const dialogRef = this.dialog.open(DialogPersonaSociedad, {
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
        const dialogRef = this.dialog.open(DialogDocumentoSociedad, {
            width: '700px',
            data: dataDocumento,
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
                    codtiposPersona: "M",
                    idpersona: this.data.idSociedad,
                    nombre: null,
                    rfc: this.data.datosSociedad.rfc,
                    apellidoPaterno: this.data.datosSociedad.razonSocial,
                    apellidoMaterno: null,
                    curp: null,
                    ife: null,
                    iddocIdentif: null,
                    valdocIdentif: null,
                    fechaNacimiento: moment(this.data.datosSociedad.fecha_alta).format("DD-MM-YYYY"),
                    fechaDefuncion: moment(this.data.datosSociedad.fecha_baja).format("DD-MM-YYYY"),
                    celular: this.data.datosSociedad.celular,
                    email: this.data.datosSociedad.email,
                    activprincip: this.data.datosSociedad.acta,
                    idtipomoral: this.data.datosSociedad.tipoMoral,
                    idmotivosmoral: this.data.datosSociedad.motivoCambio,
                    fechainicioactiv: moment(this.data.datosSociedad.fechaInicio).format("DD-MM-YYYY"),
                    fechacambiosituacion: moment(this.data.datosSociedad.fechaCambio).format("DD-MM-YYYY")
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
        this.http.put(this.endpoint + 'insertarRepresentacion', payload, this.httpOptions).subscribe(
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
    styleUrls: ['./editar-sociedad.component.css']
})
export class DialogRepresentadoSociedad {
    endpoint = environment.endpoint;
    loading = false;
    httpOptions;
    tipoPersona = 'F';
    fisicaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    idPersonaRepresentacion;
    dataRepresentacion: DataRepresentacion = {} as DataRepresentacion;
  
    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogRepresentadoSociedad>,
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
  
        if(data.dataRepresentante){
            this.setDataRepresentacion(data.dataRepresentante);
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
        const dialogRef = this.dialog.open(DialogPersonaSociedad, {
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
        const dialogRef = this.dialog.open(DialogDocumentoSociedad, {
            width: '700px',
            data: dataDocumento,
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
                    codtiposPersona: "M",
                    idpersona: this.data.idSociedad,
                    nombre: null,
                    rfc: this.data.datosSociedad.rfc,
                    apellidoPaterno: this.data.datosSociedad.razonSocial,
                    apellidoMaterno: null,
                    curp: null,
                    ife: null,
                    iddocIdentif: null,
                    valdocIdentif: null,
                    fechaNacimiento: moment(this.data.datosSociedad.fecha_alta).format("DD-MM-YYYY"),
                    fechaDefuncion: moment(this.data.datosSociedad.fecha_baja).format("DD-MM-YYYY"),
                    celular: this.data.datosSociedad.celular,
                    email: this.data.datosSociedad.email,
                    activprincip: this.data.datosSociedad.acta,
                    idtipomoral: this.data.datosSociedad.tipoMoral,
                    idmotivosmoral: this.data.datosSociedad.motivoCambio,
                    fechainicioactiv: moment(this.data.datosSociedad.fechaInicio).format("DD-MM-YYYY"),
                    fechacambiosituacion: moment(this.data.datosSociedad.fechaCambio).format("DD-MM-YYYY")
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
        this.http.put(this.endpoint + 'insertarRepresentacion', payload, this.httpOptions).subscribe(
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
  
///////////////DOCUMENTO////////////////
@Component({
    selector: 'app-dialog-documento',
    templateUrl: 'app-dialog-documento.html',
    styleUrls: ['./editar-sociedad.component.css']
})
export class DialogDocumentoSociedad {
    endpointCatalogos = environment.endpoint;
    loadingTiposDocumentoDigital = false;
    loadingTiposDocumentoJuridico = false;
    httpOptions;
    tiposDocumentoDigital;
    tiposDocumentoJuridico;
    selectTipoDoc = '1';
    tiposDocumentoFormGroup: FormGroup;
    infoDocumentoFormGroup: FormGroup;
    archivosDocumentoFormGroup: FormGroup;
    dataDocumento: DataDocumentoRepresentacion = {} as DataDocumentoRepresentacion;
    canSend = false;
    
    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogDocumentoSociedad>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {

        dialogRef.disableClose = true;
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
        if(data){
            this.setDataDocumento(data);
        }
      }
  
    getDataTiposDocumentoDigital(): void {
        this.loadingTiposDocumentoDigital = true;
        this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
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
        this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
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
        const dialogRef = this.dialog.open(DialogNotarioSociedad, {
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
    
        this.canSend = true;
    }
  
    setDataDocumento(dataDocumento): void {
        this.tiposDocumentoFormGroup.controls['codtipodocumento'].setValue(dataDocumento.codtipodocumento);
        this.tiposDocumentoFormGroup.controls['codtipodocumentojuridico'].setValue(dataDocumento.codtipodocumentojuridico);
        if(dataDocumento.codtipodocumentojuridico == 'PN'){
            this.dataDocumento.idnotario = dataDocumento.idnotario;
            this.infoDocumentoFormGroup.controls['noNotario'].setValue(dataDocumento.noNotario);
            this.infoDocumentoFormGroup.controls['ciudadNotario'].setValue(dataDocumento.ciudadNotario);
            this.infoDocumentoFormGroup.controls['nombreNotario'].setValue(dataDocumento.nombreNotario);
            this.infoDocumentoFormGroup.controls['num_escritura'].setValue(dataDocumento.num_escritura);
        }
        this.dataDocumento.nombreTipoDocumentoJuridico = dataDocumento.nombreTipoDocumentoJuridico;
        this.infoDocumentoFormGroup.controls['fecha'].setValue(dataDocumento.fecha);
        this.infoDocumentoFormGroup.controls['descripcion'].setValue(dataDocumento.descripcion);
        this.infoDocumentoFormGroup.controls['lugar'].setValue(dataDocumento.lugar);
    
        if(dataDocumento.archivos){
            for(let archivo of dataDocumento.archivos){
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
    styleUrls: ['./editar-sociedad.component.css']
})
export class DialogNotarioSociedad {
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
        public dialogRef: MatDialogRef<DialogNotarioSociedad>,
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
    styleUrls: ['./editar-sociedad.component.css']
})
export class DialogPersonaSociedad {
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
      public dialogRef: MatDialogRef<DialogPersonaSociedad>,
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

///////////////BUSCAR PERSONA SOCIEDAD////////////////
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
}
@Component({
    selector: 'app-dialog-buscaPerito',
    templateUrl: 'app-dialog-buscaPerito.html',
    styleUrls: ['./editar-sociedad.component.css']
})
export class DialogSociedadPerito {
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

    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogSociedadPerito>,
        @Inject(MAT_DIALOG_DATA) public data: any){
            dialogRef.disableClose = true;
            this.httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: this.auth.getSession().token
                })
            };
        }

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

    cleanBusca(): void{
        this.pagina = 1;
        this.total = 0;
        this.dataSource = [];
        this.loading = false;
        this.dataPaginate;
    }

    getPerito2(){
        let query = '';
        let busquedaDatos = '';

        if(this.nombre){
            query = query + '&nombre=' + this.nombre + '&filtroNombre=0';
        }
        if(this.appaterno){
            query = query + '&apellidoPaterno=' + this.appaterno + '&filtroApellidoPaterno=0';
        }
        if(this.apmaterno){
            query = query + '&apellidoMaterno=' + this.apmaterno + '&filtroApellidoMaterno=0';
        }
        if(this.curp){
            query = query + '&curp=' + this.curp;
        }
        if(this.rfc){
            query = query + '&rfc=' + this.rfc;
        }
        if(this.ine){
            query = query + '&ine=' + this.ine;
        }
        if(this.registro){
            query = query + '&registro=' + this.registro;
        }
        if(this.identificacion && this.idedato){
            query = query + '&iddocidentif=' + this.identificacion + '&valdocidentif=' + this.idedato;
        }

        if( this.isIdentificativo ){
            busquedaDatos = busquedaDatos + 'getIdentificativos';
            query = query + '&coincidenTodos=false';
        }else{
            busquedaDatos = busquedaDatos + 'getContribuyente';
        }

        query = query.substr(1);

        console.log(this.endpoint + busquedaDatos + '?' + query);
        this.loading = true;
        this.http.post(this.endpoint + busquedaDatos + '?' + query, '', this.httpOptions)
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

    peritoPersonaSelected(element){
        console.log(element);
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
    }
}