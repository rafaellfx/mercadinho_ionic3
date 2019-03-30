import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, AlertController, Alert, ToastController } from 'ionic-angular';

import { Produto } from '../../modules/produtos/produto';
import { ListaDaoProvider } from '../../providers/lista-dao/lista-dao';

@IonicPage()
@Component({
  selector: 'page-produtos',
  templateUrl: 'produtos.html',
})
export class ProdutosPage {

  public produtos: Produto[] = [];
  private _precoTotal: number = 0;
  private _toggle: boolean;
  private _alerta: Alert;
  private _key: string = '';

  constructor(
    public navCtrl: NavController,
    private _listaDeCompraDao: ListaDaoProvider,
    private _actionSheetCtrl: ActionSheetController,
    private _listaDao: ListaDaoProvider,
    private _navParams: NavParams,
    private _toastCtrl: ToastController,
    private _alertCtrl: AlertController) { }

  ionViewDidLoad() {

    this._key = this._navParams.get('chave');

    this._listaDao.getLista(this._key)
      .subscribe(
        (lista) => {

          this.produtos = lista ? lista : this.produtos;
        },
        (error) => console.log(error)
      );
  }

  addProduto() {

    const prompt = this._alertCtrl.create({
      title: 'Produto',
      message: "Informe o produto e valor",
      inputs: [
        {
          name: 'nome',
          placeholder: 'Produto'
        },
        {
          name: 'preco',
          placeholder: 'R$'
        },
        {
          name: 'qtn',
          placeholder: 'Quantidade'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: data => {

            let produto: Produto;
            produto = { nome: data.nome, preco: +data.preco, qtn: +data.qtn };
            this.produtos.push(produto);
            this._addProdutoInList(this.produtos,"Produto adicionado!");

          }
        }
      ]
    });
    prompt.present();
    
  }

  get precoTotal() {
    return this._decimalAdjust('round', this._precoTotal, -1);
  }

  updateAllWithToggle(toggle: boolean, produto: Produto) {

    this._toggle = toggle;

    if (toggle) {

      this._precoTotal += +produto.preco * produto.qtn;

    } else {

      this._precoTotal -= +produto.preco * produto.qtn;

    }

  }

  addLista() {

    let mensagem = "";
    this._alerta = this._alertCtrl.create({
      title: 'Aviso',
      buttons: [
        { text: 'ok' }
      ]
    });

    this._listaDeCompraDao.salva(this.produtos, this._key)
      .finally(() => {
        this._alerta.setSubTitle(mensagem);
        this._alerta.present();
      })
      .subscribe(
        () => mensagem = "Lista cadastrada com sucesso !",
        () => mensagem = "Não foi possível cadastrar a lista, tente novamente mais tarde!"
      );
  }

  delete(produtoParaRemover: Produto) {

    this.produtos = this.produtos.filter((produto: Produto) => !(JSON.stringify(produto) == JSON.stringify(produtoParaRemover)));
    this._listaDeCompraDao.salva(this.produtos, this._key)
      .subscribe(
        () => this._addProdutoInList(this.produtos, "Produto removido!")
      )

  }



  addQuantidade(produto: Produto) {

    this._actionSheetCtrl.create({
      title: "Alterar a quantidade",
      buttons: [
        {
          text: "+",
          handler: () => {
            this._adicionaDiminui(produto, Operador.MAIS);
          },
        },
        {
          text: "-",
          handler: () => {
            produto.qtn
              ? this._adicionaDiminui(produto, Operador.MENOS)
              : '';
          },
        }
      ]
    }).present();

  }

  private _adicionaDiminui(produto: Produto, operador: number) {

    this.produtos = this.produtos.filter((produtoFind: Produto) =>
      this.produtos.some(() => {

        if (JSON.stringify(produtoFind) == JSON.stringify(produto)) {

          if (this._toggle && operador == 1) {
            this._precoTotal += produto.preco;
          } else if (this._toggle) {
            this._precoTotal -= produto.preco;
          }

          produto.qtn = operador + produtoFind.qtn

        }

        return true;
      })

    );
  }

  private _addProdutoInList(produtos: Array<Produto>, mensagem: string){

    this._listaDeCompraDao.salva(produtos, this._key)
      .subscribe(
        () => this._toastCtrl.create({
          message: mensagem,
          duration: 2000
        }).present()
      )
  }

  private _decimalAdjust(type, value, exp) {
    
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

}

export enum Operador {

  MENOS = -1,
  MAIS = 1
};
