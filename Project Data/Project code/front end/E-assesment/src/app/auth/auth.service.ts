import { Router } from '@angular/router';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url = ''
  constructor( private Router :Router, private httpClient :HttpClient) { }
  login(email: string, password: string,selectedUser : number) {
    
    if(selectedUser == 1){
      this.url = 'http://localhost:3000/admin'
    }else if(selectedUser == 2){
      this.url = 'http://localhost:4000/user'
    }
    const body = {
      email: email,
      password: password
    }
    return this.httpClient.post(this.url + '/signin', body)
  }
}
