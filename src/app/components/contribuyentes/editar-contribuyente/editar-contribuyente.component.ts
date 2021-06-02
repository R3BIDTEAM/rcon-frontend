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

export interface DataRepresentacion {
  tipoPersona: string;
  nombre: string;
  nombre_moral: string;
  apaterno: string;
  amaterno: string;
  rfc: string;
  curp: string;
  ine: string;
  idDocIdent: number;
  docIdent: string;
  fechaNacimiento: Date;
  fechaDefuncion: Date;
  celular: string;
  email: string;
  actPreponderante: string;
  idTipoPersonaMoral: number;
  fechaInicioOperacion: Date;
  idMotivo: number;
  fechaCambio: Date;
  texto: string;
  fechaCaducidad: Date;
  // documentoRepresentacion: DataDocumentoRepresentacion;
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
  id_direccion: string;
}

@Component({
  selector: 'app-editar-contribuyente',
  templateUrl: './editar-contribuyente.component.html',
  styleUrls: ['./editar-contribuyente.component.css']
})

export class EditarContribuyenteComponent implements OnInit {
  endpoint = environment.endpoint + 'registro/';
  loading = false;
  loadingDocumentos = false;
  httpOptions;
  fisicaFormGroup: FormGroup;
  moralFormGroup: FormGroup;
  dataContribuyenteResultado;
  query;
  idContribuyente;
  panelDomicilio = false;
  dataRepresentantes: DataRepresentacion[] = [];
  dataRepresentados: DataRepresentacion[] = [];
  contribuyente: DataRepresentacion = {} as DataRepresentacion;
  dataDocumentos: DocumentosIdentificativos[] = [];
  dataDomicilios: DataDomicilio[] = [];
  dataDomicilioEspecifico: DataDomicilio[] = [];
  displayedColumnsDom: string[] = ['tipoDir','direccion', 'historial', 'editar'];
  loadingDomicilios = false;
  paginaDom = 1;
  totalDom = 0;
  pageSizeDom = 15;
  dataDomicilioResultado;
  dataSourceDom = [];
  dataPaginateDom;
  endpointActualiza = environment.endpoint + 'registro/';
  isIdentificativo;
  idInmueble;
  loadingDireccionEspecifica = false;

   /*Paginado*/
   dataSource1 = [];
   total1 = 0;
   pagina1= 1;
   dataPaginate1;
   /*Paginado*/

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private _formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: this.auth.getSession().token
      })
    };

    this.fisicaFormGroup = this._formBuilder.group({
      nombre: [null, [Validators.required]],
      apaterno: [null, [Validators.required]],
      amaterno: [null, []],
      rfc: [null, [Validators.required]],
      curp: [null, [Validators.required]],
      ine: [null, []],
      idDocIdent: ['', []],
      docIdent: [null, []],
      fechaNacimiento: [null, []],
      fechaDefuncion: [null, []],
      celular: [null, []],
      email: [null, []],
    });

    this.moralFormGroup = this._formBuilder.group({
      nombre_moral: [null, [Validators.required]],
      rfc: [null, [Validators.required]],
      actPreponderante: [null, []],
      idTipoPersonaMoral: ['', []],
      fechaInicioOperacion: [null, []],
      idMotivo: ['', []],
      fechaCambio: [null, []],
    });

    this.idContribuyente = this.route.snapshot.paramMap.get('idcontribuyente');
    this.getDataDocumentos();
    this.getContribuyenteDatos();
    this.getDomicilioContribuyente();
  }

  changeRequired(remove, add): void {
    this.fisicaFormGroup.controls[remove].setValue(null);
    this.fisicaFormGroup.controls[remove].clearValidators();
    this.fisicaFormGroup.controls[add].setValidators(Validators.required);
    this.fisicaFormGroup.markAsUntouched();
    this.fisicaFormGroup.updateValueAndValidity();
  }

  getDataDocumentos(): void{
    this.loadingDocumentos = true;
    this.http.post(this.endpoint + 'getCatalogos', '', this.httpOptions).subscribe(
      (res: any) => {
        this.loadingDocumentos = false;
        this.dataDocumentos = res.CatDocIdentificativos;
        console.log(this.dataDocumentos);
      },
      (error) => {
        this.loadingDocumentos = false;
      }
    );
  }

  getContribuyenteDatos(){
    this.query = '&idPersona=' + this.idContribuyente; 
    this.loading = true;
    console.log(this.endpoint);
    this.http.post(this.endpoint + 'getInfoContribuyente?' + this.query, '', this.httpOptions)
        .subscribe(
            (res: any) => {
                this.loading = false;
                this.dataContribuyenteResultado = res.contribuyente;
                console.log("AQUI ENTRO EL RES");
                console.log(this.dataContribuyenteResultado);
                this.datoDelContribuyente();
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

  datoDelContribuyente(){
    this.contribuyente.tipoPersona = this.dataContribuyenteResultado[0].CODTIPOPERSONA;
    this.contribuyente.nombre  = this.dataContribuyenteResultado[0].NOMBRE;
    this.contribuyente.nombre_moral  = this.dataContribuyenteResultado[0].APELLIDOPATERNO;
    this.contribuyente.apaterno = this.dataContribuyenteResultado[0].APELLIDOPATERNO;
    this.contribuyente.amaterno = this.dataContribuyenteResultado[0].APELLIDOMATERNO;
    this.contribuyente.rfc = this.dataContribuyenteResultado[0].RFC;
    this.contribuyente.curp = this.dataContribuyenteResultado[0].CURP;
    this.contribuyente.ine = this.dataContribuyenteResultado[0].CLAVEIFE;
    this.contribuyente.idDocIdent = this.dataContribuyenteResultado[0].IDDOCIDENTIF;
    this.contribuyente.docIdent = this.dataContribuyenteResultado[0].VALDOCIDENTIF;
    this.contribuyente.fechaNacimiento = new Date(this.dataContribuyenteResultado[0].FECHANACIMIENTO);
    this.contribuyente.fechaDefuncion = new Date(this.dataContribuyenteResultado[0].FECHADEFUNCION);
    this.contribuyente.celular = this.dataContribuyenteResultado[0].CELULAR;
    this.contribuyente.email = this.dataContribuyenteResultado[0].EMAIL;
    this.contribuyente.actPreponderante = this.dataContribuyenteResultado[0].ACTIVPRINCIP;
    this.contribuyente.idTipoPersonaMoral = this.dataContribuyenteResultado[0].IDTIPOMORAL;
    this.contribuyente.fechaInicioOperacion = new Date(this.dataContribuyenteResultado[0].FECHAINICIOACTIV);
    this.contribuyente.idMotivo = this.dataContribuyenteResultado[0].IDMOTIVOSMORAL;
    this.contribuyente.fechaCambio = new Date(this.dataContribuyenteResultado[0].FECHACAMBIOSITUACION);

    console.log(this.contribuyente.nombre_moral);
    
  }


  actualizarContribuyente(){
    //registro/actualizaContribuyente?codtipospersona=F&nombre=Jose Albert&activprincip&idtipomoral&idmotivosmoral&fechainicioactiv&fechacambiosituacion&rfc=RUFV891129R15&apellidopaterno=Hernandez&apellidomaterno=MESSIE&curp=PAGJ830626HMCLMN11&claveife=mmmmmm&iddocidentif=1&valdocidentif=888&fechanacimiento=02-02-1989&fechadefuncion=02-02-2020&celular=5555555&email=nuevo_mail@mail.com&idExpediente&idpersona=4485307
    console.log('Preparando actualización...');
    let query = '';
    this.loading = true;

    query = (this.contribuyente.tipoPersona) ? query + '&codtipospersona=' + this.contribuyente.tipoPersona : query + '&codtipospersona=';
    query = (this.contribuyente.nombre) ? query + '&nombre=' + this.contribuyente.nombre : query + '&nombre=';
    query = (this.contribuyente.idTipoPersonaMoral) ? query + '&idtipomoral=' + this.contribuyente.idTipoPersonaMoral : query + '&idtipomoral=';
    query = (this.contribuyente.idMotivo) ? query + '&idmotivosmoral=' + this.contribuyente.idMotivo : query + '&idmotivosmoral=';
    query = (this.contribuyente.fechaInicioOperacion) ? query + '&fechainicioactiv=' + moment(this.contribuyente.fechaInicioOperacion).format('DD-MM-YYYY') : query + '&fechainicioactiv=';
    query = (this.contribuyente.fechaCambio) ? query + '&fechacambiosituacion=' + moment(this.contribuyente.fechaCambio).format('DD-MM-YYYY') : query + '&fechacambiosituacion=';
    query = (this.contribuyente.rfc) ? query + '&rfc=' + this.contribuyente.rfc : query + '&rfc=';
    query = (this.contribuyente.apaterno) ? query + '&apellidopaterno=' + this.contribuyente.apaterno : query + '&apellidopaterno=';
    query = (this.contribuyente.amaterno) ? query + '&apellidomaterno=' + this.contribuyente.amaterno : query + '&apellidomaterno=';
    query = (this.contribuyente.curp) ? query + '&curp=' + this.contribuyente.curp : query + '&curp=';
    query = (this.contribuyente.ine) ? query + '&claveife=' + this.contribuyente.ine : query + '&claveife=';
    query = (this.contribuyente.idDocIdent) ? query + '&iddocidentif=' + this.contribuyente.idDocIdent : query + '&iddocidentif=';
    query = (this.contribuyente.docIdent) ? query + '&valdocidentif=' + this.contribuyente.docIdent : query + '&valdocidentif=';
    query = (this.contribuyente.fechaNacimiento) ? query + '&fechanacimiento=' + moment(this.contribuyente.fechaNacimiento).format('DD-MM-YYYY') : query + '&fechanacimiento=';
    query = (this.contribuyente.fechaDefuncion) ? query + '&fechadefuncion=' + moment(this.contribuyente.fechaDefuncion).format('DD-MM-YYYY') : query + '&fechadefuncion=';
    query = (this.contribuyente.celular) ? query + '&celular=' + this.contribuyente.celular : query + '&celular=';
    query = (this.contribuyente.email) ? query + '&email=' + this.contribuyente.email : query + '&email=';
    query = (this.contribuyente.actPreponderante) ? query + '&activprincip=' + this.contribuyente.actPreponderante : query + '&activprincip=';
    query = (this.contribuyente.nombre_moral) ? query + '&apellidopaterno=' + this.contribuyente.nombre_moral : query + '&apellidopaterno=';
    query = query + '&idExpediente&idpersona='  + this.idContribuyente;

    this.http.post(this.endpoint + 'actualizaContribuyente' + '?' + query, '', this.httpOptions)
        .subscribe(
            (res: any) => {
                this.loading = false;
                console.log("CONTRIBUYENTE ACTUALIZADO");
                console.log(res);
                this.snackBar.open('guardado correcto', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
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


    getDomicilioContribuyente(){
        this.loadingDomicilios = true;
        let metodo = 'getDireccionesContribuyente';
        this.http.post(this.endpointActualiza + metodo + '?idPersona='+ this.idContribuyente, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    this.loadingDomicilios = false;

                    this.dataSource1 = res.filter(element => element.CODTIPOSDIRECCION !== "N");
                    // this.dataSource2 = res.filter(element => element.CODTIPOSDIRECCION === "N");
                    this.total1 = this.dataSource1.length;
                    // this.total2 = this.dataSource2.length;
                    this.dataPaginate1 = this.paginate(this.dataSource1, 15, this.pagina1);
                    // this.dataPaginate2 = this.paginate(this.dataSource2, 15, this.pagina2);
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

    getDireccionEspecifica(iddireccion){
        this.loadingDireccionEspecifica = true;
        let metodo = 'getDireccionById';
        this.http.post(this.endpointActualiza + metodo + '?idDireccion='+ iddireccion, '', this.httpOptions)
            .subscribe(
                (res: any) => {
                    // alert('entro');
                    this.loadingDireccionEspecifica = false;
                    this.dataDomicilioEspecifico = res;
                    this.editDomicilio(this.dataDomicilioEspecifico);
                    console.log('domicilio único encontrado');
                    console.log(this.dataDomicilioEspecifico);
                },
                (error) => {
                    this.loadingDireccionEspecifica = false;
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

    paginate(array, page_size, page_number) {
      return array.slice((page_number - 1) * page_size, page_number * page_size);
    }


    addDomicilio(i = -1, dataDomicilio = null): void {
      let codtiposdireccion = '';
      const dialogRef = this.dialog.open(DialogDomicilioContribuyente, {
          width: '700px',
          data: {dataDomicilio:dataDomicilio, idContribuyente: this.idContribuyente,
                  codtiposdireccion: codtiposdireccion
          },
      });
      dialogRef.afterClosed().subscribe(result => {
              this.getDomicilioContribuyente();
      });
    }

    editDomicilio(dataDomicilioEspecifico): void {
        let codtiposdireccion = '';
            const dialogRef = this.dialog.open(DialogDomicilioContribuyente, {
                width: '700px',
                data: {dataDomicilioEspecifico:dataDomicilioEspecifico, idContribuyente: this.idContribuyente},
            });
            dialogRef.afterClosed().subscribe(result => {
                    this.getDomicilioContribuyente();
            });
      }

}




///////////////DOMICILIO////////////////
@Component({
  selector: 'app-dialog-domicilio-contribuyente',
  templateUrl: 'app-dialog-domicilio-contribuyente.html',
  styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogDomicilioContribuyente {
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
  dataDomicilioEspecifico: DataDomicilio = {} as DataDomicilio;
  loadingDireccionEspecifica = false;
  iddomicilio;
  iddireccion;

  constructor(
      private auth: AuthService,
      private snackBar: MatSnackBar,
      private http: HttpClient,
      private _formBuilder: FormBuilder,
      public dialogRef: MatDialogRef<DialogDomicilioContribuyente>,
      public dialog: MatDialog,
      @Inject(MAT_DIALOG_DATA) public data: any) {
          console.log(data);
          dialogRef.disableClose = true;
          this.httpOptions = {
              headers: new HttpHeaders({
                  'Content-Type': 'application/json',
                  Authorization: this.auth.getSession().token
              })
          };

          this.iddireccion = data.dataDomicilioEspecifico;
          this.codtiposdireccion = data.codtiposdireccion;
          this.dataDomicilio = {} as DataDomicilio;
          this.dataDomicilioEspecifico = {} as DataDomicilio;
          this.getDataEstados();
          this.getDireccionEspecifica();
          
          this.domicilioFormGroup = this._formBuilder.group({
              //idtipodireccion: ['', Validators.required],
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
              id_direccion: [null]
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
  
        //   if(data){
        //       this.setDataDomicilio(data);
        //   }
        if(data){
            console.log(data.dataDomicilioEspecifico);
            console.log("recibimos data seteado1");
            //console.log(data.dataDomicilioEspecifico[0]);
            // this.domicilioFormGroup.controls['cp'].val('11111');
        }
          this.getDataTiposAsentamiento();
          this.getDataTiposVia();
          this.getDataTiposLocalidad();
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

  getDireccionEspecifica(){
    this.loadingDireccionEspecifica = true;
    let metodo = 'getDireccionById';
    this.http.post(this.endpointCatalogos + metodo + '?idDireccion='+ this.iddireccion, '', this.httpOptions)
        .subscribe(
            (res: any) => {
                this.loadingDireccionEspecifica = false;
                this.dataDomicilioEspecifico = res;
                this.setDataDomicilio(this.dataDomicilioEspecifico[0]);
                console.log('domicilio único encontrado');
                console.log(this.dataDomicilioEspecifico);
            },
            (error) => {
                this.loadingDireccionEspecifica = false;
                this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
            }
        );
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

      this.dataDomicilio.id_direccion = (this.domicilioFormGroup.value.id_direccion) ? this.domicilioFormGroup.value.id_direccion : null;
      
      if(this.domicilioFormGroup.value.idestado == 9){
          this.dataDomicilio.idmunicipio = this.domicilioFormGroup.value.idmunicipio;
          // alert(this.dataDomicilio.idmunicipio);
          //this.dataDomicilio.delegacion = this.domicilioFormGroup.value.delegacion;
      } else {
          this.dataDomicilio.idmunicipio2 = this.domicilioFormGroup.value.idmunicipio2;
          this.dataDomicilio.municipio = (this.domicilioFormGroup.value.municipio) ? this.domicilioFormGroup.value.municipio : null;
          this.dataDomicilio.ciudad = (this.domicilioFormGroup.value.ciudad) ? this.domicilioFormGroup.value.ciudad : null;
          this.dataDomicilio.idciudad = (this.domicilioFormGroup.value.idciudad) ? this.domicilioFormGroup.value.idciudad : null;
      }


          // alert(this.dataDomicilio.id_direccion);
          if(this.domicilioFormGroup.value.id_direccion == null){
              // alert('guardar');
               this.guardaDomicilio();
          } else{
              // alert('actualizar');
               this.actualizarDomicilio();
          }

     
  

      //console.log('AQUEI EL FORM VALID');
      // console.log(this.domicilioFormGroup);
      ///retu
  }
      
  guardaDomicilio(){
      
      let query = 'insertarDireccion?idPersona=' + this.data.idContribuyente;

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

  actualizarDomicilio(){
        
    let query = 'actualizarDireccion?idPersona=' + this.data.idContribuyente + '&idDireccion=' + this.iddireccion;

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
    
    console.log('Actualizacion de Direcciones...');
    console.log(query);
    
    //localhost:8000/api/v1/registro/actualizarDireccion?idPersona=4353312&idDireccion=3597172&codtiposvia=1&idvia=2568&via=ABRAHAM SANCHEZ&numeroexterior=21&entrecalle1&entrecalle2&andador&edificio&seccion&entrada&codtiposlocalidad=1&numerointerior=&codtiposasentamiento=9&idcolonia=8&codasentamiento=&colonia=DOCTORES&codigopostal=06720&codciudad&ciudad&iddelegacion=5&codmunicipio=15&delegacion=CUAUHTEMOC&telefono&codestado=9&codtiposdireccion=&indicacionesadicionales

    this.http.post(this.endpointCatalogos + query, '', this.httpOptions)
        .subscribe(
            // (res: any) => {
            //     console.log(res);
            //     if(res.length > 0){
            //         this.snackBar.open('Actualización exitosa', 'Cerrar', {
            //             duration: 10000,
            //             horizontalPosition: 'end',
            //             verticalPosition: 'top'
            //         });                        
            //     }else{
            //         this.snackBar.open('Ocurrio un error al Insertar la dirección, intente nuevemente', 'Cerrar', {
            //             duration: 10000,
            //             horizontalPosition: 'end',
            //             verticalPosition: 'top'
            //         });
            //     }
            // },
            // (error) => {
            // }
            (res: any) => {
                console.log("AQUI ACTUALIZO");
                console.log(res);
                this.snackBar.open('Actualización Correcta', 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
            },
            (error) => {
                this.snackBar.open(error.error.mensaje, 'Cerrar', {
                    duration: 10000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top'
                });
            }
        );
}

  setDataDomicilio(data): void {
    console.log("ACA EL COD DATA ESPE");
    console.log(data);
    // console.log("ACA EL COD ESTADO SETEADO"+data.dataDomicilioEspecifico.CODESTADO);
    //this.domicilioFormGroup.controls['idtipodireccion'].setValue(dataDomicilio.idtipodireccion);
   
    this.domicilioFormGroup.controls['idestado'].setValue(data.CODESTADO);
    this.getDataMunicipios({value: this.domicilioFormGroup.value.idestado});
    this.domicilioFormGroup.controls['codasentamiento'].setValue(data.IDCOLONIA);
    this.domicilioFormGroup.controls['idtipoasentamiento'].setValue(data.CODTIPOSASENTAMIENTO);
    this.domicilioFormGroup.controls['asentamiento'].setValue(data.COLONIA);
    this.domicilioFormGroup.controls['codtiposvia'].setValue(data.CODTIPOSVIA);
    this.domicilioFormGroup.controls['idtipovia'].setValue(data.IDVIA);
    this.domicilioFormGroup.controls['via'].setValue(data.VIA);
    this.domicilioFormGroup.controls['idtipolocalidad'].setValue(data.CODTIPOSLOCALIDAD);
    this.domicilioFormGroup.controls['cp'].setValue(data.CODIGOPOSTAL);
    this.domicilioFormGroup.controls['nexterior'].setValue(data.NUMEROEXTERIOR);
    this.domicilioFormGroup.controls['entrecalle1'].setValue(data.ENTRECALLE1);
    this.domicilioFormGroup.controls['entrecalle2'].setValue(data.ENTRECALLE2);
    this.domicilioFormGroup.controls['andador'].setValue(data.ANDADOR);
    this.domicilioFormGroup.controls['edificio'].setValue(data.EDIFICIO);
    this.domicilioFormGroup.controls['seccion'].setValue(data.SECCION);
    this.domicilioFormGroup.controls['entrada'].setValue(data.ENTRADA);
    this.domicilioFormGroup.controls['ninterior'].setValue(data.NUMEROINTERIOR);
    this.domicilioFormGroup.controls['telefono'].setValue(data.TELEFONO);
    this.domicilioFormGroup.controls['adicional'].setValue(data.INDICACIONESADICIONALES);
    this.domicilioFormGroup.controls['id_direccion'].setValue(data.IDDIRECCION);

    if(data.CODESTADO == 9){
        // alert('funciona');
        this.domicilioFormGroup.controls['idmunicipio'].setValue(data.IDDELEGACION);
    } else {
        this.domicilioFormGroup.controls['idmunicipio2'].setValue(data.CODMUNICIPIO);
        this.domicilioFormGroup.controls['municipio'].setValue(data.DELEGACION);
        this.domicilioFormGroup.controls['ciudad'].setValue(data.CIUDAD);
        this.domicilioFormGroup.controls['idciudad'].setValue(data.CODCIUDAD);
    }
  }

  getMunicipios(){
      this.dataDomicilio.idestado = this.domicilioFormGroup.value.idestado;
      const dialogRef = this.dialog.open(DialogMunicipiosContribuyente, {
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
      const dialogRef = this.dialog.open(DialogCiudadContribuyente, {
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
      const dialogRef = this.dialog.open(DialogAsentamientoContribuyente, {
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
      const dialogRef = this.dialog.open(DialogViaContribuyente, {
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
  selector: 'app-dialog-municipios-contribuyente',
  templateUrl: 'app-dialog-municipios-contribuyente.html',
  styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogMunicipiosContribuyente {
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
      public dialogRef: MatDialogRef<DialogMunicipiosContribuyente>,
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
  selector: 'app-dialog-ciudad-contribuyente',
  templateUrl: 'app-dialog-ciudad-contribuyente.html',
  styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogCiudadContribuyente {
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
      public dialogRef: MatDialogRef<DialogCiudadContribuyente>,
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
  selector: 'app-dialog-asentamiento-contribuyente',
  templateUrl: 'app-dialog-asentamiento-contribuyente.html',
  styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogAsentamientoContribuyente {
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
      public dialogRef: MatDialogRef<DialogAsentamientoContribuyente>,
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
  selector: 'app-dialog-via-contribuyente',
  templateUrl: 'app-dialog-via-contribuyente.html',
  styleUrls: ['./editar-contribuyente.component.css']
})
export class DialogViaContribuyente {
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
      public dialogRef: MatDialogRef<DialogViaContribuyente>,
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
