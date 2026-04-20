import { Component, input, output } from '@angular/core';

/**
 * Fixed-position floating panel (e.g. tooltip/popover).
 * Position and visual styling are controlled by the parent; body is projected.
 */
@Component({
  selector: 'app-float-tooltip',
  imports: [],
  templateUrl: './float-tooltip.component.html',
})
export class FloatTooltipComponent {
  visible = input(false);
  leftPx = input(0);
  topPx = input(0);
  /** Tailwind / arbitrary classes for the panel (size, border, background, padding). */
  panelClass = input('');

  popoverEnter = output<void>();
  popoverLeave = output<void>();
}
