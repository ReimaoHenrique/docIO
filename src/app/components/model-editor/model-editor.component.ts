import { Component, inject, signal, computed, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import EasyMDE from 'easymde';

@Component({
  selector: 'app-model-editor',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, RouterLink],
  template: `
    <div class="container mx-auto p-6 max-w-6xl" *ngIf="model(); else notFound">
      <div class="mb-8 flex items-center gap-4">
        <a [routerLink]="['/model', model()?.slug]" class="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </a>
        <h1 class="text-3xl font-bold text-gray-800">Editor: {{ model()?.name }}</h1>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-100 flex flex-col md:flex-row gap-8">

        <!-- Constant Fields Form -->
        <div class="w-full md:w-1/3 border-r border-gray-100 pr-6 space-y-6">
            <h2 class="text-lg font-bold text-blue-700 uppercase tracking-wide border-b pb-2">Campos Fixos</h2>
            <div *ngFor="let field of model()?.fields" class="space-y-1">
              <label [for]="field" class="block text-sm font-medium text-gray-700 uppercase tracking-wide">
                {{ field }}
              </label>
              <input
                type="text"
                [id]="field"
                [ngModel]="formData()[field]"
                (ngModelChange)="updateFormField(field, $event)"
                [name]="field"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Preencha o valor..."
              >
            </div>

            <div class="pt-6 border-t border-gray-100 flex flex-col gap-3">
              <button
                (click)="generatePdf()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Gerar & Salvar PDF
              </button>
              <a [routerLink]="['/model', model()?.slug]" class="text-center text-gray-500 hover:text-gray-700 font-medium">Cancelar</a>
            </div>
        </div>

        <!-- EasyMDE Editor -->
        <div class="w-full md:w-2/3">
            <h2 class="text-lg font-bold text-blue-700 uppercase tracking-wide border-b pb-2 mb-4">Conteúdo do Documento</h2>
            <div class="prose max-w-none">
                <textarea #markdownEditor></textarea>
            </div>
        </div>
      </div>
    </div>

    <ng-template #notFound>
      <div class="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 class="text-3xl font-bold text-gray-800">Modelo não encontrado</h2>
        <a routerLink="/" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">Voltar para Home</a>
      </div>
    </ng-template>
  `,
  styles: [`
    :host ::ng-deep .EasyMDEContainer .CodeMirror {
      height: 400px;
    }
  `]
})
export class ModelEditorComponent implements AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private docService = inject(DocumentService);

  @ViewChild('markdownEditor') textarea!: ElementRef;
  private easyMDE: EasyMDE | null = null;

  slug = signal<string | null>(null);
  model = computed(() => {
    const s = this.slug();
    return s ? this.docService.getModelBySlug(s) : null;
  });

  formData = signal<Record<string, string>>({});

  updateFormField(field: string, value: string) {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  constructor() {
    this.route.params.subscribe(params => {
      this.slug.set(params['slug']);
      this.initForm();
    });
  }

  ngAfterViewInit() {
    if (this.textarea) {
        this.easyMDE = new EasyMDE({
            element: this.textarea.nativeElement,
            spellChecker: false,
            placeholder: "Escreva o conteúdo do seu documento aqui...",
            initialValue: "# Título do Documento\n\nEscreva seu texto aqui..."
        });
    }
  }

  ngOnDestroy() {
    if (this.easyMDE) {
        this.easyMDE.toTextArea();
        this.easyMDE = null;
    }
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
    if (!currentModel || !this.easyMDE) return;

    const markdownText = this.easyMDE.value();
    const doc = new jsPDF();

    // Watermark Logo - MUST BE ADDED FIRST TO BE IN BACKGROUND
    // We fetch the logo and convert to base64 or use the known data from the SVG
    const logoUrl = 'logo-bg-branca.svg';

    // Drawing the watermark FIRST so it's in the background
    // Using a simpler approach: draw the image with global transparency
    const addWatermark = (pdf: jsPDF) => {
        try {
            // @ts-ignore
            pdf.setGState(new pdf.GState({ opacity: 0.1 }));
            // We'll use the SVG directly as jsPDF-autotable or jspdf should handle it
            // If it fails, we'd need to use a pre-processed PNG
            pdf.addImage(logoUrl, 'SVG', 40, 60, 130, 180);
            // @ts-ignore
            pdf.setGState(new pdf.GState({ opacity: 1.0 }));
        } catch (e) {
            console.error('Watermark error', e);
        }
    };

    addWatermark(doc);

    // Header
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(currentModel.name.toUpperCase(), 10, 14);

    // Constant Fields
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CAMPOS FIXOS:', 10, 30);

    let y = 38;
    Object.entries(this.formData()).forEach(([key, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${key}:`, 15, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${value}`, 60, y);
      y += 8;
    });

    // Content
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('CONTEÚDO:', 10, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    const lines = doc.splitTextToSize(markdownText, 180);
    doc.text(lines, 15, y);

    const timestamp = new Date().getTime();
    const fileName = `${currentModel.slug}_${timestamp}.pdf`;

    this.docService.addHistoryEntry({
      modelSlug: currentModel.slug,
      data: { ...this.formData(), '_content': markdownText },
      fileName: fileName
    });

    doc.save(fileName);
    alert(`Documento "${fileName}" gerado com sucesso!`);
    this.router.navigate(['/model', currentModel.slug]);
  }
}
