import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarSociedadComponent } from './editar-sociedad.component';

describe('EditarSociedadComponent', () => {
  let component: EditarSociedadComponent;
  let fixture: ComponentFixture<EditarSociedadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarSociedadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarSociedadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
