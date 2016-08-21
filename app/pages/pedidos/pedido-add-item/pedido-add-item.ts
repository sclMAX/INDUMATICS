import { Component} from '@angular/core';
import { NavController, NavParams, Platform, LoadingController, ToastController } from 'ionic-angular';
import {FormGroup} from '@angular/forms';
import {Pedidos, Item, Pedido} from '../../../providers/pedidos/pedidos';
import {Colores, Color} from '../../../providers/colores/colores';

@Component({
  templateUrl: 'build/pages/pedidos/pedido-add-item/pedido-add-item.html',
  providers: [Colores, Pedidos]
})
export class PedidoAddItemPage {
  addForm: FormGroup;
  title: string;
  pedidoItem: Item;
  pesoTotal: number;
  colores: Array<Color>;



  constructor(private nav: NavController,
    private parametros: NavParams, private coloresP: Colores, private pedidosP: Pedidos,
    private platform: Platform, private toast: ToastController, private loading: LoadingController) {
    this.pedidoItem = new Item();
    this.pedidoItem.perfil = this.parametros.get('perfil');
    this.title = 'Código: ' + this.pedidoItem.perfil.idPerfil;
  }

  add() {
    let t = this.toast.create({ duration: 2000 });
    this.pedidosP.addItem(this.pedidoItem).subscribe(res => {
      t.setMessage('Item agregado correctamente!');
      this.nav.pop();
      t.present();
    }, err => {
      t.setMessage('No se pudo agregar el item!');
      t.present();
    });
  }

  onChanges() {
    if ((this.pedidoItem.color) && (this.pedidoItem.cantidad > 0)) {
      let l: number = this.pedidoItem.perfil.largo / 1000;
      let pxm: number = this.pedidoItem.perfil.pxm;
      let inc: number = this.pedidoItem.color.incremento;
      let c: number = this.pedidoItem.cantidad;
      this.pesoTotal = c * ((pxm * l) + ((pxm * l) * (inc / 100)));
    }
  }

  ionViewWillEnter() {
    this.platform.ready().then(() => {
      let load = this.loading.create({ content: 'Cargando colores disponibles...' });
      load.present().then(() => {
        this.coloresP.getAll().subscribe(res => {
          this.colores = res;
        }, err => {
          load.dismiss().then(() => {
            let t = this.toast.create({ duration: 2000, message: 'No se pudo cargar los colores!' });
            t.present().then(() => {
              this.nav.pop();
            })
          });
        }, () => {
          load.dismiss();
        })
      });
    });
  }

}
