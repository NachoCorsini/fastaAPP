self.addEventListener('install', e => {
    e.waitUntil(
      caches.open('inasistapp-cache').then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/panel.html',
          '/consulta.html',
          '/cargadorListas.html',
          '/assetts/logo fasta.png',
          '/firebase.js',
          '/index.js',
          '/panel.js',
          '/consulta.js',
          '/cargadorListas.js',
          'https://cdn.jsdelivr.net/npm/sweetalert2@11',
          'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', e => {
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request);
      })
    );
  });
  