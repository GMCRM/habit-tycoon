import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PendingHabitsModalComponent } from './pending-habits-modal.component';
import { HabitBusiness } from '../../services/habit-business.service';

function makeHabit(id: string, name: string): HabitBusiness {
  return { id, business_name: name } as HabitBusiness;
}

describe('PendingHabitsModalComponent', () => {
  let component: PendingHabitsModalComponent;
  let fixture: ComponentFixture<PendingHabitsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingHabitsModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PendingHabitsModalComponent);
    component = fixture.componentInstance;
    component.modalController = jasmine.createSpyObj('ModalController', ['dismiss']);
  });

  it('renders only the given (pending) habits, showing just their names', () => {
    component.habits = [makeHabit('a', 'Read'), makeHabit('b', 'Meditate'), makeHabit('c', 'Push-ups')];
    fixture.detectChanges();

    const names = fixture.debugElement.queryAll(By.css('.pending-name')).map(el => el.nativeElement.textContent.trim());
    expect(names).toEqual(['Read', 'Meditate', 'Push-ups']);
  });

  it('shows an empty state when there are no pending habits', () => {
    component.habits = [];
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.empty-state'))).toBeTruthy();
    expect(fixture.debugElement.queryAll(By.css('.pending-name')).length).toBe(0);
  });

  it('persists the new order (as habit ids) after a drag completes', async () => {
    component.habits = [makeHabit('a', 'Read'), makeHabit('b', 'Meditate'), makeHabit('c', 'Push-ups')];
    const onReorder = jasmine.createSpy('onReorder');
    component.onReorder = onReorder;
    fixture.detectChanges();

    // Simulate dragging the first row ("Read") down to the last slot, the
    // way ion-reorder-group's real ionReorderEnd event would: `complete()`
    // is handed the working array and returns it moved from->to.
    const fakeEvent = {
      detail: {
        from: 0,
        to: 2,
        complete: (data: HabitBusiness[]) => {
          const reordered = [...data];
          const [moved] = reordered.splice(0, 1);
          reordered.splice(2, 0, moved);
          return reordered;
        }
      }
    } as any;

    await component.handleReorder(fakeEvent);

    expect(component.orderedHabits.map(hb => hb.id)).toEqual(['b', 'c', 'a']);
    expect(onReorder).toHaveBeenCalledWith(['b', 'c', 'a']);
  });

  it('dismisses via the modal controller', () => {
    component.dismiss();
    expect(component.modalController.dismiss).toHaveBeenCalled();
  });
});
