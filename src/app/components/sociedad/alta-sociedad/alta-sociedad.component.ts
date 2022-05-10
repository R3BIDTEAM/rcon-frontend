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
import { DialogDuplicadosComponent, DialogsMensaje } from '@comp/dialog-duplicados/dialog-duplicados.component';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-alta-sociedad',
    templateUrl: './alta-sociedad.component.html',
    styleUrls: ['./alta-sociedad.component.css']
})
export class AltaSociedadComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/insertarSociedad';
    endpointPrevia = environment.endpoint + 'registro/';
    sociedadFormGroup: FormGroup;    
    httpOptions;
    razonSocial;
    rfc;
    registro;
    fecha_alta;
    fecha_baja;
    email;
    login;
    search;
    isIdentificativo;
    loading = false;
    inserto = false;
    dataSource = [];
    btnDisabled = true;
    buscadoEscrito: number = 0;
    diaHoy = new Date();
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        private auth: AuthService,
        private route: ActivatedRoute,
        private router:Router,
        private spinner: NgxSpinnerService
    ) { }

    /**
     * 
     *Metodo que autentica la sesión y define grupo de campos requeridos
     *
     */
    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };

        this.sociedadFormGroup = this._formBuilder.group({
            razonSocial: ['', [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            rfc: ['', [Validators.required]],
            registro: ['', [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            fecha_alta: [null],
            fecha_baja: [null],
            email: ['', [Validators.email, Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            login: ['', [Validators.required, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
          });

          this.sociedadFormGroup.controls['fecha_alta'].setValue(this.diaHoy);
    }


    minDate = '';

    fechaTope(){
        this.sociedadFormGroup.controls['fecha_baja'].setValue(null);
        this.minDate = moment(this.sociedadFormGroup.controls['fecha_alta'].value).add(2, 'd').format('YYYY-MM-DD');  
    }

    /**
     * Reinicia los valores del paginado.
     */
    clean(): void{
        this.sociedadFormGroup.controls['razonSocial'].setValue(null);
        this.sociedadFormGroup.controls['rfc'].setValue(null);
        this.sociedadFormGroup.controls['registro'].setValue(null);
        this.sociedadFormGroup.controls['fecha_alta'].setValue(null);
        this.sociedadFormGroup.controls['fecha_baja'].setValue(null);
        this.sociedadFormGroup.controls['email'].setValue(null);
        this.sociedadFormGroup.controls['login'].setValue(null);    
        this.inserto = false;
        this.btnDisabled = true;
        this.buscadoEscrito = 0;
    }    

    /**
     * Consulta si existe un registro con los mismos datos que se están ingresando para evitar la duplicidad,
     * de coincidir los datos con un registro existente nos mostrará un dialogo con los datos existentes,
     * de no existir coincidencias registrará la nueva sociedad.
     */
    consulta_previa(){
        this.spinner.show();
        this.razonSocial = this.sociedadFormGroup.value.razonSocial.toLocaleUpperCase();
        this.rfc = this.sociedadFormGroup.value.rfc.toLocaleUpperCase();
        this.registro = this.sociedadFormGroup.value.registro.toLocaleUpperCase();
        this.fecha_alta = this.sociedadFormGroup.value.fecha_alta;
        this.fecha_baja = this.sociedadFormGroup.value.fecha_baja;
        this.email = this.sociedadFormGroup.value.email;
        this.login = this.sociedadFormGroup.value.login.toLocaleUpperCase();
        if(this.buscadoEscrito == 0){
            

            let query = '';
            let busquedaDatos = 'getContribuyentesSimilares';
            
            // query = query + 'nombre=&filtroNombre=';

            // query = query + '&apellidoPaterno=&filtroApellidoPaterno=';
            
            // query = query + '&apellidoMaterno=&filtroApellidoMaterno=&curp=';

            if(this.rfc){
                query = query + '&rfc=' + this.rfc;
            }

            //query = query + '&claveife&actividadPrincip=';
            this.loading = true;
            console.log("RESULTADO DE LA BUSQUEDA");
            console.log(this.endpoint);
            console.log(query);
            this.http.get(this.endpointPrevia + busquedaDatos + '?' + query, this.httpOptions)
                .subscribe(
                    (res: any) => {
                        this.loading = false;
                        if(res.length > 0){
                            console.log("RES SOCIEDAD");
                            console.log(res);
                            this.validaDialog(res);
                        }else{
                            this.guardaSociedad();
                        }
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
                        this.spinner.hide();
                    }
                );
        }else{
            this.existeSociedad();
        }                
    }

    existeSociedad(){
        let query = '';
        let busquedaDatos = 'getSocValuacionByDatosIdentificativos';
        
        query = query + '&rfc=' + this.rfc;

        console.log(this.endpointPrevia + busquedaDatos + '?' + query);
        this.loading = true;
        this.http.get(this.endpointPrevia + busquedaDatos + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    console.log("RES DEL ELEMENT BUSQUEDA PERITO 111 !!!");
                    console.log(res);
                    if(res.length > 0){
                        this.validaDialogRedirect(res);
                    }else{
                        this.guardaSociedad();
                    }
                },
                (error) => {
                    this.loading = false;
                }
            );
    }

    /**
     * Abre el dialogo que nos muestra los registros existentes para editar o confirmar si queremos continuar con el registro.
     */
    validaDialog(res): void {
        //this.dataSource = res;
        const dialogRef = this.dialog.open(DialogsValidacionSociedad, {
            width: '850px',
            data: {
                dataSource: res,
                bandeja: 6
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
            if(result === 1){
                this.guardaSociedad();
            }else if(result !== 1 && result !== 2){
                console.log("RESULT DEL VALIDADO SIN ENCOTRAR COMO PERITO");
                console.log(result);
                this.sociedadFormGroup.controls['razonSocial'].setValue(result.razon_social);
                this.sociedadFormGroup.controls['rfc'].setValue(result.rfc);
                this.buscadoEscrito = 1;
            }
        });
    }

    /**
     * Abre el dialogo que nos muestra los registros existentes.
     */
    validaDialogRedirect(res){
        this.spinner.hide();
        const dialogRef = this.dialog.open(DialogsMensaje, {
            width: '850px',
            data: {
                dataSource: res,
                bandeja: 5
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result === true){
               
            }
        });
    }

    /**
     * Registra los datos de la nueva sociedad.
     */
    guardaSociedad(){
        this.spinner.show();
        let query = 'idPersona';
        this.loading = true;
        
        query = (this.registro) ? query + '&registro=' + this.registro.toLocaleUpperCase().trim() : query + '&registro=';
        
        query = (this.fecha_alta) ? query + '&fechaAlta=' + moment(this.fecha_alta).format('DD-MM-YYYY') : query + '&fechaAlta=';
        
        query = (this.fecha_baja) ? query + '&fechaBaja=' + moment(this.fecha_baja).format('DD-MM-YYYY') : query + '&fechaBaja=';
        
        query = (this.razonSocial) ? query + '&nombre=' + this.razonSocial.toLocaleUpperCase().trim() : query + '&nombre=';

        query = (this.rfc) ? query + '&rfc=' + this.rfc.toLocaleUpperCase().trim() : query + '&rfc=';

        query = (this.email) ? query + '&email=' + this.email.trim() : query + '&email=';

        query = (this.login) ? query + '&login=' + this.login.toLocaleUpperCase().trim() : query + '&login=';        

        query = query + '&codtiposPersona=M&persona&idExpediente';

        console.log(this.endpoint + '?' + query);
        this.http.post(this.endpoint + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.inserto = true;
                    this.btnDisabled = false;
                    console.log("AQUI ENTRO EL RES DEL NUEVO PERITO");
                    console.log(res);
                    // this.snackBar.open('guardado correcto - ' + res.mensaje, 'Cerrar', {
                    //     duration: 10000,
                    //     horizontalPosition: 'end',
                    //     verticalPosition: 'top'
                    // });
                    Swal.fire({
                        title: 'CORRECTO',
                        text: res.mensaje,
                        icon: 'success',
                        confirmButtonText: 'Cerrar'
                    });
                    this.spinner.hide();
                },
                (error) => {
                    console.log(error.error);
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
                    this.spinner.hide();
                }
            );
    }

    /**
     * Abre el dialogo para realizar la búsqueda de una sociedad existente.
     */
    openDialogSociedad(): void {
        const dialogRef = this.dialog.open(DialogSociedad, {
            width: '850px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.sociedadFormGroup.controls['razonSocial'].setValue(result.razonSocial);
                this.sociedadFormGroup.controls['rfc'].setValue(result.rfc);
                this.buscadoEscrito = 1;
                console.log(result);
            }
        });
    }
}

/////////////////////BUSCA SOCIEDAD//////////////////////////////
export interface SociedadDialog{
    razonSocial: string;
    rfc: string;
}
@Component({
    selector: 'app-dialog-alta-sociedad',
    templateUrl: 'app-dialog-alta-sociedad.html',
})

export class DialogSociedad {
    endpoint = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['razon', 'rfc', 'select'];
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
    personaFormGroup: FormGroup;
    sociedadDialog: SociedadDialog = {} as SociedadDialog;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
            private http: HttpClient,
            private snackBar: MatSnackBar,
            private auth: AuthService,
            private route: ActivatedRoute,
            private spinner: NgxSpinnerService,
            public dialogRef: MatDialogRef<DialogSociedad>,
            @Inject(MAT_DIALOG_DATA) public data: any
        ) {
    }

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
    }

    /**
     * Cierra el dialogo
     */
    onNoClick(): void {
        this.dialogRef.close();
    }

    /**
     * Reinicia los valores del paginado.
     */
     clean(): void{
        console.log("ENTREEEEE EN CLEAN");
        this.razonSocial = null;
        this.rfc = null;
        this.loading = false;
        this.pagina = 1;
        this.total = 0;
        this.pageSize = 15;
        this.dataSource = [];
        this.dataPaginate;
    }

    /*cleanPersona(): void{
        this.personaFormGroup.controls['razonSocial'].setValue(null);
        this.personaFormGroup.controls['rfc'].setValue(null);
        
    }*/

    /**
     * Valida que exista un dato para activar el bóton de búsqueda.
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
     * Realiza la búsqueda de una sociedad existente de acuerdo a los críterios que pueden ser datos identificativos o personales.
     */
    getSociedad(){
        this.spinner.show();
        let query = '';
        let busquedaDatos = '';
        if( this.razonSocial ){
            busquedaDatos = busquedaDatos + 'getPersonaMoral';
        }else{
            busquedaDatos = busquedaDatos + 'getMoralIdentificativos';
        }

        if( this.razonSocial ){
            query = query + '&razonSocial=' + this.razonSocial.toLocaleUpperCase() + '&filtroApellidoPaterno=0';
        }
        if(this.rfc){
            query = query + '&rfc=' + this.rfc.toLocaleUpperCase();
        }

        query = query.substr(1);

        this.loading = true;
        console.log(this.endpoint);
        this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    console.log(res);
                    this.spinner.hide();
                    if (res.length === 0) {
                        Swal.fire({
                            title: 'SIN RESULTADO',
                            text: "No se encontraron datos.",
                            icon: 'error',
                            confirmButtonText: 'Cerrar'
                        });
                    }
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
                    this.spinner.hide();
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
     * Obtiene y almacea los datos de la sociedad seleccionada, la cual se mostrará en el formulario.
     * @param element Arreglo de los datos de la sociedad seleccionada
     */
    sociedadSelected(element){
        console.log(element);
        this.sociedadDialog.razonSocial = element.APELLIDOPATERNO;
        this.sociedadDialog.rfc = element.RFC;
    }
}


///////////////////// VALIDACIÓN SOCIEDAD ///////////////////////////
export interface DatosSociedad{
    idsociedad: string;
    razon_social: string;
    rfc: string;
}

@Component({
    selector: 'dialog-valida-sociedad',
    templateUrl: 'dialog-valida-sociedad.html',
})
export class DialogsValidacionSociedad {
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
    registro;
    datosSociedad: DatosSociedad = {} as DatosSociedad;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private http: HttpClient,
        private auth: AuthService,
        public dialog: MatDialog,
        private router:Router,
        private spinner: NgxSpinnerService,
        public dialogRef: MatDialogRef<DialogsValidacionSociedad>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
        dialogRef.disableClose = true;
        console.log("ACA EL RES DEL VALIDADOR PERITO");
        console.log(data);
        console.log(data.dataSource.registro);
        this.bandeja = data.bandeja;
        this.buscadoEscrito = data.buscadoEscrito;
        
        this.registro = data.dataSource[0].REGISTRO;
    }

    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };
        this.bandeja = this.data.bandeja;
        console.log("ESTA ES LA DATA DEL DIALOG DUPLICADOS");
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

    existeSociedad(element){
        let query = '';
        //let busquedaDatos = 'getSocValuacionByDatosIdentificativos';
        let busquedaDatos = 'getSociedadValuacion';
        
        // query = query + 'nombre=&filtroNombre=';

        // query = query + '&apellidoPaterno=&filtroApellidoPaterno=';
        
        // query = query + '&apellidoMaterno=&filtroApellidoMaterno=&curp=';

        // if(element.RFC){
        //     query = query + '&rfc=' + element.RFC;
        // };

        query = query + 'idSociedad=' + element.IDPERSONA;

        console.log(this.endpoint + busquedaDatos + '?' + query);
        this.loading = true;
        this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    console.log("RES DEL ELEMENT BUSQUEDA PERITO!!!");
                    console.log(res);
                    if(res.length > 0){
                        this.dialogRef.close();
                        this.validaDialog(res);
                    }else{
                        this.datosSociedad.razon_social = element.APELLIDOPATERNO;
                        this.datosSociedad.rfc = element.RFC;
                        this.dialogRef.close(this.datosSociedad);
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
        this.spinner.hide();
        const dialogRef = this.dialog.open(DialogsMensaje, {
            width: '850px',
            data: {
                dataSource: res,
                bandeja: 6
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result === true){
                console.log("EL ID SOCIEDAD DEL MENSAJE CHECK");
                console.log(res[0].IDSOCIEDAD);
                let navegar = '/main/editar-sociedad/' + res[0].IDSOCIEDAD;
                this.router.navigate([navegar]);
            }
        });
    }
}


