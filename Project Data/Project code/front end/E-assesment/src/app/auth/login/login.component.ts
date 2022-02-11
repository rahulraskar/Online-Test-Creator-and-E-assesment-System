import { AuthService } from './../auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  selectedUser = -1
  email = ''
  password = ''
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
  }

  onLogin(): void {
    
    // console.log("in on login ")
    // console.log("selected user : "+this.selectedUser)
    // console.log("email : "+this.email)
    // console.log("password"+this.password)

    if(this.email.length == 0){
      this.toastr.error('please enter email')
    }else if(this.password.length == 0){
      this.toastr.error('please enter password')
    }else if(this.selectedUser == -1){
      this.toastr.error('please select user type')
    }else{
      this.authService
      .login(this.email,this.password,this.selectedUser)
      .subscribe(response => {
        if(response['status'] == 'Success'){
          
          const data = response['data']
          console.log(data)
          sessionStorage['firstName'] = data['firstName']
          sessionStorage['lastName'] = data['lastName']
          sessionStorage['id'] = data['id']

          this.toastr.success(`Welcome ${data['firstName']}`)
          if(this.selectedUser == 1){
            this.router.navigate(['/adminhome/admin/comp_1'])
          }else if(this.selectedUser == 2){
            this.router.navigate(['/userhome']) 
          }
        }else{
          this.toastr.error(`${response['Error']}`)
        }
      })
    }
  }
}
