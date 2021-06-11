import { Component, OnInit, Inject, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-dialog-duplicados',
    templateUrl: './dialog-duplicados.component.html',
    styleUrls: ['./dialog-duplicados.component.css']
})
export class DialogDuplicadosComponent implements OnInit {
    displayedColumns: string[] = ['nombre','rfc', 'datos', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    loading = false;
    dataSource = [];
    dataPaginate = [];
    linkRoute;
    bandeja;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private auth: AuthService,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogDuplicadosComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
        dialogRef.disableClose = true;
        this.tableResultados();
    }

    ngOnInit(): void {
    }

    tableResultados(){
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
}
