import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditartContribuyenteComponent } from './editart-contribuyente.component';

describe('EditartContribuyenteComponent', () => {
  let component: EditartContribuyenteComponent;
  let fixture: ComponentFixture<EditartContribuyenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditartContribuyenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditartContribuyenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
