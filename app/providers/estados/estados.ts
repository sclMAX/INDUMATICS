import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers} from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import * as ResponseClass from '../clases/response';

let PouchDB = require('pouchdb');
const apiUrl: string = 'http://www.indumatics.com.ar/api/estado/';

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

@Injectable()
export class Estados {
  private db: any;
  private estado: Estado;

  constructor(private http: Http) { }

  private initDB() { this.db = PouchDB('estado', { adapter: 'websql' }); }

  private serverGetEstado() {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    let url: string = apiUrl;
    return this.http.get(url, options).map(res => res.json());
  }



}

