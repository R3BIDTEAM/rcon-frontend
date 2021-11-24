import { Component, OnInit, Inject, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox'; 
import * as moment from 'moment';
import { DialogDuplicadosComponent, DialogsMensaje, DialogsValidaPerito } from '@comp/dialog-duplicados/dialog-duplicados.component';

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
    independiente: string;
    fecha_alta: Date;
    fecha_baja: Date;
    login: string;
}

export interface DocumentosIdentificativos{
    id_documento: number;
    documento: string;
}

@Component({
    selector: 'app-alta-peritos',
    templateUrl: './alta-peritos.component.html',
    styleUrls: ['./alta-peritos.component.css']
})
export class AltaPeritosComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/';
    peritoPersonaFormGroup: FormGroup;
    datoPeritos: DatosPeritos = {} as DatosPeritos;
    botonEdit = false;
    loading = false;
    httpOptions;
    search = false;
    inserto = false;
    isIdentificativo;
    isRequired = true;
    documentos: DocumentosIdentificativos[] = [];
    loadingDocumentosIdentificativos = false;
    @ViewChild('paginator') paginator: MatPaginator;
    btnNuevo = false;
    selectDisabled = false;
    buscadoEscrito: number = 0;
    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        private auth: AuthService,
        private route: ActivatedRoute,
        private router:Router
    ) {}

    /**
     * Valida la sesión del usuario
     */
    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };
        this.peritoPersonaFormGroup = this._formBuilder.group({
            apepaterno: ['', [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            apematerno: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            nombre: ['', [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            rfc: [null, []],
            curp: [null, []],
            ine: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            identificacion: [null],
            idedato: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            fechaNacimiento: [null],
            fechaDefuncion: [null],
            celular: [null, [Validators.pattern("^\\w+(\\s+\\w+)*$")]],
            email: ['', [Validators.email, Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            registro: ['', [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            fechaInicio: [null, []],
            fechaFin: [null, []],
            login: ['', [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]]
        });
        this.datoPeritos.independiente = 'N';
        this.getDataDocumentosIdentificativos();
    }

    /** 
    * Obtiene los Documentos Identificativos para llenar el Select de Documentos Identificativos
    */
    getDataDocumentosIdentificativos(): void{
        this.loadingDocumentosIdentificativos = true;
        this.http.get(this.endpoint + 'getCatalogos', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingDocumentosIdentificativos = false;
                this.documentos = res.CatDocIdentificativos;
                // console.log(this.documentos);
            },
            (error) => {
                this.loadingDocumentosIdentificativos = false;
            }
        );
    }

    minDate = '';

    fechaTope(){
        this.peritoPersonaFormGroup.controls['fechaDefuncion'].setValue(null);
        this.minDate = moment(this.peritoPersonaFormGroup.controls['fechaNacimiento'].value).add(2, 'd').format('YYYY-MM-DD');  
    }


    minDate2 = '';

    fechaTope2(){
        this.peritoPersonaFormGroup.controls['fechaFin'].setValue(null);
        this.minDate2 = moment(this.peritoPersonaFormGroup.controls['fechaInicio'].value).add(2, 'd').format('YYYY-MM-DD');  
    }

    /**
     * Limpia los campos del formulario.
     */
    clean(){
        this.peritoPersonaFormGroup.controls['apepaterno'].setValue(null);
        this.peritoPersonaFormGroup.controls['apematerno'].setValue(null);
        this.peritoPersonaFormGroup.controls['nombre'].setValue(null);
        this.peritoPersonaFormGroup.controls['rfc'].setValue(null);
        this.peritoPersonaFormGroup.controls['curp'].setValue(null);
        this.peritoPersonaFormGroup.controls['ine'].setValue(null);
        this.peritoPersonaFormGroup.controls['identificacion'].setValue(null);
        this.peritoPersonaFormGroup.controls['idedato'].setValue(null);
        this.peritoPersonaFormGroup.controls['fechaNacimiento'].setValue(null);
        this.peritoPersonaFormGroup.controls['fechaDefuncion'].setValue(null);
        this.peritoPersonaFormGroup.controls['celular'].setValue(null);
        this.peritoPersonaFormGroup.controls['email'].setValue(null);
        this.peritoPersonaFormGroup.controls['registro'].setValue(null);
        this.peritoPersonaFormGroup.controls['fechaInicio'].setValue(null);
        this.peritoPersonaFormGroup.controls['fechaFin'].setValue(null);
        this.peritoPersonaFormGroup.controls['login'].setValue(null);
        this.inserto = false;
        this.btnNuevo = false;
        this.selectDisabled = false;
        this.buscadoEscrito = 0;
    }

    /**
     * De acuerdo al campo seleccionado será requerido el RFC, el CURP o ambos.
     */
    changeRequired(): void {
        if((!this.peritoPersonaFormGroup.value.rfc && !this.peritoPersonaFormGroup.value.curp) || (!this.datoPeritos.rfc && !this.datoPeritos.curp)){​​​​​​​​
            this.isRequired = true;
        }​​​​​​​​ else {​​​​​​​​
            this.isRequired = false;
        }​​​​​​​​

        console.log(this.peritoPersonaFormGroup.value.rfc);
        this.peritoPersonaFormGroup.markAsTouched();
        this.peritoPersonaFormGroup.updateValueAndValidity();
    }

    /**
     *  Si se selecciona alguna opción desbloqueará el input del número del documento.
     * @param event Valor del option
     */
     seleccionaDocto(){
        this.selectDisabled = true;
    }

    /**
     * Obtiene el dato del checbox para definir la variable independiente sea S en caso de estar seleccionado o N de no ser así.
     * @param dato Valor true o false del check
     */
    isIndependiente(dato){
        if(dato.checked){
            this.datoPeritos.independiente = 'S';
        }else{
            this.datoPeritos.independiente = 'N';
        }
    }

    /**
     * Consulta si existe un registro con los mismos datos que se están ingresando para evitar la duplicidad,
     * de coincidir los datos con un registro existente nos mostrará un dialogo con los datos existentes,
     * de no existir coincidencias registrará el nuevo perito.
     */
    consulta_previa(){
        if(this.buscadoEscrito == 0){
            this.datoPeritos.registro = (this.peritoPersonaFormGroup.value.registro) ? this.peritoPersonaFormGroup.value.registro.toLocaleUpperCase().trim() : null;
            this.datoPeritos.fecha_alta = (this.peritoPersonaFormGroup.value.fechaInicio) ? this.peritoPersonaFormGroup.value.fechaInicio : null;
            this.datoPeritos.fecha_baja = (this.peritoPersonaFormGroup.value.fechaFin) ? this.peritoPersonaFormGroup.value.fechaFin : null;
            this.datoPeritos.nombre = (this.peritoPersonaFormGroup.value.nombre) ? this.peritoPersonaFormGroup.value.nombre.toLocaleUpperCase().trim() : null;
            this.datoPeritos.apepaterno = (this.peritoPersonaFormGroup.value.apepaterno) ? this.peritoPersonaFormGroup.value.apepaterno.toLocaleUpperCase().trim() : null;
            this.datoPeritos.apematerno = (this.peritoPersonaFormGroup.value.apematerno) ? this.peritoPersonaFormGroup.value.apematerno.toLocaleUpperCase().trim() : null;
            this.datoPeritos.rfc = (this.peritoPersonaFormGroup.value.rfc) ? this.peritoPersonaFormGroup.value.rfc.toLocaleUpperCase().trim() : null;
            this.datoPeritos.ine = (this.peritoPersonaFormGroup.value.ine) ? this.peritoPersonaFormGroup.value.ine.toLocaleUpperCase().trim() : null;
            this.datoPeritos.identificacion = (this.peritoPersonaFormGroup.value.identificacion) ? this.peritoPersonaFormGroup.value.identificacion.toLocaleUpperCase().trim() : null;
            this.datoPeritos.fecha_naci = (this.peritoPersonaFormGroup.value.fechaNacimiento) ? this.peritoPersonaFormGroup.value.fechaNacimiento : null;
            this.datoPeritos.fecha_def = (this.peritoPersonaFormGroup.value.fechaDefuncion) ? this.peritoPersonaFormGroup.value.fechaDefuncion : null;
            this.datoPeritos.email = (this.peritoPersonaFormGroup.value.email) ? this.peritoPersonaFormGroup.value.email.trim() : null;
            this.datoPeritos.celular = (this.peritoPersonaFormGroup.value.celular) ? this.peritoPersonaFormGroup.value.celular.trim() : null;
            this.datoPeritos.login = (this.peritoPersonaFormGroup.value.login) ? this.peritoPersonaFormGroup.value.login.toLocaleUpperCase().trim() : null;
            
            let query = '';
            //let busquedaDatos = 'getContribuyentesSimilares';
            let busquedaDatos = 'getContribuyentesSimilares';

            query = query + 'nombre=&filtroNombre=';

            query = query + '&apellidoPaterno=&filtroApellidoPaterno=';

            query = query + '&apellidoMaterno=&filtroApellidoMaterno=';

            //getContribuyentesSimilares?nombre=&filtroNombre=&apellidoPaterno=&filtroApellidoPaterno=&apellidoMaterno=&filtroApellidoMaterno=&curp=&rfc=VIPI900629MG5&claveife&actividadPrincip=
            query = (this.datoPeritos.rfc) ? query + '&rfc=' + this.datoPeritos.rfc : query + '&rfc=';

            query = (this.datoPeritos.curp) ? query + '&curp=' + this.datoPeritos.curp : query + '&curp=';

            query = (this.datoPeritos.ine) ? query + '&claveife=' + this.datoPeritos.ine : query + '&claveife=';

            //query = query.substr(1);

            //query = query + '&actividadPrincip=';

            console.log(this.endpoint + busquedaDatos + '?' + query);
            this.loading = true;
            this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
                .subscribe(
                    (res: any) => {
                        this.loading = false;
                        console.log(res);
                        console.log("EL RES DE LA VALIDACIÓN CONSULTA");
                        console.log(res.length);
                        if(res.length > 0){
                            this.validaDialog(res);
                        }else{
                            this.guardaPerito();
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
        }else{
            this.existePerito();
        }
    }

    /**
     * Abre el dialogo que nos muestra los registros existentes para editar o confirmar si queremos continuar con el registro.
     */
    validaDialog(res){
        const dialogRef = this.dialog.open(DialogsValidacionPerito, {
            width: '850px',
            data: {
                dataSource: res,
                bandeja: 3,
                buscadoEscrito: this.buscadoEscrito
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result !== 1 && result !== 2){
                console.log("RESULT DEL VALIDADO SIN ENCOTRAR COMO PERITO");
                console.log(result);
                this.puebaform(result);
            }else if(result == 1){
                this.guardaPerito();
            }else{
                console.log("RESULT NADA");
            }
        });
    }

    /**
     * Registra el nuevo perito.
     */
    guardaPerito(){
        let metodo = 'insertarPerito';
        let query = 'idPersona';
        this.loading = true;
        
        query = (this.datoPeritos.registro) ? query + '&registro=' + this.datoPeritos.registro : query + '&registro=';
        
        query = (this.datoPeritos.fecha_alta) ? query + '&fechaAlta=' + moment(this.datoPeritos.fecha_alta).format('DD-MM-YYYY') : query + '&fechaAlta=';
        
        query = (this.datoPeritos.fecha_baja) ? query + '&fechaBaja=' + moment(this.datoPeritos.fecha_baja).format('DD-MM-YYYY') : query + '&fechaBaja=';
        
        query = query + '&independiente=' + this.datoPeritos.independiente;
        
        query = (this.datoPeritos.nombre) ? query + '&nombre=' + this.datoPeritos.nombre : query + '&nombre=';

        query = (this.datoPeritos.apepaterno) ? query + '&apellidoPaterno=' + this.datoPeritos.apepaterno : query + '&apellidoPaterno=';

        query = (this.datoPeritos.apematerno) ? query + '&apellidoMaterno=' + this.datoPeritos.apematerno : query + '&apellidoMaterno=';

        query = (this.datoPeritos.rfc) ? query + '&rfc=' + this.datoPeritos.rfc : query + '&rfc=';

        query = (this.datoPeritos.curp) ? query + '&curp=' + this.datoPeritos.curp : query + '&curp=';
            
        query = (this.datoPeritos.ine) ? query + '&ife=' + this.datoPeritos.ine : query + '&ife=';

        query = (this.datoPeritos.identificacion && this.datoPeritos.idedato) ? query + '&iddocIdentif=' + this.datoPeritos.identificacion 
        + '&valdocIdentif=' + this.datoPeritos.idedato : query + '&iddocIdentif=&valdocIdentif=';

        query = (this.datoPeritos.fecha_naci) ? query + '&fechaNacimiento=' + moment(this.datoPeritos.fecha_naci).format('DD-MM-YYYY') : query + '&fechaNacimiento=';

        query = (this.datoPeritos.fecha_def) ? query + '&fechaDefuncion=' + moment(this.datoPeritos.fecha_def).format('DD-MM-YYYY') : query + '&fechaDefuncion=';

        query = (this.datoPeritos.email) ? query + '&email=' + this.datoPeritos.email : query + '&email=';

        query = (this.datoPeritos.celular) ? query + '&celular=' + this.datoPeritos.celular : query + '&celular=';        

        query = query + '&codtiposPersona=F&persona&idExpediente';

        query = (this.datoPeritos.login) ? query + '&login=' + this.datoPeritos.login : query + '&login=';

        console.log(this.datoPeritos.independiente);
        this.http.post(this.endpoint + metodo + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.inserto = true;
                    console.log("AQUI ENTRO EL RES DEL NUEVO PERITO");
                    console.log(res);
                    this.snackBar.open('guardado correcto - ' + res.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                    this.btnNuevo = true;
                },
                (error) => {
                    this.loading = false;
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                    this.btnNuevo = false;
                }
            );
    }

    existePerito(){
        let query = '';
        let busquedaDatos = 'getPeritosByDatosIdentificativos';

        query = (this.datoPeritos.rfc) ? query + '&rfc=' + this.datoPeritos.rfc : query + '&rfc=';

        query = (this.datoPeritos.curp) ? query + '&curp=' + this.datoPeritos.curp : query + '&curp=';

        query = (this.datoPeritos.ine) ? query + '&claveife=' + this.datoPeritos.ine : query + '&claveife=';

        console.log(this.endpoint + busquedaDatos + '?' + query);
        this.loading = true;
        this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    console.log("RES DEL ELEMENT BUSQUEDA PERITO 111!!!");
                    console.log(res);
                    if(res.length > 0){
                        this.validaDialog2(res);
                    }else{
                        this.guardaPerito();
                    }
                },
                (error) => {
                    this.loading = false;
                }
            );
    }

    /**
     * Abre el dialogo que nos muestra los registros existentes.
     */
    validaDialog2(res){
        const dialogRef = this.dialog.open(DialogsMensaje, {
            width: '850px',
            data: {
                dataSource: res,
                bandeja: 3
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log(result);
                //this.guardaPerito();
            }
        });
    }
    
    /**
     * Abre el dialogo para realizar la búsqueda de un contribuyente existente.
     */
    openDialogPerito(){
        const dialogRef = this.dialog.open(DialogAltaBusca, {
            width: '700px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log("RESULTADO DEL NUEVO NOMBRE");
                console.log(result);
                console.log(result.apepaterno);
                if(result.identificacion !== null){
                    this.selectDisabled = true;
                }
                setTimeout (() => {
                    this.puebaform(result);
                }, 500);
            }
        });
    }

    cambiaBoton(){
        var x = document.getElementById("BotonBorrar");
        var b = document.getElementById("BotonBuscar");
        if (x.style.display === "none") {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }

        b.style.display = "block";    
    }

    puebaform(result){
        
        this.buscadoEscrito = 1;
        this.datoPeritos.fecha_naci = (result.fecha_naci) ? new Date(result.fecha_naci) : null;
        this.datoPeritos.fecha_def = (result.fecha_def) ? new Date(result.fecha_def) : null;
        
        // if(this.datoPeritos.fecha_naci){
        //     this.peritoPersonaFormGroup.controls['fechaNacimiento'].clearValidators();
        // }
        // if(this.datoPeritos.fecha_def){
        //     this.peritoPersonaFormGroup.controls['fechaDefuncion'].clearValidators();
        // }
        //this.inserto = true;
        this.peritoPersonaFormGroup.controls['apepaterno'].setValue(result.apepaterno);
        this.peritoPersonaFormGroup.controls['apematerno'].setValue(result.apematerno);
        this.peritoPersonaFormGroup.controls['nombre'].setValue(result.nombre);
        this.peritoPersonaFormGroup.controls['rfc'].setValue(result.rfc);
        this.peritoPersonaFormGroup.controls['curp'].setValue(result.curp);
        this.peritoPersonaFormGroup.controls['ine'].setValue(result.ine);
        this.peritoPersonaFormGroup.controls['identificacion'].setValue(result.identificacion);
        this.peritoPersonaFormGroup.controls['idedato'].setValue(result.idedato);
        this.peritoPersonaFormGroup.controls['fechaNacimiento'].setValue(this.datoPeritos.fecha_naci);
        this.peritoPersonaFormGroup.controls['fechaDefuncion'].setValue(this.datoPeritos.fecha_def);
        this.peritoPersonaFormGroup.controls['celular'].setValue(result.celular);
        this.peritoPersonaFormGroup.controls['email'].setValue(result.email);
        this.peritoPersonaFormGroup.markAsUntouched();
        this.peritoPersonaFormGroup.updateValueAndValidity();
        this.changeRequired();
    }
    
}

//////////////////////////BUSCAR PERSONA PERITO////////////////////////
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
    buscadoEscrito: number;
}
@Component({
    selector: 'app-dialog-buscaPersona',
    templateUrl: 'app-dialog-buscaPersona.html',
    styleUrls: ['./alta-peritos.component.css']
})
export class DialogAltaBusca {
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
    btnDisabled = true;
    personaFormGroup: FormGroup;
    datoPeritoPersona: DatosPeritoPersona = {} as DatosPeritoPersona;
    @ViewChild('paginator') paginator: MatPaginator;
    loadingDocumentos;
    dataDocumentos: DocumentosIdentificativos[] = [];

    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogAltaBusca>,
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

        ngOnInit(): void {
            
            this.personaFormGroup = this._formBuilder.group({
                appaterno: ['', [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
                apmaterno: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
                nombre: ['', [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
                rfc: [null, []],
                curp: [null, []],
                ine: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
                identificacion: [null],    
                registro: ['', [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]]
            });
            
        }

        

    /**
     * Valida que exista un dato para activar el bóton de búsqueda.
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
     * Reinicia los valores del paginado.
     */
    cleanBusca(): void{
        this.personaFormGroup.controls['appaterno'].setValue(null);
        this.personaFormGroup.controls['apmaterno'].setValue(null);
        this.personaFormGroup.controls['nombre'].setValue(null);
        this.personaFormGroup.controls['rfc'].setValue(null);
        this.personaFormGroup.controls['curp'].setValue(null);
        this.personaFormGroup.controls['ine'].setValue(null);
        this.personaFormGroup.controls['registro'].setValue(null);
        this.personaFormGroup.controls['idedato'].setValue(null);
        this.pagina = 1;
        this.total = 0;
        this.dataSource = [];
        this.loading = false;
        this.dataPaginate;
        this.btnDisabled = true;
    }

    /**
     * Obtiene el o los registros de los contribuyentes existentes.
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

        console.log(this.endpoint + busquedaDatos + '?' + query);
        this.loading = true;
        this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
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
     * Obtiene y almacena los fato del perito seleccionado, la cual se mostrará en el formulario.
     * @param element Arreglo de los datos del perito seleccionado
     */
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
        this.datoPeritoPersona.idedato = element.VALDOCIDENTIF;
        this.datoPeritoPersona.fecha_naci = element.FECHANACIMIENTO;
        this.datoPeritoPersona.fecha_def = element.FECHADEFUNCION;
        this.datoPeritoPersona.celular = element.CELULAR;
        this.datoPeritoPersona.email = element.EMAIL;
        this.datoPeritoPersona.buscadoEscrito = 1;
        this.btnDisabled = false;

        var x = document.getElementById("BotonBorrar");
        var b = document.getElementById("BotonBuscar");
        if (x.style.display === "none") {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }

        b.style.display = "none";
    }
}

    

///////////////////////// VALIDACIÓN DEL PERITO ///////////////////////
export interface DatosPeritoValida {
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
    buscadoEscrito: number;
}
@Component({
    selector: 'dialog-valida-perito',
    templateUrl: 'dialog-valida-perito.html',
})
export class DialogsValidacionPerito {
    endpoint = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['nombre','rfc', 'datos', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    loading = false;
    dataSource = [];
    dataPaginate = [];
    linkRoute;
    bandeja;
    buscadoEscrito: number;
    httpOptions;
    datosPeritoValida: DatosPeritoValida = {} as DatosPeritoValida;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private http: HttpClient,
        private auth: AuthService,
        public dialog: MatDialog,
        private router:Router,
        public dialogRef: MatDialogRef<DialogsValidacionPerito>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
        dialogRef.disableClose = true;
        console.log("ACA EL RES DEL VALIDADOR PERITO 222");
        console.log(data);
        console.log(data.dataSource.registro);
        this.bandeja = data.bandeja;
        this.buscadoEscrito = data.buscadoEscrito;
        // if(data.bandeja == 3){
        //     this.registro = data.dataSource[0].registro;
        // }else{
        //     this.registro = data.dataSource[0].REGISTRO;
        // }
        
    }

    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };
        this.bandeja = this.data.bandeja;
        console.log("ESTA ES LA DATA DEL DIALOG DUPLICADOS 222");
        console.log(this.data.dataSource.length);
        this.dataSource = this.data.dataSource;
        this.dataPaginate = this.paginate(this.data.dataSource, this.pageSize, this.pagina);
        this.total = this.data.dataSource.length; 
        //this.paginator.pageIndex = 0;
    }

    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.data.dataSource, this.pageSize, this.pagina);
    }
    
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    existePerito(element){
        let query = '';
        //let busquedaDatos = 'getPeritosByDatosIdentificativos';
        let busquedaDatos = 'getPerito';
        //obtenerSociedades=1&idPerito=4494886

        query = query + 'obtenerSociedades=1&idPerito=' + element.IDPERSONA;
        // query = (element.RFC) ? query + '&rfc=' + element.RFC : query + '&rfc=';

        // query = (element.CURP) ? query + '&curp=' + element.CURP : query + '&curp=';

        // query = (element.CLAVEIFE) ? query + '&claveife=' + element.CLAVEIFE : query + '&claveife=';

        console.log(this.endpoint + busquedaDatos + '?' + query);
        this.loading = true;
        this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    console.log("RES DEL ELEMENT BUSQUEDA PERITO 222!!!");
                    console.log(res);
                    if(res.dsPeritos){
                        if(res.dsPeritos.length > 0){
                            this.dialogRef.close();
                            this.validaDialog(res.dsPeritos);
                        }
                    }else if(res.mensaje){
                        //this.guardaPerito();
                        console.log("ACA EL RES DEL EXISTE PERITO")
                        console.log(element);
                        this.datosPeritoValida.nombre = element.NOMBRE;
                        this.datosPeritoValida.apepaterno = element.APELLIDOPATERNO;
                        this.datosPeritoValida.apematerno = element.APELLIDOMATERNO;
                        this.datosPeritoValida.rfc = element.RFC;
                        this.datosPeritoValida.curp = element.CURP;
                        this.datosPeritoValida.ine = element.CLAVEIFE;
                        this.datosPeritoValida.identificacion = element.IDDOCIDENTIF;
                        this.datosPeritoValida.idedato = element.VALDOCIDENTIF;
                        this.datosPeritoValida.fecha_naci = element.FECHANACIMIENTO;
                        this.datosPeritoValida.fecha_def = element.FECHADEFUNCION;
                        this.datosPeritoValida.celular = element.CELULAR;
                        this.datosPeritoValida.email = element.EMAIL;
                        this.datosPeritoValida.buscadoEscrito = 1;
                        this.dialogRef.close(this.datosPeritoValida);
                    }
                },
                (error) => {
                    this.loading = false;
                }
            );
    }

    /**
     * Abre el dialogo que nos muestra los registros existentes.
     */
     validaDialog(res){
        const dialogRef = this.dialog.open(DialogsMensaje, {
            width: '850px',
            data: {
                dataSource: res,
                bandeja: 4
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result === true){
                console.log("EL ID PERITO DEL MENSAJE CHECK");
                console.log(res[0].IDPERITO);
                let navegar = '/main/editar-peritos/' + res[0].IDPERITO;
                this.router.navigate([navegar]);
            }
        });
    }
}