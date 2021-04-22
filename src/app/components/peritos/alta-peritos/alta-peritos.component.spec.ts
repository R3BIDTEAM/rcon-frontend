import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltaPeritosComponent } from './alta-peritos.component';

describe('AltaPeritosComponent', () => {
  let component: AltaPeritosComponent;
  let fixture: ComponentFixture<AltaPeritosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AltaPeritosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AltaPeritosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
