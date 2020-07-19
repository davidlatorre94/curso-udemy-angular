import { Component, OnInit } from '@angular/core';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { Router, ActivatedRoute } from '@angular/router';
import swall from 'sweetalert2';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public cliente: Cliente = new Cliente()
  public titulo:string = "Crear Cliente"

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
    })
  }

  public create(): void{
    console.log("Clicked!!!")
    this.clienteService.create(this.cliente).subscribe(
      cliente => {
        this.router.navigate(['/clientes'])
        swall.fire('nuevo cliente', `Cliente ${cliente.nombre} creado con éxito!`, 'success')
      }
    );
    console.log(this.cliente)
  }

  update():void{
    this.clienteService.update(this.cliente).subscribe( cliente => {
      this.router.navigate(['clientes'])
      swall.fire('Cliente Actualizado', `Cliente ${cliente.nombre} actualizado con éxito`, 'success')
    })
  }

}
