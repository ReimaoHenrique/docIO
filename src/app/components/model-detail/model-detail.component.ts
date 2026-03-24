import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DocumentService, DocumentModel } from '../../services/document.service';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-model-detail',
  imports: [NgIf, NgFor, FormsModule, RouterLink],
  template: `
    <div class="container mx-auto p-6 max-w-4xl" *ngIf="model(); else notFound">
      <div class="mb-8 flex items-center gap-4">
        <a routerLink="/" class="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </a>
        <h1 class="text-3xl font-bold text-gray-800">{{ model()?.name }}</h1>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <p class="text-gray-600 mb-8 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 italic">
          {{ model()?.description }}
        </p>

        <form (ngSubmit)="generatePdf()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div *ngFor="let field of model()?.fields" class="space-y-1">
              <label [for]="field" class="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                {{ field }}
              </label>
              <input
                type="text"
                [id]="field"
                [(ngModel)]="formData()[field]"
                [name]="field"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              >
            </div>
          </div>

          <div class="pt-6 border-t border-gray-100 flex justify-end gap-4">
            <button
              type="button"
              routerLink="/"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Gerar PDF (Easymode)
            </button>
          </div>
        </form>
      </div>
    </div>

    <ng-template #notFound>
      <div class="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 class="text-3xl font-bold text-gray-800">Modelo não encontrado</h2>
        <p class="text-gray-500 mb-6">O slug que você acessou não corresponde a nenhum modelo conhecido.</p>
        <a routerLink="/" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Voltar para Home</a>
      </div>
    </ng-template>
  `,
  styles: [``]
})
export class ModelDetailComponent {
  private route = inject(ActivatedRoute);
  private docService = inject(DocumentService);

  slug = signal<string | null>(null);
  model = computed(() => {
    const s = this.slug();
    return s ? this.docService.getModelBySlug(s) : null;
  });

  formData = signal<Record<string, string>>({});

  constructor() {
    this.route.params.subscribe(params => {
      this.slug.set(params['slug']);
      this.initForm();
    });
  }

  initForm() {
    const currentModel = this.model();
    if (currentModel) {
      const initial: Record<string, string> = {};
      currentModel.fields.forEach(f => initial[f] = '');
      this.formData.set(initial);
    }
  }

  generatePdf() {
    const currentModel = this.model();
    if (!currentModel) return;

    // Easymode simulation via jsPDF
    const doc = new jsPDF();

    // Header
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(currentModel.name.toUpperCase(), 10, 14);

    // Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    let y = 40;

    Object.entries(this.formData()).forEach(([key, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${key}:`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${value}`, 60, y);
      y += 10;
    });

    const timestamp = new Date().getTime();
    const fileName = `${currentModel.slug}_${timestamp}.pdf`;

    // Save record in data history
    this.docService.addHistoryEntry({
      modelSlug: currentModel.slug,
      data: this.formData(),
      fileName: fileName
    });

    // Save/Download PDF
    doc.save(fileName);

    alert(`Documento "${fileName}" gerado com sucesso via Easymode!`);
  }
}
