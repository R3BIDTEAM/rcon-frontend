import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerSociedadComponent } from './ver-sociedad.component';

describe('VerSociedadComponent', () => {
  let component: VerSociedadComponent;
  let fixture: ComponentFixture<VerSociedadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerSociedadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerSociedadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
