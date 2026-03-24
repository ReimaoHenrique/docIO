import { Component, input, output } from '@angular/core';
import { DocumentHistory } from '../../services/document.service';
import { DatePipe, NgFor } from '@angular/common';

@Component({
  selector: 'app-history-item',
  imports: [DatePipe],
  template: `
    <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center group hover:bg-gray-50 transition-colors">
      <div>
        <p class="text-sm font-medium text-gray-800">{{ entry().fileName }}</p>
        <p class="text-xs text-gray-500">{{ entry().timestamp | date:'short' }}</p>
      </div>
      <button
        (click)="onDelete.emit(entry().id)"
        class="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Excluir histórico"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  `,
})
export class HistoryItemComponent {
  entry = input.required<DocumentHistory>();
  onDelete = output<string>();
}
