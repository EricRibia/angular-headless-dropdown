import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsSwitcher } from './accounts-switcher';

describe('AccountsSwitcher', () => {
  let component: AccountsSwitcher;
  let fixture: ComponentFixture<AccountsSwitcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsSwitcher],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsSwitcher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
