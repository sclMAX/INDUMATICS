import {Component} from '@angular/core';
import {NavController, Loading, Toast} from 'ionic-angular';
import {Platform} from 'ionic-angular';
import {FormBuilder, ControlGroup, Validators} from '@angular/common';
import {Usuarios, Usuario} from '../../../providers/usuarios/usuarios';

@Component({
  templateUrl: 'build/pages/usuario//registro/registro.html',
  providers: [Usuarios]
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


  registrarUsuario() {
    let t = Toast.create({ duration: 2000 });
    console.log(this.usuario);

    if (this.usuario.id > 0) { //si tiene un id actualiza los cambios en el servidor 
      let load = Loading.create({
        content: 'Guardando datos del usuario...'
      });
      this.navCtrl.present(load).then(() => {
        this.usuariosP.updateUsuario(this.usuario).subscribe(value => {
          t.setMessage('Usuario actualizado correctamente');
          this.navCtrl.present(t);
        }, err => {
          load.dismiss().then(() => {
            t.setMessage('Error al actualizar los datos ERROR:' + err);
            this.navCtrl.present(t);
          });
          console.log(err);
        }, () => {
          load.dismiss();
        });
      });
    } else { //si no, registra el usuario en el servidor
      let load = Loading.create({
        content: 'Registrar usuario...'
      });
      this.navCtrl.present(load).then(() => {
        this.usuariosP.registrarUsuario(this.usuario).subscribe(value => {
          this.usuario = value;
          t.setMessage('Usuario registrado correctamente con el ID:' + this.usuario.id);
          this.navCtrl.present(t);
        }, err => {
          load.dismiss();
          t.setMessage('Error al intentar registrar el ususario ERROR: ' + err.message);
          console.log(err);
          this.navCtrl.present(t);
        }, () => {
          load.dismiss();
        })
      });
    }
  }

  private createForm() {
    return this.formBuilder.group({
      razonSocial: [''],
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
    this.platform.ready().then(() => {
      let load = Loading.create({
        content: 'Cargando datos...',
        showBackdrop: false,
        dismissOnPageChange: true,
      });
      this.navCtrl.present(load).then(() => {
        this.usuariosP.getUsuario()
          .subscribe(value => {
            this.usuario = value;
            if (this.usuario.id > 0) { this.title = 'Modificar datos...' };
          }, err => {
            console.error.bind(err);
          }, () => {
            load.dismiss();
          });
      });
    });
  }

}
