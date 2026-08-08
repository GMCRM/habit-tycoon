import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonButtons, IonSpinner, IonFooter, IonToggle
} from '@ionic/angular/standalone';
import { SocialService, Friend } from '../../../services/social.service';
import { AuthService } from '../../../services/auth.service';
import { addIcons } from 'ionicons';
import { peopleCircle, close, personCircle, personAddOutline } from 'ionicons/icons';

@Component({
  selector: 'app-friend-picker-modal',
  templateUrl: './friend-picker-modal.component.html',
  styleUrls: ['./friend-picker-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonButtons, IonSpinner, IonFooter, IonToggle
  ]
})
export class FriendPickerModalComponent implements OnInit {
  @Input() modalController: any;
  /** Friend ids already selected, if reopening to edit a prior selection. */
  @Input() initialSelectedFriendIds: string[] = [];

  friends: Friend[] = [];
  selectedIds = new Set<string>();
  isLoading = true;

  constructor(
    private socialService: SocialService,
    private authService: AuthService
  ) {
    addIcons({ peopleCircle, close, personCircle, personAddOutline });
  }

  async ngOnInit() {
    this.selectedIds = new Set(this.initialSelectedFriendIds);
    try {
      const { data: { user } } = await this.authService.getUser();
      if (user) {
        this.friends = await this.socialService.getFriends(user.id);
      }
    } finally {
      this.isLoading = false;
    }
  }

  isSelected(friendId: string): boolean {
    return this.selectedIds.has(friendId);
  }

  toggle(friendId: string) {
    if (this.selectedIds.has(friendId)) {
      this.selectedIds.delete(friendId);
    } else {
      this.selectedIds.add(friendId);
    }
  }

  get selectedCount(): number {
    return this.selectedIds.size;
  }

  confirm() {
    this.modalController.dismiss({ selectedFriendIds: Array.from(this.selectedIds) });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
