import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssembliesComponent } from './Components/assemblies/assemblies.component';

const routes: Routes = [
  { path: 'assemblies', component: AssembliesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
