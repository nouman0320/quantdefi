import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssembliesComponent } from './Components/assemblies/assemblies.component';
import { ItemsComponent } from './Components/items/items.component';

const routes: Routes = [
  { path: 'assemblies', component: AssembliesComponent },
  { path: 'items', component: ItemsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
