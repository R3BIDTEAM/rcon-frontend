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

@Component({
    selector: 'app-alta-sociedad',
    templateUrl: './alta-sociedad.component.html',
    styleUrls: ['./alta-sociedad.component.css']
})
export class AltaSociedadComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/insertarSociedad';
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
    @ViewChild('paginator') paginator: MatPaginator;
    constructor(
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        private auth: AuthService,
        private route: ActivatedRoute,
    ) { }

    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };
    }

    clean(): void{
        // this.busqueda = false;
        // this.resetPaginator();
    }

    guardaSociedad(){
        let query = 'idPersona';
        this.loading = true;
        
        //http://localhost:8000/api/v1/registro/insertarSociedad?idPersona&registro=S-9999-99&fechaAlta=14-05-2021&fechaBaja&nombre=CHAI S.A484&rfc=VIP900629MG5&email=ivl@mail.com&login&codtiposPersona=M&persona&idExpediente=347418
        //http://localhost:8000/api/v1/registro/insertarSociedad?idPersona&registro=S-0012-99&fechaAlta=21-05-2021&fechaBaja=&nombre=PEKAS DOGS&rfc=PKAS900629D4&email=pks@dogs.com&login=&codtiposPersona=M&persona&idExpediente

        query = (this.registro) ? query + '&registro=' + this.registro : query + '&registro=';
        
        query = (this.fecha_alta) ? query + '&fechaAlta=' + moment(this.fecha_alta).format('DD-MM-YYYY') : query + '&fechaAlta=';
        
        query = (this.fecha_baja) ? query + '&fechaBaja=' + moment(this.fecha_baja).format('DD-MM-YYYY') : query + '&fechaBaja=';
        
        query = (this.razonSocial) ? query + '&nombre=' + this.razonSocial : query + '&nombre=';

        query = (this.rfc) ? query + '&rfc=' + this.rfc : query + '&rfc=';

        query = (this.email) ? query + '&email=' + this.email : query + '&email=';

        query = (this.login) ? query + '&login=' + this.login : query + '&login=';        

        query = query + '&codtiposPersona=M&persona&idExpediente';

        //this.datoPeritos.independiente
        console.log(this.endpoint + '?' + query);
        //return;
        this.http.post(this.endpoint + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
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
    openDialogSociedad(): void {
        const dialogRef = this.dialog.open(DialogSociedad, {
            width: '850px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.razonSocial = result.razonSocial;
                this.rfc = result.rfc;
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

    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    clean(): void{
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

    sociedadSelected(element){
        console.log(element);
        this.sociedadDialog.razonSocial = element.RAZONSOCIAL;
        this.sociedadDialog.rfc = element.RFC;
    }
}
