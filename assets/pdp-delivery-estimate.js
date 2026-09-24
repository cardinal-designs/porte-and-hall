/*
 * "Arrives Sep 29–Oct 1" under the buy buttons on the PDP.
 *
 * The range is counted in the browser from the buyer's own date, so it can't be
 * cached stale, and it skips Saturdays and Sundays. Day counts come from the
 * section settings; the element ships hidden and only appears once dates are in.
 */
customElements.define(
  'delivery-estimate',
  class DeliveryEstimate extends HTMLElement {
    connectedCallback() {
      const target = this.querySelector('[data-delivery-text]');
      if (!target) return;

      let min = parseInt(this.dataset.minDays, 10);
      let max = parseInt(this.dataset.maxDays, 10);
      if (!Number.isFinite(min) || !Number.isFinite(max)) return;
      if (min < 0) min = 0;
      if (max < min) max = min;

      const today = new Date();
      const from = this.addBusinessDays(today, min);
      const to = this.addBusinessDays(today, max);

      target.textContent = this.format(from, to);
      this.hidden = false;
    }

    // Counts forward `days` business days, landing on a weekday either way.
    addBusinessDays(from, days) {
      const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
      let added = 0;

      while (added < days) {
        date.setDate(date.getDate() + 1);
        if (!this.isWeekend(date)) added += 1;
      }

      while (this.isWeekend(date)) {
        date.setDate(date.getDate() + 1);
      }

      return date;
    }

    isWeekend(date) {
      const day = date.getDay();
      return day === 0 || day === 6;
    }

    format(from, to) {
      const month = (date) => date.toLocaleDateString('en-US', { month: 'short' });
      const start = `${month(from)} ${from.getDate()}`;

      if (from.getTime() === to.getTime()) return `Arrives ${start}`;

      // Same month reads as "Sep 29–30"; across months both months are named.
      const end =
        from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()
          ? `${to.getDate()}`
          : `${month(to)} ${to.getDate()}`;

      return `Arrives ${start}–${end}`;
    }
  }
);
