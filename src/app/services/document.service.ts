import { Injectable, signal, effect } from '@angular/core';

export interface DocumentModel {
  slug: string;
  name: string;
  description: string;
  fields: string[];
}

export interface DocumentHistory {
  id: string;
  modelSlug: string;
  timestamp: number;
  data: Record<string, string>;
  fileName: string;
}

const INITIAL_MODELS: DocumentModel[] = [
  {
    slug: 'contrato-servico',
    name: 'Contrato de Serviço',
    description: 'Modelo básico para prestação de serviços diversos.',
    fields: ['Contratante', 'Contratado', 'Valor', 'Prazo']
  },
  {
    slug: 'declaracao-residencia',
    name: 'Declaração de Residência',
    description: 'Documento para comprovação de endereço.',
    fields: ['Nome Completo', 'CPF', 'Endereço', 'Cidade', 'Estado']
  },
  {
    slug: 'recibo-pagamento',
    name: 'Recibo de Pagamento',
    description: 'Comprovante de recebimento de valores.',
    fields: ['Recebedor', 'Pagador', 'Valor Extenso', 'Referente a']
  }
];

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly STORAGE_KEY = 'doc_io_data';

  models = signal<DocumentModel[]>(INITIAL_MODELS);
  history = signal<DocumentHistory[]>([]);

  constructor() {
    this.loadFromStorage();

    // Auto-save history changes
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history()));
    });
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.history.set(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored data', e);
        this.history.set([]);
      }
    }
  }

  getModels() {
    return this.models();
  }

  getModelBySlug(slug: string) {
    return this.models().find(m => m.slug === slug);
  }

  getHistoryBySlug(slug: string) {
    return this.history().filter(h => h.modelSlug === slug);
  }

  addHistoryEntry(entry: Omit<DocumentHistory, 'id' | 'timestamp'>) {
    const newEntry: DocumentHistory = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    this.history.update(h => [newEntry, ...h]);
    return newEntry;
  }

  deleteHistoryEntry(id: string) {
    this.history.update(h => h.filter(item => item.id !== id));
  }
}
