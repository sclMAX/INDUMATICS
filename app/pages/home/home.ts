import {Component} from '@angular/core';
import {NavController, Platform, Toast} from 'ionic-angular';
import {Usuarios, Usuario} from '../../providers/usuarios/usuarios';
import {Estados, Estado} from '../../providers/estados/estados';
import {ContactoPage} from '../contacto/contacto';
import {RegistroPage} from '../usuario/registro/registro';
import {CatalogoPage} from '../catalogo/catalogo';
import {PedidosPage} from '../pedidos/pedidos';


@Component({
  templateUrl: 'build/pages/home/home.html',
  providers: [Usuarios, Estados],
})
export class HomePage {
  title: string;
  isRegistrado: boolean = false;
  isUpdateAvailable: boolean;
  novedades: string;

  constructor(public navCtrl: NavController, private platform: Platform,
    private usuariosP: Usuarios, private estadosP: Estados) {
    this.title = "INDUMATICS S.A.";
    this.novedades = '';
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

  goUpdate() {
    this.estadosP.updateLocalEstado(new Estado()).subscribe(res=>{
      console.log('RESPUESTA:',res);
    },err=>{
      console.error.bind(err);
    })
  }

  ionViewWillEnter() {
    this.platform.ready().then(() => {
      this.usuariosP.getUsuario().subscribe(u => {
        this.isRegistrado = (u.id > 0);
      });
      this.estadosP.chkEstado().subscribe(res => {
        this.isUpdateAvailable = res.isUpdate;
        console.log('RES:', res);
        if (!res.estado.isLeido) {
          console.log('RES:', res);

          this.novedades = res.estado.novedades;
          let t = Toast.create({ duration: 5000, message: this.novedades });
          this.navCtrl.present(t);
          console.log('Novedades:', this.novedades);
        }
      });
    });
  }
}
