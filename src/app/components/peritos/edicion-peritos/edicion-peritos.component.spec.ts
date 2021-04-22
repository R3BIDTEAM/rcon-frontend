import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicionPeritosComponent } from './edicion-peritos.component';

describe('EdicionPeritosComponent', () => {
  let component: EdicionPeritosComponent;
  let fixture: ComponentFixture<EdicionPeritosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EdicionPeritosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EdicionPeritosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
