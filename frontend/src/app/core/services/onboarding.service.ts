import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly KEY = 'inventory_tour_done';

  hasSeenTour(): boolean  { return localStorage.getItem(this.KEY) === 'true'; }
  shouldShowTour(): boolean { return !this.hasSeenTour(); }
  markTourDone(): void    { localStorage.setItem(this.KEY, 'true'); }
  resetTour(): void       { localStorage.removeItem(this.KEY); }
}
