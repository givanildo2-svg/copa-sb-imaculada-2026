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

function calcularClassificacao(equipes, jogos) {

  const tabela = {};

  equipes.forEach(equipe => {

    tabela[equipe.id] = {
      id: equipe.id,
      nome: equipe.name,
      grupo: equipe.group_code,
      pontos: 0,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsPro: 0,
      golsContra: 0,
      saldo: 0
    };

  });

  jogos.forEach(jogo => {

    if (
  jogo.phase !== "grupo" ||
  jogo.status !== "final" ||
  jogo.home_score === null ||
  jogo.away_score === null
) {
  return;
}

    const mandante = tabela[jogo.home_team_id];
    const visitante = tabela[jogo.away_team_id];

    if (!mandante || !visitante) {
      return;
    }

    const golsMandante = Number(jogo.home_score);
    const golsVisitante = Number(jogo.away_score);

    mandante.jogos++;
    visitante.jogos++;

    mandante.golsPro += golsMandante;
    mandante.golsContra += golsVisitante;

    visitante.golsPro += golsVisitante;
    visitante.golsContra += golsMandante;

    if (golsMandante > golsVisitante) {

      mandante.pontos += 3;
      mandante.vitorias++;
      visitante.derrotas++;

    } else if (golsMandante < golsVisitante) {

      visitante.pontos += 3;
      visitante.vitorias++;
      mandante.derrotas++;

    } else {

      mandante.pontos++;
      visitante.pontos++;

      mandante.empates++;
      visitante.empates++;

    }

  });

  Object.values(tabela).forEach(equipe => {

  equipe.saldo =
    equipe.golsPro - equipe.golsContra;

});

return Object.values(tabela).sort((a, b) => {

  if (b.pontos !== a.pontos) {
    return b.pontos - a.pontos;
  }

  return b.saldo - a.saldo;

});

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
} function mostrarJogos(jogos, equipes) {

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
const nomesEquipes = {};

equipes.forEach(equipe => {
  nomesEquipes[equipe.id] = equipe.name;
});
  jogos.forEach(jogo => {

    html += `
      <div class="jogo-item">

        <strong>
  Jogo ${jogo.match_no}
  ${jogo.group_code ? ` — Grupo ${jogo.group_code}` : ""}
</strong>

        <div>
         ${nomesEquipes[jogo.home_team_id] || "A definir"}
<strong> x </strong>
${nomesEquipes[jogo.away_team_id] || "A definir"}
        </div>

       <small>
  📅 ${jogo.match_date || "Data a definir"}
  ${jogo.match_time ? ` — ⏰ ${jogo.match_time}` : ""}
  ${jogo.venue ? `<br>📍 ${jogo.venue}` : ""}
</small>
<div class="status-jogo">
  ${
    jogo.status === "final"
      ? `FINAL — ${jogo.home_score ?? 0} x ${jogo.away_score ?? 0}`
      : "PREVISTO"
  }
</div>
    `;

  });

  lista.innerHTML = html;
}
async function iniciarAplicativo() {

  console.log("Conectando ao Supabase...");

  const equipes = await buscarEquipes();
const jogos = await buscarJogos();
mostrarJogos(jogos, equipes);
console.log(`Conexão realizada. ${jogos.length} jogos encontrados.`);
  console.log(
  `Conexão realizada. ${equipes.length} equipes encontradas.`
);

mostrarEquipes(equipes);
const classificacao = calcularClassificacao(equipes, jogos);

console.log("CLASSIFICAÇÃO:", classificacao);
  const resumo = document.getElementById("classificacao-resumo");

if (resumo) {
  resumo.innerHTML = classificacao.map((equipe, indice) => `
    <div class="linha-classificacao">
      <strong>${indice + 1}º</strong>
      <span>${equipe.nome}</span>
      <strong>${equipe.pontos} pts</strong>
    </div>
  `).join("");
}
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
