import { trigger, transition, style, query, animate, group } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(10px)' })
    ], { optional: true }),
    query(':leave', [
      animate('200ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
    ], { optional: true }),
    query(':enter', [
      animate('400ms 200ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
    ], { optional: true })
  ])
]);
