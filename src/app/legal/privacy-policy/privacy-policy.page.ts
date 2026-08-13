import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['../legal-page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon],
})
export class PrivacyPolicyPage {
  constructor(private location: Location) {
    addIcons({ arrowBack });
  }

  goBack() {
    this.location.back();
  }
}
