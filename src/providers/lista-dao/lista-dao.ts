import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Produto } from '../../modules/produtos/produto';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';

@Injectable()
export class ListaDaoProvider {

  constructor(
    private _http: HttpClient,
    private _storage: Storage) { }

  salva(prosutos:Array<Produto>, key:string){
    
    if(!key){
      let data  = new Date(Date.now());
      key = data.getDate() + "/"+ data.getMonth() +"/"+data.getFullYear();
    }
    
    let promise = this._storage.set(key , prosutos);
    return Observable.fromPromise(promise);
  }

  lista(){
    return Observable.fromPromise(this._storage.keys())
  }

  getLista(chave:string){
     return Observable.fromPromise(this._storage.get(chave));

  }

  remove(chave:string){
    
    return Observable.fromPromise(this._storage.remove(chave));
  }

}
