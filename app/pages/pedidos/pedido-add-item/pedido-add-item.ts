import { Component } from '@angular/core';
import { NavController, NavParams, Platform, Loading, Toast } from 'ionic-angular';
import {FormBuilder, ControlGroup, Validators} from '@angular/common';
import {Pedidos, Item, Pedido} from '../../../providers/pedidos/pedidos';
import {Colores, Color} from '../../../providers/colores/colores';

@Component({
  templateUrl: 'build/pages/pedidos/pedido-add-item/pedido-add-item.html',
  providers: [Colores, Pedidos]
})
export class PedidoAddItemPage {
  addForm: ControlGroup;
  title: string;
  pedidoItem: Item;
  pesoTotal: number;
  colores: Array<Color>;



  constructor(private nav: NavController, private formBuilder: FormBuilder,
    private parametros: NavParams, private coloresP: Colores, private pedidosP: Pedidos,
    private platform: Platform) {
    this.pedidoItem = new Item();
    this.addForm = this.createForm();
    this.pedidoItem.perfil = this.parametros.get('perfil');
    this.title = 'Código: ' + this.pedidoItem.perfil.idPerfil;
  }
  private createForm() {
    return this.formBuilder.group({
      cantidad: ['', Validators.required],
      color: ['', Validators.required]
    });
  }

  add() {
    let load = Loading.create({ content: 'Agregando al pedido...' });
    this.nav.present(load).then(() => {
      this.pedidosP.addItem(this.pedidoItem).subscribe(res => {
        let t = Toast.create({ duration: 2000, message: 'Item agregado correctamente!' });
        this.nav.pop().then(() => {
          this.nav.present(t);
        });
      }, err => {
        load.dismiss().then(() => {
          let t = Toast.create({ duration: 2000, message: 'No se pudo agregar el item!' });
          this.nav.present(t);
        });
      }, () => {
        load.dismiss();
      })
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
      let load = Loading.create({ content: 'Cargando colores disponibles...' });
      this.nav.present(load).then(() => {
        this.coloresP.getAll().subscribe(res => {
          this.colores = res;
        }, err => {
          load.dismiss().then(() => {
            let t = Toast.create({ duration: 2000, message: 'No se pudo cargar los colores!' });
            this.nav.present(t).then(() => {
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
