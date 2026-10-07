// Browser wiring for the export and print buttons. Each view passes a function returning the tables currently on screen.
(function () {
  function download(name, type, text) {
    // A byte-order mark makes Excel read the CSV as UTF-8.
    const blob = new Blob([type === 'text/csv' ? '﻿' + text : text], { type: type + ';charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  function mount(options) {
    const bar = document.createElement('div');
    bar.className = 'toolbar no-print';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Export and print');
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.className = 'no-print';
    const add = (text, onClick) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = text;
      b.addEventListener('click', onClick);
      bar.appendChild(b);
    };
    add('Download CSV', () => {
      download(`${options.filename}.csv`, 'text/csv', BaflExport.toCsv(options.getTables()));
      status.textContent = `Downloaded ${options.filename}.csv`;
    });
    add('Download Excel', () => {
      download(`${options.filename}.xml`, 'application/xml', BaflExport.toExcelXml(options.getTables()));
      status.textContent = `Downloaded ${options.filename}.xml (opens in Excel)`;
    });
    add('Print or save as PDF', () => window.print());
    const h1 = document.querySelector('main h1');
    h1.after(bar, status);
  }

  window.BaflExportUI = { mount };
})();
