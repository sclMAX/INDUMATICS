import { Component } from '@angular/core';
import { NavController, NavParams, Toast} from 'ionic-angular';
import {Pedidos, Pedido} from '../../../providers/pedidos/pedidos';
import {RegistroPage} from '../../usuario/registro/registro';
import {FormBuilder, ControlGroup, Validators} from '@angular/common';

@Component({
  templateUrl: 'build/pages/pedidos/pedido-config/pedido-config.html',
  providers: [Pedidos],
})
export class PedidoConfigPage {
  title: string;
  pedido: Pedido;
  pedidoForm: ControlGroup;
  isChange: boolean = false;

  constructor(private navCtrl: NavController, private parametros: NavParams,
    private pedidosP: Pedidos, private formBuilder: FormBuilder) {
    this.pedido = this.parametros.get('pedido');
    this.title = 'Ajustes pedido Actual';
    this.pedidoForm = this.createForm();
  }

  goRegistro() {
    this.navCtrl.push(RegistroPage);
  }

  savePedido() {
    let t = Toast.create({ duration: 2000 });
    this.pedidosP.saveActual(this.pedido).subscribe(res => {
      t.setMessage('Ajustes guardados correctamente!');
      this.navCtrl.present(t);
    }, err => {
      t.setMessage('No se puedo guardar los cambios!');
      this.navCtrl.present(t);
    });
    this.isChange = false;
  }

  private createForm() {
    return this.formBuilder.group({
      tipo: ['', Validators.required],
    });
  }

  onChanges() {
    this.isChange = true;
  }

}
