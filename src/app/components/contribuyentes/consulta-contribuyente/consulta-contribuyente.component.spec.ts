import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaContribuyenteComponent } from './consulta-contribuyente.component';

describe('ConsultaContribuyenteComponent', () => {
  let component: ConsultaContribuyenteComponent;
  let fixture: ComponentFixture<ConsultaContribuyenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaContribuyenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaContribuyenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
