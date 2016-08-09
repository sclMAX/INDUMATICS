import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Perfil} from '../../../providers/perfiles/perfiles';
import {PedidoAddItemPage} from '../../pedidos/pedido-add-item/pedido-add-item';


@Component({
  templateUrl: 'build/pages/catalogo/perfiles-detalle/perfiles-detalle.html',
})
export class PerfilesDetallePage {
  title: string;
  perfil: Perfil;

  constructor(private nav: NavController, private parametros: NavParams) {
    this.perfil = this.parametros.get('perfil');
    this.title = 'Perfil ' + this.perfil.idPerfil;
  }

  addPedido(perfil: Perfil) {
    this.nav.push(PedidoAddItemPage, { 'perfil': perfil });
  }

}
