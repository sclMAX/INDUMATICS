import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import * as ResponseClass from '../clases/response';

let PouchDB = require('pouchdb');
const apiUrl: string = 'http://www.indumatics.com.ar/api/lineas/index.php';

export class Linea {
  id: number;
  linea: string;
  descripcion: string;
  isEncatalogo: boolean;
}

@Injectable()
export class Lineas {
  private lineas: Array<Linea>;
  private db: any;

  constructor(private http: Http) { }

  private initDB() { this.db = PouchDB('lineas', { adapter: 'websql' }) }

  /**
   * Guarda las lineas localmente
   * 
   * @private
   * @param {Array<Linea>} l
   * @returns {Observable}
   * Exito: {Array<Linea>} l
   * Falla: Observable.error(error)
   */
  private localSaveLineas(l: Array<Linea>) {
    return Observable.create(obs => {
      if (!this.db) { this.initDB() };
      this.db.get('linea').then(doc => {
        return this.db.put({
          _id: 'linea',
          doc: l,
          _rev: doc._rev
        });
      }).then(res => {
        obs.next(l);
      }).catch(err => {
        this.db.put({
          _id: 'linea',
          doc: l
        }).then(() => {
          obs.next(l);
        }).catch(err => {
          obs.error(err);
        })
      });
    });
  }

  /**
   * Recupera las lineas gurdadas localmente
   * 
   * @private
   * @returns {Observable}
   * Exito: {Array<Linea>}
   * Falla: Observable.error(error)
   */
  private localGetLineas() {
    return Observable.create(obs => {
      if (!this.db) { this.initDB(); }
      this.db.get('linea').then(doc => {
        this.lineas = doc.doc;
        obs.next(this.lineas);
      }).catch(err => {
        obs.error(err);
      });
    });
  }

  /**
   * Descarga las lineas del Servidor
   * 
   * @private
   * @returns {Observable}
   * Exito/Falla: {Response}
   */
  private serverGetLineas() {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let url: string = apiUrl;
    return this.http.get(url, options).map(res => res.json());
  }

  /**
   * Busca las lineas localmente si no las encuentra las busca en el servidor
   * 
   * @returns {Observable}
   * Exito: {Array<Linea>}
   * Falla: {Response} 
   */
  public getAll() {
    if (this.lineas) {
      return Observable.create(obs => { obs.next(this.lineas) });
    } else {
      return Observable.create(obs => {
        this.localGetLineas().subscribe(res => { //Busca las lineas loaclmente y la retorna
          this.lineas = res;
          obs.next(this.lineas);
        }, err => { //Si no encuentra localmente busca en el servidor
          this.serverGetLineas().subscribe(res => {
            if (res.response) { //si se lograron descargar intenta guardarlas localmente y retorna las lineas
              this.lineas = <Array<Linea>>res.result;
              this.localSaveLineas(this.lineas).subscribe(res => {
                obs.next(this.lineas);
              }, err => {
                obs.next(this.lineas);
              });
            } else {// en caso de conexion exitosa pero sin datos retorna el error {Response} 
              obs.error(res);
            }
          }, err => {
            let r = new ResponseClass.Response(false, ResponseClass.RES_SERVER_ERROR, 'Sin conexión a internet!');
          })
        })
      });
    }
  }




}

