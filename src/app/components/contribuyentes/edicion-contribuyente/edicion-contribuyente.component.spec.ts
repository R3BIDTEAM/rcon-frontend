import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicionContribuyenteComponent } from './edicion-contribuyente.component';

describe('EdicionContribuyenteComponent', () => {
  let component: EdicionContribuyenteComponent;
  let fixture: ComponentFixture<EdicionContribuyenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EdicionContribuyenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EdicionContribuyenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
