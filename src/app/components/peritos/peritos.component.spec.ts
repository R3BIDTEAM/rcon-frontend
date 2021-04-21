import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeritosComponent } from './peritos.component';

describe('PeritosComponent', () => {
  let component: PeritosComponent;
  let fixture: ComponentFixture<PeritosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PeritosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PeritosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
