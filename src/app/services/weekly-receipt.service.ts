import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export type ReceiptItemType =
  | 'habit_earning'
  | 'dividend'
  | 'stock_purchase'
  | 'stock_sale'
  | 'stock_refund'
  | 'business_sale';

export interface ReceiptLineItem {
  id: string;
  type: ReceiptItemType;
  timestamp: string; // ISO
  amount: number; // signed — positive = cash in, negative = cash out
  icon: string;
  title: string;
  subtitle: string;
}

export interface ReceiptDay {
  date: Date;
  dayName: string;
  dateLabel: string;
  isToday: boolean;
  items: ReceiptLineItem[];
  total: number;
}

export interface WeeklyReceipt {
  weekStart: Date;
  weekEnd: Date;
  days: ReceiptDay[];
  totalIn: number;
  totalOut: number;
  net: number;
  itemCount: number;
}

interface WeeklyReceiptRow {
  item_type: ReceiptItemType;
  occurred_at: string;
  amount: number;
  primary_label: string;
  secondary_label: string;
  icon: string;
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

@Injectable({
  providedIn: 'root',
})
export class WeeklyReceiptService {
  private supabaseService = inject(SupabaseService);
  private get supabase() {
    return this.supabaseService.client;
  }

  /** Monday 12:00 AM local time for the week containing `referenceDate`. */
  getWeekStart(referenceDate: Date = new Date()): Date {
    const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
    const daysSinceMonday = (start.getDay() + 6) % 7; // getDay(): 0=Sun..6=Sat
    start.setDate(start.getDate() - daysSinceMonday);
    return start;
  }

  getWeekEnd(weekStart: Date): Date {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 7);
    return end;
  }

  addWeeks(weekStart: Date, delta: number): Date {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + delta * 7);
    return next;
  }

  async getWeeklyReceipt(weekStart: Date): Promise<WeeklyReceipt> {
    const weekEnd = this.getWeekEnd(weekStart);

    const { data, error } = await this.supabase.rpc('get_weekly_receipt', {
      p_week_start: weekStart.toISOString(),
      p_week_end: weekEnd.toISOString(),
    });

    if (error) {
      console.error('Error fetching weekly receipt:', error);
      throw error;
    }

    const items = ((data || []) as WeeklyReceiptRow[]).map((row) => this.toLineItem(row));
    return this.bucketByDay(weekStart, weekEnd, items);
  }

  private toLineItem(row: WeeklyReceiptRow): ReceiptLineItem {
    const amount = Number(row.amount) || 0;
    let title = row.primary_label;
    let subtitle = row.secondary_label;
    let icon = row.icon;

    switch (row.item_type) {
      case 'habit_earning':
        // primary = habit name, secondary = business type
        icon = row.icon || '✅';
        break;
      case 'dividend':
        // primary = friend's name, secondary = business name
        title = `Dividend from ${row.primary_label}`;
        subtitle = row.secondary_label;
        icon = '📈';
        break;
      case 'stock_purchase':
        title = `Bought shares — ${row.primary_label}`;
        subtitle = `Owned by ${row.secondary_label}`;
        icon = '📊';
        break;
      case 'stock_sale':
        title = `Sold shares — ${row.primary_label}`;
        subtitle = `Owned by ${row.secondary_label}`;
        icon = '📊';
        break;
      case 'stock_refund':
        title = `Shares refunded — ${row.primary_label}`;
        subtitle = 'Business was closed by the owner';
        icon = '↩️';
        break;
      case 'business_sale':
        title = `Sold business — ${row.primary_label}`;
        subtitle = row.secondary_label;
        icon = '💰';
        break;
    }

    return {
      id: `${row.item_type}-${row.occurred_at}-${Math.random().toString(36).slice(2, 8)}`,
      type: row.item_type,
      timestamp: row.occurred_at,
      amount,
      icon,
      title,
      subtitle,
    };
  }

  private bucketByDay(weekStart: Date, weekEnd: Date, items: ReceiptLineItem[]): WeeklyReceipt {
    const today = this.startOfLocalDay(new Date());
    const days: ReceiptDay[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push({
        date,
        dayName: DAY_NAMES[i],
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: date.getTime() === today.getTime(),
        items: [],
        total: 0,
      });
    }

    let totalIn = 0;
    let totalOut = 0;

    for (const item of items) {
      const ts = new Date(item.timestamp);
      if (ts < weekStart || ts >= weekEnd) continue; // safety net against tz edge cases
      const dayIndex = Math.round((this.startOfLocalDay(ts).getTime() - weekStart.getTime()) / 86400000);
      if (dayIndex < 0 || dayIndex > 6) continue;

      days[dayIndex].items.push(item);
      days[dayIndex].total += item.amount;

      if (item.amount >= 0) {
        totalIn += item.amount;
      } else {
        totalOut += item.amount;
      }
    }

    for (const day of days) {
      day.items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      day.total = Math.round(day.total * 100) / 100;
    }

    return {
      weekStart,
      weekEnd,
      days,
      totalIn: Math.round(totalIn * 100) / 100,
      totalOut: Math.round(totalOut * 100) / 100,
      net: Math.round((totalIn + totalOut) * 100) / 100,
      itemCount: items.length,
    };
  }

  private startOfLocalDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}
