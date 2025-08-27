import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HabitCheckinPage } from './habit-checkin.page';

describe('HabitCheckinPage', () => {
  let component: HabitCheckinPage;
  let fixture: ComponentFixture<HabitCheckinPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitCheckinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
