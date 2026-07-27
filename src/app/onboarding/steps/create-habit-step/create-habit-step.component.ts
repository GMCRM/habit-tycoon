import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, ModalController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { business } from 'ionicons/icons';
import { LaunchBusinessModalComponent } from '../../../shared/components/launch-business-modal/launch-business-modal.component';
import { HabitBusiness } from '../../../services/habit-business.service';

@Component({
  selector: 'app-create-habit-step',
  templateUrl: './create-habit-step.component.html',
  styleUrls: ['../onboarding-step.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
})
export class CreateHabitStepComponent {
  @Output() habitCreated = new EventEmitter<HabitBusiness>();

  attempted = false;

  constructor(private modalController: ModalController, private toastController: ToastController) {
    addIcons({ business });
  }

  async openLaunchModal() {
    this.attempted = true;
    const modal = await this.modalController.create({
      component: LaunchBusinessModalComponent,
      componentProps: {
        modalController: this.modalController,
        toastController: this.toastController,
      },
      cssClass: 'launch-business-modal',
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.created && data.habitBusiness) {
      this.habitCreated.emit(data.habitBusiness as HabitBusiness);
    }
  }
}
