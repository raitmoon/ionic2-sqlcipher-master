import {Page, NavController, NavParams, Platform} from 'ionic-angular';
declare var sqlitePlugin:any;
declare var plugins:any;
declare var cordova:any;
declare var window:any;

@Page({
  templateUrl: 'build/pages/list/list.html'
})
export class ListPage {

  items: Array<{title: string}>;

  constructor(private nav: NavController, navParams: NavParams, platform: Platform) {
    platform.ready().then(()=>{
      var filePath : string = cordova.file.dataDirectory.replace("NoCloud", "LocalDatabase") + 'encrypted.db';
      window.resolveLocalFileSystemURI(filePath, ()=> {
        this.getData();
      }, (error) => {
        this.dbCopy();
      })
    });
  }
  
  dbCopy() {
    plugins.sqlDB.copy('encrypted.db', 2, ()=>{
      this.getData();
    }, (error)=>{
      console.log("Error Code = "+JSON.stringify(error));
    });
  }

  getData(){
    sqlitePlugin.openDatabase({name: 'encrypted.db', key: 'Password', location: 'default'}, (db) => {
      db.transaction((tx) => {
          var query: string = "SELECT * FROM items";
          //var param: [string] = ['param'];
          this.items = [];
          tx.executeSql(query, [], (tx, resultSet) => {
            for (var i: number = 0; i < resultSet.rows.length; i++ ) {
              //alert("name: " + resultSet.rows.item(i).name);
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

  itemTapped(event, item) {
    this.nav.push(ListPage, {
      item: item
    });
  }
}
