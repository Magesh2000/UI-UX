import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../confirmation-dialog/confirmation-dialog.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { ComponentLoaderService } from 'src/app/core/services/component-loader.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  labels: any = {};
  hide: any;
  is_login: any = true;
  message: any = '';
  _success = new Subject<string>();

  constructor(private router: Router, private formBuilder: FormBuilder, public loginService: LoginService, private httpClient: HttpClient, private dialog: MatDialog, private authService: AuthService, private componentLoaderService: ComponentLoaderService) { }

  ngOnInit(): void {
    localStorage.clear();
    this.componentLoaderService.display(false);
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.pattern(new RegExp('\\S'))]],
      password: ['', [Validators.pattern(new RegExp('\\S'))]],
    });
    this.httpClient.get("assets/api/label-jp.json").subscribe(data => {
      this.labels = data;
    });
    this._success.subscribe((message: any) => this.message = message);
    this._success.pipe(
      debounceTime(70000)
    ).subscribe(() => this.message = null);
  }

  login() {
    if (!this.loginForm.value.username && !this.loginForm.value.password) {
      this._success.next(this.labels?.user_id_and_password_is_required);
    }
    else if (this.loginForm.value.username && !this.loginForm.value.password) {
      this._success.next(this.labels?.password_required);
    }
    else if (!this.loginForm.value.username && this.loginForm.value.password) {
      this._success.next(this.labels?.user_id_required);
    } else {
      this._success.next('');
    }
    if (this.loginForm.valid) {
      this.componentLoaderService.display(true);
      this.loginService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe((data: any) => {
        let loginRes = JSON.parse(data['_body']);
        if (loginRes?.responseCode == '200') {
    
          localStorage.setItem('previousUrl', '/login');
          loginRes?.succesObject?.firstLogin == 0 ? this.router.navigateByUrl('/blank') : this.router.navigateByUrl('/change-password');
          localStorage.setItem('userId', loginRes?.succesObject?.userId);
          localStorage.setItem('userLn', loginRes?.succesObject?.userLn);
          localStorage.setItem('userName', loginRes?.succesObject?.userName);
          localStorage.setItem('roleId', loginRes?.succesObject?.roleId);
          localStorage.setItem('imagePath', loginRes?.succesObject?.imagePath);
          this.authService.set_profile_image(loginRes?.succesObject?.imagePath);
          localStorage.setItem('access_token', loginRes?.succesObject?.access_token);
          localStorage.setItem('refreshToken', loginRes?.succesObject?.refreshToken);
          localStorage.setItem('screenListM', JSON.stringify(loginRes?.authSuccesObject));
          localStorage.setItem('screenListR', JSON.stringify(loginRes?.authSuccesObject));
          localStorage.setItem('moduleList', JSON.stringify(loginRes?.moduleSuccesObject));
          this.componentLoaderService.display(false);
        } else if (loginRes?.responseCode == '401') {
          this._success.next(this.labels?.unauthorized_user_id_and_password);
          this.componentLoaderService.display(false);
        } else {
          this.componentLoaderService.display(false);
        }
      }, error => {
        this.componentLoaderService.display(false);
        if (error.status === 401) {
          this._success.next(this.labels?.unauthorized_user_id_and_password);
        }
      })
      this.loginService.set_username(this.loginForm.value.username);
    } else {
      if (!this.loginForm.value.username) this.loginForm.get('username')?.markAsTouched();
      if (!this.loginForm.value.password) this.loginForm.get('password')?.markAsTouched();
    }
  }

  forgot_password() {
    if (this.loginForm.value.username) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: false,
        width: 'auto',
        data: {
          title: this.labels?.confirmation,
          message: 'temppassword',
          btnYes: this.labels?.ok,
          btnNo: this.labels?.no,
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result == true) {
          this.loginService.forgotPassword(this.loginForm.value.username).subscribe((data: any) => {
            let forgotPasswordRes = JSON.parse(data['_body']);
            if (forgotPasswordRes.responseCode == 200) {
              setTimeout(() => {
                this._success.next(forgotPasswordRes.responseMessage);
                this.is_login = !this.is_login;
              }, 2000);
            } else {
              setTimeout(() => {
                this._success.next(forgotPasswordRes.responseMessage);
                this.is_login = !this.is_login;
              }, 2000);
            }
          }, error => {
            if (error.status === 401) {
              alert(error);
            }
          })
        }
        else {
          this.is_login = !this.is_login;
        }
      })
    }
    else {
      this.message = this.labels?.please_enter_valid_user_id;
    }
  }

  userId(event: any) {
    let username = event.srcElement.value;
    if (username !== "") {
      this.message = "";
    } else {
      this.message = this.labels?.please_enter_valid_user_id;
    }
  }

}
