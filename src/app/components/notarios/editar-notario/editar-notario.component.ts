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

export interface DatosNotario {
  no_notario: string;
  estado: string;
}

export interface DatosGenerales {
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  rfc: string;
  curp: string;
  ine: string;
  otro_documento: number;
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

export interface DataDomicilios {
  //idtipodireccion: number;
  //tipodireccion: string;
  idestado: number;
  estado: string;
  idmunicipio: number;
  municipio: string;
  ciudad: string;
  idtipoasentamiento: number;
  asentamiento: string;
  idtipovia: number;
  via: string;
  idtipolocalidad: number;
  localidad: string;
  cp: string;
  nexterior: string;
  entrecalle1: string;
  entrecalle2: string;
  andador: string;
  edificio: string;
  seccion: string;
  entrada: string;
  ninterior: string;
  telefono: string;
  adicional: string;
}

@Component({
  selector: 'app-editar-notario',
  templateUrl: './editar-notario.component.html',
  styleUrls: ['./editar-notario.component.css']
})
export class EditarNotarioComponent implements OnInit {
  endpoint = environment.endpoint + 'registro/getInfoNotario';
  endpointEstados = environment.endpoint + 'registro/';
  displayedColumns: string[] = ['nombre','registro', 'rfc'];
  pagina = 1;
  total = 0;
  pageSize = 15;
  loading = false;
  dataNotarioResultado;
  dataSource;
  dataPaginate;
  httpOptions;
  search = false;
  query;
  idNotario;
  datosNotario: DatosNotario = {} as DatosNotario;
  datosGenerales: DatosGenerales = {} as DatosGenerales;
  estados: Estados = {} as Estados;
  dataDomicilios: DataDomicilios[] = [];
  loadingEstados = false;
  loadingDatosNotario = false;
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: this.auth.getSession().token
        })
    };
    this.idNotario = this.route.snapshot.paramMap.get('idnotario');
    console.log(this.idNotario);
    this.getNotarioDatos();
    this.getDataEstados();
  }

  getDataEstados(): void {
    this.loadingEstados = true;
    this.http.post(this.endpointEstados + 'getEstados', '', this.httpOptions).subscribe(
      (res: any) => {
        this.loadingEstados = false;
        this.estados = res;
        console.log(this.estados);
      },
      (error) => {
        this.loadingEstados = false;
      }
    );
  }

  getNotarioDatos(){
      this.query = 'infoExtra=true&idPersona=' + this.idNotario; 
      this.loading = true;
      console.log(this.endpoint);
      this.http.post(this.endpoint + '?' + this.query, '', this.httpOptions)
          .subscribe(
              (res: any) => {
                  this.loading = false;
                  this.dataNotarioResultado = res.notario;
                  this.dataSource = res.direcciones;
                  // this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                  // this.total = this.dataPaginate.length; 
                  // this.paginator.pageIndex = 0;
                  console.log("AQUI ENTRO EL RES");
                  console.log(this.dataNotarioResultado);
                  this.datoDelNotario();
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

  datoDelNotario(){
      this.datosNotario.no_notario = this.dataNotarioResultado[0].NUMNOTARIO;
      this.datosNotario.estado = this.dataNotarioResultado[0].CODESTADO;
      this.datosGenerales.nombre  = this.dataNotarioResultado[0].NOMBRE;
      this.datosGenerales.apellido_paterno = this.dataNotarioResultado[0].APELLIDOPATERNO;
      this.datosGenerales.apellido_materno = this.dataNotarioResultado[0].APELLIDOMATERNO;
      this.datosGenerales.rfc = this.dataNotarioResultado[0].RFC;
      this.datosGenerales.curp = this.dataNotarioResultado[0].CURP;
      this.datosGenerales.ine = this.dataNotarioResultado[0].CLAVEIFE;
      this.datosGenerales.otro_documento = this.dataNotarioResultado[0].IDDOCIDENTIF;
      this.datosGenerales.numero_documento = this.dataNotarioResultado[0].VALDOCIDENTIF;
      this.datosGenerales.fecha_nacimiento = new Date(this.dataNotarioResultado[0].FECHANACIMIENTO);
      this.datosGenerales.fecha_defuncion = new Date(this.dataNotarioResultado[0].FECHADEFUNCION);
      this.datosGenerales.celular = this.dataNotarioResultado[0].CELULAR;
      this.datosGenerales.email = this.dataNotarioResultado[0].EMAIL;

      console.log(this.datosGenerales.fecha_nacimiento);
      
  }
  paginado(evt): void{
      this.pagina = evt.pageIndex + 1;
      this.dataSource = this.paginate(this.dataSource, this.pageSize, this.pagina);
  }

  paginate(array, page_size, page_number) {
      return array.slice((page_number - 1) * page_size, page_number * page_size);
  }


  actualizarDatosNotario(){
    let query = '';

    query = 'idPersona=' + this.idNotario;
    query = (this.datosNotario.no_notario) ? query + '&numNotario=' + this.datosNotario.no_notario : query + '&numNotario=';
    query = (this.datosNotario.estado) ? query + '&codEstado=' + this.datosNotario.estado : query + '&codEstado=';

    this.http.post(this.endpointEstados + 'actualizarNotario?' + query, '', this.httpOptions)
        .subscribe(
            (res: any) => {
                console.log(res);
                this.loadingDatosNotario = false;
                this.snackBar.open('Datos de Notario actualizados correctamente', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
            },
            (error) => {
                this.loadingDatosNotario = false;
                this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
            }
        );
  }

  actualizarDatosGenerales(){

  }


  addDomicilio(i = -1, dataDomicilio = null): void {
    const dialogRef = this.dialog.open(DialogDomiciliosNotario, {
      width: '700px',
      data: dataDomicilio,
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        if(i != -1){
          this.dataDomicilios[i] = result;
        }else{
          this.dataDomicilios.push(result);
        }
      }
    });
  }

  removeDomicilio(i){
		this.dataDomicilios.splice(i, 1);
	}


}


/////////////// DOMICILIOS ////////////////
@Component({
  selector: 'app-dialog-domicilios-notario',
  templateUrl: 'app-dialog-domicilios-notario.html',
  styleUrls: ['./editar-notario.component.css']
})
export class DialogDomiciliosNotario {
  endpointCatalogos = environment.endpoint + 'registro/';
  //loadingTiposDireccion = false;
  loadingEstados = false;
  loadingMunicipios = false;
  loadingTiposAsentamiento = false;
  loadingTiposVia = false;
  loadingTiposLocalidad = false;
  httpOptions;
  tiposDireccion;
  estados;
  municipios;
  tiposAsentamiento;
  tiposVia;
  tiposLocalidad;
  domicilioFormGroup: FormGroup;
  dataDomicilio: DataDomicilios = {} as DataDomicilios;

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogDomiciliosNotario>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
        dialogRef.disableClose = true;
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };

    this.getDataEstados();
    
    this.domicilioFormGroup = this._formBuilder.group({
        //idtipodireccion: ['', Validators.required],
        idestado: ['', Validators.required],
        municipio: [null, Validators.required],
        ciudad: [null, Validators.required],
        idtipoasentamiento: ['', Validators.required],
        asentamiento: [null, Validators.required],
        idtipovia: ['', Validators.required],
        via: [null, Validators.required],
        idtipolocalidad: ['', Validators.required],
        cp: [null],
        nexterior: [null, Validators.required],
        entrecalle1: [null],
        entrecalle2: [null],
        andador: [null],
        edificio: [null],
        seccion: [null],
        entrada: [null],
        ninterior: [null],
        telefono: [null],
        adicional: [null],
    });

    
    this.domicilioFormGroup.controls.idestado.valueChanges.subscribe(idestado => {
          if(idestado == 9) {
              this.domicilioFormGroup.removeControl('municipio');
              this.domicilioFormGroup.removeControl('ciudad');
              this.domicilioFormGroup.addControl('idmunicipio', new FormControl('', Validators.required));
          } else {
              this.domicilioFormGroup.removeControl('idmunicipio');
              this.domicilioFormGroup.addControl('municipio', new FormControl(null, Validators.required));
              this.domicilioFormGroup.addControl('ciudad', new FormControl(null, Validators.required));
          }
          this.domicilioFormGroup.updateValueAndValidity();
      });

      if(data){
          this.setDataDomicilio(data);
      }
    }

    /*getDataTiposDireccion(): void {
        this.loadingTiposDireccion = true;
        this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposDireccion = false;
                this.tiposDireccion = res;
            },
            (error) => {
                this.loadingTiposDireccion = false;
            }
        );
    }*/

    getDataEstados(): void {
        this.loadingEstados = true;
        this.http.post(this.endpointCatalogos + 'getEstados', '', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingEstados = false;
                this.estados = res;
            },
            (error) => {
                this.loadingEstados = false;
            }
        );
    }

    getDataMunicipios(event): void {
        this.loadingMunicipios = true;
        this.http.post(this.endpointCatalogos + 'getMunicipiosByEstado?codEstado=' + event.value, '', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingMunicipios = false;
                this.municipios = res;
            },
            (error) => {
                this.loadingMunicipios = false;
            }
        );
    }

    getDataTiposAsentamiento(): void {
        this.loadingTiposAsentamiento = true;
        this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposAsentamiento = false;
                this.tiposAsentamiento = res;
            },
            (error) => {
                this.loadingTiposAsentamiento = false;
            }
        );
    }

    getDataTiposVia(): void {
        this.loadingTiposVia = true;
        this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposVia = false;
                this.tiposVia = res;
            },
            (error) => {
                this.loadingTiposVia = false;
            }
        );
    }

    getDataTiposLocalidad(): void {
        this.loadingTiposLocalidad = true;
        this.http.get(this.endpointCatalogos, this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposLocalidad = false;
                this.tiposLocalidad = res;
            },
            (error) => {
                this.loadingTiposLocalidad = false;
            }
        );
    }

    getDataDomicilio(): DataDomicilios {
      //this.dataDomicilio.idtipodireccion = this.domicilioFormGroup.value.idtipodireccion;
      this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
      this.dataDomicilio.idtipoasentamiento = this.domicilioFormGroup.value.idtipoasentamiento;
      this.dataDomicilio.asentamiento = (this.domicilioFormGroup.value.asentamiento) ? this.domicilioFormGroup.value.asentamiento : null;
      this.dataDomicilio.idtipovia = this.domicilioFormGroup.value.idtipovia;
      this.dataDomicilio.via = (this.domicilioFormGroup.value.via) ? this.domicilioFormGroup.value.via : null;
      this.dataDomicilio.idtipolocalidad = this.domicilioFormGroup.value.idtipolocalidad;
      this.dataDomicilio.cp = (this.domicilioFormGroup.value.cp) ? this.domicilioFormGroup.value.cp : null;
      this.dataDomicilio.nexterior = (this.domicilioFormGroup.value.nexterior) ? this.domicilioFormGroup.value.nexterior : null;
      this.dataDomicilio.entrecalle1 = (this.domicilioFormGroup.value.entrecalle1) ? this.domicilioFormGroup.value.entrecalle1 : null;
      this.dataDomicilio.entrecalle2 = (this.domicilioFormGroup.value.entrecalle2) ? this.domicilioFormGroup.value.entrecalle2 : null;
      this.dataDomicilio.andador = (this.domicilioFormGroup.value.andador) ? this.domicilioFormGroup.value.andador : null;
      this.dataDomicilio.edificio = (this.domicilioFormGroup.value.edificio) ? this.domicilioFormGroup.value.edificio : null;
      this.dataDomicilio.seccion = (this.domicilioFormGroup.value.seccion) ? this.domicilioFormGroup.value.seccion : null;
      this.dataDomicilio.entrada = (this.domicilioFormGroup.value.entrada) ? this.domicilioFormGroup.value.entrada : null;
      this.dataDomicilio.ninterior = (this.domicilioFormGroup.value.ninterior) ? this.domicilioFormGroup.value.ninterior : null;
      this.dataDomicilio.telefono = (this.domicilioFormGroup.value.telefono) ? this.domicilioFormGroup.value.telefono : null;
      this.dataDomicilio.adicional = (this.domicilioFormGroup.value.adicional) ? this.domicilioFormGroup.value.adicional : null;
      
      if(this.domicilioFormGroup.value.idestado == 9){
          this.dataDomicilio.idmunicipio = this.domicilioFormGroup.value.idmunicipio;
      } else {
          this.dataDomicilio.municipio = (this.domicilioFormGroup.value.municipio) ? this.domicilioFormGroup.value.municipio : null;
          this.dataDomicilio.ciudad = (this.domicilioFormGroup.value.ciudad) ? this.domicilioFormGroup.value.ciudad : null;
      }

      return this.dataDomicilio;
    }

    setDataDomicilio(dataDomicilio): void {
      //this.domicilioFormGroup.controls['idtipodireccion'].setValue(dataDomicilio.idtipodireccion);
      this.domicilioFormGroup.controls['idestado'].setValue(dataDomicilio.idestado);
      this.getDataMunicipios({value: this.domicilioFormGroup.value.idestado});
      this.domicilioFormGroup.controls['idtipoasentamiento'].setValue(dataDomicilio.idtipoasentamiento);
      this.domicilioFormGroup.controls['asentamiento'].setValue(dataDomicilio.asentamiento);
      this.domicilioFormGroup.controls['idtipovia'].setValue(dataDomicilio.idtipovia);
      this.domicilioFormGroup.controls['via'].setValue(dataDomicilio.via);
      this.domicilioFormGroup.controls['idtipolocalidad'].setValue(dataDomicilio.idtipolocalidad);
      this.domicilioFormGroup.controls['cp'].setValue(dataDomicilio.cp);
      this.domicilioFormGroup.controls['nexterior'].setValue(dataDomicilio.nexterior);
      this.domicilioFormGroup.controls['entrecalle1'].setValue(dataDomicilio.entrecalle1);
      this.domicilioFormGroup.controls['entrecalle2'].setValue(dataDomicilio.entrecalle2);
      this.domicilioFormGroup.controls['andador'].setValue(dataDomicilio.andador);
      this.domicilioFormGroup.controls['edificio'].setValue(dataDomicilio.edificio);
      this.domicilioFormGroup.controls['seccion'].setValue(dataDomicilio.seccion);
      this.domicilioFormGroup.controls['entrada'].setValue(dataDomicilio.entrada);
      this.domicilioFormGroup.controls['ninterior'].setValue(dataDomicilio.ninterior);
      this.domicilioFormGroup.controls['telefono'].setValue(dataDomicilio.telefono);
      this.domicilioFormGroup.controls['adicional'].setValue(dataDomicilio.adicional);

      if(dataDomicilio.idestado == 9){
          this.domicilioFormGroup.controls['idmunicipio'].setValue(dataDomicilio.idmunicipio);
      } else {
          this.domicilioFormGroup.controls['municipio'].setValue(dataDomicilio.municipio);
          this.domicilioFormGroup.controls['ciudad'].setValue(dataDomicilio.ciudad);
      }
    }


}
