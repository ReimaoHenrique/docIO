import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { HistoryItemComponent } from '../history-item/history-item.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-model-detail',
  imports: [RouterLink, HistoryItemComponent, NgFor, NgIf],
  template: `
    <div class="container mx-auto p-6 max-w-5xl" *ngIf="model(); else notFound">
      <div class="mb-8 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <a routerLink="/" class="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          <div>
            <h1 class="text-3xl font-bold text-gray-800">{{ model()?.name }}</h1>
            <p class="text-gray-500">{{ model()?.description }}</p>
          </div>
        </div>

        <a [routerLink]="['/model', model()?.slug, 'editor']" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Novo Documento
        </a>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h2 class="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Histórico de Edições</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <app-history-item
            *ngFor="let history of history()"
            [entry]="history"
            (onDelete)="deleteHistory($event)"
          ></app-history-item>
        </div>

        <div *ngIf="history().length === 0" class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-gray-400 italic text-lg">Nenhum documento gerado para este modelo ainda.</p>
            <p class="text-gray-400">Clique em "Novo Documento" para começar.</p>
        </div>
      </div>
    </div>

    <ng-template #notFound>
      <div class="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 class="text-3xl font-bold text-gray-800">Modelo não encontrado</h2>
        <a routerLink="/" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">Voltar para Home</a>
      </div>
    </ng-template>
  `
})
export class ModelDetailComponent {
  private route = inject(ActivatedRoute);
  private docService = inject(DocumentService);

  slug = signal<string | null>(null);
  model = computed(() => {
    const s = this.slug();
    return s ? this.docService.getModelBySlug(s) : null;
  });

  history = computed(() => {
    const s = this.slug();
    return s ? this.docService.getHistoryBySlug(s) : [];
  });

  constructor() {
    this.route.params.subscribe(params => {
      this.slug.set(params['slug']);
    });
  }

  deleteHistory(id: string) {
    this.docService.deleteHistoryEntry(id);
  }
}
