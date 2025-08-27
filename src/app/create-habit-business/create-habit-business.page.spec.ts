import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateHabitBusinessPage } from './create-habit-business.page';

describe('CreateHabitBusinessPage', () => {
  let component: CreateHabitBusinessPage;
  let fixture: ComponentFixture<CreateHabitBusinessPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateHabitBusinessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
