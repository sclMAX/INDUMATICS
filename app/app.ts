import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HomePage} from './pages/home/home';
import {RegistroPage} from './pages/usuario/registro/registro';
import {Estados} from './providers/estados/estados';


@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>',
  providers: [Estados]
})
export class MyApp {
  rootPage: any = HomePage;

  constructor(platform: Platform, estadosP: Estados) {
    platform.ready().then(() => {
      estadosP.getServerEstado().subscribe();
      StatusBar.styleDefault();
    });
  }
}

ionicBootstrap(MyApp);
