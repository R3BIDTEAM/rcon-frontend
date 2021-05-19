import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';


export interface DatosPeritos {
    apepaterno: string;
    apematerno: string;
    nombre: string;
    rfc: string;
    curp: string;
    ine: string;
    identificacion: string;
    fecha_naci: Date;
    fecha_def: Date;
    celular: string;
    email: string;
    registro: string;
    independiente: boolean;
    fecha_alta: Date;
    fecha_baja: Date;
}

export interface DataDomicilio {
    //idtipodireccion: number;
    //tipodireccion: string;
    idestado: number;
    estado: string;
    idmunicipio: number;
    municipio: string;
    ciudad: string;
    idtipoasentamiento: number;
    asentamiento: string;
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

export interface DataSociedadAsociada{
    razonSocial: string;
    registro: string;
    rfc: string;
    idsociedad: number;
}

@Component({
    selector: 'app-editar-peritos',
    templateUrl: './editar-peritos.component.html',
    styleUrls: ['./editar-peritos.component.css']
})
export class EditarPeritosComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/getPerito';
    displayedColumns: string[] = ['nombre','registro', 'rfc'];
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
    botonEdit = false;
    peritoPersonaFormGroup: FormGroup;
    loadingDatosPerito = false;
    //floatLabelControl = new FormControl('always');
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        private auth: AuthService,
        private route: ActivatedRoute,
        fb: FormBuilder
    ) {
        // this.peritoPersonaFormGroup = fb.group({
        //     floatLabel: this.floatLabelControl,
        // });

        this.peritoPersonaFormGroup = this._formBuilder.group({
            apellidopaterno: ['', Validators.required],
            apellidomaterno: ['', Validators.required],
            nombre: ['', Validators.required],
            rfc: ['', Validators.required],
            curp: ['', Validators.required],
            ine: ['', Validators.required],
            identificacion: [null],
            idedato: [null],
            fechaNacimiento: [null],
            fechaDefuncion: [null],
            celular: [null],
            email: [null],
            // idtipoasentamiento: ['', Validators.required],
            // asentamiento: [null, Validators.required],
            // idtipovia: ['', Validators.required],
            // via: [null, Validators.required],
            // idtipolocalidad: ['', Validators.required],
            // cp: [null],
            // nexterior: [null, Validators.required],
        });
     }

    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };
        this.idPerito = this.route.snapshot.paramMap.get('idperito');
        console.log(this.idPerito);
        this.getPeritoDatos();
    }

    cleanPerito(){
        this.datoPeritos.apepaterno = null;
        this.datoPeritos.apematerno = null;
        this.datoPeritos.nombre  = null;
        this.datoPeritos.rfc = null;
        this.datoPeritos.curp = null;
        this.datoPeritos.ine = null;
        this.datoPeritos.identificacion = null;
        this.datoPeritos.fecha_naci = null;
        this.datoPeritos.fecha_def = null;
        this.datoPeritos.celular = null;
        this.datoPeritos.email = null;
        this.botonEdit = true;
    }

    getPeritoDatos(){
        this.query = 'obtenerSociedades=1&idPerito=' + this.idPerito; 
        this.loadingDatosPerito = true;
        console.log(this.endpoint);
        this.http.post(this.endpoint + '?' + this.query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDatosPerito = false;
                    this.dataPeritoResultado = res.dsPeritos[0];
                    this.dataSource = res.dsPeritos[0].Sociedades;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataPaginate.length; 
                    this.paginator.pageIndex = 0;
                    console.log("AQUI ENTRO EL RES");
                    console.log(this.dataSource);
                    this.datoDelPerito();
                },
                (error) => {
                    this.loadingDatosPerito = false;
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }

    datoDelPerito(){
        this.datoPeritos.apepaterno = this.dataPeritoResultado.APELLIDOPATERNO;
        this.datoPeritos.apematerno = this.dataPeritoResultado.APELLIDOMATERNO;
        this.datoPeritos.nombre  = this.dataPeritoResultado.NOMBRE;
        this.datoPeritos.rfc = this.dataPeritoResultado.RFC;
        this.datoPeritos.curp = this.dataPeritoResultado.CURP;
        this.datoPeritos.ine = this.dataPeritoResultado.CLAVEIFE;
        this.datoPeritos.identificacion = this.dataPeritoResultado.DESCDOCIDENTIF;
        this.datoPeritos.fecha_naci = this.dataPeritoResultado.FECHANACIMIENTO;
        this.datoPeritos.fecha_def = this.dataPeritoResultado.FECHADEFUNCION;
        this.datoPeritos.celular = this.dataPeritoResultado.CELULAR;
        this.datoPeritos.email = this.dataPeritoResultado.EMAIL;
        this.datoPeritos.registro = this.dataPeritoResultado.REGISTRO;
        this.datoPeritos.fecha_alta = new Date(this.dataPeritoResultado.FECHAALTA);
        this.datoPeritos.fecha_baja = new Date(this.dataPeritoResultado.FECHABAJA);
        
        if(this.dataPeritoResultado.INDEPENDIENTE === 'S'){
            this.datoPeritos.independiente = true;
        }else{
            this.datoPeritos.independiente = false;
        }
    }

    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataSource = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    addDomicilio(i = -1, dataDomicilio = null): void {
        const dialogRef = this.dialog.open(DialogDomicilioPerito, {
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

    addRepresentante(i = -1, dataRepresentante = null): void {
        const dialogRef = this.dialog.open(DialogRepresentacionPeritos, {
            width: '700px',
            data: dataRepresentante,
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
        const dialogRef = this.dialog.open(DialogRepresentadoPeritos, {
            width: '700px',
            data: dataRepresentante,
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

    agregaSociedadEditar(){
        const dialogRef = this.dialog.open(DialogSociedadAsociada, {
            width: '700px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.dataSociedadAsociada.push(result);
                console.log("AQUI EL RESULTADOOOOO");
                console.log(this.dataSociedadAsociada);
            }
        });
    }
    
    buscarPeritoPersona(){
        const dialogRef = this.dialog.open(DialogBuscaPerito, {
            width: '700px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.idPerito = result;
                console.log("RESULTADO DEL IDPERITO NUEVO");
                console.log(this.idPerito);
                this.getPeritoDatos();
                this.botonEdit = false;
            }
        });
    }
}

///////////////BUSCAR PERSONA PERITO////////////////
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
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogDomicilioPerito>,
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
        if(this.rfc){
            query = query + '&rfc=' + this.rfc;
        }
        if(this.curp){
            query = query + '&curp=' + this.curp;
        }
        if(this.ine){
            query = query + '&ine=' + this.ine;
        }
        if(this.registro){
            query = query + '&registro=' + this.registro;
        }
        if(this.identificacion && this.idedato){
            query = query + '&idOtroDocumento=' + this.identificacion + '&valorOtroDocumento=' + this.idedato;
        }

        if( this.isIdentificativo ){
            busquedaDatos = busquedaDatos + 'getPeritosByDatosIdentificativos';
        }else{
            busquedaDatos = busquedaDatos + 'getPeritosByDatosPersonales';
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
    domicilioFormGroup: FormGroup;
    dataDomicilio: DataDomicilio = {} as DataDomicilio;
    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogDomicilioPerito>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
            dialogRef.disableClose = true;
            this.httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: this.auth.getSession().token
                })
            };
  
            this.getDataEstados();
            
            this.domicilioFormGroup = this._formBuilder.group({
                //idtipodireccion: ['', Validators.required],
                idestado: ['', Validators.required],
                municipio: [null, Validators.required],
                ciudad: [null, Validators.required],
                idtipoasentamiento: ['', Validators.required],
                asentamiento: [null, Validators.required],
                idtipovia: ['', Validators.required],
                via: [null, Validators.required],
                idtipolocalidad: ['', Validators.required],
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
                    this.domicilioFormGroup.removeControl('ciudad');
                    this.domicilioFormGroup.addControl('idmunicipio', new FormControl('', Validators.required));
                } else {
                    this.domicilioFormGroup.removeControl('idmunicipio');
                    this.domicilioFormGroup.addControl('municipio', new FormControl(null, Validators.required));
                    this.domicilioFormGroup.addControl('ciudad', new FormControl(null, Validators.required));
                }
                this.domicilioFormGroup.updateValueAndValidity();
            });
    
            if(data){
                this.setDataDomicilio(data);
            }
        }
    
    /*getDataTiposDireccion(): void {
        this.loadingTiposDireccion = true;
        this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposDireccion = false;
                this.tiposDireccion = res;
            },
            (error) => {
                this.loadingTiposDireccion = false;
            }
        );
    }*/
  
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
        this.loadingMunicipios = true;
        this.http.post(this.endpointCatalogos + 'getMunicipiosByEstado?codEstado=' + event.value, '', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingMunicipios = false;
                this.municipios = res;
            },
            (error) => {
                this.loadingMunicipios = false;
            }
        );
    }
  
    getDataTiposAsentamiento(): void {
        this.loadingTiposAsentamiento = true;
        this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposAsentamiento = false;
                this.tiposAsentamiento = res;
            },
            (error) => {
                this.loadingTiposAsentamiento = false;
            }
        );
    }
  
    getDataTiposVia(): void {
        this.loadingTiposVia = true;
        this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposVia = false;
                this.tiposVia = res;
            },
            (error) => {
                this.loadingTiposVia = false;
            }
        );
    }
  
    getDataTiposLocalidad(): void {
        this.loadingTiposLocalidad = true;
        this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposLocalidad = false;
                this.tiposLocalidad = res;
            },
            (error) => {
                this.loadingTiposLocalidad = false;
            }
        );
    }
  
    getDataDomicilio(): DataDomicilio {
        //this.dataDomicilio.idtipodireccion = this.domicilioFormGroup.value.idtipodireccion;
        this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
        this.dataDomicilio.idtipoasentamiento = this.domicilioFormGroup.value.idtipoasentamiento;
        this.dataDomicilio.asentamiento = (this.domicilioFormGroup.value.asentamiento) ? this.domicilioFormGroup.value.asentamiento : null;
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
        } else {
            this.dataDomicilio.municipio = (this.domicilioFormGroup.value.municipio) ? this.domicilioFormGroup.value.municipio : null;
            this.dataDomicilio.ciudad = (this.domicilioFormGroup.value.ciudad) ? this.domicilioFormGroup.value.ciudad : null;
        }
    
        return this.dataDomicilio;
    }
  
    setDataDomicilio(dataDomicilio): void {
        //this.domicilioFormGroup.controls['idtipodireccion'].setValue(dataDomicilio.idtipodireccion);
        this.domicilioFormGroup.controls['idestado'].setValue(dataDomicilio.idestado);
        this.getDataMunicipios({value: this.domicilioFormGroup.value.idestado});
        this.domicilioFormGroup.controls['idtipoasentamiento'].setValue(dataDomicilio.idtipoasentamiento);
        this.domicilioFormGroup.controls['asentamiento'].setValue(dataDomicilio.asentamiento);
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
            this.domicilioFormGroup.controls['municipio'].setValue(dataDomicilio.municipio);
            this.domicilioFormGroup.controls['ciudad'].setValue(dataDomicilio.ciudad);
        }
    }
}

///////////////REPRESENTACION////////////////
@Component({
    selector: 'app-dialog-representacion',
    templateUrl: 'app-dialog-representacion.html',
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogRepresentacionPeritos {
    endpoint = environment.endpoint;
    loading = false;
    httpOptions;
    tipoPersona = 'F';
    fisicaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    dataRepresentacion: DataRepresentacion = {} as DataRepresentacion;
  
    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogRepresentacionPeritos>,
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
  
        if(data){
            this.setDataRepresentacion(data);
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
        const dialogRef = this.dialog.open(DialogPersonaPeritos, {
            width: '700px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.tipoPersona = result.tipoPersona;
    
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
        const dialogRef = this.dialog.open(DialogDocumentoPerito, {
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

///////////////REPRESENTACION////////////////
@Component({
    selector: 'app-dialog-representado',
    templateUrl: 'app-dialog-representado.html',
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogRepresentadoPeritos {
    endpoint = environment.endpoint;
    loading = false;
    httpOptions;
    tipoPersona = 'F';
    fisicaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    dataRepresentacion: DataRepresentacion = {} as DataRepresentacion;
  
    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogRepresentadoPeritos>,
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
  
        if(data){
            this.setDataRepresentacion(data);
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
        const dialogRef = this.dialog.open(DialogPersonaPeritos, {
            width: '700px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.tipoPersona = result.tipoPersona;
    
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
        const dialogRef = this.dialog.open(DialogDocumentoPerito, {
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
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogDocumentoPerito {
    endpointCatalogos = environment.endpoint;
    loadingTiposDocumentoDigital = false;
    loadingTiposDocumentoJuridico = false;
    httpOptions;
    tiposDocumentoDigital;
    tiposDocumentoJuridico;
    tiposDocumentoFormGroup: FormGroup;
    infoDocumentoFormGroup: FormGroup;
    archivosDocumentoFormGroup: FormGroup;
    dataDocumento: DataDocumentoRepresentacion = {} as DataDocumentoRepresentacion;
    canSend = false;
    
    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogDocumentoPerito>,
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
        if(codtipodocumentojuridico == 1) {
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
        if(this.tiposDocumentoFormGroup.value.codtipodocumentojuridico == 1){
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
        if(dataDocumento.codtipodocumentojuridico == 1){
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
    styleUrls: ['./editar-peritos.component.css']
})
export class DialogNotarioPeritos {
    endpoint = environment.endpoint + 'registro/getNotariosBy';
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
    @ViewChild('paginator') paginator: MatPaginator;
  
    constructor(
        private auth: AuthService,
        private http: HttpClient,
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
        
        this.http.post(this.endpoint + this.tipoBusqueda + '?' + this.queryParamFiltros, '', this.httpOptions).subscribe(
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
    tipoPersona = 'F';
    isIdentificativo;
    optionPersona;
    isBusqueda;
    queryParamFiltros;
    endpointBusqueda;
    @ViewChild('paginator') paginator: MatPaginator;
  
    constructor(
      private auth: AuthService,
      private http: HttpClient,
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
      }
  
    clearInputsIdentNoIdent(isIdentificativo): void {
        this.isIdentificativo = isIdentificativo;
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

////////// SOCIEDADES ASOCIADAS ////////////////
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
    search;
    isIdentificativo;
    optionSociedad;
    dataSociedadAsociada: DataSociedadAsociada = {} as DataSociedadAsociada;
    @ViewChild('paginator') paginator: MatPaginator;
  
    constructor(
        private auth: AuthService,
        private http: HttpClient,
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

    clean(): void{
        this.loading = false;
        this.pagina = 1;
        this.total = 0;
        this.pageSize = 15;
        this.dataSource = [];
        this.dataPaginate;
        this.optionSociedad = undefined;
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

    sociedadSelected(element): DataSociedadAsociada {
        console.log(element);
        this.dataSociedadAsociada.rfc = element.RFC;
        this.dataSociedadAsociada.registro = element.REGISTRO;
        this.dataSociedadAsociada.razonSocial =element.RAZONSOCIAL;
        console.log(this.dataSociedadAsociada);
        return;
    }
}