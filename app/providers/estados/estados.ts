import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers} from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import * as ResponseClass from '../clases/response';

let PouchDB = require('pouchdb');
const apiUrl: string = 'http://www.indumatics.com.ar/api/estado/';
const idL: string = 'local';
const idS: string = 'server';

export class Estado {
  catalogoVersion: Date;
  appVersion: number;
  novedades: string;
  isLeido: boolean;

  constructor() {
    this.isLeido = false;
    this.catalogoVersion = new Date();
  }
}

export class EstadoResult {
  isUpdate: boolean;
  estado: Estado;
  constructor() {
    this.isUpdate = false;
  }
}

@Injectable()
export class Estados {
  private db: any;
  private localEstado: Estado;
  private serverEstado: Estado;

  constructor(private http: Http) { }

  private initDB() { this.db = PouchDB('estado', { adapter: 'websql' }); }

  private serverGetEstado(): Observable<ResponseClass.Response> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let url: string = apiUrl;
    return this.http.get(url, options).map(res => res.json());
  }

  private localSave(id: string, estado: Estado): Promise<any> {
    if (!this.db) { this.initDB(); }
    return this.db.get(id).then(doc => {
      return this.db.put({
        _id: id,
        _rev: doc._rev,
        doc: estado
      });
    }).catch(() => {
      return this.db.put({
        _id: id,
        doc: estado
      })
    });
  }

  private localGet(id: string): Promise<any> {
    if (!this.db) { this.initDB(); }
    return this.db.get(id);
  }

  public setCatalogoVersionNow(): Observable<boolean> {
    return Observable.create(obs => {
      this.localGet(idL).then(estado => {
        if (estado) {
          estado.catalogoVersion = new Date();
          this.updateLocalEstado(estado).subscribe(res => {
            obs.next(res.response);
          })
        } else {
          obs.next(false);
        }
      }).catch(() => {
        obs.error();
      })
    });
  }

  public updateLocalEstado(estado: Estado): Observable<ResponseClass.Response> {
    return Observable.create(obs => {
      this.localSave(idL, estado).then(() => {
        this.localEstado = estado;
        this.serverEstado = null;
        this.localSave(idS, this.serverEstado).then();
        obs.next(new ResponseClass.Response(true, ResponseClass.RES_OK, 'Se actualizao correctamente el estado local'));
        obs.complete();
      }).catch(() => {
        obs.error(new ResponseClass.Response(false, ResponseClass.RES_LOCAL_STORAGE_FAIL, 'No se pudo guardar el estado local'));
      });
    });
  }

  public getServerEstado(): Observable<Estado> {
    return Observable.create(obs => {
      this.serverGetEstado().subscribe(res => {
        if (res.response) {
          this.serverEstado = res.result[0];
          this.localSave(idS, this.serverEstado).then(() => {
            obs.next(this.serverEstado);
            obs.complete();
          }).catch(() => {
            obs.error(new ResponseClass.Response(false, ResponseClass.RES_LOCAL_STORAGE_FAIL, 'No se pudo guardar localmente'))
          })
        } else {
          obs.error(res);
        }
      }, err => {
        obs.error(err);
      });
    });
  }

  /**
   * Chequea el estado de actualizacion localmente
   * 
   * @returns {Observable<EstadoResult>}
   */
  public chkEstado(): Observable<EstadoResult> {
    return Observable.create(obs => {
      this.localGet(idL).then(doc => {
        this.localEstado = doc.doc;
        console.log('LOCAL:', this.localEstado);
        let resEstado = new EstadoResult();
        resEstado.estado = this.localEstado;
        this.localGet(idS).then(doc => {
          this.serverEstado = doc.doc;
          if (this.serverEstado) {
            resEstado.isUpdate = (this.serverEstado.catalogoVersion > this.localEstado.catalogoVersion);
            if ((resEstado.isUpdate) || (this.serverEstado.novedades != this.localEstado.novedades)) {
              resEstado.estado = this.serverEstado;
            }
          }
          obs.next(resEstado);
          obs.complete();
        }).catch(() => {
          obs.next(resEstado);
          obs.complete();
        });
      }).catch(() => {
        this.localGet(idS).then(doc => {
          this.serverEstado = doc.doc;
          if (this.serverEstado) {
            let resEstado = new EstadoResult();
            resEstado.isUpdate = true;
            resEstado.estado = this.serverEstado;
            obs.next(resEstado);
            obs.complete();
          } else {
            obs.error();
          }
        }).catch(() => {
          obs.error();
        })
      });
    });
  }

}
