import 'zone.js/node';
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import * as express from 'express';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import bootstrap from './src/main.server';

export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/app/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html'))
    ? join(distFolder, 'index.original.html')
    : join(distFolder, 'index.html');

  const commonEngine = new CommonEngine({
    enablePerformanceProfiler: true,
  });

  // Cerca dinamicamente il file CSS generato con hash
  const cssFileName = readdirSync(distFolder).find(
    (file) => file.startsWith('styles') && file.endsWith('.css')
  );

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Serve i file statici
  server.get(
    '*.*',
    express.static(distFolder, {
      maxAge: '1y',
    })
  );

  // Gestisce tutte le altre richieste utilizzando l'engine Angular
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: distFolder,
        inlineCriticalCss: false,
        providers: [
          { provide: APP_BASE_HREF, useValue: req.baseUrl },
          { provide: 'REQUEST', useValue: req },
          { provide: 'RESPONSE', useValue: res },
        ],
      })
      .then((html) => {
        // Inietta dinamicamente il CSS nel contenuto HTML generato
        if (cssFileName) {
          html = html.replace(
            '</head>',
            `<link rel="stylesheet" href="${cssFileName}"></head>`
          );
        }
        res.send(html);
      })
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Avvia il server Node
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export default bootstrap;
