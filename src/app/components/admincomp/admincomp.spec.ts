import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Admincomp } from './admincomp';

describe('Admincomp', () => {
  let component: Admincomp;
  let fixture: ComponentFixture<Admincomp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Admincomp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Admincomp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
