// Função para normalizar texto (remover acentos, case insensitive)
function normalize(str) {
    return str
        .toLowerCase()
        .normalize('NFD');
}

module.exports = { normalize };