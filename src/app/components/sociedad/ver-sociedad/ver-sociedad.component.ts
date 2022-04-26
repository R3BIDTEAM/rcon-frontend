import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DialogHistorialComponent, DialogDomicilioHistoricoG } from '@comp/dialog-historial/dialog-historial.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

export interface DatosSociedad {
    razonSocial: string;
    rfc: string;
    registro: string;
    fecha_alta: Date;
    fecha_baja: Date;
}

@Component({
    selector: 'app-ver-sociedad',
    templateUrl: './ver-sociedad.component.html',
    styleUrls: ['./ver-sociedad.component.css']
})
export class VerSociedadComponent implements OnInit {

    endpoint = environment.endpoint + 'registro/getSociedadValuacion';
    endpointTable = environment.endpoint + 'registro/getPeritoBySociedad';
    endpointActualiza = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['nombre','registro', 'rfc'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    loading = false;
    displayedColumnsDom: string[] = ['tipoDir', 'direccion', 'historial'];
    displayedColumnsInm: string[] = ['inmueble','direccion','domicilio','descripcion','sujeto'];
    displayedColumnsRepdo: string[] = ['representacion','texto','caducidad'];
    displayedColumnsDataRep: string[] = ['fechaCaducidad','texto','caducidad'];
    loadingDomicilios = false;
    loadingRepresentante = false;
    loadingRepresentado = false;
    loadingInmuebles = false;
    paginaDom = 1;
    totalDom = 0;
    pageSizeDom = 15;
    dataSocedadResultado;
    dataSource;
    dataPaginate;
    httpOptions;
    search = false;
    query;
    idSociedad;
    datosSociedad: DatosSociedad = {} as DatosSociedad;
    Auditor: boolean = false;
    @ViewChild('paginator') paginator: MatPaginator;

    /*Paginado*/
    dataSource1 = [];
    total1 = 0;
    pagina1= 1;
    dataPaginate1;
    dataSource2 = [];
    total2 = 0;
    pagina2= 1;
    dataPaginate2;
    dataSource3 = [];
    total3 = 0;
    pagina3= 1;
    dataPaginate3;
    dataSource4 = [];
    total4 = 0;
    pagina4= 1;
    dataPaginate4;
    dataSource5 = [];
    total5 = 0;
    pagina5= 1;
    dataPaginate5;
    total6 = 0;
    pagina6= 1;
    dataPaginate6;
    total7 = 0;
    pagina7= 1;
    dataPaginate7;
   /*Paginado*/

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private auth: AuthService,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private spinner: NgxSpinnerService
    ) { }

    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };
        if(this.auth.getSession().userData.rol_nombre == 'AUDITORIA RCON'){
            this.Auditor = true; 
        }
        this.idSociedad = this.route.snapshot.paramMap.get('idsociedad');
        console.log(this.idSociedad);
        this.getSociedadDatos();
        this.getDomicilioSociedad();
        this.getRepresentacion();
        this.getRepresentado();
    }

    getSociedadDatos(){
        this.spinner.show();
        this.query = 'idSociedad=' + this.idSociedad; 
        this.loading = true;
        console.log(this.endpoint);
        this.http.get(this.endpoint + '?' + this.query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    //this.loading = false;
                    this.dataSocedadResultado = res[0];
                    console.log("AQUI ENTRO EL RES");
                    console.log(this.dataSocedadResultado);
                    this.getPeritosSociedad();
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

    getPeritosSociedad(){
        this.http.get(this.endpointTable + '?' + 'idSociedad=' + this.idSociedad + '&idPerito', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataPaginate.length; 
                    this.paginator.pageIndex = 0;
                    console.log("OTRO RES");
                    console.log(this.total);
                    this.datosDeLaSociedad();
                    this.spinner.hide();
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

    datosDeLaSociedad(){
        this.datosSociedad.razonSocial  = this.dataSocedadResultado.RAZONSOCIAL;
        this.datosSociedad.rfc = this.dataSocedadResultado.RFC;
        this.datosSociedad.registro = this.dataSocedadResultado.REGISTRO;
        this.datosSociedad.fecha_alta = (this.dataSocedadResultado.FECHAALTA) ? new Date(this.dataSocedadResultado.FECHAALTA) : null;
        this.datosSociedad.fecha_baja = (this.dataSocedadResultado.FECHABAJA) ? new Date(this.dataSocedadResultado.FECHABAJA) : null;
    }

    /**
     * Obtiene los domicilios registrados de la sociedad domicilios particulares y para recibir notificaciones.
     */
    getDomicilioSociedad(){
    this.loadingDomicilios = true;
    let metodo = 'getDireccionesContribuyente';
    this.http.get(this.endpointActualiza + metodo + '?idPersona='+ this.idSociedad, this.httpOptions)
        .subscribe(
            (res: any) => {
                this.loadingDomicilios = false;

                this.dataSource1 = res.filter(element => element.CODTIPOSDIRECCION !== "N");
                this.dataSource2 = res.filter(element => element.CODTIPOSDIRECCION === "N");
                this.total1 = this.dataSource1.length;
                this.total2 = this.dataSource2.length;
                this.dataPaginate1 = this.paginate(this.dataSource1, 15, this.pagina1);
                this.dataPaginate2 = this.paginate(this.dataSource2, 15, this.pagina2);
            },
            (error) => {
                this.loadingDomicilios = false;
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
    paginado1(evt): void{
        this.pagina1 = evt.pageIndex + 1;
        this.dataPaginate1 = this.paginate(this.dataSource1, 15, this.pagina1);
    }

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado2(evt): void{
        this.pagina2 = evt.pageIndex + 1;
        this.dataPaginate2 = this.paginate(this.dataSource2, 15, this.pagina2);
    }

    getidInmuebles(){
        let metodo = 'getDireccionesInmueble';
        this.http.get(this.endpointActualiza + 'getInmuebles' + '?idPersona='+ this.idSociedad, this.httpOptions)
            .subscribe(
                (res: any) => {
                    console.log("AQUI ENTRO EL INMUEBLE!!!");
                    console.log(res);
                    
                    this.dataSource3 = res;
                    console.log(res.length);
                    console.log(this.dataSource3);
                    this.dataPaginate3 = this.paginate(this.dataSource3, 15, this.pagina3);
                    this.total3 = this.dataSource3.length; 
                    this.paginator.pageIndex = 0;
                    console.log("AQUI ENTRO EL RES WEE");
                    console.log(this.dataSource3);
                },
                (error) => {
                    this.loadingInmuebles = false;
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
     paginado3(evt): void{
        this.pagina3 = evt.pageIndex + 1;
        this.dataPaginate3 = this.paginate(this.dataSource3, 15, this.pagina3);
    }

    /**
     * Obtiene las representaciónes de la sociedad.
     */
     getRepresentacion(){
        this.loadingRepresentante = true;
        let queryRep = 'rep=Representantes&idPersona=' + this.idSociedad;
        this.http.get(this.endpointActualiza + 'getRepresentacionContribuyente?' + queryRep, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingRepresentante = false;
                    this.dataSource4 = res;
                    this.total4 = this.dataSource4.length;
                    this.dataPaginate4 = this.paginate(this.dataSource4, 15, this.pagina4);
                },
                (error) => {
                    this.loadingRepresentante = false;
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
     * Obtienen los representados de la sociedad.
     */
     getRepresentado(){
        this.loadingRepresentado = true;
        let queryRepdo = 'rep=Representado&idPersona=' + this.idSociedad;
        console.log(this.endpointActualiza + 'getRepresentacionContribuyente?' + queryRepdo);
        this.http.get(this.endpointActualiza + 'getRepresentacionContribuyente?' + queryRepdo, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingRepresentado = false;
                    this.dataSource5 = res;
                    console.log("ACA ENTRO EL REPRESENTADO");
                    console.log(res);
                    this.total5 = this.dataSource5.length;
                    this.dataPaginate5 = this.paginate(this.dataSource5, 15, this.pagina5);
                },
                (error) => {
                    this.loadingRepresentado = false;
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

    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataSource = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
     paginado4(evt): void{
        this.pagina4 = evt.pageIndex + 1;
        this.dataPaginate4 = this.paginate(this.dataSource4, 15, this.pagina4);
    }

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
     paginado5(evt): void{
        this.pagina5 = evt.pageIndex + 1;
        this.dataPaginate5 = this.paginate(this.dataSource5, 15, this.pagina5);
    }

    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    /**
     * Abre el dialogo que nos mostrará el historial de las representaciones.
     */
    historialRepresentacion(){
        let idContribuyente = this.route.snapshot.paramMap.get('idcontribuyente');
        const dialogRef = this.dialog.open(DialogHistorialComponent, {
            width: '700px',
            data: idContribuyente,
        });
        dialogRef.afterClosed().subscribe(result => {
        if(result){
            setTimeout (() => {
                
            }, 1000);
        }
        });
    }

    /**
   * @param idDireccion Valor que se enviará para la obtención de los movimientos sobre ese domicilio
   */
    viewHistoricoDomicilio(idDireccion): void {
        const dialogRef = this.dialog.open(DialogDomicilioHistoricoG, {
            width: '700px',
            data: {idDireccion},
        });
        dialogRef.afterClosed().subscribe(result => {
                
        });
    }
}
