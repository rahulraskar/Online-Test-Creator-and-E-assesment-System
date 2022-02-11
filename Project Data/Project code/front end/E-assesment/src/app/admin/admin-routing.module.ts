import { Comp2Component } from './comp2/comp2.component';
import { Comp1Component } from './comp1/comp1.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  
  { path: 'comp_1', component:  Comp1Component},
  { path: 'comp_2', component:  Comp2Component }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
