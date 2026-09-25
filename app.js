function mostrarSecao(secao) {
  const nomes = {
    jogos: "Jogos",
    classificacao: "Classificação",
    "mata-mata": "Mata-mata",
    equipes: "Equipes",
    artilharia: "Artilharia",
    cartoes: "Cartões / Disciplina",
    regulamento: "Regulamento"
  };

  const nome = nomes[secao] || "Copa SB 2026";

  alert(
    nome +
    "\n\nEsta área será conectada aos dados reais da Copa SB."
  );
}

function abrirAdmin() {
  alert(
    "Área Administrativa\n\n" +
    "O acesso administrativo será conectado ao Supabase Auth."
  );
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Copa SB Imaculada Conceição de Futsal 2026 carregada.");

  console.log("Estrutura inicial:");
  console.log("- Jogos");
  console.log("- Classificação");
  console.log("- Mata-mata");
  console.log("- Equipes");
  console.log("- Artilharia");
  console.log("- Cartões");
  console.log("- Regulamento");
  console.log("- Administração");
});
