import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltaSociedadComponent } from './alta-sociedad.component';

describe('AltaSociedadComponent', () => {
  let component: AltaSociedadComponent;
  let fixture: ComponentFixture<AltaSociedadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AltaSociedadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AltaSociedadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
