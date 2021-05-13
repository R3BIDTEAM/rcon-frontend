import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPeritosComponent } from './editar-peritos.component';

describe('EditarPeritosComponent', () => {
  let component: EditarPeritosComponent;
  let fixture: ComponentFixture<EditarPeritosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarPeritosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarPeritosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
