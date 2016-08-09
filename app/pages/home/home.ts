import {Component} from '@angular/core';
import {NavController, Platform} from 'ionic-angular';
import {Usuarios, Usuario} from '../../providers/usuarios/usuarios';
import {ContactoPage} from '../contacto/contacto';
import {RegistroPage} from '../usuario/registro/registro';
import {CatalogoPage} from '../catalogo/catalogo';
import {PedidosPage} from '../pedidos/pedidos';


@Component({
  templateUrl: 'build/pages/home/home.html',
  providers: [Usuarios],
})
export class HomePage {
  title: string;
  isRegistrado: boolean = false;
  isUpdateAvailable: boolean = true;

  constructor(public navCtrl: NavController, private platform: Platform,
    private usuariosP: Usuarios) {
    this.title = "INDUMATICS S.A.";
  }

  goContacto() {
    this.navCtrl.push(ContactoPage);
  }

  goRegistro() {
    this.navCtrl.push(RegistroPage);
  }

  goPedidos() {
    this.navCtrl.push(PedidosPage);
  }

  goCatalogo() {
    this.navCtrl.push(CatalogoPage);
  }

  ionViewWillEnter() {
    this.platform.ready().then(() => {
      this.usuariosP.getUsuario().subscribe(u => {
        this.isRegistrado = (u.id > 0);
      });
    });
  }
}
