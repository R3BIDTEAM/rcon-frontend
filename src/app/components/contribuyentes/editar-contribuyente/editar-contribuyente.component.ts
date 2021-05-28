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
  // dataDomicilios: DataDomicilio[] = [];
  dataRepresentantes: DataRepresentacion[] = [];
  dataRepresentados: DataRepresentacion[] = [];
  contribuyente: DataRepresentacion = {} as DataRepresentacion;
  dataDocumentos: DocumentosIdentificativos[] = [];

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

}
