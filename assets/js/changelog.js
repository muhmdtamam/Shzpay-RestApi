const entries = [
    {
      version: 'v1.3.0', date: '10 Agu 2026', tag: 'major', tagLabel: 'Fitur Baru',
      title: 'Playground & penghapusan wajib API key',
      items: [
        '<b>Ditambahkan:</b> halaman "Coba API" untuk menguji endpoint langsung dari browser tanpa menulis kode.',
        '<b>Diubah:</b> seluruh endpoint kini dapat diakses publik tanpa API key — cukup panggil base URL secara langsung.',
        '<b>Ditambahkan:</b> halaman Status Layanan dan Kebijakan Penggunaan (fair use).'
      ]
    },
    {
      version: 'v1.2.0', date: '28 Jul 2026', tag: 'minor', tagLabel: 'Peningkatan',
      title: 'Penambahan 5 endpoint kategori AI',
      items: [
        '<b>Ditambahkan:</b> <span class="mono">/api/vision</span> untuk analisis gambar.',
        '<b>Ditambahkan:</b> <span class="mono">/api/text-to-image</span> untuk menghasilkan gambar dari teks.',
        '<b>Ditingkatkan:</b> waktu respons rata-rata endpoint AI turun sekitar 18%.'
      ]
    },
    {
      version: 'v1.1.2', date: '14 Jul 2026', tag: 'fix', tagLabel: 'Perbaikan',
      title: 'Perbaikan latensi tinggi pada Download YouTube',
      items: [
        '<b>Diperbaiki:</b> latensi tinggi pada <span class="mono">/api/ytmp3</span> dan <span class="mono">/api/ytmp4</span> akibat pembatasan dari sumber pihak ketiga.',
        '<b>Diperbaiki:</b> respons kosong pada <span class="mono">/api/pinterest</span> untuk tautan pendek.'
      ]
    },
    {
      version: 'v1.1.0', date: '2 Jul 2026', tag: 'minor', tagLabel: 'Peningkatan',
      title: 'Penambahan kategori Search',
      items: [
        '<b>Ditambahkan:</b> endpoint pencarian lirik, jadwal salat, anime, dan Google.',
        '<b>Ditambahkan:</b> dokumentasi interaktif dengan contoh kode cURL dan JavaScript.'
      ]
    },
    {
      version: 'v1.0.0', date: '19 Jun 2026', tag: 'major', tagLabel: 'Rilis Awal',
      title: 'SHZPAY API resmi dirilis',
      items: [
        'Rilis awal dengan 14 endpoint mencakup kategori Download, AI, dan Tools.',
        'Landing page, dashboard ringkasan, dan halaman dokumentasi pertama kali diluncurkan.'
      ]
    }
  ];

  const timeline = document.getElementById('clTimeline');
  entries.forEach(e => {
    const el = document.createElement('div');
    el.className = 'cl-entry ' + e.tag;
    el.innerHTML = `
      <span class="cl-dot" aria-hidden="true"></span>
      <div class="cl-head">
        <span class="cl-version">${e.version}</span>
        <span class="cl-tag ${e.tag}">${e.tagLabel}</span>
        <span class="cl-date">${e.date}</span>
      </div>
      <div class="cl-title">${e.title}</div>
      <ul class="cl-list">${e.items.map(it => `<li>${it}</li>`).join('')}</ul>
    `;
    timeline.appendChild(el);
  });
