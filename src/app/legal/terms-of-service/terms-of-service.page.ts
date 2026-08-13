import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  selector: 'app-terms-of-service',
  templateUrl: './terms-of-service.page.html',
  styleUrls: ['../legal-page.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon],
})
export class TermsOfServicePage {
  constructor(private location: Location) {
    addIcons({ arrowBack });
  }

  goBack() {
    this.location.back();
  }
}
