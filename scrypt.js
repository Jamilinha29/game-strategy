const apiKeyInput = document.getElementById('apiKey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const aiResponse = document.getElementById('aiResponse');
const form = document.querySelector('form'); // Defina o form PRIMEIRO
const askButton = document.getElementById('askButton'); // Seleciona o botão pelo id

const markdownConverter = (text) => {
    const converter = new showdown.Converter();
    const html = converter.makeHtml(text);
    return html;
}
//criação de key explicada no REDEME.md
const perguntarAI = async (apiKey, game, question) => {
  const model = "gemini-2.5-flash";
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
const pergunta = `
Você é um assistente especialista em jogos do tipo ${game}.

Com base na pergunta do usuário, gere a melhor build/meta atual para o jogo e função informada.

Inclua:
- Nome do jogo (ex: Genshin Impact, LoL, Free Fire, Valorant ...)
- Função (ex: mago, suporte, sniper, duelista, arqueiro ...)
- Personagem ou agente ideal escolhido pelo ususario
- Equipamentos, armas recomendadas ou armas principais
- Habilidades, taletos ou atributos recomendadas
- Dicas rápidas de uso e estratégia


Pergunta do usuário: ${question}

##Regra
- Se você não souber responda com 'Não sei' e não tente inventar uma resposta.
- Se a pergunta não está relacionada ao jogo, responda essa pergunta com ' Essa pergunta não esta relacionada ao jogo'
- Considere a data atual ${new Date().toLocaleDateString()}
- Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
- Nunca responda itens que vc não tenha certeza de que existe no patch atual.
- Use emojis e tópicos para facilitar a leitura.

## Resposta
- Economize na resposta, seja direto e objetivo, e responda no máximo de caracteres posiveis.
- Responda em markdown
- Não precisa fazer nenhuma saudação ou pedido, apenas responda o que o usuário está querendo.

`;


  const contents = [{
    role: 'user',
    parts: [{
      text: pergunta
    }]
  }];
  const tools = [{
    google_search: {}
  }];

  //chamada API
  const response = await fetch(geminiURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        contents, 
        tools 
    }),
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

const enviarFormulario = async (event) => {
  event.preventDefault(); // Impede o envio do formulário padrão
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  console.log({ apiKey, game, question });

  if (apiKey === '' || game === '' || question === '') {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  askButton.disabled = true; // Desabilita o botão de enviar
  askButton.textContent = 'Pesquisando...'; // Altera o texto do botão
  askButton.classList.add('loading'); // Adiciona a classe de loading

  try {
    // Perguntar IA
    const text = await perguntarAI(apiKey, game, question);
    aiResponse.querySelector('.response-content').innerHTML = markdownConverter(text); // Exibe a resposta na interface
    aiResponse.classList.remove('hidden'); // Torna o elemento visível

} catch (error) {
    console.error('Erro:', error);
    aiResponse.querySelector('.response-content').innerText = "Ocorreu um erro ao consultar a IA.";
  } finally {
    askButton.disabled = false; // Reabilita o botão de enviar
    askButton.textContent = 'Pesquisar'; // Restaura o texto do botão
    askButton.classList.remove('loading'); // Remove a classe de loading
  }
};

form.addEventListener('submit', enviarFormulario);
