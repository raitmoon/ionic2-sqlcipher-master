import {Page, NavController, NavParams, Platform} from 'ionic-angular';

//プラグインの読み込み
declare var sqlitePlugin:any;
declare var plugins:any;
declare var cordova:any;
declare var window:any;

@Page({
  templateUrl: 'build/pages/list/list.html'
})
export class ListPage {

  //配列の定義
  items: Array<{title: string}>;

  constructor(private nav: NavController, navParams: NavParams, platform: Platform) {
    //DeviceReadyになってから処理を開始（ここが重要）
    platform.ready().then(()=>{
      //DBファイルの物理パスを作成
      var filePath : string = cordova.file.dataDirectory.replace("NoCloud", "LocalDatabase") + 'encrypted.db';
      //ファイルの存在チェック
      window.resolveLocalFileSystemURI(filePath, ()=> {
        //DBファイルがある場合は、データ取得処理を実行
        this.getData();
      }, (error) => {
        //DBファイルがない場合(初回起動時)はDBファイルのコピー処理を実行
        this.dbCopy();
      })
    });
  }
  
  //DBファイルコピー処理
  dbCopy() {
    plugins.sqlDB.copy('encrypted.db', 2, ()=>{
      this.getData();
    }, (error)=>{
      console.log("Error Code = "+JSON.stringify(error));
    });
  }

  //データ取得処理
  getData(){
    //データベース接続をオープン
    sqlitePlugin.openDatabase({name: 'encrypted.db', key: 'Password', location: 'default'}, (db) => {
      //なぜかトランザクション処理しないとSELECTできないのでトランザクション開始
      db.transaction((tx) => {
        //SELECT文を作成
        var query: string = "SELECT * FROM items";
        //var param: [string] = ['param'];
        this.items = [];
        //SQL実行
        tx.executeSql(query, [], (tx, resultSet) => {
          for (var i: number = 0; i < resultSet.rows.length; i++ ) {
            //items配列へデータを追加
            this.items.push({
              title: resultSet.rows.item(i).name
            });
          }
        }, (error) => {
          alert('SELECT error: ' + error.message);
          console.log('SELECT error: ' + error.message);
        });
      }, (error) => {
        alert('transaction error: ' + error.message);
        console.log('transaction error: ' + error.message);
      }, () => {
        console.log('transaction ok');
      });
    }, (error) => {
      alert('error' + error.message);
    });
  }  

  //アイテムがタップされた時の処理
  itemTapped(event, item) {
    //ListPage(自分自身)をプッシュして表示
    this.nav.push(ListPage, {
      item: item
    });
  }
}
