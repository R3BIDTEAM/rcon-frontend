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
@Component({
    selector: 'app-alta-peritos',
    templateUrl: './alta-peritos.component.html',
    styleUrls: ['./alta-peritos.component.css']
})
export class AltaPeritosComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/insertarPerito';
    peritoPersonaFormGroup: FormGroup;
    datoPeritos: DatosPeritos = {} as DatosPeritos;
    botonEdit = false;
    loading = false;
    httpOptions;
    search = false;
    inserto = false;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        private auth: AuthService,
        private route: ActivatedRoute,
    ) {
    }

    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };
        this.peritoPersonaFormGroup = this._formBuilder.group({
            apepaterno: ['', Validators.required],
            apematerno: ['', Validators.required],
            nombre: ['', Validators.required],
            rfc: ['', Validators.required],
            curp: ['', Validators.required],
            ine: [null],
            identificacion: [null],
            idedato: [null],
            fechaNacimiento: [null],
            fechaDefuncion: [null],
            celular: [null],
            email: ['', Validators.email],
            registro: [null, []],
            fechaInicio: [null, []],
            fechaFin: [null, []],
            login: ['', Validators.required]
          });
          this.datoPeritos.independiente = 'N';
    }

    isIndependiente(dato){
        if(dato.checked){
            this.datoPeritos.independiente = 'S';
        }else{
            this.datoPeritos.independiente = 'N';
        }
    }

    guardaPerito(){
        let query = 'idPersona';
        this.loading = true;
        
        //http://localhost:8000/api/v1/registro/insertarPerito?idPersona&registro=v-9999-99&fechaAlta=10-05-2021&fechaBaja&independiente=N&nombre=Omar Isaias&apellidoPaterno=Vidal&apellidoMaterno=Perez&rfc=VIP900629MG5&curp&ife=PLGMJN83062615H500&iddocIdentif=1&valdocIdentif&fechaNacimiento&fechaDefuncion&email=ividal@mail.com&celular&codtiposPersona=F&persona&idExpediente=347418
        //http://localhost:8000/api/v1/registro/insertarPerito?idPersona&registro=V-9988-48&fechaAlta=&fechaBaja=&independiente=N&nombre=VIVIANA&apellidopaterno=CHAVEZ&apellidomaterno=ROSAS&rfc=PIPO900929FA0&curp=PIPO900929HASDER08&claveife=DA181F&iddocidentif=&valdocidentif=&fechanacimiento=&fechadefuncion=&email=lli@gmail.com&celular=&codtiposPersona=F&persona&idExpediente=347418

        this.datoPeritos.registro = this.peritoPersonaFormGroup.value.registro;
        this.datoPeritos.fecha_alta = this.peritoPersonaFormGroup.value.fecha_alta;
        this.datoPeritos.fecha_baja = this.peritoPersonaFormGroup.value.fecha_baja;
        this.datoPeritos.nombre = this.peritoPersonaFormGroup.value.nombre;
        this.datoPeritos.apepaterno = this.peritoPersonaFormGroup.value.apepaterno;
        this.datoPeritos.apematerno = this.peritoPersonaFormGroup.value.apematerno;
        this.datoPeritos.rfc = this.peritoPersonaFormGroup.value.rfc;
        this.datoPeritos.ine = this.peritoPersonaFormGroup.value.ine;
        this.datoPeritos.identificacion = this.peritoPersonaFormGroup.value.identificacion;
        this.datoPeritos.fecha_naci = this.peritoPersonaFormGroup.value.fecha_naci;
        this.datoPeritos.fecha_def = this.peritoPersonaFormGroup.value.fecha_def;
        this.datoPeritos.email = this.peritoPersonaFormGroup.value.email;
        this.datoPeritos.celular = this.peritoPersonaFormGroup.value.celular;
        this.datoPeritos.login = this.peritoPersonaFormGroup.value.login;

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

        //this.datoPeritos.independiente
        console.log(this.datoPeritos.independiente);
        //return;
        this.http.post(this.endpoint + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.inserto = true;
                    console.log("AQUI ENTRO EL RES DEL NUEVO PERITO");
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

    openDialogPerito(){
        const dialogRef = this.dialog.open(DialogAltaBusca, {
            width: '700px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log("RESULTADO DEL NUEVO NOMBRE");
                console.log(result);
                console.log(result.apepaterno);
                this.datoPeritos.apepaterno = result.apepaterno;
                this.datoPeritos.apematerno = result.apematerno;
                this.datoPeritos.nombre  = result.nombre;
                this.datoPeritos.rfc = result.rfc;
                this.datoPeritos.curp = result.curp;
                this.datoPeritos.ine = result.ine;
                this.datoPeritos.identificacion = result.identificacion;
                this.datoPeritos.idedato = result.idedato;
                this.datoPeritos.fecha_naci = result.fecha_naci;
                this.datoPeritos.fecha_def = result.fecha_def;
                this.datoPeritos.celular = result.celular;
                this.datoPeritos.email = result.email;
                this.botonEdit = false;
            }
        });
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
    datoPeritoPersona: DatosPeritoPersona = {} as DatosPeritoPersona;
    @ViewChild('paginator') paginator: MatPaginator;

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