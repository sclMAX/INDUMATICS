import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
let PouchDB = require('pouchdb');
let apiUrl: string = 'http://www.indumatics.com.ar/api/usuarios/';

export class Usuario {
  id: number = 0;
  razonSocial: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  localidad: string = 'Paraná';
  provincia: string = 'Entre Ríos';
  pais: string = 'Argentina';
}


@Injectable()
export class Usuarios {
  private usuario: Usuario;
  private db: any;
  constructor(private http: Http) {
  }

  private initDB() {
    this.db = new PouchDB('usuarios', { adapter: 'websql' });
  }

  private localGetUsuario() {
    return Observable.create(obs => {
      if (!this.db) { this.initDB() };
      this.db.get('usuario').then(value => {
        this.usuario = <Usuario>value.doc;
        obs.next(this.usuario);
        obs.complete();
      }).catch(() => {
        this.usuario = new Usuario();
        obs.next(this.usuario);
        obs.complete();
      });
    });
  }

  /**
   * Intenta gruardar el usuario localmente
   * 
   * @private
   * @param {Usuario} u
   * @returns 
   * Exito: {Usuario} guardado
   * Falla: Observable.error(error)
   */
  private localSaveUsuario(u: Usuario) {
    return Observable.create(obs => {
      if (!this.db) { this.initDB() };
      this.db.get('usuario').then(doc => {
        return this.db.put({
          _id: doc._id,
          _rev: doc._rev,
          doc: u
        });
      }).then(doc => {
        obs.next(doc);
        obs.complete();
      }).catch(err => {
        obs.error(err);
      });
    });
  }

  /**
   * Registra un Usuario en el Servidor
   * 
   * @private
   * @param {Usuario} u
   * @returns Observable 
   * result: id generado en el servidor / null ,
   *  response = true/false,
   *  message = string descriptivo,
   *  code = RES_OK = 200/RES_ACCESO_DENEGADO = 401;RES_SERVER_ERROR = 500;
   *     RES_DATABASE_ERROR = 510;RES_FALTAN_PARAMETROS = 422;RES_NO_EN_DB = 410;RES_DB_KEY_ERROR = 23000;
   * 
   */
  private serverRegitrarUsuario(u: Usuario) {
    let usuario = JSON.stringify(u);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let url: string = apiUrl + '?usuario=' + encodeURI(usuario) + '&apikey=30708166614';
    return this.http.post(url, {}, options).map(res => res.json());
  }

  private serverUpdateUsuario(u: Usuario) {
    let usuario = JSON.stringify(u);
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let url: string = apiUrl + '?usuario=' + encodeURI(usuario) + '&apikey=30708166614';
    return this.http.put(url, {}, options).map(res => res.json());
  }

  /**
   * Intenta registrar un usuario en el servidor, si lo logra lo guarda localmente
   * 
   * @param {Usuario} u
   * @returns
   * Exito: {Usuario} con el id del servido incorporado
   * Falla: {Response} del servidor
   */
  public registrarUsuario(u: Usuario) {
    return Observable.create(obs => {
      this.serverRegitrarUsuario(u).subscribe(value => {
        if (value.response) {
          u.id = <number>value.result;
          if (u.id) {
            this.localSaveUsuario(u).subscribe(res => {
              obs.next(u);
              obs.complete();
            }, err => {
              obs.error(err);
            }, () => {
              obs.complete();
            });
          } else {
            obs.error(value);
          }
        } else {
          obs.error(value);
        }
      }, err => {
        obs.error(err);
      }, () => {
        obs.complete();
      })
    });
  }

  public getUsuario() {
    return Observable.create(obs => {
      this.localGetUsuario().subscribe(value => {
        this.usuario = value;
        obs.next(this.usuario);
        obs.complete();
      }, err => {
        obs.error(err);
      }, () => { obs.complete() });
    });
  }

}



