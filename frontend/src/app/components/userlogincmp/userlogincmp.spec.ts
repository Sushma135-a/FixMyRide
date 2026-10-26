import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Userlogincmp } from './userlogincmp';

describe('Userlogincmp', () => {
  let component: Userlogincmp;
  let fixture: ComponentFixture<Userlogincmp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Userlogincmp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Userlogincmp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
