import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ModelDetailComponent } from './components/model-detail/model-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'model/:slug', component: ModelDetailComponent },
  { path: '**', redirectTo: '' }
];
