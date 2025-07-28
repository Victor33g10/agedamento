function logout() {
  localStorage.removeItem('usuarioAtual');
  window.location.href = 'index.html';
}

function carregarUsuarioAtual() {
  const usuario = localStorage.getItem('usuarioAtual');
  return usuario ? JSON.parse(usuario) : null;
}

function salvarUsuarioAtual(usuario) {
  localStorage.setItem('usuarioAtual', JSON.stringify(usuario));
}

document.addEventListener('DOMContentLoaded', () => {
  const cadastroForm = document.getElementById('cadastroForm');
  const loginForm = document.getElementById('loginForm');
  const agendamentoForm = document.getElementById('agendamentoForm');
  const listaAgendamentos = document.getElementById('listaAgendamentos');
  const graficoAgendamentos = document.getElementById('graficoAgendamentos');
  const filtroData = document.getElementById('filtroData');
  const buscaNome = document.getElementById('buscaNome');

  if (cadastroForm) {
    cadastroForm.addEventListener('submit', e => {
      e.preventDefault();
      const usuario = document.getElementById('cadastroUsuario').value;
      const senha = document.getElementById('cadastroSenha').value;
      const tipo = document.getElementById('cadastroTipo').value;
      const dono = tipo === 'cliente' ? prompt('Escolha o dono:') : usuario;
      localStorage.setItem(`user_${usuario}`, JSON.stringify({ senha, tipo, dono }));
      alert('Cadastrado com sucesso!');
      window.location.href = 'index.html';
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const usuario = document.getElementById('loginUsuario').value;
      const senha = document.getElementById('loginSenha').value;
      const userData = JSON.parse(localStorage.getItem(`user_${usuario}`));
      if (userData && userData.senha === senha) {
        salvarUsuarioAtual({ usuario, ...userData });
        if (userData.tipo === 'dono') {
          window.location.href = 'painel-dono.html';
        } else {
          window.location.href = 'agendamento.html';
        }
      } else {
        alert('Usuário ou senha inválidos');
      }
    });
  }

  if (agendamentoForm) {
    agendamentoForm.addEventListener('submit', e => {
      e.preventDefault();
      const usuario = carregarUsuarioAtual();
      if (!usuario) return;
      const nome = document.getElementById('clienteNome').value;
      const data = document.getElementById('data').value;
      const hora = document.getElementById('hora').value;
      const motivo = document.getElementById('motivo').value;
      const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
      agendamentos.push({ nome, data, hora, motivo, dono: usuario.dono });
      localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
      alert('Agendamento feito!');
      agendamentoForm.reset();
    });
  }

  if (listaAgendamentos) {
    const usuario = carregarUsuarioAtual();
    if (!usuario) return;

    function renderizarLista() {
      const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]')
        .filter(a => a.dono === usuario.usuario);

      const filtro = filtroData?.value;
      const busca = buscaNome?.value?.toLowerCase();

      const filtrados = agendamentos.filter(a => {
        return (!filtro || a.data === filtro) && (!busca || a.nome.toLowerCase().includes(busca));
      });

      listaAgendamentos.innerHTML = filtrados.map((a, index) => `
        <li>
          <strong>${a.nome}</strong> - ${a.data} às ${a.hora} | ${a.motivo}
          <button onclick="excluirAgendamento(${index})">Excluir</button>
        </li>
      `).join('');

      if (graficoAgendamentos) {
        const contagem = {};
        filtrados.forEach(a => {
          contagem[a.data] = (contagem[a.data] || 0) + 1;
        });
        const ctx = graficoAgendamentos.getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(contagem),
            datasets: [{ label: 'Agendamentos por data', data: Object.values(contagem), backgroundColor: '#4CAF50' }]
          }
        });
      }
    }

    window.excluirAgendamento = function(index) {
      const agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
      const filtrados = agendamentos.filter(a => a.dono === usuario.usuario);
      const aExcluir = filtrados[index];
      const novos = agendamentos.filter(a => !(a.nome === aExcluir.nome && a.data === aExcluir.data && a.hora === aExcluir.hora));
      localStorage.setItem('agendamentos', JSON.stringify(novos));
      renderizarLista();
    };

    filtroData?.addEventListener('input', renderizarLista);
    buscaNome?.addEventListener('input', renderizarLista);
    renderizarLista();
  }
});
