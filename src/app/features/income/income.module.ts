import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { IncomeComponent } from './income.component';

const routes: Routes = [{ path: '', component: IncomeComponent }];

@NgModule({
  declarations: [IncomeComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class IncomeModule {}