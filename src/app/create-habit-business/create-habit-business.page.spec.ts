import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ModalController } from '@ionic/angular/standalone';
import { CreateHabitBusinessPage } from './create-habit-business.page';

describe('CreateHabitBusinessPage', () => {
  let component: CreateHabitBusinessPage;
  let fixture: ComponentFixture<CreateHabitBusinessPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateHabitBusinessPage],
      providers: [
        provideRouter([]),
        { provide: ModalController, useValue: jasmine.createSpyObj('ModalController', ['create', 'dismiss']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateHabitBusinessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
