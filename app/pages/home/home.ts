import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Usuarios, Usuario} from '../../providers/usuarios/usuarios';
import {ContactoPage} from '../contacto/contacto';
import {RegistroPage} from '../usuario/registro/registro';


@Component({
  templateUrl: 'build/pages/home/home.html',
  providers:[],
})
export class HomePage {
  title: string;
  isRegistrado:boolean= false;  
  isUpdateAvailable:boolean = true;

  constructor(public navCtrl: NavController) {
    this.title = "INDUMATICS S.A.";
  }

  goContacto(){
    this.navCtrl.push(ContactoPage);
  }

  goRegistro(){
    this.navCtrl.push(RegistroPage);
  }
}
