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

export interface DireccionesNotario {
    tipo_via: string;
    id_via: string;
    via: string;
    no_exterior: string;
    no_interior: string;
    entre_calle_1: string;
    entre_calle_2: string;
    andador: string;
    edificio: string;
    seccion: string;
    entrada: string;
    tipo_localidad: string;
    tipo_asentamiento: string;
    id_colonia: string;
    asentamiento: string;
    colonia: string;
    codigo_postal: string;
    codigo_ciudad: string;
    ciudad: string;
    id_delegacion: string;
    codigo_municipio: string;
    delegacion: string;
    telefono: string;
    codigo_estado: string;
    codigo_tipo_direccion: string;
    indicaciones_adicionales: string;
}

export interface Estados{
  idestado: number;
  estado: string;
}

export interface DocumentosIdentificativos{
    id_documento: number;
    documento: string;
}

export interface DataDomicilio {
    codtiposdireccion: string;
    idestado: number;
    estado: string;
    idmunicipio: number;
    idmunicipio2: number;
    municipio: string;
    delegacion: string;
    idciudad: number;
    ciudad: string;
    codasentamiento: number;
    idtipoasentamiento: number;
    asentamiento: string;
    codtiposvia: number;
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
  pagina = 1;
  total = 0;
  pageSize = 10;
  loading = false;
  dataSource = [];
  dataPaginate = [];
  displayedColumnsDom: string[] = ['tipoDir','direccion', 'historial'];
  dataNotarioResultado;
  dataNotarioDireccionesResultado;
  httpOptions;
  search = false;
  query;
  idNotario;
  datosNotario: DatosNotario = {} as DatosNotario;
  datosGenerales: DatosGenerales = {} as DatosGenerales;
  direccionesNotario: DireccionesNotario = {} as DireccionesNotario;
  estados: Estados = {} as Estados;
  documentos: DocumentosIdentificativos = {} as DocumentosIdentificativos;
  dataDomicilio: DataDomicilio[] = [];
  loadingEstados = false;
  loadingDocumentosIdentificativos = false;
  loadingDatosNotario = false;
  loadingDatosGenerales = false;
  loadingDomicilios = false;

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
  /*PAGINADOS*/

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
    this.getNotarioDirecciones();
    this.getDataEstados();
    this.getDataDocumentosIdentificativos();
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

  getDataDocumentosIdentificativos(): void{
    this.loadingDocumentosIdentificativos = true;
    this.http.post(this.endpointEstados + 'getCatalogos', '', this.httpOptions).subscribe(
      (res: any) => {
        this.loadingDocumentosIdentificativos = false;
        this.documentos = res.CatDocIdentificativos;
        console.log(this.documentos);
      },
      (error) => {
        this.loadingDocumentosIdentificativos = false;
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
  


    getNotarioDirecciones(){
        this.loadingDomicilios = true;
        let metodo = 'getDireccionesContribuyente';
        this.http.post(this.endpointEstados + metodo + '?idPersona='+ this.idNotario, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDomicilios = false;

                    this.dataSource1 = res.filter(element => element.CODTIPOSDIRECCION !== "N");
                    this.dataSource2 = res.filter(element => element.CODTIPOSDIRECCION === "N");
                    this.total1 = this.dataSource1.length;
                    this.total2 = this.dataSource2.length;
                    this.dataPaginate1 = this.paginate(this.dataSource1, 15, this.pagina1);
                    this.dataPaginate2 = this.paginate(this.dataSource2, 15, this.pagina2);
                    console.log('entra');
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

    paginado1(evt): void{
        this.pagina1 = evt.pageIndex + 1;
        this.dataSource1 = this.paginate(this.dataSource1, 15, this.pagina1);
    }

    paginado2(evt): void{
        this.pagina2 = evt.pageIndex + 1;
        this.dataSource2 = this.paginate(this.dataSource2, 15, this.pagina2);
    }

    paginado3(evt): void{
        this.pagina3 = evt.pageIndex + 1;
        this.dataSource3 = this.paginate(this.dataSource3, 15, this.pagina3);
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
    let query = '';

    query = 'codtipospersona=F';
    query = (this.datosGenerales.nombre) ? query + '&nombre=' + this.datosGenerales.nombre : query + '&nombre=';
    query = query + '&activprincip&idtipomoral&idmotivosmoral&fechainicioactiv&fechacambiosituacion&idExpediente';
    query = (this.datosGenerales.rfc) ? query + '&rfc=' + this.datosGenerales.rfc : query + '&rfc=';
    query = (this.datosGenerales.apellido_paterno) ? query + '&apellidopaterno=' + this.datosGenerales.apellido_paterno : query + '&apellidopaterno=';
    query = (this.datosGenerales.apellido_materno) ? query + '&apellidomaterno=' + this.datosGenerales.apellido_materno : query + '&apellidomaterno=';
    query = (this.datosGenerales.curp) ? query + '&curp=' + this.datosGenerales.curp : query + '&curp=';
    query = (this.datosGenerales.ine) ? query + '&claveife=' + this.datosGenerales.ine : query + '&claveife=';
    query = (this.datosGenerales.otro_documento) ? query + '&iddocidentif=' + this.datosGenerales.otro_documento : query + '&iddocidentif=';
    query = (this.datosGenerales.numero_documento) ? query + '&valdocidentif=' + this.datosGenerales.numero_documento : query + '&valdocidentif=';
    query = (this.datosGenerales.fecha_nacimiento) ? query + '&fechanacimiento=' + moment(this.datosGenerales.fecha_nacimiento).format('DD-MM-YYYY') : query + '&fechanacimiento=';
    query = (this.datosGenerales.fecha_defuncion) ? query + '&fechadefuncion=' + moment(this.datosGenerales.fecha_defuncion).format('DD-MM-YYYY') : query + '&fechadefuncion=';
    query = (this.datosGenerales.celular) ? query + '&celular=' + this.datosGenerales.celular : query + '&celular=';
    query = (this.datosGenerales.email) ? query + '&email=' + this.datosGenerales.email : query + '&email=';
    query = query + '&idExpediente&idpersona=' + this.idNotario;

    this.http.post(this.endpointEstados + 'actualizaContribuyente?' + query, '', this.httpOptions)
        .subscribe(
            (res: any) => {
                console.log(res);
                this.loadingDatosGenerales = false;
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


  addDomicilio(i = -1, dataDomicilio = null): void {
    let codtiposdireccion = '';
        const dialogRef = this.dialog.open(DialogDomiciliosNotario, {
            width: '700px',
            data: {dataDomicilio:dataDomicilio, idNotario: this.idNotario,
                    codtiposdireccion: codtiposdireccion
            },
        });
        dialogRef.afterClosed().subscribe(result => {
                this.getNotarioDirecciones();
        });
  }

  removeDomicilio(i){
		this.dataDomicilio.splice(i, 1);
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
    optionCiudad;
    codtiposdireccion;
    idestadoNg
    idmunicipioNg
    idmunicipio2Ng
    municipioNg
    idciudadNg
    ciudadNg
    codasentamientoNg
    asentamientoNg
    idtipoasentamientoNg
    cpNg
    codtiposviaNg
    idtipoviaNg
    viaNg
    idtipolocalidadNg
    nexteriorNg
    entrecalle1Ng
    entrecalle2Ng
    andadorNg
    edificioNg
    seccionNg
    entradaNg
    ninteriorNg
    telefonoNg
    adicionalNg
    botonAsentamiento = true;
    botonCiudad = true;
    botonMunicipio = true;
    botonVia = true;
    buscaMunicipios;
    domicilioFormGroup: FormGroup;
    dataDomicilio: DataDomicilio = {} as DataDomicilio;

  constructor(
    private auth: AuthService,
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<DialogDomiciliosNotario>,
        public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) {
        dialogRef.disableClose = true;
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };

    this.codtiposdireccion = data.codtiposdireccion;
    this.dataDomicilio = {} as DataDomicilio
    this.getDataEstados();
    
        this.domicilioFormGroup = this._formBuilder.group({
            ///idtipodireccion: ['', Validators.required],
            idestado: ['', Validators.required],
            delegacion: [null],
            municipio: [null, Validators.required],
            idciudad: [null],
            ciudad: [null, Validators.required],
            codasentamiento: [null, Validators.required],
            asentamiento: [null, Validators.required],
            idtipoasentamiento: [null],
            codtiposvia: [null],
            idtipovia: ['', Validators.required],
            via: [null, Validators.required],
            idtipolocalidad: [null],
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
                this.domicilioFormGroup.removeControl('idciudad');
                this.domicilioFormGroup.removeControl('ciudad');
                this.domicilioFormGroup.addControl('idmunicipio', new FormControl('', Validators.required));
                this.domicilioFormGroup.removeControl('idmunicipio2');
            } else {
                this.domicilioFormGroup.removeControl('idmunicipio');
                this.domicilioFormGroup.addControl('municipio', new FormControl(null, Validators.required));
                this.domicilioFormGroup.addControl('idciudad', new FormControl(null, Validators.required));
                this.domicilioFormGroup.addControl('ciudad', new FormControl(null, Validators.required));
                this.domicilioFormGroup.addControl('idmunicipio2', new FormControl('', Validators.required));
            }
            this.domicilioFormGroup.updateValueAndValidity();
        });

        if(data){
            this.setDataDomicilio(data);
        }
        this.getDataTiposAsentamiento();
        this.getDataTiposVia();
        this.getDataTiposLocalidad();

    }

    getNombreDel(event): void {
        this.dataDomicilio.delegacion = event.source.triggerValue;
        this.botonAsentamiento = false;
    }

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
        this.botonMunicipio = false;
        let busquedaMunCol = '';
        busquedaMunCol = (event.value == 9) ? 'getDelegaciones' : 'getMunicipiosByEstado?codEstado=' + event.value;
        this.loadingMunicipios = true;
        this.http.post(this.endpointCatalogos + busquedaMunCol, '', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingMunicipios = false;
                this.municipios = res;
                console.log('GETDELEG');
                console.log(res);
            },
            (error) => {
                this.loadingMunicipios = false;
            }
        );
    }
    
    getDataTiposAsentamiento(): void {
        this.loadingTiposAsentamiento = true;
        this.http.post(this.endpointCatalogos + 'getTiposAsentamiento', '', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposAsentamiento = false;
                this.tiposAsentamiento = res;
                console.log('AQUI EL ASENTAMIENTO SELECT');
                console.log(this.tiposAsentamiento);
            },
            (error) => {
                this.loadingTiposAsentamiento = false;
            }
        );
    }
  
    getDataTiposVia(): void {
        this.loadingTiposVia = true;
        this.http.post(this.endpointCatalogos + 'getTiposVia', '', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposVia = false;
                this.tiposVia = res;
                console.log('AQUI EL TIPOS VIA SELECT');
                console.log(this.tiposVia);
                console.log(this.codtiposdireccion);
            },
            (error) => {
                this.loadingTiposVia = false;
            }
        );
    }
  
    getDataTiposLocalidad(): void {
        this.loadingTiposLocalidad = true;
        this.http.post(this.endpointCatalogos + 'getTiposLocalidad', '', this.httpOptions).subscribe(
            (res: any) => {
                this.loadingTiposLocalidad = false;
                this.tiposLocalidad = res;
                console.log('AQUI EL TIPOS LOCALIDAD');
                console.log(this.tiposLocalidad);
            },
            (error) => {
                this.loadingTiposLocalidad = false;
            }
        );
    }
  
    getDataDomicilio(): void {
        //this.dataDomicilio.idtipodireccion = this.domicilioFormGroup.value.idtipodireccion;
        this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
        this.dataDomicilio.codasentamiento = this.domicilioFormGroup.value.codasentamiento;
        this.dataDomicilio.idtipoasentamiento = this.domicilioFormGroup.value.idtipoasentamiento;
        this.dataDomicilio.asentamiento = (this.domicilioFormGroup.value.asentamiento) ? this.domicilioFormGroup.value.asentamiento : null;
        this.dataDomicilio.codtiposvia = (this.domicilioFormGroup.value.codtiposvia) ? this.domicilioFormGroup.value.codtiposvia : null;
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
            //this.dataDomicilio.delegacion = this.domicilioFormGroup.value.delegacion;
        } else {
            this.dataDomicilio.idmunicipio2 = this.domicilioFormGroup.value.idmunicipio2;
            this.dataDomicilio.municipio = (this.domicilioFormGroup.value.municipio) ? this.domicilioFormGroup.value.municipio : null;
            this.dataDomicilio.ciudad = (this.domicilioFormGroup.value.ciudad) ? this.domicilioFormGroup.value.ciudad : null;
            this.dataDomicilio.idciudad = (this.domicilioFormGroup.value.idciudad) ? this.domicilioFormGroup.value.idciudad : null;
        }
        this.guardaDomicilio();
        //console.log('AQUEI EL FORM VALID');
        // console.log(this.domicilioFormGroup);
        ///retu
    }
        
    guardaDomicilio(){
        
        let query = 'insertarDireccion?idPersona=' + this.data.idNotario;

        query = (this.dataDomicilio.codtiposvia) ? query + '&codtiposvia=' + this.dataDomicilio.codtiposvia : query + '&codtiposvia=';
        query = (this.dataDomicilio.idtipovia) ? query + '&idvia=' + this.dataDomicilio.idtipovia : query + '&idvia=';
        query = (this.dataDomicilio.via) ? query + '&via=' + this.dataDomicilio.via : query + '&via=';

        query = (this.dataDomicilio.nexterior) ? query + '&numeroexterior=' + this.dataDomicilio.nexterior : query + '&numeroexterior=';
        query = (this.dataDomicilio.entrecalle1) ? query + '&entrecalle1='  + this.dataDomicilio.entrecalle1 : query + '&entrecalle1';
        query = (this.dataDomicilio.entrecalle2) ? query + '&entrecalle2='  + this.dataDomicilio.entrecalle2 : query + '&entrecalle2';
        query = (this.dataDomicilio.andador) ? query + '&andador=' + this.dataDomicilio.andador : query + '&andador';
        query = (this.dataDomicilio.edificio) ? query + '&edificio=' + this.dataDomicilio.edificio : query + '&edificio';
        query = (this.dataDomicilio.seccion) ? query + '&seccion=' + this.dataDomicilio.seccion : query + '&seccion=';
        query = (this.dataDomicilio.entrada) ? query + '&entrada=' + this.dataDomicilio.entrada : query + '&entrada=';
        query = (this.dataDomicilio.idtipolocalidad) ? query + '&codtiposlocalidad=' + this.dataDomicilio.idtipolocalidad : query + '&codtiposlocalidad=';
        query = (this.dataDomicilio.idtipoasentamiento) ? query + '&codtiposasentamiento=' + this.dataDomicilio.idtipoasentamiento : query + '&codtiposasentamiento=';
        
        query = (this.dataDomicilio.codasentamiento) ? query + '&idcolonia=' + this.dataDomicilio.codasentamiento : query + '&idcolonia=';
        
        query = (this.dataDomicilio.codasentamiento) ? query + '&codasentamiento=' + this.dataDomicilio.codasentamiento : query + '&codasentamiento=';
        query = (this.dataDomicilio.asentamiento) ? query + '&colonia=' + this.dataDomicilio.asentamiento : query + '&colonia=';
        query = (this.dataDomicilio.cp) ? query + '&codigopostal=' + this.dataDomicilio.cp : query + '&codigopostal=';
        query = (this.dataDomicilio.idciudad) ? query + '&codciudad=' + this.dataDomicilio.idciudad : query + '&codciudad=';
        query = (this.dataDomicilio.ciudad) ? query + '&ciudad=' + this.dataDomicilio.ciudad : query + '&ciudad=';
        query = (this.dataDomicilio.idmunicipio) ? query + '&iddelegacion=' + this.dataDomicilio.idmunicipio : query + '&iddelegacion';
        query = (this.dataDomicilio.idmunicipio2) ? query + '&codmunicipio=' + this.dataDomicilio.idmunicipio2 : query + '&codmunicipio=';
        
        query = (this.dataDomicilio.idestado == 9) ? query + '&delegacion=' + this.dataDomicilio.delegacion : query + '&delegacion=' + this.dataDomicilio.municipio;
        
        query = (this.dataDomicilio.telefono) ? query + '&telefono=' + this.dataDomicilio.telefono : query + '&telefono=';
        query = (this.dataDomicilio.idestado) ? query + '&codestado=' + this.dataDomicilio.idestado : query + '&codestado=';
        query = (this.codtiposdireccion) ? query + '&codtiposdireccion=' + this.codtiposdireccion : query + '&codtiposdireccion=';
        query = (this.dataDomicilio.adicional) ? query + '&indicacionesadicionales=' + this.dataDomicilio.adicional : query + '&indicacionesadicionales=';
        query = (this.dataDomicilio.ninterior) ? query + '&numerointerior=' + this.dataDomicilio.ninterior : query + '&numerointerior=';
        
        console.log('EL SUPER QUERY!!!!!!');
        console.log(query);
        //insertarDireccion?idPersona=4485239&codtiposvia=1&idvia=686&via=DR LAVISTA&numeroexterior=144&entrecalle1&entrecalle2&andador&edificio&seccion&entrada
            //&codtiposlocalidad=1&codtiposasentamiento=9&idcolonia=8&codasentamiento=&colonia=DOCTORES&codigopostal=06720
            //&codciudad=&ciudad&iddelegacion=5&codmunicipio=15&delegacion=CUAUHTEMOC&telefono&codestado=9&codtiposdireccion=N&indicacionesadicionales&numerointerior=
        this.http.post(this.endpointCatalogos + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    console.log(res);
                    if(res.length > 0){
                        this.snackBar.open('Registro exitoso', 'Cerrar', {
                            duration: 10000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });                        
                    }else{
                        this.snackBar.open('Ocurrio un error al Insertar la dirección, intente nuevemente', 'Cerrar', {
                            duration: 10000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top'
                        });
                    }
                    //this.dialogRef.close();
                },
                (error) => {
                }
            );
    }
  
    setDataDomicilio(dataDomicilio): void {
        //this.domicilioFormGroup.controls['idtipodireccion'].setValue(dataDomicilio.idtipodireccion);
        this.domicilioFormGroup.controls['idestado'].setValue(dataDomicilio.idestado);
        this.getDataMunicipios({value: this.domicilioFormGroup.value.idestado});
        this.domicilioFormGroup.controls['codasentamiento'].setValue(dataDomicilio.codasentamiento);
        this.domicilioFormGroup.controls['idtipoasentamiento'].setValue(dataDomicilio.idtipoasentamiento);
        this.domicilioFormGroup.controls['asentamiento'].setValue(dataDomicilio.asentamiento);
        this.domicilioFormGroup.controls['codtiposvia'].setValue(dataDomicilio.codtiposvia);
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
            this.domicilioFormGroup.controls['idmunicipio2'].setValue(dataDomicilio.idmunicipio);
            this.domicilioFormGroup.controls['municipio'].setValue(dataDomicilio.municipio);
            this.domicilioFormGroup.controls['ciudad'].setValue(dataDomicilio.ciudad);
        }
    }

    getMunicipios(){
        this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
        const dialogRef = this.dialog.open(DialogMunicipiosNotario, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log("MUNICIPIOS!!!!!!!");
                console.log(result);
                this.domicilioFormGroup.controls['idmunicipio2'].setValue(result.codmunicipio);
                this.domicilioFormGroup.controls['municipio'].setValue(result.municipio);
                this.botonCiudad = false;
            }
        });
    }

    getCiudad(){
        this.dataDomicilio.idmunicipio2 = this.domicilioFormGroup.value.idmunicipio2;
        const dialogRef = this.dialog.open(DialogCiudadNotario, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado,
                    codMunicipio : this.dataDomicilio.idmunicipio2
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.botonAsentamiento = false;
                console.log("CIUDAD!!!!!!!");
                console.log(result);
                this.domicilioFormGroup.controls['idciudad'].setValue(result.codciudad);
                this.domicilioFormGroup.controls['ciudad'].setValue(result.ciudad);
            }
        });
    }

    getAsentamiento(){
        this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
        this.dataDomicilio.idmunicipio = this.domicilioFormGroup.value.idmunicipio;
        this.dataDomicilio.idmunicipio2 = this.domicilioFormGroup.value.idmunicipio2;
        this.dataDomicilio.idciudad = (this.domicilioFormGroup.value.idciudad) ? this.domicilioFormGroup.value.idciudad : null;
        const dialogRef = this.dialog.open(DialogAsentamientoNotario, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado,
                    codMunicipio : this.dataDomicilio.idmunicipio,
                    codMunicipio2 : this.dataDomicilio.idmunicipio2,
                    codCiudad : this.dataDomicilio.idciudad
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.botonVia = false;
                console.log("ASENTAMIENTO!!!!!!!");
                console.log(result);
                this.domicilioFormGroup.controls['codasentamiento'].setValue(result.codasentamiento);
                this.domicilioFormGroup.controls['asentamiento'].setValue(result.asentamiento);
                this.domicilioFormGroup.controls['idtipoasentamiento'].setValue(result.codtiposasentamiento);
                this.domicilioFormGroup.controls['cp'].setValue(result.codigopostal);
            }
        });
    }

    getVia(){
        this.dataDomicilio.codasentamiento =  this.domicilioFormGroup.value.codasentamiento;
        const dialogRef = this.dialog.open(DialogViaNotario, {
            width: '700px',
            data: {codEstado : this.dataDomicilio.idestado,
                    codAsentamiento : this.dataDomicilio.codasentamiento
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                console.log("VIA!!!!!!!");
                console.log(result);
                this.domicilioFormGroup.controls['codtiposvia'].setValue(result.codtiposvia);
                this.domicilioFormGroup.controls['idtipovia'].setValue(result.idvia);
                this.domicilioFormGroup.controls['via'].setValue(result.via);
            }
        });
    }


}




///////////////MUNICIPIOS//////////////////
export interface DataMunicipios{
    codmunicipio: number;
    codestado: number;
    municipio: string;
}
@Component({
    selector: 'app-dialog-municipios-notario',
    templateUrl: 'app-dialog-municipios-notario.html',
    styleUrls: ['./editar-notario.component.css']
})
export class DialogMunicipiosNotario {
    endpoint = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['coloniaAsentamiento', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    optionColonia;
    loadingBuscaMun = false;
    dataSource = [];
    dataPaginate;
    httpOptions;
    buscaMunicipios;
    dataMunicipios: DataMunicipios = {} as DataMunicipios;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogMunicipiosNotario>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        dialogRef.disableClose = true;
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };
        this.obtenerMunicipios();
        console.log(data);
    }

    cleanAsentamiento(){
        this.pagina = 1;
        this.total = 0;
        this.dataSource = [];
        this.loadingBuscaMun = false;
        this.dataPaginate;
        this.obtenerMunicipios();
    }

    obtenerMunicipios(){
        this.loadingBuscaMun = true;
        let criterio = '';
        let query = '';

        if(this.data.codEstado != 9){
            criterio = criterio + 'getMunicipiosByEstado';
            query = query + 'codEstado=' + this.data.codEstado;
        }else{
            criterio = '';
            query = '';
        }

        console.log('ASENTAMIENTOSSSS'+this.endpoint + '?' + query);
        this.loadingBuscaMun = true;
        this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingBuscaMun = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    console.log(this.dataSource);
                },
                (error) => {
                    this.loadingBuscaMun = false;
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

    selectMunicipios(element){
        console.log(element);
        this.dataMunicipios.codestado = element.CODESTADO;
        this.dataMunicipios.codmunicipio = element.CODMUNICIPIO;
        this.dataMunicipios.municipio = element.MUNICIPIO;
    }

    obtenerMunicipiosPorNombre(){
        this.loadingBuscaMun = true;
        let criterio = '';
        let query = '';
        console.log(this.buscaMunicipios);
        if(this.data.codEstado != 9){
            criterio = criterio + 'getMunicipiosByNombre';
            query = query + 'codEstado=' + this.data.codEstado + '&municipio=' + this.buscaMunicipios;
        }else{
            criterio = '';
            query = '';
        }

        console.log('ASENTAMIENTOSSSS'+this.endpoint + '?' + query);
        this.loadingBuscaMun = true;
        this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingBuscaMun = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    console.log(this.dataSource);
                },
                (error) => {
                    this.loadingBuscaMun = false;
                }
            );
    }
}

///////////////CIUDAD//////////////////
export interface DataCiudad{
    codciudad: number;
    codestado: number;
    ciudad: string;
}
@Component({
    selector: 'app-dialog-ciudad-notario',
    templateUrl: 'app-dialog-ciudad-notario.html',
    styleUrls: ['./editar-notario.component.css']
})
export class DialogCiudadNotario {
    endpoint = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['ciudad', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    optionColonia;
    loadingBuscaCiudad = false;
    dataSource = [];
    dataPaginate;
    httpOptions;
    buscaCiudad;
    dataCiudad: DataCiudad = {} as DataCiudad;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogCiudadNotario>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        dialogRef.disableClose = true;
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };
        this.obtenerCiudad();
        console.log(data);
    }

    cleanAsentamiento(){
        this.pagina = 1;
        this.total = 0;
        this.dataSource = [];
        this.loadingBuscaCiudad = false;
        this.dataPaginate;
        this.obtenerCiudad();
    }

    obtenerCiudad(){
        this.loadingBuscaCiudad = true;
        let criterio = '';
        let query = '';

        if(this.data.codEstado != 9){
            criterio = criterio + 'getCiudadesByNombre';
            query = query + 'codEstado=' + this.data.codEstado + '&codMunicipio=' + this.data.codMunicipio;
        }else{
            criterio = '';
            query = '';
        }

        if(this.buscaCiudad){
            query = query + '&nombre=' + this.buscaCiudad;
        }

        console.log('CIUDAD!!!!!'+this.endpoint + '?' + query);
        this.loadingBuscaCiudad = true;
        this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingBuscaCiudad = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    console.log(this.dataSource);
                },
                (error) => {
                    this.loadingBuscaCiudad = false;
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

    selectCiudad(element){
        console.log(element);
        this.dataCiudad.ciudad = element.CIUDAD;
        this.dataCiudad.codciudad = element.CODCIUDAD;
        this.dataCiudad.codestado = element.CODESTADO;
    }

    // obtenerAsentamientoPorNombre(){
    //     this.loadingBuscaCiudad = true;
    //     let criterio = '';
    //     let query = '';

    //     if(this.data.codEstado != 9){
    //         criterio = criterio + 'getMunicipiosByEstado';
    //         query = query + 'codEstado=' + this.data.codEstado;
    //     }else{
    //         criterio = '';
    //         query = '';
    //     }

    //     console.log('ASENTAMIENTOSSSS'+this.endpoint + '?' + query);
    //     this.loadingBuscaCiudad = true;
    //     this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
    //         .subscribe(
    //             (res: any) => {
    //                 this.loadingBuscaCiudad = false;
    //                 this.dataSource = res;
    //                 this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    //                 this.total = this.dataSource.length; 
    //                 this.paginator.pageIndex = 0;
    //                 console.log(this.dataSource);
    //             },
    //             (error) => {
    //                 this.loadingBuscaCiudad = false;
    //             }
    //         );
    // }
}

///////////////ASENTAMIENTO//////////////////
export interface DataAsentamiento{
    codasentamiento: string;
    asentamiento: string;
    codigopostal: string;
    codtiposasentamiento: string;
}
@Component({
    selector: 'app-dialog-asentamiento-notario',
    templateUrl: 'app-dialog-asentamiento-notario.html',
    styleUrls: ['./editar-notario.component.css']
})
export class DialogAsentamientoNotario {
    endpoint = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['coloniaAsentamiento', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    optionColonia;
    loading = false;
    dataSource = [];
    dataPaginate;
    httpOptions;
    buscaAsentamiento;
    dataAsentamiento: DataAsentamiento = {} as DataAsentamiento;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogAsentamientoNotario>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        dialogRef.disableClose = true;
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };
        this.obtenerAsentamiento();
        console.log(data);
    }

    cleanAsentamiento(){
        this.pagina = 1;
        this.total = 0;
        this.dataSource = [];
        this.loading = false;
        this.dataPaginate;
        this.obtenerAsentamiento();
    }

    obtenerAsentamiento(){
        this.loading = true;
        let criterio = '';
        let query = '';

        if(this.data.codEstado == 9){
            criterio = criterio + 'getColAsentByDelegacion';
            query = query + 'idDelegacion=' + this.data.codMunicipio;
        }else{
            criterio = criterio + 'getAsentamientoByEstado';
            query = 'codEstado=' + this.data.codEstado + '&codMunicipio=' + this.data.codMunicipio2;
            query = (this.data.codCiudad) ? query + '&codCiudad=' + this.data.codCiudad : query + '&codCiudad=';
        }

        if(this.buscaAsentamiento){
            query = query + '&nombre=' + this.buscaAsentamiento;
        }

        console.log('ASENTAMIENTOSSSS'+this.endpoint + '?' + query);
        this.loading = true;
        this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loading = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    console.log(this.dataSource);
                },
                (error) => {
                    this.loading = false;
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

    selectAsentamiento(element){
        console.log(element);
        if(element.IDDELEGACION){
            this.dataAsentamiento.codasentamiento = element.CODIGO;
            this.dataAsentamiento.asentamiento = element.DESCRIPCION;
            this.dataAsentamiento.codigopostal = element.CODIGOPOSTAL;
            this.dataAsentamiento.codtiposasentamiento = element.CODTIPOSASENTAMIENTO;
        }else{
            this.dataAsentamiento.codasentamiento = element.codasentamiento;
            this.dataAsentamiento.asentamiento = element.asentamiento;
            this.dataAsentamiento.codigopostal = element.codigopostal;
            this.dataAsentamiento.codtiposasentamiento = element.codtiposasentamiento;
        }
    }

    // obtenerAsentamientoPorNombre(){
    //     this.loading = true;
    //     let criterio = 'getAsentamientoByNombre';
    //     let query = '';
        
    //     query = 'nombre=' + this.buscaAsentamiento + '&codEstado=' + this.data.codEstado + '&codMunicipio=' + this.data.codMunicipio;

    //     query = (this.data.codCiudad) ? query + '&codCiudad=' + this.data.codCiudad : query + '&codCiudad=';

    //     console.log('ASENTAMIENTOSSSS'+this.endpoint + '?' + query);
    //     this.loading = true;
    //     this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
    //         .subscribe(
    //             (res: any) => {
    //                 this.loading = false;
    //                 this.dataSource = res;
    //                 this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
    //                 this.total = this.dataSource.length; 
    //                 this.paginator.pageIndex = 0;
    //                 console.log(this.dataSource);
    //             },
    //             (error) => {
    //                 this.loading = false;
    //             }
    //         );
    // }
}

///////////////VIA//////////////////
export interface dataVia{
    codtiposvia: number;
    idvia: number;
    via : string;
}
@Component({
    selector: 'app-dialog-via-notario',
    templateUrl: 'app-dialog-via-notario.html',
    styleUrls: ['./editar-notario.component.css']
})
export class DialogViaNotario {
    endpoint = environment.endpoint + 'registro/';
    displayedColumns: string[] = ['via', 'select'];
    pagina = 1;
    total = 0;
    pageSize = 15;
    optionVia;
    loadingBuscaVia = false;
    dataSource = [];
    dataPaginate;
    httpOptions;
    buscaVia;
    dataVia: dataVia = {} as dataVia;
    @ViewChild('paginator') paginator: MatPaginator;

    constructor(
        private auth: AuthService,
        private http: HttpClient,
        private _formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DialogViaNotario>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        dialogRef.disableClose = true;
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: this.auth.getSession().token
            })
        };
        this.obtenerVia();
        console.log(data);
    }

    cleanAsentamiento(){
        this.pagina = 1;
        this.total = 0;
        this.dataSource = [];
        this.loadingBuscaVia = false;
        this.dataPaginate;
        this.obtenerVia();
    }

    obtenerVia(){
        this.loadingBuscaVia = true;
        let criterio = 'getViasByIdColonia';
        let query = '';

        if(this.buscaVia){
            query = query + 'nombre=' + this.buscaVia;
        }else{
            query = query + 'nombre';
        }

        if(this.data.codEstado != 9){
            query = query + '&idColonia=' + this.data.codAsentamiento;
        }else{
            query = query + '&idColonia=' + this.data.codAsentamiento;
        }

        console.log('VIA!!!!!'+this.endpoint + '?' + query);
        this.loadingBuscaVia = true;
        this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingBuscaVia = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    console.log(this.dataSource);
                },
                (error) => {
                    this.loadingBuscaVia = false;
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

    selectVia(element){
        console.log(element);
        this.dataVia.codtiposvia = element.codtiposvia;
        this.dataVia.idvia = element.idvia;
        this.dataVia.via = element.via;
    }

    obtenerAsentamientoPorNombre(){
        this.loadingBuscaVia = true;
        let criterio = '';
        let query = '';

        if(this.data.codEstado != 9){
            criterio = criterio + 'getMunicipiosByEstado';
            query = query + 'codEstado=' + this.data.codEstado;
        }else{
            criterio = '';
            query = '';
        }

        console.log('ASENTAMIENTOSSSS'+this.endpoint + '?' + query);
        this.loadingBuscaVia = true;
        this.http.post(this.endpoint + criterio + '?' + query, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingBuscaVia = false;
                    this.dataSource = res;
                    this.dataPaginate = this.paginate(this.dataSource, this.pageSize, this.pagina);
                    this.total = this.dataSource.length; 
                    this.paginator.pageIndex = 0;
                    console.log(this.dataSource);
                },
                (error) => {
                    this.loadingBuscaVia = false;
                }
            );
    }
}