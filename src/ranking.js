// Power ranking view logic: column sorting over the core's ranking rows.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BaflRanking = factory();
})(this, function () {
  // Text columns sort A-Z first, number columns sort high-to-low first.
  const columns = [
    { key: 'rank', label: 'Power rank', type: 'number', first: 'asc' },
    { key: 'name', label: 'Team', type: 'text', first: 'asc' },
    { key: 'record', label: 'Record', type: 'number', sortKey: 'winPct', first: 'desc' },
    { key: 'avgMargin', label: 'Avg capped margin', type: 'number', first: 'desc' },
    { key: 'sos', label: 'Strength of schedule', type: 'number', first: 'desc' },
  ];

  function sortRows(rows, key, direction) {
    const col = columns.find((c) => c.key === key);
    const field = col.sortKey || key;
    const dir = direction === 'desc' ? -1 : 1;
    return [...rows].sort((a, b) => {
      const x = a[field];
      const y = b[field];
      // Missing values always sort last, whichever direction.
      if (x === null && y === null) return a.rank - b.rank;
      if (x === null) return 1;
      if (y === null) return -1;
      const cmp = col.type === 'text' ? x.localeCompare(y) : x - y;
      return cmp * dir || a.rank - b.rank;
    });
  }

  return { columns, sortRows };
});
