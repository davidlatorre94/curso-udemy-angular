import { Injectable } from '@angular/core';
import { formatDate, DatePipe } from '@angular/common';
import { CLIENTES } from './clientes.json';
import { Cliente } from './cliente';
import { of, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError, tap  } from 'rxjs/operators';
import swall from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private urlEndPoint:string = 'http://localhost:8080/api/clientes';

  private httpHeaders = new HttpHeaders({'Content-Type': 'application/json'})

  constructor(private http: HttpClient, private router: Router) { }

  getClientes(page:number): Observable<any> {
    return this.http.get(this.urlEndPoint + '/page/' + page).pipe(
      tap((response:any) => {
        (response.content as Cliente[]).forEach( cliente => {
          console.log(cliente.nombre);
        });
      }),
      map((response:any) => {
        (response.content as Cliente[]).map(cliente => {
          cliente.nombre = cliente.nombre.toUpperCase();
          //cliente.createAt = formatDate(cliente.createAt, 'dd-MM-yyyy', 'en-US');
          //let datePipe = new DatePipe('es-CO');
          //cliente.createAt = datePipe.transform(cliente.createAt, 'EEEE dd, MMMM yyyy');
          return cliente;
        });
        return response;
    }),
    tap(response => {
      console.log("TAP----2");
      (response.content as Cliente[]).forEach( cliente => {
        console.log(cliente.nombre);
      });
    })
    );
  }

  create(cliente: Cliente) : Observable<Cliente>{
    return this.http.post<any>(this.urlEndPoint, cliente, {headers: this.httpHeaders}).pipe(
      map( (response:any) => response.cliente as Cliente),
      catchError(e => {

        if(e.status==400){
          return throwError(e);
        }

        console.error(e.error.mensaje);
        swall.fire("Error al crear el cliente", e.error.mensaje, 'error');
        return throwError(e);
      })
    )
  }

  getCliente(id: number): Observable<Cliente>{
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/clientes']);
        console.error(e.error.mensaje);
        swall.fire("Error al editar", e.error.mensaje, 'error');
        return throwError(e);
      })
    )
  }

  update(cliente:Cliente): Observable<any>{
    return this.http.put<any>(`${this.urlEndPoint}/${cliente.id}`, cliente, {headers: this.httpHeaders}).pipe(
      catchError(e => {
        if(e.status==400){
          return throwError(e);
        }
        console.error(e.error.mensaje);
        swall.fire("Error al editar el cliente", e.error.mensaje, 'error');
        return throwError(e);
      })
    )
  }

  delete(id: number): Observable<Cliente>{
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`, {headers: this.httpHeaders}).pipe(
      catchError(e => {
        console.error(e.error.mensaje);
        swall.fire("Error al eliminar el cliente", e.error.mensaje, 'error');
        return throwError(e);
      })
    )
  }

}
