import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, IonFooter 
} from '@ionic/angular/standalone';
import { HabitBusiness } from '../../services/habit-business.service';

@Component({
  selector: 'app-upgrade-modal',
  templateUrl: './upgrade-modal.component.html',
  styleUrls: ['./upgrade-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, IonFooter]
})
export class UpgradeModalComponent implements OnInit {
  @Input() habitBusiness!: HabitBusiness;
  @Input() upgradeOptions: any[] = [];
  @Input() userCash: number = 0;
  @Input() currentBusinessValue: number = 0;
  @Input() modalController: any;
  @Input() toastController: any;

  constructor() {}

  ngOnInit() {}

  dismiss() {
    this.modalController.dismiss();
  }

  selectUpgrade(businessType: any) {
    const upgradeCost = businessType.base_cost - this.currentBusinessValue;
    const canAfford = this.userCash >= upgradeCost;
    
    if (!canAfford) {
      this.showErrorToast(`You need $${upgradeCost - this.userCash} more to afford this upgrade.`);
      return;
    }

    this.modalController.dismiss({
      selectedBusinessType: businessType,
      upgradeCost: upgradeCost
    });
  }

  getUpgradeCost(businessType: any): number {
    return businessType.base_cost - this.currentBusinessValue;
  }

  canAffordUpgrade(businessType: any): boolean {
    return this.userCash >= this.getUpgradeCost(businessType);
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: `❌ ${message}`,
      duration: 3000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }
}
