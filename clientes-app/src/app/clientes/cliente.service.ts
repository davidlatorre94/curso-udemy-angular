import { Injectable } from '@angular/core';
import { formatDate, DatePipe } from '@angular/common';
import { Cliente } from './cliente';
import { Region } from './region';
import { of, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import swall from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../usuarios/auth.service';
import { IfStmt } from '@angular/compiler';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private urlEndPoint: string = 'http://localhost:8080/api/clientes';

  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  private agregarAuthorizationHeader() {
    let token = this.authService.token;
    if (token != null) {
      return this.httpHeaders.append('Authorization', 'Bearer ' + token);
    }
    return this.httpHeaders;
  }

  private isNoAutorizado(e): boolean {
    if (e.status == 401 ) {
      
      if(this.authService.isAuthenticated()){
        this.authService.logout();
      }

      this.router.navigate(['/login']);
      return true;
    } else if (e.status == 403) {
      swall.fire('Acceso denegado', `Hola ${this.authService.usuario.username} no tienes acceso a este recurso!`,'warning');
      this.router.navigate(['/clientes']);
      return true;
    } else {
      return false;
    }
  }

  getRegiones(): Observable<Region[]> {
    return this.http
      .get<Region[]>(this.urlEndPoint + '/regiones', { headers: this.agregarAuthorizationHeader() })
      .pipe(
        catchError((e) => {
          this.isNoAutorizado(e);
          return throwError(e);
        })
      );
  }

  getClientes(page: number): Observable<any> {
    return this.http.get(this.urlEndPoint + '/page/' + page).pipe(
      tap((response: any) => {
        (response.content as Cliente[]).forEach((cliente) => {
          console.log(cliente.nombre);
        });
      }),
      map((response: any) => {
        (response.content as Cliente[]).map((cliente) => {
          cliente.nombre = cliente.nombre.toUpperCase();
          //cliente.createAt = formatDate(cliente.createAt, 'dd-MM-yyyy', 'en-US');
          //let datePipe = new DatePipe('es-CO');
          //cliente.createAt = datePipe.transform(cliente.createAt, 'EEEE dd, MMMM yyyy');
          return cliente;
        });
        return response;
      }),
      tap((response) => {
        console.log('TAP----2');
        (response.content as Cliente[]).forEach((cliente) => {
          console.log(cliente.nombre);
        });
      })
    );
  }

  create(cliente: Cliente): Observable<Cliente> {
    return this.http
      .post<any>(this.urlEndPoint, cliente, { headers: this.agregarAuthorizationHeader() })
      .pipe(
        map((response: any) => response.cliente as Cliente),
        catchError((e) => {
          if (this.isNoAutorizado(e)) {
            return throwError(e);
          }

          if (e.status == 400) {
            return throwError(e);
          }

          console.error(e.error.mensaje);
          swall.fire('Error al crear el cliente', e.error.mensaje, 'error');
          return throwError(e);
        })
      );
  }

  getCliente(id: number): Observable<Cliente> {
    return this.http
      .get<Cliente>(`${this.urlEndPoint}/${id}`, { headers: this.agregarAuthorizationHeader() })
      .pipe(
        catchError((e) => {
          if (this.isNoAutorizado(e)) {
            return throwError(e);
          }

          this.router.navigate(['/clientes']);
          console.error(e.error.mensaje);
          swall.fire('Error al editar', e.error.mensaje, 'error');
          return throwError(e);
        })
      );
  }

  update(cliente: Cliente): Observable<any> {
    return this.http
      .put<any>(`${this.urlEndPoint}/${cliente.id}`, cliente, { headers: this.agregarAuthorizationHeader() })
      .pipe(
        catchError((e) => {
          if (this.isNoAutorizado(e)) {
            return throwError(e);
          }

          if (e.status == 400) {
            return throwError(e);
          }
          console.error(e.error.mensaje);
          swall.fire('Error al editar el cliente', e.error.mensaje, 'error');
          return throwError(e);
        })
      );
  }

  delete(id: number): Observable<Cliente> {
    return this.http
      .delete<Cliente>(`${this.urlEndPoint}/${id}`, { headers: this.agregarAuthorizationHeader() })
      .pipe(
        catchError((e) => {
          if (this.isNoAutorizado(e)) {
            return throwError(e);
          }

          console.error(e.error.mensaje);
          swall.fire('Error al eliminar el cliente', e.error.mensaje, 'error');
          return throwError(e);
        })
      );
  }

  subirFoto(archivo: File, id: number): Observable<HttpEvent<{}>> {
    let formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('id', id.toString());

    console.log("AAAAAAAAAAA");
    let httpHeaders = new HttpHeaders();
    let token = this.authService.token;
    if (token != null) {
      console.log("BBBBBBBBB");
      httpHeaders = httpHeaders.append('Authorization', 'Bearer ' + token);
    }
    console.log("CCCCCCC");
    console.log("ato: "  + JSON.stringify(httpHeaders));
    const req = new HttpRequest('POST', `${this.urlEndPoint}/upload`, formData, {
      reportProgress: true,
      headers: httpHeaders,
    });

    return this.http.request(req).pipe(
      catchError((e) => {
        this.isNoAutorizado(e);
        return throwError(e);
      })
    );
  }
}
