import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
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
  fecha: Date = new Date();
  comentarios: string;
  isEnviado: boolean;
  isProcesado: boolean;
  detalle: Array<Item>;

  constructor() {
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

@Injectable()
export class Pedidos {
  private pedidoActual: Pedido;
  private pedidosEnviado: Array<Pedido>;
  private db: any;

  constructor(private http: Http) { }

  private initDB() { this.db = PouchDB('pedidos', { adapter: 'websql' }); }


  private localGetActual() {
    return Observable.create(obs => {
      if (!this.db) { this.initDB(); }
      this.db.get('actual').then(doc => {
        obs.next(doc.doc);
      }).catch(err => {
        obs.error(err);
      })
    });
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

  private localSaveEnviados(pedidos: Array<Pedido>) {
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
          this.pedidoActual = res;
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
        this.localGetActual().subscribe(doc => {
          this.pedidosEnviado = doc;
          obs.next(this.pedidosEnviado);
          obs.complete();
        }, err => {
          obs.error(err);
        });
      })
    }
  }

}

