import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

export interface DatosNotario {
  apepaterno: string;
  apematerno: string;
  nombre: string;
  rfc: string;
  curp: string;
  ine: string;
  idIden: number;
  identificacion: string;
  fecha_naci: Date;
  fecha_def: Date;
  celular: string;
  email: string;
  registro: string;
  independiente: boolean;
  fecha_alta: Date;
  fecha_baja: Date;
}

@Component({
  selector: 'app-editar-notario',
  templateUrl: './editar-notario.component.html',
  styleUrls: ['./editar-notario.component.css']
})
export class EditarNotarioComponent implements OnInit {
  endpoint = environment.endpoint + 'registro/getNotariosByDatosIdentificativos';
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
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private route: ActivatedRoute
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
    // this.getPeritoDatos();
  }

}
