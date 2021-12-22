import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCargaComponent } from './dialog-carga.component';

describe('DialogCargaComponent', () => {
  let component: DialogCargaComponent;
  let fixture: ComponentFixture<DialogCargaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogCargaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogCargaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
