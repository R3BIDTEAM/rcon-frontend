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
import { DialogConfirmacionComponent } from '@comp/dialog-confirmacion/dialog-confirmacion.component';
import { isEmptyExpression } from '@angular/compiler';
import { EMPTY } from 'rxjs';

export interface DatosNotario {
  no_notario: string;
  estado: string;
}

export interface DatosGenerales {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    rfc: string;
    curp: string;
    ine: string;
    otro_documento: string;
    numero_documento: string;
    fecha_nacimiento: Date;
    fecha_defuncion: Date;
    celular: string;
    email: string;
    actPreponderante: string;
    idTipoPersonaMoral: number;
    fechaInicioOperacion: Date;
    idMotivo: number;
    fechaCambio: Date;
    nombre_moral: string;
    tipoPersona: string;
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

@Component({
  selector: 'app-editar-notario',
  templateUrl: './editar-notario.component.html',
  styleUrls: ['./editar-notario.component.css']
})
export class EditarNotarioComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/getInfoNotario';
    endpointEstados = environment.endpoint + 'registro/';
    pagina = 1;
    total = 0;
    pageSize = 10;
    loading = false;
    dataSource = [];
    dataPaginate = [];
    displayedColumnsDom: string[] = ['direccion', 'historial', 'editar'];
    dataNotarioResultado;
    dataNotarioDireccionesResultado;
    httpOptions;
    search = false;
    query;
    idNotario;
    idDireccion;
    personaFormGroup: FormGroup;
    moralFormGroup: FormGroup;
    datosNotario: DatosNotario = {} as DatosNotario;
    datosGenerales: DatosGenerales = {} as DatosGenerales;
    direccionesNotario: DireccionesNotario = {} as DireccionesNotario;
    estados: Estados[] = [];
    documentos: DocumentosIdentificativos[] = [];
    dataDomicilio: DataDomicilio[] = [];
    dataDomicilioEspecifico: DataDomicilio[] = [];
    loadingEstados = false;
    loadingDocumentosIdentificativos = false;
    loadingDatosNotario = false;
    loadingDatosGenerales = false;
    loadingDomicilios = false;
    loadingDireccionEspecifica = false;
    cambioPersona;
    actCambioPersona = true;
    isRequired = true;
    minDate;

    /*PAGINADOS*/
    dataSource1 = [];
    total1 = 0;
    pagina1= 1;
    dataPaginate1;
    /*PAGINADOS*/

    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        private auth: AuthService,
        private route: ActivatedRoute,
        public dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: this.auth.getSession().token
            })
        };

        this.personaFormGroup = this._formBuilder.group({
            no_notario: ['', [Validators.required, Validators.pattern("^\\w+(\\s+\\w+)*$")]],
            estado: [null, []],
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
            email: ['', [Validators.email, Validators.pattern("^\\S{1}.{1,248}\\S{1}$"), Validators.required]],
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

        this.idNotario = this.route.snapshot.paramMap.get('idnotario');
        this.idDireccion = this.route.snapshot.paramMap.get('iddireccion');
        console.log(this.idNotario);
        console.log(this.idDireccion);
        this.getNotarioDatos();
        this.getNotarioDirecciones();
        this.getDataEstados();
        this.getDataDocumentosIdentificativos();
    }

    /** 
    * @example obtiene los nombres de los estados
    */
    getDataEstados(): void {
        this.loadingEstados = true;
        this.http.get(this.endpointEstados + 'getEstados', this.httpOptions).subscribe(
        (res: any) => {
            this.loadingEstados = false;
            this.estados = res;
            console.log(this.estados);
        },
        (error) => {
            this.loadingEstados = false;
        }
        );
    }

    changeRequired(): void {
        if((!this.datosGenerales.rfc && !this.datosGenerales.curp) || (!this.personaFormGroup.value.rfc && !this.personaFormGroup.value.curp)
            ){​​​​​​​​
            this.isRequired = true;
        }​​​​​​​​ else {​​​​​​​​
            this.isRequired = false;
        }​​​​​​​​

        this.personaFormGroup.markAsTouched();
        this.personaFormGroup.updateValueAndValidity();
    }

    /**
    * Esta funcion sirve para traer los docuemntos que llenan el select de otro Documento identificativo
    */
    getDataDocumentosIdentificativos(): void{
        this.loadingDocumentosIdentificativos = true;
        this.http.get(this.endpointEstados + 'getCatalogos', this.httpOptions).subscribe(
        (res: any) => {
            this.loadingDocumentosIdentificativos = false;
            this.documentos = res.CatDocIdentificativos;
            console.log(this.documentos);
        },
        (error) => {
            this.loadingDocumentosIdentificativos = false;
        }
        );
    }

    /**
    * Habilita el campo cuando se selecciona otro Documento identificativo, si se quita alguna opciín se vuelve a deshabilitar
    */
    otroDocumento(){
        if(this.datosGenerales.otro_documento === null || this.datosGenerales.otro_documento === ''){
        this.datosGenerales.numero_documento = '';
        }
    }

    /**
    * Trae la información guardada del notario seleccionado (Datos personales, direcciones, etc..)
    */
    getNotarioDatos(){
        this.query = 'infoExtra=true&idPersona=' + this.idNotario; 
        this.loading = true;
        console.log(this.endpoint);
        this.http.get(this.endpoint + '?' + this.query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataNotarioResultado = res.notario;
                    console.log("AQUI ENTRO EL RES");
                    console.log(this.dataNotarioResultado);
                    this.datoDelNotario();
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
    * Setea los valores encontrado en getDatosDelNotario en los campos del formulario
    */
    datoDelNotario(){
        this.cambioPersona = this.dataNotarioResultado[0].CODTIPOPERSONA;
        this.datosGenerales.tipoPersona = this.dataNotarioResultado[0].CODTIPOPERSONA;
        this.datosNotario.no_notario = this.dataNotarioResultado[0].NUMNOTARIO;
        this.datosNotario.estado = this.dataNotarioResultado[0].CODESTADO;
        this.datosGenerales.nombre  = this.dataNotarioResultado[0].NOMBRE;
        this.datosGenerales.apellido_paterno = this.dataNotarioResultado[0].APELLIDOPATERNO;
        this.datosGenerales.apellido_materno = this.dataNotarioResultado[0].APELLIDOMATERNO;
        this.datosGenerales.rfc = this.dataNotarioResultado[0].RFC;
        this.personaFormGroup.controls['rfc'].setValue(this.dataNotarioResultado[0].RFC);
        this.personaFormGroup.controls['curp'].setValue(this.dataNotarioResultado[0].CURP);
        this.datosGenerales.curp = this.dataNotarioResultado[0].CURP;
        this.datosGenerales.ine = this.dataNotarioResultado[0].CLAVEIFE;
        this.datosGenerales.otro_documento = this.dataNotarioResultado[0].IDDOCIDENTIF;
        this.datosGenerales.fecha_nacimiento = (this.dataNotarioResultado[0].FECHANACIMIENTO) ? new Date(this.dataNotarioResultado[0].FECHANACIMIENTO) : null;
        this.datosGenerales.fecha_defuncion = (this.dataNotarioResultado[0].FECHADEFUNCION) ? new Date(this.dataNotarioResultado[0].FECHADEFUNCION) : null;
        this.datosGenerales.celular = this.dataNotarioResultado[0].CELULAR;
        this.datosGenerales.email = this.dataNotarioResultado[0].EMAIL;
        this.datosGenerales.nombre_moral = this.dataNotarioResultado[0].APELLIDOPATERNO + ' ' + this.dataNotarioResultado[0].APELLIDOMATERNO + ' ' + this.dataNotarioResultado[0].NOMBRE; 
        console.log(this.datosGenerales.fecha_nacimiento);
        
        this.minDate = (moment(this.datosGenerales.fecha_nacimiento).add(2, 'd').format('YYYY-MM-DD'));
        console.log("ACA EL CHAGE REQUIRED");
        this.changeRequired();
    }


    fechaTope(){
        this.personaFormGroup.controls['fechaDefuncion'].setValue(null);
        this.minDate = moment(this.personaFormGroup.controls['fechaNacimiento'].value).add(2, 'd').format('YYYY-MM-DD');  
    }
  

    /**
    * Trae la información guardada de las direcciones que están dadas de alta para éste notario
    */
    getNotarioDirecciones(){
        this.loadingDomicilios = true;
        let metodo = 'getDireccionesContribuyente';
        this.http.get(this.endpointEstados + metodo + '?idPersona='+ this.idNotario, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDomicilios = false;
                    this.dataSource1 = res;
                    this.total1 = this.dataSource1.length;
                    this.dataPaginate1 = this.paginate(this.dataSource1, 15, this.pagina1);
                    // console.log('entra');
                    // console.log(this.dataSource1);
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
    * @param iddireccion Es el identificador de la dirección seleccionada en la tabla de direcciones agregadas
    */
    getDireccionEspecifica(iddireccion){
        this.loadingDireccionEspecifica = true;
        let metodo = 'getDireccionById';
        this.http.get(this.endpointEstados + metodo + '?idDireccion='+ iddireccion, this.httpOptions)
            .subscribe(
                (res: any) => {
                    // alert('entro');
                    this.loadingDireccionEspecifica = false;
                    this.dataDomicilioEspecifico = res;
                    this.editDomicilio(this.dataDomicilioEspecifico);
                    // console.log('domicilio único encontrado');
                    // console.log(this.dataDomicilioEspecifico);
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
    
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    
    /**
    * Actualiza la información del notario que fue cambiada en Datos del Notario (Estado, Número notario)
    */
    actualizarDatosNotario(){
        let query = '';

        query = 'idPersona=' + this.idNotario;
        query = (this.datosNotario.no_notario) ? query + '&numNotario=' + this.datosNotario.no_notario : query + '&numNotario=';
        query = (this.datosNotario.estado) ? query + '&codEstado=' + this.datosNotario.estado : query + '&codEstado=';

        this.http.post(this.endpointEstados + 'actualizarNotario?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    console.log(res);
                    this.loadingDatosNotario = false;
                    this.snackBar.open('Datos de Notario actualizados correctamente', 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                },
                (error) => {
                    this.loadingDatosNotario = false;
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }


    /**
    * Actualiza la información del notario que fue cambiada en Datos Personales del Notario (Nombre, apellidos, teléfono, RFC, etc...)
    */
    actualizarDatosGenerales(){
        let query = '';
        this.loading = true;
        query = 'codtipospersona=F';
        query = (this.datosGenerales.nombre) ? query + '&nombre=' + this.datosGenerales.nombre.toLocaleUpperCase().trim() : query + '&nombre=';
        query = query + '&activprincip&idtipomoral&idmotivosmoral&fechainicioactiv&fechacambiosituacion&idExpediente';
        query = (this.datosGenerales.rfc) ? query + '&rfc=' + this.datosGenerales.rfc.toLocaleUpperCase().trim() : query + '&rfc=';
        query = (this.datosGenerales.apellido_paterno) ? query + '&apellidopaterno=' + this.datosGenerales.apellido_paterno.toLocaleUpperCase().trim() : query + '&apellidopaterno=';
        query = (this.datosGenerales.apellido_materno) ? query + '&apellidomaterno=' + this.datosGenerales.apellido_materno.toLocaleUpperCase().trim() : query + '&apellidomaterno=';
        query = (this.datosGenerales.curp) ? query + '&curp=' + this.datosGenerales.curp.toLocaleUpperCase().trim() : query + '&curp=';
        query = (this.datosGenerales.ine) ? query + '&claveife=' + this.datosGenerales.ine.toLocaleUpperCase().trim() : query + '&claveife=';
        query = (this.datosGenerales.otro_documento) ? query + '&iddocidentif=' + this.datosGenerales.otro_documento : query + '&iddocidentif=';
        query = (this.datosGenerales.numero_documento) ? query + '&valdocidentif=' + this.datosGenerales.numero_documento.toLocaleUpperCase().trim() : query + '&valdocidentif=';
        query = (this.datosGenerales.fecha_nacimiento) ? query + '&fechanacimiento=' + moment(this.datosGenerales.fecha_nacimiento).format('DD-MM-YYYY') : query + '&fechanacimiento=';
        query = (this.datosGenerales.fecha_defuncion) ? query + '&fechadefuncion=' + moment(this.datosGenerales.fecha_defuncion).format('DD-MM-YYYY') : query + '&fechadefuncion=';
        query = (this.datosGenerales.celular) ? query + '&celular=' + this.datosGenerales.celular.trim() : query + '&celular=';
        query = (this.datosGenerales.email) ? query + '&email=' + this.datosGenerales.email.trim() : query + '&email=';
        query = query + '&idExpediente&idpersona=' + this.idNotario;

        this.http.post(this.endpointEstados + 'actualizaContribuyente?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    console.log(res);
                    this.loading = false;
                    this.snackBar.open('Datos de Notario actualizados correctamente', 'Cerrar', {
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
    * Activa el Dialogo de Confirmación de Cambio
    */
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


    /**
    * Cambia el Tipo de Persona de Moral a Física o visceversa
    */
    cambiarTipoPersona(){
        let query = 'idpersona=' + this.idNotario;
        this.loading = true;

        query = (this.datosGenerales.tipoPersona) ? query + '&codtipospersona=' + this.datosGenerales.tipoPersona : query + '&codtipospersona=';

        if(this.datosGenerales.tipoPersona === 'F'){
            query = (this.datosGenerales.apellido_paterno) ? query + '&apellidopaterno=' + this.datosGenerales.apellido_paterno : query + '&apellidopaterno=';
            query = (this.datosGenerales.apellido_materno) ? query + '&apellidomaterno=' + this.datosGenerales.apellido_materno : query + '&apellidomaterno=';
            query = (this.datosGenerales.nombre) ? query + '&nombreF=' + this.datosGenerales.nombre : query + '&nombreF=';
            query = (this.datosGenerales.rfc) ? query + '&rfcF=' + this.datosGenerales.rfc : query + '&rfcF=';
        } else {
            query = (this.datosGenerales.nombre_moral) ? query + '&nombreM=' + this.datosGenerales.nombre_moral : query + '&nombreM=';
            query = (this.datosGenerales.rfc) ? query + '&rfcM=' + this.datosGenerales.rfc : query + '&rfcM=';
        }
        
        query = (this.datosGenerales.curp) ? query + '&curp=' + this.datosGenerales.curp : query + '&curp=';
        query = (this.datosGenerales.ine) ? query + '&claveife=' + this.datosGenerales.ine : query + '&claveife=';
        query = (this.datosGenerales.otro_documento) ? query + '&iddocidentif=' + this.datosGenerales.otro_documento : query + '&iddocidentif=';
        query = (this.datosGenerales.numero_documento) ? query + '&valdocidentif=' + this.datosGenerales.numero_documento : query + '&valdocidentif=';
        query = (this.datosGenerales.fecha_nacimiento) ? query + '&fechanacimiento=' + moment(this.datosGenerales.fecha_nacimiento).format('DD-MM-YYYY') : query + '&fechanacimiento=';
        query = (this.datosGenerales.fecha_defuncion) ? query + '&fechadefuncion=' + moment(this.datosGenerales.fecha_defuncion).format('DD-MM-YYYY') : query + '&fechadefuncion=';
        query = (this.datosGenerales.celular) ? query + '&celular=' + this.datosGenerales.celular : query + '&celular=';
        query = (this.datosGenerales.email) ? query + '&email=' + this.datosGenerales.email : query + '&email=';

        query = (this.datosGenerales.actPreponderante) ? query + '&activprincip=' + this.datosGenerales.actPreponderante : query + '&activprincip=';
        query = (this.datosGenerales.idTipoPersonaMoral) ? query + '&idtipomoral=' + this.datosGenerales.idTipoPersonaMoral : query + '&idtipomoral=';
        query = (this.datosGenerales.idMotivo) ? query + '&idmotivosmoral=' + this.datosGenerales.idMotivo : query + '&idmotivosmoral=';
        query = (this.datosGenerales.fechaInicioOperacion) ? query + '&fechainicioactiv=' + moment(this.datosGenerales.fechaInicioOperacion).format('DD-MM-YYYY') : query + '&fechainicioactiv=';
        query = (this.datosGenerales.fechaCambio) ? query + '&fechacambiosituacion=' + moment(this.datosGenerales.fechaCambio).format('DD-MM-YYYY') : query + '&fechacambiosituacion=';

        this.http.post(this.endpointEstados + 'cambioTipoPersona' + '?' + query, '', this.httpOptions)
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
                this.snackBar.open('Se ha presentado un problema intente más tarde', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
            }
        );
    }


    /**
    * @param event Es el parametro que recibe el método para elegir en el switch que acción realizar.
    * @todo algo
    * @bussineslogic 0 y 1
    */
    actualizaPersona(event){
        console.log(event)
        this.actCambioPersona = (event == this.cambioPersona) ? true : false;
        console.log(this.actCambioPersona);
        if(this.datosGenerales.tipoPersona == 'M'){
            this.datosGenerales.nombre_moral = this.datosGenerales.apellido_paterno + ' ' + this.datosGenerales.apellido_materno + ' ' + this.datosGenerales.nombre;
        }
        this.datosGenerales.rfc = null;
    }

    addDomicilio(i = -1, dataDomicilio = null): void {
        let codtiposdireccion = '';
        const dialogRef = this.dialog.open(DialogDomiciliosNotario, {
            width: '700px',
            data: {dataDomicilio:dataDomicilio, idNotario: this.idNotario,
                    codtiposdireccion: codtiposdireccion
            },
        });
        dialogRef.afterClosed().subscribe(result => {
            this.loadingDomicilios = true;
            setTimeout (() => {
                this.getNotarioDirecciones();
            }, 1500);
        });
    }


    /** 
    * @param dataDomicilioEspecifico Recibe la información del domicilio seleccionado
    */
    editDomicilio(dataDomicilioEspecifico): void {
        let codtiposdireccion = '';
            const dialogRef = this.dialog.open(DialogDomiciliosNotario, {
                width: '700px',
                data: {dataDomicilioEspecifico:dataDomicilioEspecifico, idNotario: this.idNotario},
            });
            dialogRef.afterClosed().subscribe(result => {
                this.loadingDomicilios = true;
                setTimeout (() => {
                    this.getNotarioDirecciones();
                }, 1500);
            });
    }


    /** 
    * @param idDireccion Identificador único de la dirección especifica guardada para éste notario
    */
    viewHistoricoDomicilio(idDireccion): void {
            const dialogRef = this.dialog.open(DialogDomicilioHistoricoNotario, {
                width: '700px',
                data: {idDireccion},
            });
            dialogRef.afterClosed().subscribe(result => {
                    // this.getNotarioDirecciones();
            });
    }


    /** 
    * @param idPersona Identificador único del Notario
    */
    viewHistoricoDatosPersonales(idPersona): void {
            const dialogRef = this.dialog.open(DialogPersonalesHistoricoNotario, {
                width: '700px',
                data: {idPersona},
            });
            dialogRef.afterClosed().subscribe(result => {
                    // this.getNotarioDirecciones();
            });
    }

    removeDomicilio(i){
            this.dataDomicilio.splice(i, 1);
    }


}


/////////////// DOMICILIOS ////////////////
@Component({
  selector: 'app-dialog-domicilios-notario',
  templateUrl: 'app-dialog-domicilios-notario.html',
  styleUrls: ['./editar-notario.component.css']
})
export class DialogDomiciliosNotario {
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
    loadingDireccionEspecifica = false;
    iddomicilio;
    iddireccion;

  constructor(
    private auth: AuthService,
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogDomiciliosNotario>,
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
        this.getDireccionEspecifica();
            if(data){
                console.log(data.dataDomicilioEspecifico);
                console.log("recibimos data seteado1");
            }
            this.getDataTiposAsentamiento();
            this.getDataTiposVia();
            this.getDataTiposLocalidad();
            //this.getDireccionEspecifica();

    }


    /** 
    * Obtiene la dirección especifica guardada para éste notario
    */
    getDireccionEspecifica(){
        this.loadingDireccionEspecifica = true;
        let metodo = 'getDireccionById';
        this.http.get(this.endpointCatalogos + metodo + '?idDireccion='+ this.iddireccion, this.httpOptions)
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
    * Obtiene los nombres de los Estados para el select de Selección de estado
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

    
    }
        
    /** 
    * Guarda un domicilio dado de alta
    */
    guardaDomicilio(){
        
        let query = 'insertarDireccion?idPersona=' + this.data.idNotario;

        query = (this.dataDomicilio.codtiposvia) ? query + '&codtiposvia=' + this.dataDomicilio.codtiposvia : query + '&codtiposvia=';
        query = (this.dataDomicilio.idtipovia) ? query + '&idvia=' + this.dataDomicilio.idtipovia : query + '&idvia=';
        query = (this.dataDomicilio.via) ? query + '&via=' + this.dataDomicilio.via : query + '&via=';

        query = (this.dataDomicilio.nexterior) ? query + '&numeroexterior=' + this.dataDomicilio.nexterior : query + '&numeroexterior=';
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
        query = (this.dataDomicilio.ninterior) ? query + '&numerointerior=' + this.dataDomicilio.ninterior : query + '&numerointerior=';
        
        // console.log('EL SUPER QUERY!!!!!!');
        // console.log(query);
        // insertarDireccion?idPersona=4485239&codtiposvia=1&idvia=686&via=DR LAVISTA&numeroexterior=144&entrecalle1&entrecalle2&andador&edificio&seccion&entrada&codtiposlocalidad=1&codtiposasentamiento=9&idcolonia=8&codasentamiento=&colonia=DOCTORES&codigopostal=06720&codciudad=&ciudad&iddelegacion=5&codmunicipio=15&delegacion=CUAUHTEMOC&telefono&codestado=9&codtiposdireccion=N&indicacionesadicionales&numerointerior=
        this.http.post(this.endpointCatalogos + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    console.log(res);
                    this.snackBar.open('Registro exitoso', 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                    //this.dialogRef.close();
                },
                (error) => {
                    this.snackBar.open('Ocurrio un error al Insertar la dirección, intente nuevemente', 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }


    /** 
    * Actualiza un domicilio que ya se encuentra dado de alta
    */
    actualizarDomicilio(){
        
        let query = 'actualizarDireccion?idPersona=' + this.data.idNotario + '&idDireccion=' + this.iddireccion;

        query = (this.dataDomicilio.codtiposvia) ? query + '&codtiposvia=' + this.dataDomicilio.codtiposvia : query + '&codtiposvia=';
        query = (this.dataDomicilio.idtipovia) ? query + '&idvia=' + this.dataDomicilio.idtipovia : query + '&idvia=';
        query = (this.dataDomicilio.via) ? query + '&via=' + this.dataDomicilio.via : query + '&via=';
        query = (this.dataDomicilio.nexterior) ? query + '&numeroexterior=' + this.dataDomicilio.nexterior : query + '&numeroexterior=';
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
        query = (this.dataDomicilio.ninterior) ? query + '&numerointerior=' + this.dataDomicilio.ninterior : query + '&numerointerior=';
        
        console.log('Actualizacion de Direcciones...');
        console.log(query);
        
        //localhost:8000/api/v1/registro/actualizarDireccion?idPersona=4353312&idDireccion=3597172&codtiposvia=1&idvia=2568&via=ABRAHAM SANCHEZ&numeroexterior=21&entrecalle1&entrecalle2&andador&edificio&seccion&entrada&codtiposlocalidad=1&numerointerior=&codtiposasentamiento=9&idcolonia=8&codasentamiento=&colonia=DOCTORES&codigopostal=06720&codciudad&ciudad&iddelegacion=5&codmunicipio=15&delegacion=CUAUHTEMOC&telefono&codestado=9&codtiposdireccion=&indicacionesadicionales

        this.http.post(this.endpointCatalogos + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    console.log("AQUI ACTUALIZO");
                    console.log(res);
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
  

    /** 
    * @param data Utiliza el arreglo de data para pasar los valores al formulario 
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
    * Obtiene los municipios
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
        const dialogRef = this.dialog.open(DialogMunicipiosNotario, {
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
    * Obtiene las ciudades 
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
        const dialogRef = this.dialog.open(DialogCiudadNotario, {
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
    * Obtiene las colonias 
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
        const dialogRef = this.dialog.open(DialogAsentamientoNotario, {
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
    * Obtiene las calles
    */
    getVia(){
        this.dataDomicilio.codasentamiento =  this.domicilioFormGroup.value.codasentamiento;
        const dialogRef = this.dialog.open(DialogViaNotario, {
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
    selector: 'app-dialog-municipios-notario',
    templateUrl: 'app-dialog-municipios-notario.html',
    styleUrls: ['./editar-notario.component.css']
})
export class DialogMunicipiosNotario {
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
        public dialogRef: MatDialogRef<DialogMunicipiosNotario>,
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
            // alert('es cdmx');
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

    /** 
    * Obtiene los municipios según el estado seleccionado
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
    selector: 'app-dialog-ciudad-notario',
    templateUrl: 'app-dialog-ciudad-notario.html',
    styleUrls: ['./editar-notario.component.css']
})
export class DialogCiudadNotario {
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
        public dialogRef: MatDialogRef<DialogCiudadNotario>,
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
    * Obtiene la ciudad según el estado seleccionado
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
    selector: 'app-dialog-asentamiento-notario',
    templateUrl: 'app-dialog-asentamiento-notario.html',
    styleUrls: ['./editar-notario.component.css']
})
export class DialogAsentamientoNotario {
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
        public dialogRef: MatDialogRef<DialogAsentamientoNotario>,
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
        this.buscaAsentamiento = null;
        this.obtenerAsentamiento();
    }

    /** 
    * Obtiene la colonia según el estado seleccionado
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
  
        criterio = 'getAsentamientoByNombre';
        query = query + 'nombre=' + this.buscaAsentamiento + '&codEstado=' + this.data.codEstado + '&codMunicipio=' + this.data.codMunicipio2;
        query = (this.data.codCiudad) ? query + '&codCiudad=' + this.data.codCiudad : query + '&codCiudad=';
        
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
    selector: 'app-dialog-via-notario',
    templateUrl: 'app-dialog-via-notario.html',
    styleUrls: ['./editar-notario.component.css']
})
export class DialogViaNotario {
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
        public dialogRef: MatDialogRef<DialogViaNotario>,
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
    * Obtiene la calle según la colonia seleccionada 
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



/////////////// DOMICILIOS HISTORICO ////////////////
export interface DataHistorico{
    fecha_desde: Date;
    fecha_hasta: Date;
}

@Component({
    selector: 'app-dialog-domicilio-historico-notario',
    templateUrl: 'app-dialog-domicilio-historico-notario.html',
    styleUrls: ['./editar-notario.component.css']
  })
  export class DialogDomicilioHistoricoNotario {
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
        public dialogRef: MatDialogRef<DialogDomicilioHistoricoNotario>,
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
    * Obtiene todas las modificaciones que se han hecho sobre un domicilio registrado
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

    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    viewHistoricoDomicilioEspecifico(dataDomicilioEspecifico): void {
        const dialogRef = this.dialog.open(DialogDomicilioHistoricoEspecificoNotario, {
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
    selector: 'app-dialog-domicilio-historico-especifico-notario',
    templateUrl: 'app-dialog-domicilio-historico-especifico-notario.html',
    styleUrls: ['./editar-notario.component.css']
  })
  export class DialogDomicilioHistoricoEspecificoNotario {
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
        public dialogRef: MatDialogRef<DialogDomicilioHistoricoEspecificoNotario>,
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
    * Obtiene la dirección especifica seleccionada
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

    getNombreDel(event): void {
        this.dataDomicilio.delegacion = event.source.triggerValue;
        this.botonAsentamiento = false;
        
    }

    /** 
    * Obtiene el nombre de los estados
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
    * Obtiene el nombre de los muncipios de cada estado o alcaldías en caso de la Ciudad de México
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
    * Obtiene las colonias de los estados y/o delegaciones
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
    * Obtiene las calles de las colonias
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
    * Obtiene los tipos de localidad
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
    * Setea los datos del domicilio seleccionado en el formulario
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

    getMunicipios(){
        this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
        const dialogRef = this.dialog.open(DialogMunicipiosNotario, {
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
        const dialogRef = this.dialog.open(DialogCiudadNotario, {
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
        const dialogRef = this.dialog.open(DialogAsentamientoNotario, {
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
        const dialogRef = this.dialog.open(DialogViaNotario, {
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
    selector: 'app-dialog-personales-historico-notario',
    templateUrl: 'app-dialog-personales-historico-notario.html',
    styleUrls: ['./editar-notario.component.css']
  })
  export class DialogPersonalesHistoricoNotario {
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
        public dialogRef: MatDialogRef<DialogPersonalesHistoricoNotario>,
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
    * Obtiene todas las modificaciones que se han hecho sobre un domicilio registrado
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

    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    /** 
    * @param dataPersonalesEspecifico abre el Dialog con la infirmación del cambio seleccionado
    */
    viewHistoricoPersonalesEspecifico(dataPersonalesEspecifico): void {
        const dialogRef = this.dialog.open(DialogPersonalesHistoricoEspecificoNotario, {
            width: '700px',
            data: { dataPersonalesEspecifico:dataPersonalesEspecifico, idDireccion:this.idPersona },
        });
        dialogRef.afterClosed().subscribe(result => {
                // this.getNotarioDirecciones();
        });
    }

}


/////////////// PERSONALES HISTORICO ESPECIFICO ////////////////
@Component({
    selector: 'app-dialog-personales-historico-especifico-notario',
    templateUrl: 'app-dialog-personales-historico-especifico-notario.html',
    styleUrls: ['./editar-notario.component.css']
  })
  export class DialogPersonalesHistoricoEspecificoNotario {

  }