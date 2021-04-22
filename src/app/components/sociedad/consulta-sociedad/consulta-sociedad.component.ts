import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-consulta-sociedad',
    templateUrl: './consulta-sociedad.component.html',
    styleUrls: ['./consulta-sociedad.component.css']
})
export class ConsultaSociedadComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

    clean(): void{
        // this.busqueda = false;
        // this.resetPaginator();
    }
}
