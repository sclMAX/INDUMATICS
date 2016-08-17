import { Component } from '@angular/core';
import { NavController, Platform, Loading, Toast } from 'ionic-angular';
import {Lineas, Linea} from '../../providers/lineas/lineas';
import {PerfilesPage} from './perfiles/perfiles';

@Component({
  templateUrl: 'build/pages/catalogo/catalogo.html',
  providers: [Lineas],
})
export class CatalogoPage {

  title: string;
  lineas: Array<Linea>;

  constructor(private navCtrl: NavController, private lineasP: Lineas, private platform: Platform) {
    this.title = "Lineas Disponibles";
  }

  goPerfiles(linea: Linea) {
    this.navCtrl.push(PerfilesPage, { 'linea': linea });
  }


  ionViewWillEnter() {
    this.platform.ready().then(() => {
      if (!this.lineas) {
        let load = Loading.create({
          content: 'Cargando lineas disponibles...',
        });
        this.navCtrl.present(load).then(() => {
          this.lineasP.getAll().subscribe(value => {
            this.lineas = value;
          }, err => {
            load.dismiss().then(() => {
              let t = Toast.create({ duration: 2000 });
              t.setMessage(err.message);
              this.navCtrl.present(t);
            });
          }, () => {
            load.dismiss();
          });
        });
      }
    });
  }

}
