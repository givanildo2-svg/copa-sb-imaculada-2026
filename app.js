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


async function buscarJogos() {

  try {

    const resposta = await fetch(
      `${SUPABASE_URL}/rest/v1/matches?select=*&order=match_no`,
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

    const jogos = await resposta.json();

    console.log("JOGOS DO SUPABASE:", jogos);

    return jogos;

  } catch (erro) {

    console.error("ERRO AO BUSCAR JOGOS:", erro);

    return [];

  }
}
function mostrarEquipes(equipes) {

  const lista = document.getElementById("lista-equipes");
  const secao = document.getElementById("secao-equipes");

  if (!lista || !secao) {
    return;
  }

  secao.style.display = "block";

  if (equipes.length === 0) {
    lista.innerHTML = "<p>Nenhuma equipe encontrada.</p>";
    return;
  }

  const grupos = {
    A: [],
    B: [],
    C: []
  };

  equipes.forEach(equipe => {
    if (grupos[equipe.group_code]) {
      grupos[equipe.group_code].push(equipe);
    }
  });

  let html = "";

  Object.keys(grupos).forEach(grupo => {

    html += `
      <div class="grupo-equipes">
        <h3>Grupo ${grupo}</h3>
    `;

    grupos[grupo].forEach((equipe, indice) => {

      html += `
        <div class="equipe-item">
          <div class="numero-equipe">
            ${indice + 1}
          </div>

          <div>
            <strong>${equipe.name}</strong>
            <small>Grupo ${equipe.group_code}</small>
          </div>
        </div>
      `;

    });

    html += `
      </div>
    `;

  });

  lista.innerHTML = html;
} function mostrarJogos(jogos) {

  const lista = document.getElementById("lista-jogos");
  const secao = document.getElementById("secao-jogos");

  if (!lista || !secao) {
    return;
  }

  secao.style.display = "block";

  if (jogos.length === 0) {
    lista.innerHTML = "<p>Nenhum jogo cadastrado.</p>";
    return;
  }

  let html = "";

  jogos.forEach(jogo => {

    html += `
      <div class="jogo-item">

        <strong>Jogo ${jogo.match_no}</strong>

        <div>
          ${jogo.home_team_id || "A definir"}
          <strong> x </strong>
          ${jogo.away_team_id || "A definir"}
        </div>

        <small>
          ${jogo.match_date || "Data a definir"}
          ${jogo.match_time || ""}
        </small>

      </div>
    `;

  });

  lista.innerHTML = html;
}
async function iniciarAplicativo() {

  console.log("Conectando ao Supabase...");

  const equipes = await buscarEquipes();
const jogos = await buscarJogos();
mostrarJogos(jogos);
console.log(`Conexão realizada. ${jogos.length} jogos encontrados.`);
  console.log(
  `Conexão realizada. ${equipes.length} equipes encontradas.`
);

mostrarEquipes(equipes);

}

function mostrarSecao(secao) {

  const secoes = {
    jogos: "secao-jogos",
    equipes: "secao-equipes"
  };

  const idSecao = secoes[secao];

  if (idSecao) {
    const elemento = document.getElementById(idSecao);

    if (elemento) {
      elemento.style.display = "block";

      elemento.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      return;
    }
  }

  const nomes = {
    classificacao: "Classificação",
    "mata-mata": "Mata-mata",
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
