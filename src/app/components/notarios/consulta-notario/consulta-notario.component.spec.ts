import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaNotarioComponent } from './consulta-notario.component';

describe('ConsultaNotarioComponent', () => {
  let component: ConsultaNotarioComponent;
  let fixture: ComponentFixture<ConsultaNotarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaNotarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaNotarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
