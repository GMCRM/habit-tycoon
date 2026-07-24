import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules, withHashLocation } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  // The app logs auth internals (user IDs, emails, session objects) via
  // console.log throughout auth.service.ts, login/sign-up pages, etc.
  // Silence the noisy/PII-bearing levels in production; keep warn/error so
  // real failures are still visible in browser dev tools and crash reports.
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withHashLocation()),
  ],
});
