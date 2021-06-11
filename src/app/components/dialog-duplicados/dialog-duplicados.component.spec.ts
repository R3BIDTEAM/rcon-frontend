import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDuplicadosComponent } from './dialog-duplicados.component';

describe('DialogDuplicadosComponent', () => {
  let component: DialogDuplicadosComponent;
  let fixture: ComponentFixture<DialogDuplicadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDuplicadosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDuplicadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
