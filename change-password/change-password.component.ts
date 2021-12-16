import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../confirmation-dialog/confirmation-dialog.component';
import { LoginService } from '../login/login.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment';
import { FormControl, Validators } from '@angular/forms';
import { ComponentLoaderService } from 'src/app/core/services/component-loader.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  hide1: any;
  hide2: any;
  hide3: any;
  userId!: any;
  oldpassword = new FormControl('', [Validators.pattern(new RegExp('\\S'))]);
  newpassword = new FormControl('', [Validators.pattern(new RegExp('\\S'))]);
  confirmpassword = new FormControl('', [Validators.pattern(new RegExp('\\S'))]);
  successMessage!: string;
  changedmessage!: string;
  subscriptionList: Subscription[] = [];
  labels: any = {};
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private loginService: LoginService,
    private httpClient: HttpClient,
    private authService: AuthService,
    private componentLoaderService: ComponentLoaderService,
  ) { }

  ngOnInit() {
    if (localStorage.length > 0) {
      this.userId = localStorage.getItem('userId');
    } else {
      if (environment.envName == 'local') {
        this.router.navigateByUrl('/');
      } else {
        window.location.href = '../twp-common';
      }
    }
    let url: any = localStorage.getItem('userLn') ? localStorage.getItem('userLn') : "en";
    if (url) this.httpClient.get("assets/api/label-" + url + ".json").subscribe(data => {
      this.labels = data;
    });
  }

  changePassword(event: any): void {

    if (this.oldpassword.invalid || this.newpassword.invalid || this.confirmpassword.invalid) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: false,
        width: 'auto',
        data: {
          title: this.labels?.alert,
          message: 'password',
          btnYes: this.labels?.ok
        }
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        this.oldpassword.markAsTouched();
        this.newpassword.markAsTouched();
        this.confirmpassword.markAsTouched();
      });
    } else if (this.newpassword.value !== this.confirmpassword.value) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: false,
        width: 'auto',
        data: {
          title: this.labels?.alert,
          message: 'confirmpassword',
          btnYes: this.labels?.ok
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result == true) {
          this.confirmpassword.setValue('');
          this.confirmpassword.markAsTouched();
        }
      });
    } else if (this.oldpassword.value === this.newpassword.value) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: false,
        width: 'auto',
        data: {
          title: this.labels?.alert,
          message: 'passwordcheck',
          btnYes: this.labels?.ok
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result == true) {
          this.newpassword.setValue('');
          this.newpassword.markAsTouched();
          this.confirmpassword.setValue('');
          this.confirmpassword.markAsTouched();
        }
      });
    } else {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: false,
        width: 'auto',
        data: {
          title: this.labels?.do_you_want_to_change_password,
          message: 'changePassword',
          btnYes: this.labels?.yes,
          btnNo: this.labels?.no,
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result == true) {
          this.componentLoaderService.display(true);
          this.loginService.changePassword(this.userId, this.oldpassword.value, this.newpassword.value, this.confirmpassword.value).subscribe((data: any) => {
            let changeNewPasswordRes = JSON.parse(data['_body']);

            
            this.successMessage = changeNewPasswordRes.responseMessage;
            if (changeNewPasswordRes.responseCode == 200) {
              this.successMessage = changeNewPasswordRes.responseMessage;
              const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                disableClose: false,
                panelClass: 'btnCenter',
                width: 'auto',
                data: {
                  title: this.labels?.information,
                  server: 'servermessage',
                  message: this.successMessage,
                  btnYes: this.labels?.ok,
                }
              });
              dialogRef.afterClosed().subscribe((data: any) => {
                this.componentLoaderService.display(true);
                setTimeout(() => {
                  window.localStorage.removeItem('access_token');
                  window.localStorage.clear();
                  this.router.navigateByUrl('/');
                }, 2000);
              });

            }
            this.componentLoaderService.display(false);
          }, error => {
            this.componentLoaderService.display(false);
            if (error.status === 401) {
              if (this.authService.refreshToken().subscribe((status: any) => { return status })) {
                this.changePassword(event);
              }
            }
          });
        }
      });
    }
  }

  cancel() {
    if (String(localStorage.getItem('previousUrl'))) this.router.navigateByUrl(String(localStorage.getItem('previousUrl')));
  }

  ngOnDestroy() {
    this.subscriptionList.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

}
