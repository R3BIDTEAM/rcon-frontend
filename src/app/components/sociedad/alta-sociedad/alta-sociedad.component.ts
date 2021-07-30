import { Component, OnInit, Inject, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox'; 
import * as moment from 'moment';
import { DialogDuplicadosComponent, DialogsMensaje } from '@comp/dialog-duplicados/dialog-duplicados.component';

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
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        private auth: AuthService,
        private route: ActivatedRoute,
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
            razonSocial: ['', Validators.required],
            rfc: ['', Validators.required],
            registro: ['', Validators.required],
            fecha_alta: [null],
            fecha_baja: [null],
            email: ['', Validators.email],
            login: ['', Validators.required],
          });
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
    }

    /**
     * Consulta si existe un registro con los mismos datos que se están ingresando para evitar la duplicidad,
     * de coincidir los datos con un registro existente nos mostrará un dialogo con los datos existentes,
     * de no existir coincidencias registrará la nueva sociedad.
     */
    consulta_previa(){
        this.razonSocial = this.sociedadFormGroup.value.razonSocial;
        this.rfc = this.sociedadFormGroup.value.rfc;
        this.registro = this.sociedadFormGroup.value.registro;
        this.fecha_alta = this.sociedadFormGroup.value.fecha_alta;
        this.fecha_baja = this.sociedadFormGroup.value.fecha_baja;
        this.email = this.sociedadFormGroup.value.email;
        this.login = this.sociedadFormGroup.value.login;

        let query = '';
        let busquedaDatos = 'getSocValuacionByDatosIdentificativos';
        
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
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }//YA NO SE USA

    /**
     * Abre el dialogo que nos muestra los registros existentes para editar o confirmar si queremos continuar con el registro.
     */
    validaDialog(res): void {
        //this.dataSource = res;
        const dialogRef = this.dialog.open(DialogsMensaje, {
            width: '850px',
            data: {
                dataSource: res,
                bandeja: 4
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log(result);
                this.guardaSociedad();
            }
        });
    }

    /**
     * Registra los datos de la nueva sociedad.
     */
    guardaSociedad(){

        let query = 'idPersona';
        this.loading = true;
        
        query = (this.registro) ? query + '&registro=' + this.registro : query + '&registro=';
        
        query = (this.fecha_alta) ? query + '&fechaAlta=' + moment(this.fecha_alta).format('DD-MM-YYYY') : query + '&fechaAlta=';
        
        query = (this.fecha_baja) ? query + '&fechaBaja=' + moment(this.fecha_baja).format('DD-MM-YYYY') : query + '&fechaBaja=';
        
        query = (this.razonSocial) ? query + '&nombre=' + this.razonSocial : query + '&nombre=';

        query = (this.rfc) ? query + '&rfc=' + this.rfc : query + '&rfc=';

        query = (this.email) ? query + '&email=' + this.email : query + '&email=';

        query = (this.login) ? query + '&login=' + this.login : query + '&login=';        

        query = query + '&codtiposPersona=M&persona&idExpediente';

        console.log(this.endpoint + '?' + query);
        this.http.post(this.endpoint + '?' + query, '', this.httpOptions)
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
                },
                (error) => {
                    console.log(error.error);
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
    sociedadDialog: SociedadDialog = {} as SociedadDialog;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
            private http: HttpClient,
            private snackBar: MatSnackBar,
            private auth: AuthService,
            private route: ActivatedRoute,
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
        this.loading = false;
        this.pagina = 1;
        this.total = 0;
        this.pageSize = 15;
        this.dataSource = [];
        this.dataPaginate;
    }

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
        let query = '';
        let busquedaDatos = '';
        if( this.razonSocial ){
            busquedaDatos = busquedaDatos + 'getPersonaMoral';
        }else{
            busquedaDatos = busquedaDatos + 'getMoralIdentificativos';
        }

        if( this.razonSocial ){
            query = query + '&razonSocial=' + this.razonSocial + '&filtroApellidoPaterno=0';
        }
        if(this.rfc){
            query = query + '&rfc=' + this.rfc;
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
     * Obtiene y almacea los datos de la sociedad seleccionada, la cual se mostrará en el formulario.
     * @param element Arreglo de los datos de la sociedad seleccionada
     */
    sociedadSelected(element){
        console.log(element);
        this.sociedadDialog.razonSocial = element.APELLIDOPATERNO;
        this.sociedadDialog.rfc = element.RFC;
    }
}
