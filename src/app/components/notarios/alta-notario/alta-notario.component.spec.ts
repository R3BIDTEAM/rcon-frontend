import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltaNotarioComponent } from './alta-notario.component';

describe('AltaNotarioComponent', () => {
  let component: AltaNotarioComponent;
  let fixture: ComponentFixture<AltaNotarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AltaNotarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AltaNotarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
