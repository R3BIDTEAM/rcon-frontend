import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-sociedad',
    templateUrl: './sociedad.component.html',
    styleUrls: ['./sociedad.component.css']
})
export class SociedadComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

    clean(): void{
        // this.busqueda = false;
        // this.resetPaginator();
    }
}
