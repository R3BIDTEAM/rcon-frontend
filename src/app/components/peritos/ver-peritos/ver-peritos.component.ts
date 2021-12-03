import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DialogHistorialComponent } from '@comp/dialog-historial/dialog-historial.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogDomicilioHistoricoG } from '@comp/dialog-historial/dialog-historial.component';

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
    independiente: boolean;
    fecha_alta: Date;
    fecha_baja: Date;
}

export interface DocumentosIdentificativos{
    id_documento: number;
    documento: string;
}

@Component({
    selector: 'app-ver-peritos',
    templateUrl: './ver-peritos.component.html',
    styleUrls: ['./ver-peritos.component.css']
})
export class VerPeritosComponent implements OnInit {

    endpoint = environment.endpoint + 'registro/getPerito';
    endpointActualiza = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['nombre','registro', 'rfc'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    loading = false;
    loadingRepresentante = false;
    loadingRepresentado = false;
    loadingDomicilios = false;
    loadingInmuebles = false;
    paginaDom = 1;
    totalDom = 0;
    pageSizeDom = 15;
    displayedColumnsDom: string[] = ['tipoDir','direccion', 'historial'];
    displayedColumnsInm: string[] = ['inmueble','direccion','domicilio','descripcion','sujeto'];
    displayedColumnsRepdo: string[] = ['representacion','texto','caducidad'];
    displayedColumnsDataRep: string[] = ['fechaCaducidad','texto','caducidad'];
    dataPeritoResultado;
    dataSource;
    dataPaginate;
    httpOptions;
    search = false;
    query;
    idPerito;
    datoPeritos: DatosPeritos = {} as DatosPeritos;
    @ViewChild('paginator') paginator: MatPaginator;
    loadingDocumentosIdentificativos = false;
    documentos: DocumentosIdentificativos[] = [];

    /*PAGINADOS*/
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
    /*PAGINADOS*/

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private auth: AuthService,
        public dialog: MatDialog,
        private route: ActivatedRoute
    ) { }

    /**
     * Valida la sesión del usuario y llama a los metodos necesarios para mostrar en la pantalla la información.
     */
    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: this.auth.getSession().token
            })
        };
        this.idPerito = this.route.snapshot.paramMap.get('idperito');
        console.log(this.idPerito);
        this.getPeritoDatos();
        this.getDataDocumentosIdentificativos();
        this.getDomicilioPerito();
        this.getRepresentacion();
        this.getRepresentado();
    }

    /** 
    * Obtiene los Documentos Identificativos para llenar el Select de Documentos Identificativos
    */
     getDataDocumentosIdentificativos(): void{
        this.loadingDocumentosIdentificativos = true;
        this.http.get(this.endpointActualiza + 'getCatalogos', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingDocumentosIdentificativos = false;
                this.documentos = res.CatDocIdentificativos;
            },
            (error) => {
                this.loadingDocumentosIdentificativos = false;
            }
        );
    }
    
    /**
     * Obtiene los datos del perito consultado.
     */
    getPeritoDatos(){
        this.query = 'obtenerSociedades=1&idPerito=' + this.idPerito; 
        this.loading = true;
        console.log(this.endpoint);
        this.http.get(this.endpoint + '?' + this.query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataPeritoResultado = res.dsPeritos[0];
                    this.dataSource = res.dsPeritos[0].Sociedades;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataPaginate.length; 
                    this.paginator.pageIndex = 0;
                    console.log("AQUI ENTRO EL RES");
                    console.log(this.dataSource);
                    this.datoDelPerito();
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
    * Obtiene los domicilios registrados del perito domicilios particulares y para recibir notificaciones.
    */
    getDomicilioPerito(){
    this.loadingDomicilios = true;
    let metodo = 'getDireccionesContribuyente';
    this.http.get(this.endpointActualiza + metodo + '?idPersona='+ this.idPerito, this.httpOptions)
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
                this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
            }
        );
    }

    getidInmuebles(){
        let metodo = 'getDireccionesInmueble';
        this.http.get(this.endpointActualiza + 'getInmuebles' + '?idPersona='+ this.idPerito, this.httpOptions)
            .subscribe(
                (res: any) => {
                    console.log("AQUI ENTRO EL INMUEBLE!!!");
                    console.log(res);
                    
                    this.dataSource3 = res;
                    console.log(res.length);
                    console.log(this.dataSource3);
                    this.dataPaginate3 = this.paginate(this.dataSource3, 15, this.paginaDom);
                    this.total = this.dataPaginate3.length; 
                    this.paginator.pageIndex = 0;
                    console.log("AQUI ENTRO EL RES WEE");
                    console.log(this.dataSource3);
                    // this.loadingInmuebles = false;
                    // console.log("AQUI ENTRO IDINMUEBLE!!!");
                    // console.log(res);
                    // //console.log(res[0].idinmueble);
                    // if(res.length > 0){
                    //     this.idInmueble = res[0].idinmueble;
                    // }else{
                    //     this.idInmueble = null;
                    // }
                    // this.getInmuebles();
                },
                (error) => {
                    this.loadingInmuebles = false;
                    this.snackBar.open(error.error.mensaje, 'Cerrar', {
                        duration: 10000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top'
                    });
                }
            );
    }

    /**
     * Almacena los valores recibidos de la consulta realizada.
     */
    datoDelPerito(){
        this.datoPeritos.apepaterno = this.dataPeritoResultado.APELLIDOPATERNO;
        this.datoPeritos.apematerno = this.dataPeritoResultado.APELLIDOMATERNO;
        this.datoPeritos.nombre  = this.dataPeritoResultado.NOMBRE;
        this.datoPeritos.rfc = this.dataPeritoResultado.RFC;
        this.datoPeritos.curp = this.dataPeritoResultado.CURP;
        this.datoPeritos.ine = this.dataPeritoResultado.CLAVEIFE;
        this.datoPeritos.identificacion = this.dataPeritoResultado.IDDOCIDENTIF;
        this.datoPeritos.idedato = this.dataPeritoResultado.VALDOCIDENTIF;
        this.datoPeritos.fecha_naci = (this.dataPeritoResultado.FECHANACIMIENTO) ? new Date(this.dataPeritoResultado.FECHANACIMIENTO) : null;
        this.datoPeritos.fecha_def = (this.dataPeritoResultado.FECHADEFUNCION) ? new Date(this.dataPeritoResultado.FECHADEFUNCION) : null;
        this.datoPeritos.celular = this.dataPeritoResultado.CELULAR;
        this.datoPeritos.email = this.dataPeritoResultado.EMAIL;
        this.datoPeritos.registro = this.dataPeritoResultado.REGISTRO;
        this.datoPeritos.fecha_alta = (new Date(this.dataPeritoResultado.FECHAALTA)) ? new Date(new Date(this.dataPeritoResultado.FECHAALTA)) : null;
        this.datoPeritos.fecha_baja = (this.dataPeritoResultado.FECHABAJA) ? new Date(this.dataPeritoResultado.FECHABAJA) : null;
        
        if(this.dataPeritoResultado.INDEPENDIENTE === 'S'){
            this.datoPeritos.independiente = true;
        }else{
            this.datoPeritos.independiente = false;
        }
    }

    /**
    * Obtiene las representaciónes de la sociedad.
    */
    getRepresentacion(){
    this.loadingRepresentante = true;
    let queryRep = 'rep=Representantes&idPersona=' + this.idPerito;
    this.http.get(this.endpointActualiza + 'getRepresentacionContribuyente?' + queryRep, this.httpOptions)
        .subscribe(
            (res: any) => {
                this.loadingRepresentante = false;
                this.dataSource4 = res;
                console.log("RES REPRESNTADO!!!!!!!!!");
                console.log(res);
                this.total4 = this.dataSource4.length;
                this.dataPaginate4 = this.paginate(this.dataSource4, 15, this.pagina4);
            },
            (error) => {
                this.loadingRepresentante = false;
                this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
            }
        );
    }

    /**
    * Obtienen los representados de la sociedad.
    */
    getRepresentado(){
    this.loadingRepresentado = true;
    let queryRepdo = 'rep=Representado&idPersona=' + this.idPerito;
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
        this.dataSource = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
     paginado1(evt): void{
        this.pagina1 = evt.pageIndex + 1;
        this.dataSource1 = this.paginate(this.dataSource1, 15, this.pagina1);
    }

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
     paginado2(evt): void{
        this.pagina2 = evt.pageIndex + 1;
        this.dataSource2 = this.paginate(this.dataSource2, 15, this.pagina2);
    }

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
     paginado3(evt): void{
        this.pagina3 = evt.pageIndex + 1;
        this.dataSource3 = this.paginate(this.dataSource3, 15, this.pagina3);
    }

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
     paginado4(evt): void{
        this.pagina4 = evt.pageIndex + 1;
        this.dataSource4 = this.paginate(this.dataSource4, 15, this.pagina4);
    }

    /**
     * Método del paginado que nos dira la posición del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
     paginado5(evt): void{
        this.pagina5 = evt.pageIndex + 1;
        this.dataSource5 = this.paginate(this.dataSource5, 15, this.pagina5);
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
