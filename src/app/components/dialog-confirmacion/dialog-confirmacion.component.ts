import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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
