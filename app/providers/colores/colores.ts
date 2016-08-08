import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs';
import * as ResponseClass from '../clases/response';

let PouchDB = require('pouchdb');
const apiUrl: string = 'http://www.indumatics.com.ar/api/colores/index.php';

export class Color {
  id: number;
  color: string;
  incremento: number;
}

@Injectable()
export class Colores {
  private colores: Array<Color>;
  private db: any;

  constructor(private http: Http) { }

  private initDB() { this.db = PouchDB('colores', { adapter: 'websql' }); }


  /**
   * Guarda los Colores en le cache local
   * 
   * @private
   * @param {Array<Color>} data
   * @returns {Observable}
   * Exito: {Array<Color>}
   * Falla: Observable.error(error)
   */
  private localSaveColores(data: Array<Color>) {
    return Observable.create(obs => {
      if (!this.db) { this.initDB(); }
      this.db.get('color').then(doc => {
        return this.db.put({
          _id: 'color',
          _rev: doc._rev,
          doc: data
        });
      }).then(res => {
        obs.next(data);
      }).catch(err => {
        this.db.put({
          _id: 'color',
          doc: data
        }).then(() => {
          obs.next(data);
        }).catch(err => {
          obs.error(err);
        })
      });
    });
  }

  /**
   * Busca Colores en el cache local
   * 
   * @private
   * @returns {Observable}
   * Exito: {Array<Color>}
   * Falla: Observable.error(error)
   */
  private localGetAll() {
    return Observable.create(obs => {
      if (!this.db) { this.initDB(); }
      this.db.get('color').then(doc => {
        obs.next(doc.doc);
      }).catch(err => {
        obs.error(err);
      })
    });
  }

  /**
   * Descarga los Colores del servidor
   * 
   * @private
   * @returns {Observable}
   * Exito/Falla: {Response}
   */
  private serverGetAll() {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let url: string = apiUrl;
    return this.http.get(url, options).map(res => res.json());
  }

  /**
   * Retorna los Colores 
   * 
   * @returns {Observable}
   * Exito: {Array<Color>}
   * Falla: {Rosponse}
   */
  public getAll() {
    if (this.colores) {
      return Observable.create(obs => {
        obs.next(this.colores);
        obs.complete();
      });
    } else {
      return Observable.create(obs => {
        this.localGetAll().subscribe(doc => {
          this.colores = doc;
          obs.next(this.colores);
          obs.complete();
        }, err => {
          this.serverGetAll().subscribe(res => {
            if (res.response) {
              this.colores = res.result;
              this.localSaveColores(this.colores).subscribe(doc => {
                obs.next(this.colores);
              })
              obs.next(this.colores);
              obs.complete();
            } else {
              obs.error(res);
            }
          }, err => {
            let r = new ResponseClass.Response(false, ResponseClass.RES_SERVER_ERROR, 'Sin Conexión');
            obs.error(r);
          });
        })
      })
    }
  }
}

