import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogHistorialComponent } from './dialog-historial.component';

describe('DialogHistorialComponent', () => {
  let component: DialogHistorialComponent;
  let fixture: ComponentFixture<DialogHistorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogHistorialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
