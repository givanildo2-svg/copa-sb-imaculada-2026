const SUPABASE_URL = "https://uyblqxjozzqkhwcoxupl.supabase.co";

const SUPABASE_KEY = "sb_publishable_uUVyLP5QekuF-jqmxNkOHg_xWNBfeX_";


async function buscarEquipes() {

  try {

    const resposta = await fetch(
      `${SUPABASE_URL}/rest/v1/teams?select=id,name,group_code,draw_order&order=group_code,draw_order`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    const equipes = await resposta.json();

    console.log("EQUIPES DO SUPABASE:", equipes);

    return equipes;

  } catch (erro) {

    console.error("ERRO AO CONECTAR AO SUPABASE:", erro);

    return [];

  }
}


async function iniciarAplicativo() {

  console.log("Conectando ao Supabase...");

  const equipes = await buscarEquipes();

  console.log(
    `Conexão realizada. ${equipes.length} equipes encontradas.`
  );

}


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

  console.log(
    "Copa SB Imaculada Conceição de Futsal 2026 carregada."
  );

  iniciarAplicativo();

});
