import {Component} from '@angular/core';
import {NavController, Loading} from 'ionic-angular';
import {Platform} from 'ionic-angular';
import {FormBuilder, ControlGroup, Validators} from '@angular/common';
import {Usuarios, Usuario} from '../../../providers/usuarios/usuarios';

@Component({
  templateUrl: 'build/pages/usuario//registro/registro.html',
  providers:[Usuarios]
})
export class RegistroPage {
  usuarioForm: ControlGroup;
  title: string;
  usuario: Usuario;


  constructor(public navCtrl: NavController, private formBuilder: FormBuilder,
    private usuariosP: Usuarios, private platform: Platform) {
    this.title = "Registro de Usuario";
    this.usuario = new Usuario();
    this.usuarioForm = this.createForm();
  }

  private createForm() {
    return this.formBuilder.group({
      nombre: ['', Validators.required],
      telefono: ['', Validators.required && Validators.minLength(8)],
      email: ['', Validators.required && Validators.minLength(10)],
      direccion: ['', Validators.required && Validators.minLength(6)],
      localidad: ['', Validators.required && Validators.minLength(4)],
      provincia: ['', Validators.required && Validators.minLength(5)],
      pais: ['', Validators.required && Validators.minLength(5)],
    });
  }

  ionViewWillEnter() {
    let load = Loading.create({
      content: 'Cargando datos...',
      showBackdrop: false,
      dismissOnPageChange: true,
    });
    this.navCtrl.present(load).then(() => {
      this.usuariosP.getUsuario()
        .subscribe(value => {
          this.usuario = value;
        }, err => {
          console.error.bind(err);
        }, () => {
          load.dismiss();
        });
    });
  }

}
