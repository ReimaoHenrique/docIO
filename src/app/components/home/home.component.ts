import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgFor],
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Dashboard de Modelos</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let model of models()" class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col hover:border-blue-300 transition-colors">
          <div class="p-6 flex-grow">
            <h2 class="text-xl font-bold text-blue-700 mb-2">{{ model.name }}</h2>
            <p class="text-gray-600 mb-4">{{ model.description }}</p>
          </div>

          <div class="p-4 bg-gray-50 border-t border-gray-100">
            <a [routerLink]="['/model', model.slug]" class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              Ver Histórico & Novo Documento
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class HomeComponent {
  private docService = inject(DocumentService);
  models = this.docService.models;
}
