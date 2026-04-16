import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { BudgetsComponent } from './budgets.component';

const routes: Routes = [{ path: '', component: BudgetsComponent }];

@NgModule({
  declarations: [BudgetsComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class BudgetsModule {}