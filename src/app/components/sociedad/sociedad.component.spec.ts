import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SociedadComponent } from './sociedad.component';

describe('SociedadComponent', () => {
  let component: SociedadComponent;
  let fixture: ComponentFixture<SociedadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SociedadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SociedadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
