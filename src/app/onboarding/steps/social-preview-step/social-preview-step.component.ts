import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { people, trophy, storefront } from 'ionicons/icons';
import { AuthService } from '../../../services/auth.service';
import { SocialService } from '../../../services/social.service';

interface LeaderboardPreviewEntry {
  name: string;
  net_worth: number;
}

@Component({
  selector: 'app-social-preview-step',
  templateUrl: './social-preview-step.component.html',
  styleUrls: ['../onboarding-step.scss', './social-preview-step.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
})
export class SocialPreviewStepComponent implements OnInit {
  @Output() next = new EventEmitter<void>();

  leaderboard: LeaderboardPreviewEntry[] = [];
  loading = true;

  constructor(private authService: AuthService, private socialService: SocialService) {
    addIcons({ people, trophy, storefront });
  }

  async ngOnInit() {
    try {
      const { data: { user } } = await this.authService.getUser();
      if (user) {
        const leaderboard = await this.socialService.getFriendsLeaderboard(user.id);
        this.leaderboard = (leaderboard || []).slice(0, 3);
      }
    } catch (error) {
      console.error('❌ SocialPreviewStep: failed to load leaderboard preview:', error);
    } finally {
      this.loading = false;
    }
  }
}
