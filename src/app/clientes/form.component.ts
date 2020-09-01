import { Component, OnInit } from '@angular/core';
import { Cliente } from './cliente';
import { Region } from './region';
import { ClienteService } from './cliente.service';
import { Router, ActivatedRoute } from '@angular/router';
import swall from 'sweetalert2';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public cliente: Cliente = new Cliente();
  public regiones: Region[];
  public titulo:string = "Crear Cliente";

  public errores: string[];

  constructor(private clienteService: ClienteService, private router: Router, private activatedRoute:ActivatedRoute) { }

  ngOnInit(): void {
    this.cargarCliente()
  }

  cargarCliente(): void{
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if(id){
        this.clienteService.getCliente(id).subscribe( (cliente) => this.cliente = cliente)
      }
    });

    this.clienteService.getRegiones().subscribe(regiones => this.regiones = regiones);
  }

  public create(): void{
    console.log("Clicked!!!")
    this.clienteService.create(this.cliente).subscribe(
      cliente => {
        this.router.navigate(['/clientes'])
        swall.fire('nuevo cliente', `Cliente ${cliente.nombre} creado con éxito!`, 'success')
      },
      err => {
        this.errores = err.error.errors as string[];
        console.error("length: " + this.errores.length);
        console.error("El status code desde backend: " + err.status);
        console.error(err.error.errors);
      }
    );
    console.log(this.cliente)
  }

  update():void{
    this.clienteService.update(this.cliente).subscribe( json => {
      this.router.navigate(['clientes'])
      swall.fire('Cliente Actualizado', `Cliente ${json.cliente.nombre} actualizado con éxito`, 'success')
    },
    err => {
      this.errores = err.error.errors as string[];
      console.error("El status code desde backend: " + err.status);
      console.error(err.error.errors);
    })
  }

  compararRegion(o1: Region, o2: Region):boolean{

    if( o1 === undefined && o2 === undefined){
      return true;
    }

    return o1 == null || o2 == null ? false : o1.id === o2.id ? true : false;
  }

}
