import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarNotarioComponent } from './editar-notario.component';

describe('EditarNotarioComponent', () => {
  let component: EditarNotarioComponent;
  let fixture: ComponentFixture<EditarNotarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarNotarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarNotarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
