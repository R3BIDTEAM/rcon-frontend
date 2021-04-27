import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPeritosComponent } from './ver-peritos.component';

describe('VerPeritosComponent', () => {
  let component: VerPeritosComponent;
  let fixture: ComponentFixture<VerPeritosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerPeritosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerPeritosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
