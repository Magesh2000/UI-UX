import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RequestOptions, Http, Headers } from '@angular/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: Http) { }
  private URL: string = environment.API_HOST;
  private AUTH_URL: string = environment.AUTH_HOST;

  public username = new BehaviorSubject(null);

  set_username(val: any) {
    this.username.next(val);
  }

  login(username: any, password: any): Observable<{}> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    // headers.append('Authorization', 'Basic ' + btoa(username + ":" + password));

    let headeroptions = new RequestOptions({ headers: headers });
    let bodycontent = {
      'userName': username,
      'password': password
    }
    return this.http.post(this.AUTH_URL + "/login", bodycontent, headeroptions);
  }

  forgotPassword(username: any): Observable<{}> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let headeroptions = new RequestOptions({ headers: headers });
    let bodycontent = {
      "userLoginId": username,
    }
    return this.http.post(this.URL + "/common/forgotPassword", bodycontent, headeroptions);
  }

  changePassword(userName: any, oldpassword: any, newpassword: any, confirmpassword: any): Observable<{}> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let authToken: any = localStorage.getItem("access_token");
    headers.append('Authorization', `Bearer ${authToken}`);
    let headeroptions = new RequestOptions({ headers: headers });
    let bodycontent = {
      "userId": userName,
      "oldPassword": oldpassword,
      "newPassword": newpassword,
      "confirmPassword": confirmpassword
    }
    return this.http.post(this.URL + "/common/changePassword", bodycontent, headeroptions);
  }

}
