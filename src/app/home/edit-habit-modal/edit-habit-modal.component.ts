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
  recurrenceInterval: '24h' | '7d';
  goalValue: number;
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
  recurrenceInterval: '24h' | '7d' = '24h';
  goalValue = 1;

  ngOnInit() {
    this.businessName = this.habitBusiness.business_name;
    this.habitDescription = this.habitBusiness.habit_description;
    this.recurrenceInterval = (this.habitBusiness.recurrence_interval as '24h' | '7d')
      || (this.habitBusiness.frequency === 'weekly' ? '7d' : '24h');
    this.goalValue = this.habitBusiness.goal_value || 1;
  }

  dismiss() {
    this.modalController.dismiss(null, 'cancel');
  }

  save() {
    if (!this.businessName.trim() || !this.habitDescription.trim()) return;
    const result: EditHabitResult = {
      businessName: this.businessName.trim(),
      habitDescription: this.habitDescription.trim(),
      recurrenceInterval: this.recurrenceInterval,
      goalValue: Math.max(1, Math.min(20, this.goalValue || 1))
    };
    this.modalController.dismiss(result, 'save');
  }
}
