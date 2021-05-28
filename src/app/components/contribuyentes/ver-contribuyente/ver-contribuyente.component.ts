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
  selector: 'app-ver-contribuyente',
  templateUrl: './ver-contribuyente.component.html',
  styleUrls: ['./ver-contribuyente.component.css']
})
export class VerContribuyenteComponent implements OnInit {
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

    this.fisicaFormGroup.controls['nombre'].disable();
    this.fisicaFormGroup.controls['apaterno'].disable();
    this.fisicaFormGroup.controls['amaterno'].disable();
    this.fisicaFormGroup.controls['rfc'].disable();
    this.fisicaFormGroup.controls['curp'].disable();
    this.fisicaFormGroup.controls['ine'].disable();
    this.fisicaFormGroup.controls['idDocIdent'].disable();
    this.fisicaFormGroup.controls['docIdent'].disable();
    this.fisicaFormGroup.controls['fechaNacimiento'].disable();
    this.fisicaFormGroup.controls['fechaDefuncion'].disable();
    this.fisicaFormGroup.controls['celular'].disable();
    this.fisicaFormGroup.controls['email'].disable();

    this.moralFormGroup = this._formBuilder.group({
      nombre_moral: [null, [Validators.required]],
      rfc: [null, [Validators.required]],
      actPreponderante: [null, []],
      idTipoPersonaMoral: ['', []],
      fechaInicioOperacion: [null, []],
      idMotivo: ['', []],
      fechaCambio: [null, []],
    });

    this.moralFormGroup.controls['nombre_moral'].disable();
    this.moralFormGroup.controls['rfc'].disable();
    this.moralFormGroup.controls['actPreponderante'].disable();
    this.moralFormGroup.controls['idTipoPersonaMoral'].disable();
    this.moralFormGroup.controls['fechaInicioOperacion'].disable();
    this.moralFormGroup.controls['idMotivo'].disable();
    this.moralFormGroup.controls['fechaCambio'].disable();

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

    console.log(this.contribuyente.tipoPersona);
    
  }


}
