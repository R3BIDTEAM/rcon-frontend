import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '@serv/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';

@Component({
    selector: 'app-alta-peritos',
    templateUrl: './alta-peritos.component.html',
    styleUrls: ['./alta-peritos.component.css']
})
export class AltaPeritosComponent implements OnInit {

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private auth: AuthService,
        public dialog: MatDialog,
    ) {
    }

    ngOnInit(): void {
    }

    openDialogPerito(): void {
        const dialogRef = this.dialog.open(DialogPerito, {
            width: '850px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
            }
        });
    }
}

@Component({
    selector: 'app-dialog-alta-peritos',
    templateUrl: 'app-dialog-alta-peritos.html',
})

export class DialogPerito {
    //endpoint = environment.endpoint + 'sf/notario';
    endpoint = environment.rconEndpoint + 'persona/notario';
    pagina = 1;
    total = 0;
    loading = false;
    dataSource = [];
    displayedColumns: string[] = ['no_notario', 'nombre', 'select'];
    httpOptions;
    busqueda;
    tipo = '';

    constructor(
            private http: HttpClient,
            public dialogRef: MatDialogRef<DialogPerito>,
            @Inject(MAT_DIALOG_DATA) public data: any
        ) {
            this.busqueda = false;
            this.tipo = 'perito';
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    getDataNotario(): void {
        this.loading = true;
        this.busqueda = true;
        this.http.get(this.endpoint+'?page='+ this.pagina,
            this.httpOptions).subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res.data;
                    this.total = res.total;
                },
                (error) => {
                    this.loading = false;
                    this.dataSource = [];
                }
            );
    }

    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.getDataNotario();
    }

    cleanBusqueda(): void{
        this.pagina = 1;
        this.total = 0;
        this.dataSource = [];
        this.loading = false;
        this.busqueda = false;
    }

    NotariosSelect(element) {
    }

}