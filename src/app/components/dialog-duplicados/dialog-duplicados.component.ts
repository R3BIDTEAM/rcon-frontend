import { Component, OnInit, Inject, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
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

@Component({
    selector: 'dialog-mensaje',
    templateUrl: 'dialog-mensaje.html',
    styleUrls: ['./dialog-duplicados.component.css']
})
export class DialogsMensaje {
    registro;
    bandeja;

    constructor(
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogsMensaje>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
        dialogRef.disableClose = true;
        console.log(data);
        console.log(data.dataSource.registro);
        this.bandeja = data.bandeja;

        if(data.bandeja == 3){
            this.registro = data.dataSource[0].registro;
        }else{
            this.registro = data.dataSource[0].REGISTRO;
        }
        
    }

    ngOnInit(): void {
    }

}

@Component({
    selector: 'dialog-valida-perito',
    templateUrl: 'dialog-valida-perito.html',
    styleUrls: ['./dialog-duplicados.component.css']
})
export class DialogsValidaPerito {
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
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private http: HttpClient,
        private auth: AuthService,
        public dialog: MatDialog,
        private router:Router,
        public dialogRef: MatDialogRef<DialogsValidaPerito>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
        dialogRef.disableClose = true;
        console.log("ACA EL RES DEL VALIDADOR PERITO");
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

    existePerito(element){
        let query = '';
        let busquedaDatos = 'getPeritosByDatosIdentificativos';

        query = (element.RFC) ? query + '&rfc=' + element.RFC : query + '&rfc=';

        query = (element.CURP) ? query + '&curp=' + element.CURP : query + '&curp=';

        query = (element.CLAVEIFE) ? query + '&claveife=' + element.CLAVEIFE : query + '&claveife=';

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
                        //this.guardaPerito();
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
                console.log(res[0].idperito);
                let navegar = '/main/editar-peritos/' + res[0].idperito;
                this.router.navigate([navegar]);
            }
        });
    }
}