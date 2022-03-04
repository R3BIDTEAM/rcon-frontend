import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '@serv/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-dialog-confirmacion',
    templateUrl: './dialog-confirmacion.component.html',
    styleUrls: ['./dialog-confirmacion.component.css']
})
export class DialogConfirmacionComponent implements OnInit {
    mensajeConfirma;

    constructor(
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogConfirmacionComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        dialogRef.disableClose = true;
        this.mensajeConfirma = data;
        console.log(this.mensajeConfirma);
    }

    ngOnInit(): void {
    }

}

@Component({
    selector: 'dialog-confirmaTipoPersona',
    templateUrl: 'dialog-confirmaTipoPersona.html',
})
export class DialogsCambiaPersona {
    registro;

    constructor(
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogsCambiaPersona>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
        dialogRef.disableClose = true;
        console.log(data);
        
    }

    ngOnInit(): void {
    }

}

@Component({
    selector: 'dialog-cuenta',
    templateUrl: 'dialog-cuenta.html',
})
export class DialogCuenta {
    idpersona;
    mensaje;

    constructor(
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogCuenta>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
        dialogRef.disableClose = true;
        console.log("ACÁ LA OPCIÓN");
        console.log(data);
        this.mensaje = data.mensaje;
        
    }

    ngOnInit(): void {
       
    }

}

// DIALOGO PARA ASOCIAR LAS CUENTAS
export interface DataCuenta {
    region: string;
    manzana: string;
    lote: string;
    unidad: string;
    porcentaje: string;
    digito: string;
    codDerecho: string;
}
export interface DataTipoDerecho{
    codtipoderecho: string;
    descripcion: string;
}
@Component({
    selector: 'dialogAsociaCuenta',
    templateUrl: 'dialogAsociaCuenta.html',
})
export class DialogsAsociarCuenta {
    endpoint = environment.endpoint + 'registro/';
    httpOptions;
    cuentaFormGroup: FormGroup;
    dataCuenta: DataCuenta = {} as DataCuenta;
    loadingDerecho = false;
    dataTipoDerecho: DataTipoDerecho[] = [];
    mensajeConfirma;
    constructor(
        public dialog: MatDialog,
        private _formBuilder: FormBuilder,
        private http: HttpClient,
        private auth: AuthService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<DialogsAsociarCuenta>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
        dialogRef.disableClose = true;
        console.log(data);
        
    }

    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };

        this.cuentaFormGroup = this._formBuilder.group({
            region: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
            manzana: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
            lote: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
            unidad: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
            digito: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(1)]],
            porcentaje: [null, []],
            codDerecho: [null, [Validators.required]],
        });

        this.getTipoDerecho();
    }

    /**
     * Obtiene el catálogo del tipo de derecho
     */
     getTipoDerecho(){
        this.loadingDerecho = true;
        this.http.get(this.endpoint + 'getCatTiposDerecho', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDerecho = false;
                    this.dataTipoDerecho = res;
                    console.log("DERECHO");
                    console.log(this.dataTipoDerecho);
                },
                (error) => {
                    this.loadingDerecho = false;
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }

    /** 
    * Abre el dialogo que mostrarrá un mensaje de confirmación según sea el caso
    * @param evento Es el parametro que recibe el método para elegir en el switch que acción realizar.
    * @param element Pude ser un solo dato o un array dependiendo el metodo del swtich.
    * @param tipo Utilizado en el método de eliminarRepresentación para diferenciar entre un representante o representado
    * con valor de 1 y 2 respectivamente.
    */
     confirmaCambio(evento = null, element = null, tipo = null): void {
        this.mensajeConfirma = evento;
        console.log(this.mensajeConfirma);
        const dialogRef = this.dialog.open(DialogConfirmacionComponent, {
            width: '700px',
            data: this.mensajeConfirma
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                switch (this.mensajeConfirma) {
                    case 6:
                        this.guardarCuenta();
                        break;
                    default:
                        break;
                }
            }
        });
    }

    guardarCuenta(){
        this.dataCuenta.region = this.cuentaFormGroup.value.region;
        this.dataCuenta.manzana = this.cuentaFormGroup.value.manzana;
        this.dataCuenta.lote = this.cuentaFormGroup.value.lote;
        this.dataCuenta.unidad = this.cuentaFormGroup.value.unidad;
        this.dataCuenta.digito = this.cuentaFormGroup.value.digito;
        this.dataCuenta.porcentaje = this.cuentaFormGroup.value.porcentaje;
        this.dataCuenta.codDerecho = this.cuentaFormGroup.value.codDerecho;
        console.log("ACÁ LA INFORMACIÓN");
        console.log(this.dataCuenta);
        this.dialogRef.close(this.dataCuenta);
    }

    /** 
     * Genera un salto automático de un input al siguiente una vez que la longitud máxima del input ha sido alcanzada
     */
    focusNextInput(event, input) {
        if(event.srcElement.value.length === event.srcElement.maxLength){
        input.focus();
        }
    }
}