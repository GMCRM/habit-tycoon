import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { storefront } from 'ionicons/icons';
import { LaunchBusinessModalComponent } from '../../../shared/components/launch-business-modal/launch-business-modal.component';
import { HabitBusinessService, BusinessType } from '../../../services/habit-business.service';

@Component({
  selector: 'app-shop-preview-step',
  templateUrl: './shop-preview-step.component.html',
  styleUrls: ['../onboarding-step.scss', './shop-preview-step.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
})
export class ShopPreviewStepComponent implements OnInit {
  @Output() next = new EventEmitter<void>();

  businessTypes: BusinessType[] = [];

  constructor(
    private habitBusinessService: HabitBusinessService,
    private modalController: ModalController,
    private toastController: ToastController
  ) {
    addIcons({ storefront });
  }

  async ngOnInit() {
    try {
      this.businessTypes = await this.habitBusinessService.getBusinessTypes();
    } catch (error) {
      console.error('❌ ShopPreviewStep: failed to load business types:', error);
    }
  }

  async browseShop() {
    const modal = await this.modalController.create({
      component: LaunchBusinessModalComponent,
      componentProps: {
        modalController: this.modalController,
        toastController: this.toastController,
      },
      cssClass: 'launch-business-modal',
    });

    await modal.present();
    // Browsing only — whether or not they launch a second business here,
    // just move on once they dismiss the shop.
    await modal.onDidDismiss();
    this.next.emit();
  }
}
