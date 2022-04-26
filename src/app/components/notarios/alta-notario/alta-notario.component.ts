import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '@serv/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import * as moment from 'moment';
import { DialogDuplicadosComponent } from '@comp/dialog-duplicados/dialog-duplicados.component';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

export interface Filtros {
    no_notario: string;
    estado: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    rfc: string;
    curp: string;
    ine: string;
    otro_documento: string;
    numero_documento: string;
    fecha_nacimiento: Date;
    fecha_defuncion: Date;
    celular: string;
    email: string;
}

export interface Estados{
    idestado: number;
    estado: string;
}

export interface DocumentosIdentificativos{
    id_documento: number;
    documento: string;
}


@Component({
    selector: 'app-alta-notario',
    templateUrl: './alta-notario.component.html',
    styleUrls: ['./alta-notario.component.css']
})

export class AltaNotarioComponent implements OnInit {
    endpoint = environment.endpoint + 'registro/';
    notarioFormGroup: FormGroup;    
    idestadoNg = '9';
    httpOptions;
    filtros: Filtros = {} as Filtros;
    estados: Estados[] = [];
    documentos: DocumentosIdentificativos[] = [];
    loading = false;
    loadingEstados = false;
    loadingDocumentosIdentificativos = false;
    btnDisabled = true;
    selectDisabled = false;
    selectCedula = false;
    selectPasaporte = false;
    selectLicencia = false;
    selectNSS = false;
    isRequired = true;

    constructor(
        private http: HttpClient,
        private auth: AuthService,
        private _formBuilder: FormBuilder,
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
        private spinner: NgxSpinnerService,
    ) { }

    ngOnInit(): void {
        this.httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: this.auth.getSession().token
        })  
        };

        this.notarioFormGroup = this._formBuilder.group({
            no_notario: ['', [Validators.pattern("^\\S{1,6}")]],
            estado: [null, []],
            apellido_paterno: ['', [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            apellido_materno: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            nombre: ['', [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            rfc: [null, []],
            curp: [null, []],
            ine: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            otro_documento: [null, []],
            numero_documento: [null, []],
            fecha_nacimiento: [null, []],
            fecha_defuncion: [null, []],
            celular: [null, [Validators.pattern("^\\w+(\\s+\\w+)*$")]],
            email: ['', [Validators.email, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
        });    

        this.getDataEstados();
        this.getDataDocumentosIdentificativos();
        
    }

    // minDate = '2021-06-06';
    minDate = '';

    fechaTope(){
        // alert(moment(this.filtros.fecha_nacimiento).add(2, 'd').format('YYYY-MM-DD'));
        this.filtros.fecha_defuncion = null;
        this.minDate = moment(this.filtros.fecha_nacimiento).add(2, 'd').format('YYYY-MM-DD');
    }

    /**
     * De acuerdo al campo seleccionado será requerido el RFC, el CURP o ambos.
     */
     changeRequired(): void {
        if(!this.filtros.rfc && !this.filtros.curp){​​​​​​​​
            this.isRequired = true;
        }​​​​​​​​ else {​​​​​​​​
            this.isRequired = false;
        }​​​​​​​​

        this.notarioFormGroup.markAsTouched();
        this.notarioFormGroup.updateValueAndValidity();
    }

    clean(){
        this.filtros.no_notario = null;
        this.filtros.estado = null;
        this.filtros.nombre = null;
        this.filtros.apellido_paterno = null;
        this.filtros.apellido_materno = null;
        this.filtros.rfc = null;
        this.filtros.curp = null;
        this.filtros.ine = null;
        this.filtros.otro_documento = null;
        this.filtros.numero_documento = null;
        this.filtros.fecha_nacimiento = null;
        this.filtros.fecha_defuncion = null;
        this.filtros.email = null;
        this.filtros.celular = null;
        this.btnDisabled = true;
        this.selectDisabled = false;
        this.selectCedula = false;
        this.selectPasaporte = false;
        this.selectLicencia = false;
        this.selectNSS = false;
    }

    /** 
    * Obtiene el nombre de los Estados para llenar el el Select de Estados
    */
    getDataEstados(): void {
        this.spinner.show();
        this.loadingEstados = true;
        this.http.get(this.endpoint + 'getEstados', this.httpOptions).subscribe(
        (res: any) => {
            this.spinner.hide();
            this.loadingEstados = false;
            this.estados = res;
            // console.log(this.estados);
        },
        (error) => {
            this.spinner.hide();
            this.loadingEstados = false;
        }
        );
    }

    /**
     *  Si se selecciona alguna opción desbloqueará el input del número del documento.
     * @param event Valor del option
     */
    seleccionaDocto(event){
        this.selectDisabled = true;
        this.selectCedula = false;
        this.selectPasaporte = false;
        this.selectLicencia = false;
        this.selectNSS = false;

        

        if(this.filtros.otro_documento === '1'){
            this.selectCedula = true;
        }

        if(this.filtros.otro_documento === '2'){
            this.selectPasaporte = true;
        }

        if(this.filtros.otro_documento === '3'){
            this.selectLicencia = true;
        }

        if(this.filtros.otro_documento === '6'){
            this.selectNSS = true;
        }
    }

    /** 
    * Obtiene los Documentos Identificativos para llenar el Select de Documentos Identificativos
    */
    getDataDocumentosIdentificativos(): void{
        this.spinner.show();
        this.loadingDocumentosIdentificativos = true;
        this.http.get(this.endpoint + 'getCatalogos', this.httpOptions).subscribe(
        (res: any) => {
            this.spinner.hide();
            this.loadingDocumentosIdentificativos = false;
            this.documentos = res.CatDocIdentificativos;
            // console.log(this.documentos);
        },
        (error) => {
            this.spinner.hide();
            this.loadingDocumentosIdentificativos = false;
        }
        );
    }

    /** 
    * Realiza la búsqueda de un notario con los datos que se ingresaron en el modal de búsqueda
    */
    searchNotario(): void {
        const dialogRef = this.dialog.open(DialogBuscarNotarioAlta, {
        width: '700px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(this.filtros.otro_documento !== null){
                this.selectDisabled = true;
            }
            this.filtros.no_notario = result.no_notario;
            this.filtros.estado = result.estado;
            this.filtros.nombre = result.nombre;
            this.filtros.apellido_paterno = result.apellido_paterno;
            this.filtros.apellido_materno = result.apellido_materno;
            this.filtros.rfc = result.rfc;
            this.filtros.curp = result.curp;
            this.filtros.ine = result.ine;
            this.filtros.otro_documento = result.otro_documento;
            this.filtros.numero_documento = result.numero_documento;
            this.filtros.fecha_nacimiento = (result.fecha_nacimiento) ? new Date(result.fecha_nacimiento) : null;
            this.filtros.fecha_defuncion = (result.fecha_defuncion) ? new Date(result.fecha_defuncion) : null;
            this.filtros.celular = result.celular;
            this.filtros.email = result.email;
            this.changeRequired();
        });
    }

    /** 
    * Consulta que se realiza antes de realizar el alta de un notario para verificar si éste ya existe en base de datos
    */
    consulta_previa(){
        this.spinner.show();
        let query = '';
        let busquedaDatos = 'getContribuyentesSimilares';

        //query = (this.filtros.nombre) ? query + 'nombre=' + this.filtros.nombre  + '&filtroNombre=' : query +  'nombre=&filtroNombre=';
        query = query + 'nombre=&filtroNombre=';

        //query = (this.filtros.apellido_paterno) ? query + '&apellidoPaterno=' + this.filtros.apellido_paterno : query + '&apellidoPaterno=';
        query = query + '&apellidopaterno=&filtroApellidoPaterno=';

        //query = (this.filtros.apellido_materno) ? query + '&apellidoMaterno=' + this.filtros.apellido_materno : query + '&apellidoMaterno=';
        query = query + '&apellidomaterno=&filtroApellidoMaterno=';

        query = (this.filtros.curp) ? query + '&curp=' + this.filtros.curp : query + '&curp=';

        query = (this.filtros.rfc) ? query + '&rfc=' + this.filtros.rfc : query + '&rfc=';

        query = (this.filtros.ine) ? query + '&claveife=' + this.filtros.ine : query + '&claveife=';

        query = query + '&actividadPrincip=';

        console.log(this.endpoint + busquedaDatos + '?' + query);
        this.loading = true;
        this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loading = false;
                    console.log(res);
                    console.log("CON");
                    if(res.length > 0){
                        this.validaDialog(res);
                    }else{
                        this.guardarNotario();
                    }
                },
                (error) => {
                    this.spinner.hide();
                    this.loading = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'error',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );
    }//NO SE USA

    /**
    * @param res Es el json que regresa la respuesta una vez guardado el dato
    */
    validaDialog(res){
        const dialogRef = this.dialog.open(DialogDuplicadosComponent, {
            width: '850px',
            data: {
                dataSource: res,
                bandeja: 2
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log(result);
                this.guardarNotario();
            }
        });
    }//NO SE USA

    /** 
    * Guarda la información del Notario que se está dando de alta
    */
    guardarNotario(){
        this.spinner.show();
        let query = 'idPersona';
        this.loading = true;

        //registro/insertarNotario?numNotario=666&codEstado=9&nombre=Omar Donchai&apellidoPaterno=Vidal&apellidoMaterno=Perez&rfc=VIP900629MG5&curp&ife=PLGMJN83062615H500&iddocIdentif=1&valdocIdentif&fechaNacimiento&fechaDefuncion&email=ividal@mail.com&celular&codtiposPersona=F&persona

        query = (this.filtros.no_notario) ? query + '&numNotario=' + this.filtros.no_notario : query + '&numNotario=';
        query = (this.idestadoNg) ? query + '&codEstado=' + this.idestadoNg : query + '&codEstado=';
        query = (this.filtros.nombre) ? query + '&nombre=' + this.filtros.nombre.toLocaleUpperCase().trim() : query + '&nombre=';
        query = (this.filtros.apellido_paterno) ? query + '&apellidoPaterno=' + this.filtros.apellido_paterno.toLocaleUpperCase().trim() : query + '&apellidoPaterno=';
        query = (this.filtros.apellido_materno) ? query + '&apellidoMaterno=' + this.filtros.apellido_materno.toLocaleUpperCase().trim() : query + '&apellidoMaterno=';
        query = (this.filtros.rfc) ? query + '&rfc=' + this.filtros.rfc.toLocaleUpperCase().trim() : query + '&rfc=';
        query = (this.filtros.curp) ? query + '&curp=' + this.filtros.curp.toLocaleUpperCase().trim() : query + '&curp=';
        query = (this.filtros.ine) ? query + '&ife=' + this.filtros.ine.toLocaleUpperCase().trim() : query + '&ife=';
        query = (this.filtros.otro_documento) ? query + '&iddocIdentif=' + this.filtros.otro_documento : query + '&iddocIdentif=';
        query = (this.filtros.numero_documento) ? query + '&valdocIdentif=' + this.filtros.numero_documento.toLocaleUpperCase().trim() : query + '&valdocIdentif=';
        query = (this.filtros.fecha_nacimiento) ? query + '&fechaNacimiento=' + moment(this.filtros.fecha_nacimiento).format('DD-MM-YYYY') : query + '&fechaNacimiento=';
        query = (this.filtros.fecha_defuncion) ? query + '&fechaDefuncion=' + moment(this.filtros.fecha_defuncion).format('DD-MM-YYYY') : query + '&fechaDefuncion=';
        query = (this.filtros.email) ? query + '&email=' + this.filtros.email.trim() : query + '&email=';
        query = (this.filtros.celular) ? query + '&celular=' + this.filtros.celular.trim() : query + '&celular=';
        query = query + '&codtiposPersona=F&persona';
        console.log(query);
        //return;
        this.http.post(this.endpoint + 'insertarNotario' + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loading = false;
                    // console.log("NOTARIO GUARDADO");
                    // console.log(res);
                    if(res.original){
                        Swal.fire(
                            {
                              title: '¡ATENCIÓN!',
                              text: res.original.mensaje,
                              icon: 'error',
                              confirmButtonText: 'Cerrar'
                            }
                        );
                    }else{
                        Swal.fire(
                            {
                              title: 'CORRECTO',
                              text: "Notario Dado de Alta Correctamente",
                              icon: 'success',
                              confirmButtonText: 'Cerrar'
                            }
                        );
                        this.btnDisabled = false;
                    }
                },
                (error) => {
                    this.spinner.hide();
                    this.loading = false;
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'error',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                }
            );

    }


}


///////////////BUSCAR NOTARIO////////////////
export interface DataNotarioSeleccionado {
  no_notario: string;
  estado: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  rfc: string;
  curp: string;
  ine: string;
  otro_documento: string;
  numero_documento: string;
  fecha_nacimiento: string;
  fecha_defuncion: string;
  celular: string;
  email: string;
}

export interface DocumentosIdentificativos{
  id_documento: number;
  documento: string;
}


@Component({
  selector: 'app-dialog-buscar-notario-alta',
  templateUrl: 'app-dialog-buscar-notario-alta.html',
  styleUrls: ['./alta-notario.component.css']
})

export class DialogBuscarNotarioAlta {
  endpoint = environment.endpoint + 'registro/';
  displayedColumns: string[] = ['nombre','datos_identificativos','seleccionar'];
  pagina = 1;
  total = 0;
  pageSize = 5;
  loading = false;
  dataSource = [];
  dataPaginate = [];
  httpOptions;
  nombre;
  apellido_paterno;
  apellido_materno;
  rfc;
  curp;
  ine;
  otro_documento;
  numero_documento;
  search = false;
  selectDisabled = false;
  selectCedula = false;
  selectPasaporte = false;
  selectLicencia = false;
  selectNSS = false;
  isIdentificativo;
  notarioSeleccionado;
  dataNotarioSeleccionado: DataNotarioSeleccionado = {} as DataNotarioSeleccionado;
  // documentos: DocumentosIdentificativos = {} as DocumentosIdentificativos;
  documentos: DocumentosIdentificativos[] = [];
  loadingDocumentosIdentificativos = false;
  notPersonaFormGroup: FormGroup;
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private _formBuilder: FormBuilder,
  ) { }

    ngOnInit(): void {
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };
        this.getDataDocumentosIdentificativos();

        this.notPersonaFormGroup = this._formBuilder.group({
            no_notario: ['', [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            estado: [null, []],
            apellido_paterno: ['', [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            apellido_materno: [null, [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            nombre: ['', [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            rfc: [null, []],
            curp: [null, []],
            ine: [null, []],
            otro_documento: [null, []],
            numero_documento: [null, []],
            fecha_nacimiento: [null, []],
            fecha_defuncion: [null, []],
            celular: [null, [Validators.pattern("^\\w+(\\s+\\w+)*$")]],
            email: ['', [Validators.email, Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
        });
    }

    /** 
    * Obtiene los Documentos Identificativos para llenar el Select de Documentos Identificativos
    */
    getDataDocumentosIdentificativos(): void{
        this.spinner.show();
        this.loadingDocumentosIdentificativos = true;
        this.http.get(this.endpoint + 'getCatalogos', this.httpOptions).subscribe(
            (res: any) => {
                this.spinner.hide();
                this.loadingDocumentosIdentificativos = false;
                this.documentos = res.CatDocIdentificativos;
                // console.log(this.documentos);
            },
            (error) => {
                this.spinner.hide();
                this.loadingDocumentosIdentificativos = false;
            }
        );
    }


    /**
     *  Si se selecciona alguna opción desbloqueará el input del número del documento.
     * @param event Valor del option
     */
    seleccionaDoctoD(event){
        this.selectDisabled = true;
        this.selectCedula = false;
        this.selectPasaporte = false;
        this.selectLicencia = false;
        this.selectNSS = false;

        console.log("LO QUE SE SELECCIONO "+this.otro_documento);

        if(this.otro_documento === '1'){
            this.selectCedula = true;
        }

        if(this.otro_documento === '2'){
            this.selectPasaporte = true;
        }

        if(this.otro_documento === '3'){
            this.selectLicencia = true;
        }

        if(this.otro_documento === '6'){
            this.selectNSS = true;
        }
    }

    /** 
    * @param isIdentificativo Indica si la búsqueda se está realizando por Datos Identificativos o Personales
    */
    clearInputsIdentNoIdent(isIdentificativo): void {
        this.isIdentificativo = isIdentificativo;
        if(isIdentificativo){
            this.apellido_paterno = null;
            this.apellido_materno = null;
            this.nombre = null;
        } else {
            this.rfc = null;
            this.curp = null;
            this.ine = null;
            this.otro_documento = null;
            this.dataNotarioSeleccionado.numero_documento = null;
        }
    }

    clean(): void{
        this.pagina = 1;
        this.total = 0;
        this.dataSource = [];
        this.loading = false;
        this.dataPaginate;
        this.nombre = '';
        this.apellido_paterno = '';
        this.apellido_materno = '';
        this.rfc = '';
        this.curp = '';
        this.ine = '';
        this.otro_documento = '';
        this.dataNotarioSeleccionado.numero_documento = '';
        this.search = false;
        this.dataNotarioSeleccionado = {} as DataNotarioSeleccionado;
    }

    /** 
    * Verifica que haya campos llenos para habilitar el botón de búsqueda
    */
    validateSearch(){
        console.log("ACA EL NUMERO");
        console.log(this.dataNotarioSeleccionado.numero_documento);
        this.search = (
                this.apellido_paterno ||
                this.apellido_materno ||
                this.nombre ||
                this.rfc ||
                this.curp ||
                this.ine ||
                this.otro_documento ||
                this.dataNotarioSeleccionado.numero_documento
            ) ? true : false;
    }

    /** 
    * Obtiene la información una vez llenados los filtros y realizado la búsqueda
    */
    getData(): void {
        this.spinner.show();
        let query = '';
        let busquedaDatos = '';
        this.notarioSeleccionado = false;

        if(this.nombre){
            query = query + '&nombre=' + this.nombre + '&filtroNombre=0';
        }
        if(this.apellido_paterno){
            query = query + '&apellidoPaterno=' + this.apellido_paterno + '&filtroApellidoPaterno=0';
        }
        if(this.apellido_materno){
            query = query + '&apellidoMaterno=' + this.apellido_materno + '&filtroApellidoMaterno=0';
        }
        if(this.rfc){
            query = query + '&rfc=' + this.rfc.toLocaleUpperCase();
        }
        if(this.curp){
            query = query + '&curp=' + this.curp;
        }
        if(this.ine){
            query = query + '&ine=' + this.ine;
        }
        if(this.otro_documento && this.dataNotarioSeleccionado.numero_documento){
            query = query + '&iddocidentif=' + this.otro_documento + '&valdocidentif=' + this.dataNotarioSeleccionado.numero_documento;
        }

        

        if( this.isIdentificativo ){
            //busquedaDatos = busquedaDatos + 'getNotariosByDatosIdentificativos';
            busquedaDatos = busquedaDatos + 'getIdentificativos';
        }else{
            //busquedaDatos = busquedaDatos + 'getNotariosByDatosPersonales';
            busquedaDatos = busquedaDatos + 'getContribuyenteFisico';
        }

        query = query.substr(1);

        this.loading = true;
            // console.log(this.endpoint + busquedaDatos + '?' + query);
            this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
                .subscribe(
                    (res: any) => {
                        this.spinner.hide();
                        this.loading = false;
                        this.dataSource = res;
                        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                        this.total = this.dataSource.length; 
                        this.paginator.pageIndex = 0;
                        console.log(this.dataSource);
                    },
                    (error) => {
                        this.spinner.hide();
                        this.loading = false;
                        Swal.fire(
                            {
                              title: 'SIN RESULTADO',
                              text: error.error.mensaje,
                              icon: 'error',
                              confirmButtonText: 'Cerrar'
                            }
                        );
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

    /** 
    * @param element es el idPersona del notario seleccionado, el cual al ser seleccionado vacía la información de éste en el formulario de inserción
    */
    RegistroSelect(element) {
        this.dataNotarioSeleccionado.no_notario = element.NUMNOTARIO;
        this.dataNotarioSeleccionado.estado = element.CODESTADO;
        this.dataNotarioSeleccionado.nombre = element.NOMBRE;
        this.dataNotarioSeleccionado.apellido_paterno = element.APELLIDOPATERNO;
        this.dataNotarioSeleccionado.apellido_materno = element.APELLIDOMATERNO;
        this.dataNotarioSeleccionado.rfc = element.RFC;
        this.dataNotarioSeleccionado.curp = element.CURP;
        this.dataNotarioSeleccionado.ine = element.CLAVEIFE;
        this.dataNotarioSeleccionado.otro_documento = element.IDDOCIDENTIF;
        this.dataNotarioSeleccionado.numero_documento = element.VALDOCIDENTIF;
        this.dataNotarioSeleccionado.fecha_nacimiento = element.FECHANACIMIENTO;
        this.dataNotarioSeleccionado.fecha_defuncion = element.FECHADEFUNCION;
        this.dataNotarioSeleccionado.celular = element.CELULAR;
        this.dataNotarioSeleccionado.email = element.EMAIL;
        // console.log(this.dataNotarioSeleccionado.email);
    }

}

