import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ExpensesComponent } from './expenses.component';

const routes: Routes = [{ path: '', component: ExpensesComponent }];

@NgModule({
  declarations: [ExpensesComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ExpensesModule {}