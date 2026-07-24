import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonButtons, IonSpinner, IonBadge
} from '@ionic/angular/standalone';
import { HabitBusinessService, StockOwner } from '../../../services/habit-business.service';
import { addIcons } from 'ionicons';
import { people, close, personCircle } from 'ionicons/icons';

@Component({
  selector: 'app-stock-owners-modal',
  templateUrl: './stock-owners-modal.component.html',
  styleUrls: ['./stock-owners-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonButtons, IonSpinner, IonBadge
  ]
})
export class StockOwnersModalComponent implements OnInit {
  @Input() businessName: string = '';
  @Input() habitBusinessId: string = '';
  @Input() modalController: any;

  owners: StockOwner[] = [];
  isLoading = true;

  constructor(private habitBusinessService: HabitBusinessService) {
    addIcons({ people, close, personCircle });
  }

  async ngOnInit() {
    try {
      this.owners = await this.habitBusinessService.getStockOwners(this.habitBusinessId);
    } finally {
      this.isLoading = false;
    }
  }

  totalShares(): number {
    return this.owners.reduce((sum, o) => sum + o.sharesOwned, 0);
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
