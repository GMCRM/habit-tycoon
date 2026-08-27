import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline } from 'ionicons/icons';
import { HabitBusiness } from '../../../services/habit-business.service';
import { MILESTONE_DEFINITIONS, MilestoneDefinition } from '../../../services/achievements.service';
import { BusinessIconPipe } from '../../pipes/business-icon.pipe';

export interface HabitMilestoneState extends MilestoneDefinition {
  earned: boolean;
  progressCurrent: number;
}

/**
 * The per-habit "N/6 badges" progress card — same badge grid shown on the
 * Weekly Receipt achievements tab, reused wherever a habit's progress
 * toward unlocking Habit Tycoon (tier 2) needs to be shown (e.g. the
 * upgrade popup once a habit has maxed out tier 1).
 */
@Component({
  selector: 'app-habit-milestone-card',
  templateUrl: './habit-milestone-card.component.html',
  styleUrls: ['./habit-milestone-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, BusinessIconPipe],
})
export class HabitMilestoneCardComponent implements OnChanges {
  @Input() habit!: HabitBusiness;
  @Input() earnedKeys: string[] = [];

  milestones: HabitMilestoneState[] = [];
  earnedCount = 0;

  constructor() {
    addIcons({ lockClosedOutline });
  }

  ngOnChanges() {
    if (!this.habit) return;
    const earned = new Set(this.earnedKeys);
    this.milestones = MILESTONE_DEFINITIONS.map(def => ({
      ...def,
      earned: earned.has(def.key),
      progressCurrent: def.type === 'streak' ? this.habit.longest_streak ?? this.habit.streak : this.habit.total_completions,
    }));
    this.earnedCount = this.milestones.filter(m => m.earned).length;
  }

  progressLabel(milestone: HabitMilestoneState): string {
    const current = Math.min(milestone.progressCurrent, milestone.threshold);
    const unit = milestone.type === 'streak' ? 'days' : 'done';
    return `${current}/${milestone.threshold} ${unit}`;
  }

  progressPercent(milestone: HabitMilestoneState): number {
    if (milestone.earned) return 100;
    return Math.max(0, Math.min(100, (milestone.progressCurrent / milestone.threshold) * 100));
  }
}
