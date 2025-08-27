import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, people, trendingUp, home } from 'ionicons/icons';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
  standalone: true,
  imports: [CommonModule, IonTabBar, IonTabButton, IonIcon, IonLabel]
})
export class BottomNavComponent {

  @Input() mainButton: 'add' | 'home' = 'add';

  constructor(private router: Router) {
    addIcons({ add, people, trendingUp, home });
  }


  addHabitBusiness() {
    if (this.mainButton === 'home') {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/create-habit-business']);
    }
  }

  async openSocial() {
    console.log('🔍 BottomNav: Social button clicked');
    
    // Simple, direct navigation without complex checks
    try {
      await this.router.navigate(['/social']);
      console.log('✅ BottomNav: Navigated to social');
    } catch (error) {
      console.error('❌ BottomNav: Navigation failed:', error);
    }
  }

  async openStocks() {
    console.log('🔍 BottomNav: Stocks button clicked - DEBUGGING');
    console.log('🔍 BottomNav: Stocks button clicked');
    
    // Navigate to stocks page
    try {
      await this.router.navigate(['/stocks']);
      console.log('✅ BottomNav: Navigated to stocks');
    } catch (error) {
      console.error('❌ BottomNav: Navigation failed:', error);
    }
  }
}
