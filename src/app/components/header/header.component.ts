import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `
    <header class="bg-blue-600 text-white shadow-md p-4 sticky top-0 z-10">
      <div class="container mx-auto flex justify-between items-center">
        <a routerLink="/" class="text-2xl font-bold flex items-center gap-2 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          DocIO
        </a>
        <nav>
          <ul class="flex space-x-4">
            <li><a routerLink="/" class="hover:underline">Dashboard</a></li>
          </ul>
        </nav>
      </div>
    </header>
  `,
  styles: [``]
})
export class HeaderComponent {}
