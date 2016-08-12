import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import * as ResponseClass from '../clases/response';
import {Linea} from '../lineas/lineas';
import {Estados, Estado} from '../estados/estados';

let PouchDB = require('pouchdb');
const apiUrl: string = 'http://www.indumatics.com.ar/api/perfiles/';

export class Perfil {
  idPerfil: string;
  descripcion: string;
  largo: number;
  pxm: number;
  bxp: number;
  idLinea: number;
}

@Injectable()
export class Perfiles {
  private db: any;
  private perfiles: Array<Perfil>;

  constructor(private http: Http, private estadosP: Estados) { }

  private initDB() { this.db = PouchDB('perfiles', { adapter: 'websql' }) }

  private setEstado() {
    this.estadosP.setCatalogoVersionNow();
  }

  /**
   * Descarga los perfiles del servidor
   * 
   * @private
   * @returns {Observable}
   * Existo/Falla : {Response}
   */
  private serverGetAll() {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.get(apiUrl, options).map(res => res.json());
  }

  /**
   * Guarda los perfiles en cache local
   * 
   * @private
   * @param {Array<Perfil>} p
   * @returns {Observable}
   * Exito: {Array<Perfil>}
   * Falla: {Response}
   */
  private localSavePerfiles(p: Array<Perfil>) {
    return Observable.create(obs => {
      if (!this.db) { this.initDB(); }
      this.db.get('perfil').then(doc => {
        return this.db.put({
          _id: 'perfil',
          _rev: doc._rev,
          doc: p
        });
      }).then(() => {
        this.setEstado();
        obs.next(p);
      }).catch(err => {
        this.db.put({
          _id: 'perfil',
          doc: p
        }).then(() => {
          this.setEstado();
          obs.next(p);
        }).catch(err => {
          let r = new ResponseClass.Response(false, ResponseClass.RES_LOCAL_STORAGE_FAIL, 'No se pudo gurdar el cache local');
          obs.error(r);
        })
      })
    });
  }

  /**
   * Recupera los perfiles del cache local
   * 
   * @private
   * @returns {Observable}
   * Exito: {Array<Perfil>}
   * Falla: Observable.error(error)
   */
  private localGetAll() {
    return Observable.create(obs => {
      if (!this.db) { this.initDB(); }
      this.db.get('perfil').then(doc => {
        obs.next(doc.doc);
      }).catch(err => {
        obs.error(err);
      });
    });
  }

  /**
   * Busca en el cache local o el servidor los pediles 
   * 
   * @returns {Observable}
   * Exito: {Array<Perfil>}
   * Falla: {Response}
   */
  private getAll() {
    if (this.perfiles) {
      return Observable.create(obs => { obs.next(this.perfiles); });
    } else {
      return Observable.create(obs => {
        this.localGetAll().subscribe(doc => {
          this.perfiles = doc;
          obs.next(this.perfiles);
        }, erro => {
          this.serverGetAll().subscribe(res => {
            if (res.response) {
              this.perfiles = res.result;
              this.localSavePerfiles(this.perfiles).subscribe(doc => {
                obs.next(this.perfiles);
              }, err => {
                obs.next(this.perfiles);
              })
            } else {
              obs.error(res);
            }
          }, err => {
            let r = new ResponseClass.Response(false, ResponseClass.RES_SERVER_ERROR, 'Sin Conexión!');
            obs.error(r);
          })
        })
      });
    }
  }

  public getPerfilesLinea(l: Linea) {
    if (this.perfiles) {
      return Observable.create(obs => {
        let pl: Array<Perfil> = this.perfiles.filter((perfil) => {
          return (perfil.idLinea === l.id);
        });
        obs.next(pl);
        obs.complete();
      });
    } else {
      return Observable.create(obs => {
        this.getAll().subscribe(value => {
          this.perfiles = value;
          let pl: Array<Perfil> = this.perfiles.filter((perfil) => {
            return (perfil.idLinea === l.id);
          });
          obs.next(pl);
          obs.complete();
        }, err => {
          obs.error(err);
        })
      });
    }
  }




}

