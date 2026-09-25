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

  // Cria a tabela das equipes
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
      saldo: 0,

      // Usado somente para confronto direto
      confrontos: {}
    };

  });


  // Processa somente jogos de grupos já encerrados
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

    // Garante que o confronto pertence ao mesmo grupo
    if (mandante.grupo !== visitante.grupo) {
      return;
    }

    const golsMandante = Number(jogo.home_score);
    const golsVisitante = Number(jogo.away_score);


    // ==========================================
    // ESTATÍSTICAS GERAIS
    // ==========================================

    mandante.jogos++;
    visitante.jogos++;

    mandante.golsPro += golsMandante;
    mandante.golsContra += golsVisitante;

    visitante.golsPro += golsVisitante;
    visitante.golsContra += golsMandante;


    // ==========================================
    // REGISTRO DO CONFRONTO DIRETO
    // ==========================================

    if (!mandante.confrontos[visitante.id]) {

      mandante.confrontos[visitante.id] = {
        pontos: 0,
        golsPro: 0,
        golsContra: 0,
        saldo: 0
      };

    }

    if (!visitante.confrontos[mandante.id]) {

      visitante.confrontos[mandante.id] = {
        pontos: 0,
        golsPro: 0,
        golsContra: 0,
        saldo: 0
      };

    }


    const confrontoMandante =
      mandante.confrontos[visitante.id];

    const confrontoVisitante =
      visitante.confrontos[mandante.id];


    confrontoMandante.golsPro += golsMandante;
    confrontoMandante.golsContra += golsVisitante;

    confrontoVisitante.golsPro += golsVisitante;
    confrontoVisitante.golsContra += golsMandante;


    // ==========================================
    // RESULTADO DO JOGO
    // ==========================================

    if (golsMandante > golsVisitante) {

      // Classificação geral
      mandante.pontos += 3;
      mandante.vitorias++;
      visitante.derrotas++;

      // Confronto direto
      confrontoMandante.pontos += 3;

    }

    else if (golsMandante < golsVisitante) {

      // Classificação geral
      visitante.pontos += 3;
      visitante.vitorias++;
      mandante.derrotas++;

      // Confronto direto
      confrontoVisitante.pontos += 3;

    }

    else {

      // Classificação geral
      mandante.pontos++;
      visitante.pontos++;

      mandante.empates++;
      visitante.empates++;

      // Confronto direto
      confrontoMandante.pontos++;
      confrontoVisitante.pontos++;

    }


    // Saldo do confronto
    confrontoMandante.saldo =
      confrontoMandante.golsPro -
      confrontoMandante.golsContra;

    confrontoVisitante.saldo =
      confrontoVisitante.golsPro -
      confrontoVisitante.golsContra;

  });


  // ==========================================
  // SALDO DE GOLS GERAL
  // ==========================================

  Object.values(tabela).forEach(equipe => {

    equipe.saldo =
      equipe.golsPro - equipe.golsContra;

  });


  // ==========================================
  // CLASSIFICAÇÃO POR GRUPO
  // ==========================================

  const grupos = {};

  Object.values(tabela).forEach(equipe => {

    if (!grupos[equipe.grupo]) {
      grupos[equipe.grupo] = [];
    }

    grupos[equipe.grupo].push(equipe);

  });


  const classificacaoFinal = [];


  // ==========================================
  // APLICA OS CRITÉRIOS DE DESEMPATE
  // ==========================================

  Object.keys(grupos).sort().forEach(grupo => {

    const equipesGrupo = grupos[grupo];


    equipesGrupo.sort((a, b) => {

      // 1º - Maior número de pontos
      if (b.pontos !== a.pontos) {
        return b.pontos - a.pontos;
      }


      // ======================================
      // 2º - CONFRONTO DIRETO
      // SOMENTE ENTRE EXATAMENTE DUAS EQUIPES
      // ======================================

      const empatadas = equipesGrupo.filter(
        equipe => equipe.pontos === a.pontos
      );


      if (empatadas.length === 2) {

        const confrontoA =
          a.confrontos[b.id];

        const confrontoB =
          b.confrontos[a.id];


        if (confrontoA && confrontoB) {

          // Pontos no confronto direto
          if (
            confrontoA.pontos !==
            confrontoB.pontos
          ) {

            return (
              confrontoB.pontos -
              confrontoA.pontos
            );

          }

        }

      }


      // ======================================
      // 3º - MAIOR NÚMERO DE VITÓRIAS
      // ======================================

      if (b.vitorias !== a.vitorias) {

        return b.vitorias - a.vitorias;

      }


      // ======================================
      // 4º - SALDO DE GOLS
      // ======================================

      if (b.saldo !== a.saldo) {

        return b.saldo - a.saldo;

      }


      // ======================================
      // 5º - MENOR NÚMERO DE GOLS SOFRIDOS
      // ======================================

      if (a.golsContra !== b.golsContra) {

        return a.golsContra - b.golsContra;

      }


      // ======================================
      // 6º - FATOR DISCIPLINAR
      //
      // Ainda será conectado aos cartões.
      // ======================================

      return 0;

    });


    // Adiciona as equipes do grupo
    // à classificação final
    classificacaoFinal.push(...equipesGrupo);

  });


  return classificacaoFinal;

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
