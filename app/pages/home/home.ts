import {Component} from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {Usuarios, Usuario} from '../../providers/usuarios/usuarios';
import {Colores} from '../../providers/colores/colores'; //QUITAR ES SOLO PARA PRUEBA
import {ContactoPage} from '../contacto/contacto';
import {RegistroPage} from '../usuario/registro/registro';
import {CatalogoPage} from '../catalogo/catalogo';


@Component({
  templateUrl: 'build/pages/home/home.html',
  providers: [Usuarios, Colores],
})
export class HomePage {
  title: string;
  isRegistrado: boolean = false;
  isUpdateAvailable: boolean = true;

  constructor(public navCtrl: NavController, private platform: Platform,
    private usuariosP: Usuarios, private coloresP: Colores) {
    this.title = "INDUMATICS S.A.";
  }

  goContacto() {
    this.navCtrl.push(ContactoPage);
  }

  goRegistro() {
    this.navCtrl.push(RegistroPage);
  }

  goCatalogo() {
    this.navCtrl.push(CatalogoPage);
  }

  pruebaColores() {//QUITAR SOLO ES PARA PRUEBA DE COLORES
    this.coloresP.getAll().subscribe(col => {
      console.log('EXITO:', col);
    }, err => {
      console.log('ERROR:', err);
    },() => {
      console.log('FIN');
    });
  }

  ionViewWillEnter() {
    this.platform.ready().then(() => {
      this.usuariosP.getUsuario().subscribe(u => {
        this.isRegistrado = (u.id > 0);
      });
    });
  }
}
