import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { SocialService } from '../../../services/social.service';
import { AchievementReactionsModalComponent } from '../achievement-reactions-modal/achievement-reactions-modal.component';

export interface AchievementReaction {
  reactor_id: string;
  reactor_name: string;
  emoji: string;
  created_at: string;
}

/**
 * Facebook-style reaction bar for a friend's achievement notification
 * (friend_milestone / general_achievement). Shown under the notification
 * message in social.page.html.
 *
 * - A friend viewing someone else's achievement can tap "React" to pick one
 *   of the 6 fixed emoji, or tap their current emoji again to remove it.
 * - Everyone who can see the notification (the achiever + their friends)
 *   sees the aggregated emoji badges; tapping the summary opens a popup
 *   listing who reacted with what.
 * - The achiever sees their own achievement's reactions read-only — there's
 *   no "react to your own achievement" case.
 */
@Component({
  selector: 'app-achievement-reaction-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achievement-reaction-bar.component.html',
  styleUrls: ['./achievement-reaction-bar.component.scss']
})
export class AchievementReactionBarComponent implements OnInit, OnChanges {
  @Input() achieverId!: string;
  @Input() achievementType!: 'general' | 'milestone';
  @Input() achievementKey!: string;
  @Input() habitBusinessId: string | null = null;
  @Input() currentUserId!: string;

  readonly emojiOptions = ['🎉', '♥️', '🤩', '🤑', '🙌', '👍'];

  reactions: AchievementReaction[] = [];
  loaded = false;
  pickerOpen = false;
  busy = false;
  popupBusy = false;

  constructor(
    private socialService: SocialService,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.loadReactions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const relevantKeys = ['achieverId', 'achievementType', 'achievementKey', 'habitBusinessId'];
    const changedAfterInit = relevantKeys.some(key => changes[key] && !changes[key].firstChange);
    if (changedAfterInit) {
      this.loadReactions();
    }
  }

  get isAchiever(): boolean {
    return this.currentUserId === this.achieverId;
  }

  get myReaction(): string | null {
    return this.reactions.find(r => r.reactor_id === this.currentUserId)?.emoji || null;
  }

  get groupedReactions(): { emoji: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const r of this.reactions) {
      counts.set(r.emoji, (counts.get(r.emoji) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([emoji, count]) => ({ emoji, count }));
  }

  async loadReactions(): Promise<void> {
    if (!this.achieverId || !this.achievementKey) return;
    this.reactions = await this.socialService.getAchievementReactions(
      this.achieverId,
      this.achievementType,
      this.achievementKey,
      this.habitBusinessId
    );
    this.loaded = true;
  }

  togglePicker(event: Event): void {
    event.stopPropagation();
    this.pickerOpen = !this.pickerOpen;
  }

  async selectEmoji(emoji: string, event: Event): Promise<void> {
    event.stopPropagation();
    if (this.busy) return;
    this.busy = true;
    this.pickerOpen = false;
    try {
      if (this.myReaction === emoji) {
        await this.socialService.removeAchievementReaction(
          this.achieverId, this.achievementType, this.achievementKey, this.habitBusinessId
        );
      } else {
        await this.socialService.reactToAchievement(
          this.achieverId, this.achievementType, this.achievementKey, this.habitBusinessId, emoji
        );
      }
      await this.loadReactions();
    } catch (error) {
      console.error('Error updating achievement reaction:', error);
    } finally {
      this.busy = false;
    }
  }

  async openPopup(event: Event): Promise<void> {
    event.stopPropagation();
    if (this.reactions.length === 0 || this.popupBusy) return;
    this.popupBusy = true;
    try {
      const modal = await this.modalController.create({
        component: AchievementReactionsModalComponent,
        componentProps: {
          reactions: this.reactions,
          modalController: this.modalController
        },
        cssClass: 'achievement-reactions-modal'
      });
      await modal.present();
      await modal.onDidDismiss();
    } finally {
      this.popupBusy = false;
    }
  }
}
