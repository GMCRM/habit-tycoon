import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons,
  IonFooter, IonItem, IonLabel, IonInput, IonTextarea, IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';
import { HabitBusiness } from '../../services/habit-business.service';

export interface EditHabitResult {
  businessName: string;
  habitDescription: string;
  recurrenceInterval: '24h' | 'specific_days';
  goalValue: number;
  activeDays: number[];
}

@Component({
  selector: 'app-edit-habit-modal',
  templateUrl: './edit-habit-modal.component.html',
  styleUrls: ['./edit-habit-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons,
    IonFooter, IonItem, IonLabel, IonInput, IonTextarea, IonSegment,
    IonSegmentButton
  ]
})
export class EditHabitModalComponent {
  @Input() habitBusiness!: HabitBusiness;
  @Input() modalController: any;

  businessName = '';
  habitDescription = '';
  recurrenceInterval: '24h' | 'specific_days' = '24h';
  activeDays: number[] = [1, 2, 3, 4, 5];
  goalValue = 1;

  readonly dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  readonly dayDows   = [0, 1, 2, 3, 4, 5, 6];

  ngOnInit() {
    this.businessName = this.habitBusiness.business_name;
    this.habitDescription = this.habitBusiness.habit_description;

    // Map legacy '7d' to 'specific_days'
    const ri = this.habitBusiness.recurrence_interval as string;
    if (ri === 'specific_days' || ri === '7d' || this.habitBusiness.frequency === 'weekly') {
      this.recurrenceInterval = 'specific_days';
    } else {
      this.recurrenceInterval = '24h';
    }

    this.activeDays = (this.habitBusiness.active_days && this.habitBusiness.active_days.length > 0)
      ? [...this.habitBusiness.active_days]
      : [1, 2, 3, 4, 5];

    this.goalValue = this.habitBusiness.goal_value || 1;
  }

  toggleDay(dow: number) {
    const idx = this.activeDays.indexOf(dow);
    if (idx >= 0) {
      this.activeDays = this.activeDays.filter(d => d !== dow);
    } else {
      this.activeDays = [...this.activeDays, dow].sort((a, b) => a - b);
    }
  }

  isDayActive(dow: number): boolean {
    return this.activeDays.includes(dow);
  }

  get isSaveValid(): boolean {
    if (!this.businessName.trim() || !this.habitDescription.trim()) return false;
    if (this.recurrenceInterval === 'specific_days' && this.activeDays.length === 0) return false;
    return true;
  }

  dismiss() {
    this.modalController.dismiss(null, 'cancel');
  }

  save() {
    if (!this.isSaveValid) return;
    const result: EditHabitResult = {
      businessName: this.businessName.trim(),
      habitDescription: this.habitDescription.trim(),
      recurrenceInterval: this.recurrenceInterval,
      goalValue: Math.max(1, Math.min(20, this.goalValue || 1)),
      activeDays: this.recurrenceInterval === 'specific_days' ? this.activeDays : []
    };
    this.modalController.dismiss(result, 'save');
  }
}
