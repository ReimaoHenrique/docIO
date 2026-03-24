import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ModelDetailComponent } from './components/model-detail/model-detail.component';
import { ModelEditorComponent } from './components/model-editor/model-editor.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'model/:slug', component: ModelDetailComponent },
  { path: 'model/:slug/editor', component: ModelEditorComponent },
  { path: '**', redirectTo: '' }
];
