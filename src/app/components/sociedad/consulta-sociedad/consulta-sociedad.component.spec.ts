import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaSociedadComponent } from './consulta-sociedad.component';

describe('ConsultaSociedadComponent', () => {
  let component: ConsultaSociedadComponent;
  let fixture: ComponentFixture<ConsultaSociedadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaSociedadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaSociedadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
