import { ProdutosPage } from './../produtos/produtos';
import { ListaDaoProvider } from './../../providers/lista-dao/lista-dao';

import { Component } from '@angular/core';
import { NavController, AlertController, Alert } from 'ionic-angular';


import { Produto } from './../../modules/produtos/produto';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public listas: Array<any> = [];
  public produtos: Produto[];
  private _alerta: Alert;

  constructor(
    private _navCtrl: NavController,
    private _listaDeCompraDao:  ListaDaoProvider,
    private _alertCtrl: AlertController) { }

  ionViewDidLoad(){
    this.listagem();
  }
  
  ionViewWillEnter(){
    this.listagem();
  }

  listagem(){
    this._listaDeCompraDao.lista()
    .subscribe((listas) => {

      if(listas.length){
          this.listas = listas
      }
      
    })
  }

  irProdutos(chave:string = null){
    this._navCtrl.push(ProdutosPage.name, {
      chave: chave
    })
  }
  
  delete(chave:string){

    let mensagem = "";
    this._alerta = this._alertCtrl.create({
      title: 'Aviso',
      buttons:  [
        {
          text: 'ok',
          handler: data => {
            this.listagem();
          }
        }
      ]
    });

    this._listaDeCompraDao.remove(chave)
    .finally( () => {
        this._alerta.setSubTitle(mensagem);
        this._alerta.present();
      })
      .subscribe(
        () => mensagem = "Lista removida com sucesso !",
        () => mensagem = "Não foi possível remover a lista, tente novamente mais tarde!"
      );
  }
}