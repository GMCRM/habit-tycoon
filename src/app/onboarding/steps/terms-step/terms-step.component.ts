import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon, IonCheckbox } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { documentTextOutline, checkmarkCircle } from 'ionicons/icons';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-terms-step',
  templateUrl: './terms-step.component.html',
  styleUrls: ['../onboarding-step.scss', './terms-step.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonIcon, IonCheckbox],
})
export class TermsStepComponent {
  @Output() next = new EventEmitter<void>();

  readonly termsUrl = environment.termsUrl;
  readonly privacyUrl = environment.privacyUrl;

  accepted = false;

  constructor() {
    addIcons({ documentTextOutline, checkmarkCircle });
  }

  continue() {
    if (!this.accepted) return;
    this.next.emit();
  }
}
