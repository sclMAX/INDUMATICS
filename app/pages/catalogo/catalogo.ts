import { Component } from '@angular/core';
import { NavController, Platform, LoadingController, ToastController } from 'ionic-angular';
import {Lineas, Linea} from '../../providers/lineas/lineas';
import {PerfilesPage} from './perfiles/perfiles';

@Component({
  templateUrl: 'build/pages/catalogo/catalogo.html',
  providers: [Lineas],
})
export class CatalogoPage {

  title: string;
  lineas: Array<Linea>;

  constructor(private navCtrl: NavController, private lineasP: Lineas, private platform: Platform,
    private toast: ToastController, private loading: LoadingController) {
    this.title = "Lineas Disponibles";
  }

  goPerfiles(linea: Linea) {
    this.navCtrl.push(PerfilesPage, { 'linea': linea });
  }


  ionViewWillEnter() {
    this.platform.ready().then(() => {
      if (!this.lineas) {
        let load = this.loading.create({
          content: 'Cargando lineas disponibles...',
        });
        load.present().then(() => {
          this.lineasP.getAll().subscribe(value => {
            this.lineas = value;
          }, err => {
            load.dismiss().then(() => {
              let t = this.toast.create({ duration: 2000 });
              t.setMessage(err.message);
              t.present();
            });
          }, () => {
            load.dismiss();
          });
        });
      }
    });
  }

}
