import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerNotarioComponent } from './ver-notario.component';

describe('VerNotarioComponent', () => {
  let component: VerNotarioComponent;
  let fixture: ComponentFixture<VerNotarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerNotarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerNotarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
