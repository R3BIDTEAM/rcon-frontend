import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaPeritosComponent } from './consulta-peritos.component';

describe('ConsultaPeritosComponent', () => {
  let component: ConsultaPeritosComponent;
  let fixture: ComponentFixture<ConsultaPeritosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaPeritosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaPeritosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
