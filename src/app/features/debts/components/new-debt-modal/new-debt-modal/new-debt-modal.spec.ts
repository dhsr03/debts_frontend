import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDebtModal } from './new-debt-modal';

describe('NewDebtModal', () => {
  let component: NewDebtModal;
  let fixture: ComponentFixture<NewDebtModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewDebtModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewDebtModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
