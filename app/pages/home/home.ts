import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ContactoPage} from '../contacto/contacto';

@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  title: string;
  constructor(public navCtrl: NavController) {
    this.title = "INDUMATICS S.A.";
  }

  goContacto(){
    this.navCtrl.push(ContactoPage);
  }
}
