import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-edicion-sociedad',
    templateUrl: './edicion-sociedad.component.html',
    styleUrls: ['./edicion-sociedad.component.css']
})
export class EdicionSociedadComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

    clean(): void{
        // this.busqueda = false;
        // this.resetPaginator();
    }
}
