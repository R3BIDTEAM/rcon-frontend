import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '@serv/auth.service';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { ExcelService } from '@serv/excel.service';
import { DialogCargaComponent } from '@comp/dialog-carga/dialog-carga.component';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-reporte',
	templateUrl: './reporte.component.html',
	styleUrls: ['./reporte.component.css']
})
export class ReporteComponent implements OnInit {
	endpoint = environment.endpoint + 'registro/';
	loadingResponse = false;
	httpOptions;
  	reporteFormGroup: FormGroup;
	queryParamFiltros;
	idUsuario;
	loading;
	dataSource;
	search = true;
	downloading;
    rol;
    botonDisabled = false;
    isRequired = true;

	constructor(
		private auth: AuthService,
		private http: HttpClient,
        private spinner: NgxSpinnerService,
		private _formBuilder: FormBuilder,
		private snackBar: MatSnackBar,
		public dialog: MatDialog,
		private excelService: ExcelService
	) {
        this.reporteFormGroup = this._formBuilder.group({
			fechaInicio: [null, [Validators.required]],
            fechaFin: [null, [Validators.required]],
			usuario: [null, []]
		});
     }

	ngOnInit(): void {
		this.httpOptions = {
			headers: new HttpHeaders({
			  'Content-Type': 'application/json',
			  Authorization: this.auth.getSession().token
			})
		};

        this.rol = this.auth.getSession().userData.rol_nombre;
        if(this.rol == 'SUPERVISOR RCON' || this.rol == 'Administrador'){
            this.botonDisabled = true;
            //this.isRequired = true;

        }else{
            this.botonDisabled = false;
            //this.isRequired = false;
        }
        // this.reporteFormGroup.updateValueAndValidity();
        // this.reporteFormGroup.markAsTouched();
        
	}

    minDate2 = '';
    maxDate2 = '';
    maxDate = new Date((new Date().getTime()));

    fechaTope2(){
        this.reporteFormGroup.controls['fechaFin'].setValue(null);
        this.minDate2 = moment(this.reporteFormGroup.controls['fechaInicio'].value).add(1, 'd').format('YYYY-MM-DD');
        this.maxDate2 = moment(this.reporteFormGroup.controls['fechaInicio'].value).add(2, 'd').format('YYYY-MM-DD');
    }

	/**
     * Limpia los campos del formulario.
     */
	clean(){
        this.reporteFormGroup.controls['fechaInicio'].setValue(null);
        this.reporteFormGroup.controls['fechaFin'].setValue(null);
        if(this.rol == 'SUPERVISOR RCON' || this.rol == 'Administrador'){
            this.reporteFormGroup.controls['usuario'].setValue(null);
        }
		this.idUsuario = null;
    }

	/**
     * Abre el dialogo para realizar la b??squeda de un contribuyente existente.
     */
	openDialogUsuario(){
        const dialogRef = this.dialog.open(DialogBuscaUsuario, {
            width: '700px',
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.reporteFormGroup.controls['usuario'].setValue(result.usuario);
				this.idUsuario = result.idusuario
            }
        });
    }

	getReporte(){
        this.spinner.show();
		let query = '';
        let busquedaDatos = 'getCambiosContribuyenteGen';
		
		if(this.reporteFormGroup.value.fechaInicio && this.reporteFormGroup.value.fechaFin){
			query = query + 'fecha_ini=' + moment(this.reporteFormGroup.value.fechaInicio).format('YYYY-MM-DD') + '&fecha_fin='+ moment(this.reporteFormGroup.value.fechaFin).format('YYYY-MM-DD');
		}
		
        if(this.rol !== 'SUPERVISOR RCON' && this.rol !== 'Administrador'){
            this.idUsuario = this.auth.getSession().userData.id_usuario;
        }

		if(this.idUsuario){
            query = query  + '&id_usuario=' + this.idUsuario;
		}

		const dialogRef = this.dialog.open(DialogCargaComponent, {
			width: '800px',
		});
		this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loading = false;
                    dialogRef.close();
                    if(!res.mensaje){
                        this.dataSource = res;

                        this.downloadInforme();
                    }else{
                        Swal.fire(
                            {
                              title: 'SIN RESULTADO',
                              text: res.mensaje,
                              icon: 'warning',
                              confirmButtonText: 'Cerrar'
                            }
                        );
                    }
                },
                (error) => {
                    this.spinner.hide();
                    this.loading = false;
					dialogRef.close();
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

	downloadInforme(): void {
		this.downloading = true;
        let head = [['NUM', 'FECHA', 'CUENTA', 'CAMPO MODIFICADO', 'VALOR ANTERIOR', 'VALOR DESP??ES', 'USUARIO', '??REA', 'SUB??REA', 'OBSERVACI??N']];
		// let tipo = '';
        // let head = null;
        // if(this.rol == 'SUPERVISOR RCON' || this.rol == 'Administrador'){
        //     head = [['NUM', 'FECHA', 'CUENTA', 'CAMPO MODIFICADO', 'VALOR ANTERIOR', 'VALOR DESP??ES', 'USUARIO', '??REA', 'SUB??REA', 'OBSERVACI??N']];
        //     tipo = 'A';

        // }else{
        //     head = [['NUM', 'FECHA', 'CUENTA', 'CAMPO MODIFICADO', 'VALOR ANTERIOR', 'VALOR DESP??ES']];
        //     tipo = 'E';

        // }
		let data = [];
        this.dataSource.forEach(element => data.push([element.numero, element.fecha_de_cambio, element.cuenta, element.campo_modificado, element.valor_antes, element.valor_despues, element.nombre_de_usuario, element.area, element.subarea, element.observacion]));
        		
		
		// switch(tipo) {
		// 	case 'E': {
		// 		this.dataSource.forEach(element => data.push([element.numero, element.fecha_de_cambio, element.cuenta, element.campo_modificado, element.valor_antes, element.valor_despues]));

		// 		break;
		// 	}
        //     case 'A': {
		// 		this.dataSource.forEach(element => data.push([element.numero, element.fecha_de_cambio, element.cuenta, element.campo_modificado, element.valor_antes, element.valor_despues, element.nombre_de_usuario, element.area, element.subarea, element.observacion]));

		// 		break;
		// 	}
		// default: {
		// 	this.dataSource.forEach(element => data.push([element.numero, element.fecha_de_cambio, element.cuenta, element.campo_modificado, element.valor_antes, element.valor_despues]));
		// 	break; 
		//    } 
		// }

		let fechasR = moment(this.reporteFormGroup.value.fechaInicio).format('YYYY-MM-DD') + '_' + moment(this.reporteFormGroup.value.fechaFin).format('YYYY-MM-DD');
		this.excelService.exportAsExcelFile(head[0], data, 'Rep_Mov_' + fechasR);
	
		this.downloading = false;
	}
}


/////////////////////////////////////////////// DIALOG USUARIO ////////////////////////////////////////////
export interface DatosUsuario {
    idusuario: number;
	usuario: string;
}

@Component({
    selector: 'app-dialog-reporte',
    templateUrl: 'app-dialog-reporte.html',
    styleUrls: ['./reporte.component.css']
})
export class DialogBuscaUsuario {
    endpoint = environment.ssoEndpoint + 'usuarios';
    httpOptions;
    personaFormGroup: FormGroup;
	dataSource = [];
    datoPeritoPersona: DatosUsuario = {} as DatosUsuario;
    @ViewChild('paginator') paginator: MatPaginator;
    loadingDocumentos;
	search = false;
    displayedColumns: string[] = ['nombre', 'datos', 'login', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    loading = false;
	dataPaginate;
	btnDisabled = true;

    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        private spinner: NgxSpinnerService,
        public dialogRef: MatDialogRef<DialogBuscaUsuario>,
        @Inject(MAT_DIALOG_DATA) public data: any){
            dialogRef.disableClose = true;
            this.httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: this.auth.getSession().token
                })
            };
        }

    ngOnInit(): void {
        
        this.personaFormGroup = this._formBuilder.group({
            nombre: ['', [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]],
            rfc: [null, []],
            usuario: ['', [Validators.pattern("^\\S{1}.{1,248}\\S{1}$")]]
        });
        
    }

	/**
     * Valida que exista un dato para activar el b??ton de b??squeda.
     */
	validateSearchBuscaP(){
        this.search = (
            this.personaFormGroup.value.nombre ||
            this.personaFormGroup.value.rfc ||
            this.personaFormGroup.value.usuario
        ) ? true : false;
    }

	/**
     * Reinicia los valores del paginado.
     */
	cleanBusca(): void{
        this.personaFormGroup.controls['nombre'].setValue(null);
        this.personaFormGroup.controls['rfc'].setValue(null);
        this.personaFormGroup.controls['usuario'].setValue(null);
        this.pagina = 1;
        this.total = 0;
        this.dataSource = [];
        this.loading = false;
        this.dataPaginate;
        this.btnDisabled = true;
    }

	/**
     * Obtiene el o los registros de los contribuyentes existentes.
     */
	getUsuario(){
        this.spinner.show();
        let query = 'page=1';
        let busquedaDatos = '';

        if(this.personaFormGroup.value.rfc){
            query = query + '&rfc=' + this.personaFormGroup.value.rfc.toLocaleUpperCase();
        }
		if(this.personaFormGroup.value.nombre){
            query = query + '&name=' + this.personaFormGroup.value.nombre.toLocaleUpperCase();
        }
        if(this.personaFormGroup.value.usuario){
            query = query + '&login=' + this.personaFormGroup.value.usuario.toLocaleUpperCase();
        }

		//?page=1&rfc=PERM820418S81&login=PERM820418&name=MARIO FERNANDO PEREZ SALINAS

        this.loading = true;
        this.http.get(this.endpoint + busquedaDatos + '?' + query, this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.spinner.hide();
                    this.loading = false;
                    this.dataSource = res.data;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;

                },
                (error) => {
                    Swal.fire(
                        {
                          title: 'SIN RESULTADO',
                          text: error.error.mensaje,
                          icon: 'error',
                          confirmButtonText: 'Cerrar'
                        }
                    );
                    this.spinner.hide();
                    this.loading = false;
                }
            );
    }

    /**
     * M??todo del paginado que nos dira la posici??n del paginado y los datos a mostrar
     * @param evt Nos da la referencia de la pagina en la que se encuentra
     */
    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
        this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    }
    
    /**
     * Regresa la posici??n del paginado de acuerdo a los par??metro enviados
     * @param array Contiene el arreglo con los datos que se pintaran en la tabla.
     * @param page_size Valor de la cantidad de registros que se pintaran por p??gina.
     * @param page_number Valor de la p??gina en la cual se encuentra el paginado.
     * @returns 
     */
    paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    /**
     * Obtiene y almacena los fato del perito seleccionado, la cual se mostrar?? en el formulario.
     * @param element Arreglo de los datos del perito seleccionado
     */
    usuarioSelected(element){

        this.datoPeritoPersona.idusuario = element.idusuario;
        this.datoPeritoPersona.usuario = element.login;

		this.btnDisabled = false;

        // var x = document.getElementById("BotonBorrar");
        // var b = document.getElementById("BotonBuscar");
        // if (x.style.display === "none") {
        //     x.style.display = "block";
        // } else {
        //     x.style.display = "none";
        // }

        // b.style.display = "none";
    }
}
