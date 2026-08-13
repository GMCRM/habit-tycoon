import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface BugReportInput {
  type: 'bug';
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
}

export interface FeatureRequestInput {
  type: 'feature';
  details: string;
}

export type FeedbackInput = BugReportInput | FeatureRequestInput;

/**
 * Sends user feedback to the `submit-feedback` Supabase Edge Function, which
 * relays it by email. The destination address lives only server-side in the
 * edge function, never in client code, so it's never exposed to end users.
 */
@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  constructor(private supabaseService: SupabaseService) {}

  async submitFeedback(input: FeedbackInput): Promise<void> {
    const { error } = await this.supabaseService.client.functions.invoke('submit-feedback', {
      body: input,
    });

    if (error) {
      let message = 'Failed to send feedback. Please try again.';
      const context = (error as any)?.context;
      if (context?.json) {
        try {
          const body = await context.json();
          if (body?.error) {
            message = body.error;
          }
        } catch {
          // Response body wasn't JSON; fall back to the default message.
        }
      }
      throw new Error(message);
    }
  }
}
