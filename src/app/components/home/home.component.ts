import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocumentService, DocumentModel } from '../../services/document.service';
import { HistoryItemComponent } from '../history-item/history-item.component';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterLink, HistoryItemComponent, NgFor, NgIf],
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Dashboard de Modelos</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let model of models()" class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
          <div class="p-6 flex-grow">
            <h2 class="text-xl font-bold text-blue-700 mb-2">{{ model.name }}</h2>
            <p class="text-gray-600 mb-4">{{ model.description }}</p>

            <div class="mb-4">
              <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Histórico Recente</h3>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <app-history-item
                  *ngFor="let history of getHistory(model.slug)"
                  [entry]="history"
                  (onDelete)="deleteHistory($event)"
                ></app-history-item>
                <p *ngIf="getHistory(model.slug).length === 0" class="text-sm italic text-gray-400">Nenhum documento gerado ainda.</p>
              </div>
            </div>
          </div>

          <div class="p-4 bg-gray-50 border-t border-gray-100">
            <a [routerLink]="['/model', model.slug]" class="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              Novo Documento
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

  getHistory(slug: string) {
    return this.docService.getHistoryBySlug(slug);
  }

  deleteHistory(id: string) {
    this.docService.deleteHistoryEntry(id);
  }
}
