function normalizarPlaca(placa) {
  return String(placa || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

module.exports = { normalizarPlaca };
