import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { rocket } from 'ionicons/icons';

@Component({
  selector: 'app-welcome-step',
  templateUrl: './welcome-step.component.html',
  styleUrls: ['../onboarding-step.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonButton, IonIcon],
})
export class WelcomeStepComponent {
  @Output() next = new EventEmitter<void>();

  constructor() {
    addIcons({ rocket });
  }
}
