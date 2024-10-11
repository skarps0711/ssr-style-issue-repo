import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
  withHttpTransferCacheOptions,
} from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { IonicServerModule } from '@ionic/angular-server';
import { provideServerRendering } from '@angular/platform-server';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular(),
    provideServerRendering(),
    IonicServerModule,
    provideClientHydration(
      withHttpTransferCacheOptions({
        includePostRequests: true,
      })
    ),
    provideHttpClient(withFetch()),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    importProvidersFrom(BrowserModule, BrowserAnimationsModule),
  ],
};
