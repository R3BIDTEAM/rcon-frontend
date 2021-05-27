import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerContribuyenteComponent } from './ver-contribuyente.component';

describe('VerContribuyenteComponent', () => {
  let component: VerContribuyenteComponent;
  let fixture: ComponentFixture<VerContribuyenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerContribuyenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerContribuyenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
