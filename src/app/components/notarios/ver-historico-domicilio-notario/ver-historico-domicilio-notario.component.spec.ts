import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerHistoricoDomicilioNotarioComponent } from './ver-historico-domicilio-notario.component';

describe('VerHistoricoDomicilioNotarioComponent', () => {
  let component: VerHistoricoDomicilioNotarioComponent;
  let fixture: ComponentFixture<VerHistoricoDomicilioNotarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerHistoricoDomicilioNotarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerHistoricoDomicilioNotarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
