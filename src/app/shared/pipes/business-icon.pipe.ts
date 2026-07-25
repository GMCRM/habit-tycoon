import { Pipe, PipeTransform } from '@angular/core';
import { businessIconAsset } from '../business-icon.util';

// Resolves a business emoji to its illustrated icon asset, or null if
// there isn't one — templates fall back to rendering the emoji itself.
@Pipe({ name: 'businessIconSrc', standalone: true })
export class BusinessIconPipe implements PipeTransform {
  transform(icon: string | null | undefined): string | null {
    return businessIconAsset(icon);
  }
}
