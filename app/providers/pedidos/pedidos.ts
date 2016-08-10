import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs';
import {Perfil} from '../perfiles/perfiles';
import {Color} from '../colores/colores';
import * as ResponseClass from '../clases/response';

let PouchDB = require('pouchdb');
const apiUrl: string = 'http://www.indumatics.com.ar/api/pedidos/index.php';

export class Pedido {
  id: number;
  idUsuario: number;
  isPedido: boolean;
  fecha: Date;
  comentarios: string;
  isEnviado: boolean;
  isProcesado: boolean;
  detalle: Array<Item>;

  constructor() {
    this.fecha = new Date();
    this.isPedido = false;
    this.isEnviado = false;
    this.isProcesado = false;
    this.comentarios = '';
    this.detalle = new Array<Item>();
  }
}

export class Item {
  id: number;
  idPedido: number;
  cantidad: number;
  perfil: Perfil;
  color: Color;
  comentario: string;
}

class PedidoServer {
  id: number;
  idUsuario: number;
  isPedido: boolean;
  fecha: Date;
  comentarios: string;
  isEnviado: boolean;
  isProcesado: boolean;
  detalle: Array<ItemServer>;
  constructor() {
    this.detalle = new Array<ItemServer>();
  }
}

class ItemServer {
  id: number;
  idPedido: number;
  cantidad: number;
  idPerfil: string;
  idColor: number;
  comentario: string;
}

@Injectable()
export class Pedidos {
  private pedidoActual: Pedido;
  private pedidosEnviado: Array<Pedido>;
  private db: any;

  constructor(private http: Http) { }

  private initDB() { this.db = PouchDB('pedidos', { adapter: 'websql' }); }

  private convertToServer(p: Pedido) {
    let ps = new PedidoServer();
    ps.id = 0;
    ps.idUsuario = p.idUsuario * 1;
    ps.isPedido = p.isPedido;
    ps.fecha = p.fecha;
    ps.isEnviado = p.isEnviado;
    ps.isProcesado = p.isProcesado;
    ps.comentarios = p.comentarios;
    p.detalle.forEach(item => {
      let its = new ItemServer();
      its.id = 0;
      its.idPedido = 0;
      its.cantidad = item.cantidad * 1;
      its.idPerfil = item.perfil.idPerfil;
      its.idColor = item.color.id * 1;
      its.comentario = item.comentario;
      ps.detalle.push(its);
    });
    return ps;
  }
  private localGetActual() {
    return Observable.create(obs => {
      if (!this.db) { this.initDB(); }
      this.db.get('actual').then(doc => {
        obs.next(doc.doc);
      }).catch(err => {
        obs.error(err);
      });
    });
  }
  private localDeleteActual() {
    return this.localSaveActual(null);
  }
  private localSaveActual(pedido: Pedido) {
    return Observable.create(obs => {
      if (!this.db) { this.initDB(); }
      this.db.get('actual').then(doc => {
        return this.db.put({
          _id: 'actual',
          _rev: doc._rev,
          doc: pedido
        });
      }).then(() => {
        obs.next(pedido);
      }).catch(err => {
        this.db.put({
          _id: 'actual',
          doc: pedido
        }).then(() => {
          obs.next(pedido);
        }).catch(err => {
          obs.error(err);
        })
      })
    });
  }

  private localGetEnviados() {
    return Observable.create(obs => {
      if (!this.db) { this.initDB(); }
      this.db.get('enviados').then(doc => {
        obs.next(doc.doc);
      }).catch(err => {
        obs.error(err);
      })
    });
  }

  public localSaveEnviados(pedidos: Array<Pedido>) {
    return Observable.create(obs => {
      if (!this.db) { this.initDB(); }
      this.db.get('enviados').then(doc => {
        return this.db.put({
          _id: 'enviados',
          _rev: doc._rev,
          doc: pedidos
        });
      }).then(() => {
        obs.next(pedidos);
      }).catch(err => {
        this.db.put({
          _id: 'enviados',
          doc: pedidos
        }).then(() => {
          obs.next(pedidos);
        }).catch(err => {
          obs.error(err);
        })
      });
    });
  }

  private serverSend(pedido: any) {
    let data = JSON.stringify(pedido);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let url: string = apiUrl;
    return this.http.post(url, { 'apikey': 30708166614, 'pedido': pedido }, options).map(res => res.json());
  }

  private setActualToEnviado(pedido: Pedido, enviados: Array<Pedido>) {
    return Observable.create(obs => {
      pedido.isEnviado = true;
      let pedidoEnviar: any = this.convertToServer(<Pedido>JSON.parse(JSON.stringify(pedido)));
      this.serverSend(pedidoEnviar).subscribe(res => { //Envia el pedido al servidor
        console.log('OK:', res);
        if (res.response) { //Exito
          pedido.id = res.result;
          enviados.push(pedido);
          this.localDeleteActual().subscribe(() => { //Si tiene exito Borra el pedido actual
            this.pedidoActual = null;
            this.localSaveEnviados(enviados).subscribe(() => { //Guarda el pedido en lista de pedidos enviados
              this.pedidosEnviado = enviados;
              let r = new ResponseClass.Response(true, ResponseClass.RES_OK, 'Se envio el pedido Correctamente!');
              obs.next(r);
            }, err => { //si falla al guardar lista de pedidos Retorna Ok pero con warnings
              let r = new ResponseClass.Response(true, ResponseClass.RES_LOCAL_STORAGE_FAIL, 'Se envio el pedido Correctamente, pero no se pudo guardar en lista de enviados local!');
              obs.next(r);
            })
          }, err => {//si falla al borrar el pedido actual Retorna Ok pero con warnings
            let r = new ResponseClass.Response(true, ResponseClass.RES_LOCAL_STORAGE_FAIL, 'Se envio el pedido Correctamente, pero no se pudo eliminar la copia local!');
            obs.next(r);
          });
        } else { //Si falla al enviar al servidor retorna el error del servidor
          console.log('ERROR EN EL SERVIDOR:', res)
          obs.error(res);
        }
      }, err => {
        let r = new ResponseClass.Response(false, ResponseClass.RES_SERVER_ERROR, 'Sin conexión!');
        obs.error(r);
      })
    });
  }

  public getActual() {
    if (this.pedidoActual) {
      return Observable.create(obs => {
        obs.next(this.pedidoActual);
        obs.complete();
      });
    } else {
      return Observable.create(obs => {
        this.localGetActual().subscribe(doc => {
          this.pedidoActual = doc;
          obs.next(this.pedidoActual);
          obs.complete();
        }, err => {
          obs.error(err);
        });
      })
    }
  }

  public saveActual(pedido: Pedido) {
    return Observable.create(obs => {
      this.pedidoActual = pedido;
      this.localSaveActual(this.pedidoActual).subscribe(res => {
        obs.next(res);
        obs.complete();
      }, err => {
        obs.error(err);
      });
    });
  }

  public addItem(item: Item) {
    if (this.pedidoActual) {
      return Observable.create(obs => {
        this.pedidoActual.detalle.push(item);
        this.localSaveActual(this.pedidoActual).subscribe(res => {
          obs.next(res);
          obs.complete();
        }, err => {
          obs.error(err);
        })
      });
    } else {
      return Observable.create(obs => {
        this.getActual().subscribe(res => {
          if (res) {
            this.pedidoActual = res;
          } else {
            this.pedidoActual = new Pedido();
          }
          this.pedidoActual.detalle.push(item);
          this.saveActual(this.pedidoActual).subscribe(res => {
            obs.next(res);
            obs.complete();
          }, err => {
            obs.error(err);
          });
        }, err => {
          this.pedidoActual = new Pedido();
          this.pedidoActual.detalle.push(item);
          this.saveActual(this.pedidoActual).subscribe(res => {
            obs.next(res);
            obs.complete();
          }, err => {
            obs.error(err);
          });
        })
      });
    }

  }

  public getEnviados() {
    if (this.pedidosEnviado) {
      return Observable.create(obs => {
        obs.next(this.pedidosEnviado);
        obs.complete();
      });
    } else {
      return Observable.create(obs => {
        this.localGetEnviados().subscribe(doc => {
          this.pedidosEnviado = doc;
          obs.next(this.pedidosEnviado);
          obs.complete();
        }, err => {
          obs.error(err);
        });
      })
    }
  }

  public sendPedido(pedido: Pedido) {
    if (!pedido.idUsuario) {
      return Observable.create(obs => {
        let r = new ResponseClass.Response(false, ResponseClass.RES_FALTAN_PARAMETROS, 'Debe registrarse como usuario - Opciones -> Datos de Usuario!');
        obs.error(r);
      });
    } else {
      return Observable.create(obs => {
        if (this.pedidosEnviado) {
          this.setActualToEnviado(pedido, this.pedidosEnviado).subscribe(res => {
            obs.next(res);
            obs.complete();
          }, err => {
            obs.error(err);
          });
        } else {
          this.getEnviados().subscribe(res => {
            this.pedidosEnviado = res;
            this.setActualToEnviado(pedido, this.pedidosEnviado).subscribe(res => {
              obs.next(res);
              obs.complete();
            }, err => {
              obs.error(err);
            });
          }, err => {
            this.setActualToEnviado(pedido, new Array<Pedido>()).subscribe(res => {
              obs.next(res);
              obs.complete();
            }, err => {
              obs.error(err);
            });
          })
        }

      });
    }
  }

}

