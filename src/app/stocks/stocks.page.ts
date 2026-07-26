import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon
} from '@ionic/angular/standalone';
import { BottomNavComponent } from '../shared/bottom-nav/bottom-nav.component';
import { StocksContentComponent } from './stocks-content/stocks-content.component';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { settings } from 'ionicons/icons';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.page.html',
  styleUrls: ['./stocks.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon,
    BottomNavComponent, StocksContentComponent
  ]
})
export class StocksPage implements OnInit {
  currentUser: any = null;

  constructor(private authService: AuthService) {
    addIcons({ settings });
  }

  async ngOnInit() {
    const { data: { user } } = await this.authService.getUser();
    this.currentUser = user;
  }
}
