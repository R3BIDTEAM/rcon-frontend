import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarContribuyenteComponent } from './editar-contribuyente.component';

describe('EditarContribuyenteComponent', () => {
  let component: EditarContribuyenteComponent;
  let fixture: ComponentFixture<EditarContribuyenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarContribuyenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarContribuyenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
