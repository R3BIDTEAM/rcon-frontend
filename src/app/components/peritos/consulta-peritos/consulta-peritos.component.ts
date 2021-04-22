import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-consulta-peritos',
    templateUrl: './consulta-peritos.component.html',
    styleUrls: ['./consulta-peritos.component.css']
})
export class ConsultaPeritosComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

    clean(): void{
        // this.busqueda = false;
        // this.resetPaginator();
    }
}
