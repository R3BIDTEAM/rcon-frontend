import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-alta-peritos',
    templateUrl: './alta-peritos.component.html',
    styleUrls: ['./alta-peritos.component.css']
})
export class AltaPeritosComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

    clean(): void{
        // this.busqueda = false;
        // this.resetPaginator();
    }
}
