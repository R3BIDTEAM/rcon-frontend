import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicionNotarioComponent } from './edicion-notario.component';

describe('EdicionNotarioComponent', () => {
  let component: EdicionNotarioComponent;
  let fixture: ComponentFixture<EdicionNotarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EdicionNotarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EdicionNotarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
