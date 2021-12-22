import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
@Component({
  selector: 'app-dialog-carga',
  templateUrl: './dialog-carga.component.html',
  styleUrls: ['./dialog-carga.component.scss']
})
export class DialogCargaComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DialogCargaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      dialogRef.disableClose = true;
    }

  ngOnInit(): void {
  }

}