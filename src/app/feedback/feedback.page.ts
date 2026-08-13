import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, bug, send, chatbubbleEllipses, lockClosed } from 'ionicons/icons';
import { BottomNavComponent } from '../shared/bottom-nav/bottom-nav.component';
import { FeedbackService } from '../services/feedback.service';

type FeedbackType = 'bug' | 'feature';

const MAX_SHORT_FIELD = 1000;
const MAX_LONG_FIELD = 2000;

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonToast,
    BottomNavComponent,
  ],
})
export class FeedbackPage {
  readonly maxShortField = MAX_SHORT_FIELD;
  readonly maxLongField = MAX_LONG_FIELD;

  feedbackType: FeedbackType | null = null;

  readonly feedbackTypeInterfaceOptions = { cssClass: 'feedback-type-popover' };

  stepsToReproduce = '';
  expectedResult = '';
  actualResult = '';
  featureDetails = '';

  isSubmitting = false;

  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor(private feedbackService: FeedbackService, private router: Router) {
    addIcons({ arrowBack, bug, send, chatbubbleEllipses, lockClosed });
  }

  get isBugFormValid(): boolean {
    return !!(
      this.stepsToReproduce.trim() &&
      this.expectedResult.trim() &&
      this.actualResult.trim()
    );
  }

  get isFeatureFormValid(): boolean {
    return !!this.featureDetails.trim();
  }

  get canSubmit(): boolean {
    if (this.isSubmitting) return false;
    if (this.feedbackType === 'bug') return this.isBugFormValid;
    if (this.feedbackType === 'feature') return this.isFeatureFormValid;
    return false;
  }

  async submitFeedback() {
    if (!this.canSubmit || !this.feedbackType) return;

    this.isSubmitting = true;
    try {
      if (this.feedbackType === 'bug') {
        await this.feedbackService.submitFeedback({
          type: 'bug',
          stepsToReproduce: this.stepsToReproduce.trim(),
          expectedResult: this.expectedResult.trim(),
          actualResult: this.actualResult.trim(),
        });
      } else {
        await this.feedbackService.submitFeedback({
          type: 'feature',
          details: this.featureDetails.trim(),
        });
      }

      this.resetForm();
      this.showToastMessage('Thanks! Your feedback has been sent to our team.', 'success');
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      this.showToastMessage(
        error?.message || 'Failed to send feedback. Please try again.',
        'danger'
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  private resetForm() {
    this.feedbackType = null;
    this.stepsToReproduce = '';
    this.expectedResult = '';
    this.actualResult = '';
    this.featureDetails = '';
  }

  showToastMessage(message: string, color: string) {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  goBack() {
    this.router.navigate(['/settings']);
  }
}
