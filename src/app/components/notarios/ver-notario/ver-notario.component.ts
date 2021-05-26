import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '@env/environment'
import { AuthService } from '@serv/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

export interface DatosNotario {
  no_notario: string;
  estado: string;
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

@Component({
  selector: 'app-ver-notario',
  templateUrl: './ver-notario.component.html',
  styleUrls: ['./ver-notario.component.css']
})
export class VerNotarioComponent implements OnInit {
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
  estados: Estados = {} as Estados;
  loadingEstados = false;
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
      this.datosNotario.nombre  = this.dataNotarioResultado[0].NOMBRE;
      this.datosNotario.apellido_paterno = this.dataNotarioResultado[0].APELLIDOPATERNO;
      this.datosNotario.apellido_materno = this.dataNotarioResultado[0].APELLIDOMATERNO;
      this.datosNotario.rfc = this.dataNotarioResultado[0].RFC;
      this.datosNotario.curp = this.dataNotarioResultado[0].CURP;
      this.datosNotario.ine = this.dataNotarioResultado[0].CLAVEIFE;
      this.datosNotario.otro_documento = this.dataNotarioResultado[0].IDDOCIDENTIF;
      this.datosNotario.numero_documento = this.dataNotarioResultado[0].VALDOCIDENTIF;
      this.datosNotario.fecha_nacimiento = new Date(this.dataNotarioResultado[0].FECHANACIMIENTO);
      this.datosNotario.fecha_defuncion = new Date(this.dataNotarioResultado[0].FECHADEFUNCION);
      this.datosNotario.celular = this.dataNotarioResultado[0].CELULAR;
      this.datosNotario.email = this.dataNotarioResultado[0].EMAIL;

      console.log(this.datosNotario.fecha_nacimiento);
      
      // if(this.dataNotarioResultado.INDEPENDIENTE === 'S'){
      //     this.datosNotario.independiente = true;
      // }else{
      //     this.datosNotario.independiente = false;
      // }
  }
  paginado(evt): void{
      this.pagina = evt.pageIndex + 1;
      this.dataSource = this.paginate(this.dataSource, this.pageSize, this.pagina);
  }

  paginate(array, page_size, page_number) {
      return array.slice((page_number - 1) * page_size, page_number * page_size);
  }

}
