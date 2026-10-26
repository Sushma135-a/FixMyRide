import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { Login } from './components/login/login';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Register } from './components/register/register';
import { Admincomp } from './components/admincomp/admincomp';
import { Userlogincmp } from './components/userlogincmp/userlogincmp';
import { HttpClientModule } from '@angular/common/http';
import { Userlogin } from './components/userlogin/userlogin';

@NgModule({
  declarations: [
    App,
    Login,
    Register,
    Admincomp,
    Userlogincmp,
    Userlogin
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient()
  ],
  bootstrap: [App]
})
export class AppModule { }
