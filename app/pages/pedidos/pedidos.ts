import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import {Pedidos, Pedido} from '../../providers/pedidos/pedidos';
import {PedidoDetallePage} from './pedido-detalle/pedido-detalle';

@Component({
  templateUrl: 'build/pages/pedidos/pedidos.html',
  providers: [Pedidos],
})
export class PedidosPage {
  title: string;
  pedidoActual: Pedido;
  pedidosEnviados: Array<Pedido> = [];

  constructor(private navCtrl: NavController, private pedidosP: Pedidos,
    private platform: Platform) {
    this.title = 'Pedidos';
  }

  goPedidoActual() {
    this.navCtrl.push(PedidoDetallePage, { 'pedido': this.pedidoActual, 'edit': true });

  }

  goPedido(pedido: Pedido) {
    this.navCtrl.push(PedidoDetallePage, { 'pedido': pedido, 'edit': false });
  }

  ionViewWillEnter() {
    this.platform.ready().then(() => {
      this.pedidosP.getActual().subscribe(res => {
        this.pedidoActual = res;
      });
      if (!this.pedidosEnviados) {
        this.pedidosP.getEnviados().subscribe(res => {
          this.pedidosEnviados = res;
        });
      }
    });
  }

}
