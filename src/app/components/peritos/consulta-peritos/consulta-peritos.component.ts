import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-consulta-peritos',
    templateUrl: './consulta-peritos.component.html',
    styleUrls: ['./consulta-peritos.component.css']
})
export class ConsultaPeritosComponent implements OnInit {

    displayedColumns: string[] = ['registro','nombre', 'datos', 'select'];
    pagina = 1;
    total = 0;
    pagesize = 15;

    constructor() { }

    ngOnInit(): void {
    }

    clean(): void{
        // this.busqueda = false;
        // this.resetPaginator();
    }

    paginado(evt): void{
        this.pagina = evt.pageIndex + 1;
    }
}
