import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HamburgerMenu } from './hamburger-menu';

describe('HamburgerMenu', () => {
  let component: HamburgerMenu;
  let fixture: ComponentFixture<HamburgerMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HamburgerMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(HamburgerMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
