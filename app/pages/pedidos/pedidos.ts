import { Component } from '@angular/core';
import { NavController, Platform, Alert, Toast } from 'ionic-angular';
import {Pedidos, Pedido} from '../../providers/pedidos/pedidos';
import {PedidoDetallePage} from './pedido-detalle/pedido-detalle';
import {Usuarios, Usuario} from '../../providers/usuarios/usuarios';

@Component({
  templateUrl: 'build/pages/pedidos/pedidos.html',
  providers: [Pedidos, Usuarios],
})
export class PedidosPage {
  title: string;
  pedidoActual: Pedido;
  pedidosEnviados: Array<Pedido> = [];

  constructor(private navCtrl: NavController, private pedidosP: Pedidos,
    private platform: Platform, private usuariosP: Usuarios) {
    this.title = 'Pedidos';
  }

  goPedidoActual() {
    this.navCtrl.push(PedidoDetallePage, { 'pedido': this.pedidoActual, 'edit': true });

  }

  goPedido(pedido: Pedido) {
    this.navCtrl.push(PedidoDetallePage, { 'pedido': pedido, 'edit': false });
  }

  removeItem(pedido: Pedido) {
    let confirm = Alert.create({
      title: 'Quitar de historial...',
      message: 'Esta seguro que desea quitar el pedido Nro:000' + pedido.id + '?. Solo elimina el pedido del historial local (no lo anula en el servidor).',
      buttons: [{ text: 'Cancelar' },
        {
          text: 'Aceptar',
          handler: () => {
            this.pedidosEnviados.splice((this.pedidosEnviados.findIndex(value => value === pedido)), 1);
            this.pedidosP.localSaveEnviados(this.pedidosEnviados).subscribe(() => {
              let t = Toast.create({ duration: 2000, message: 'Pedido eliminado!' });
              this.navCtrl.present(t);
            });
          }
        }]
    });
    this.navCtrl.present(confirm);
  }

  ionViewWillEnter() {
    this.platform.ready().then(() => {
      this.pedidosP.getActual().subscribe(pedido => {
        this.pedidoActual = pedido;
        this.usuariosP.getUsuario().subscribe(usuario => {
          this.pedidoActual.idUsuario = usuario.id;
        });
      });
      this.pedidosP.getEnviados().subscribe(res => {
        this.pedidosEnviados = res;
      });
    });
  }

}
