import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Admincomp } from './components/admincomp/admincomp';
import { Register } from './components/register/register';
import { Userlogincmp } from './components/userlogincmp/userlogincmp';
import { Userlogin } from './components/userlogin/userlogin';
import { AdminDetails } from './components/admin-details/admin-details';
import { AdminSettings } from './components/admin-settings/admin-settings';
import { AdminSecurity } from './components/admin-security/admin-security';
const routes: Routes = [{path:'',component:Login},
  {path:'admin',component:Admincomp},
  {path:'register',component:Register},
  {path:'login',component:Login },
  {path:'userlogin',component:Userlogin },
  {path:'admin-details',component:AdminDetails },
  {path:'admin-settings',component:AdminSettings },
  {path:'admin-security',component:AdminSecurity },
  {path:'user',component:Userlogincmp }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
