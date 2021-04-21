import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltaContribuyenteComponent } from './alta-contribuyente.component';

describe('AltaContribuyenteComponent', () => {
  let component: AltaContribuyenteComponent;
  let fixture: ComponentFixture<AltaContribuyenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AltaContribuyenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AltaContribuyenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
