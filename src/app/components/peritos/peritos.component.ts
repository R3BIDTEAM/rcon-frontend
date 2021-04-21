import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-peritos',
    templateUrl: './peritos.component.html',
    styleUrls: ['./peritos.component.css']
})
export class PeritosComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

    clean(): void{
        // this.busqueda = false;
        // this.resetPaginator();
    }
}
