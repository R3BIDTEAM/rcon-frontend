import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicionSociedadComponent } from './edicion-sociedad.component';

describe('EdicionSociedadComponent', () => {
  let component: EdicionSociedadComponent;
  let fixture: ComponentFixture<EdicionSociedadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EdicionSociedadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EdicionSociedadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
