import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { people, medalOutline, notificationsOutline, storefront, trendingUp } from 'ionicons/icons';
import { AuthService } from '../../../services/auth.service';
import { SocialService } from '../../../services/social.service';

interface LeaderboardPreviewEntry {
  name: string;
  net_worth: number;
}

const RANK_BADGES = ['🥇', '🥈', '🥉'];

@Component({
  selector: 'app-social-preview-step',
  templateUrl: './social-preview-step.component.html',
  styleUrls: ['../onboarding-step.scss', './social-preview-step.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
})
export class SocialPreviewStepComponent implements OnInit {
  @Output() next = new EventEmitter<void>();

  // Seeded with "You" so the preview always has something to show while the
  // real leaderboard loads, and gracefully if the user has no friends yet.
  leaderboard: LeaderboardPreviewEntry[] = [{ name: 'You', net_worth: 0 }];

  constructor(private authService: AuthService, private socialService: SocialService) {
    addIcons({ people, medalOutline, notificationsOutline, storefront, trendingUp });
  }

  async ngOnInit() {
    try {
      const { data: { user } } = await this.authService.getUser();
      if (user) {
        const leaderboard = await this.socialService.getFriendsLeaderboard(user.id);
        if (leaderboard && leaderboard.length > 1) {
          this.leaderboard = leaderboard.slice(0, 3);
        }
      }
    } catch (error) {
      console.error('❌ SocialPreviewStep: failed to load leaderboard preview:', error);
    }
  }

  rankBadge(index: number): string {
    return RANK_BADGES[index] ?? `#${index + 1}`;
  }
}
