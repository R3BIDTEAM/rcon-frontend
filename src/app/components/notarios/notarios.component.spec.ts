import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotariosComponent } from './notarios.component';

describe('NotariosComponent', () => {
  let component: NotariosComponent;
  let fixture: ComponentFixture<NotariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotariosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
