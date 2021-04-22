import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-alta-sociedad',
    templateUrl: './alta-sociedad.component.html',
    styleUrls: ['./alta-sociedad.component.css']
})
export class AltaSociedadComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

    clean(): void{
        // this.busqueda = false;
        // this.resetPaginator();
    }
}
