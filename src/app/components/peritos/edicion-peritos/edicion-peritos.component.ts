import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-edicion-peritos',
    templateUrl: './edicion-peritos.component.html',
    styleUrls: ['./edicion-peritos.component.css']
})
export class EdicionPeritosComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

    clean(): void{
        // this.busqueda = false;
        // this.resetPaginator();
    }
}
