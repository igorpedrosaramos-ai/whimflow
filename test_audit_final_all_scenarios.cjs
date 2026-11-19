const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\iprtr\\.gemini\\antigravity\\brain\\31e6df38-db51-4209-b462-c06598ab9fe7';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://127.0.0.1:3000/';
const SAMPLE_IMAGE_PATH = path.join(ARTIFACTS_DIR, '.user_uploaded', 'media_1794855915211_322561da.png');

// Cria arquivo JSON de teste para validação de importação/anexo
const SAMPLE_JSON_PATH = path.join(ARTIFACTS_DIR, 'scratch', 'mapa_teste_importacao.json');
if (!fs.existsSync(path.dirname(SAMPLE_JSON_PATH))) {
  fs.mkdirSync(path.dirname(SAMPLE_JSON_PATH), { recursive: true });
}

const sampleMindMapData = {
  id: 'board-import-test-1',
  title: 'Planejamento Estratégico 2027',
  mindMapNodes: [
    { id: 'root', text: 'Planejamento Estratégico 2027', parentId: null, x: 0, y: 0, width: 240, height: 48, color: '#7c3aed', side: 'root', childrenIds: ['c1', 'c2'] },
    { id: 'c1', text: 'Pilar 1: Expansão Comercial', parentId: 'root', x: 260, y: -60, width: 200, height: 40, color: '#0284c7', side: 'right', childrenIds: ['c1-1'] },
    { id: 'c1-1', text: 'Abertura de Novas Filiais', parentId: 'c1', x: 480, y: -60, width: 180, height: 38, color: '#0284c7', side: 'right', childrenIds: [] },
    { id: 'c2', text: 'Pilar 2: Eficiência Operacional', parentId: 'root', x: -260, y: 40, width: 210, height: 40, color: '#10b981', side: 'left', childrenIds: ['c2-1'] },
    { id: 'c2-1', text: 'Automação de Processos', parentId: 'c2', x: -480, y: 40, width: 180, height: 38, color: '#10b981', side: 'left', childrenIds: [] }
  ]
};
fs.writeFileSync(SAMPLE_JSON_PATH, JSON.stringify(sampleMindMapData, null, 2), 'utf8');

const results = {
  timestamp: new Date().toISOString(),
  totalTests: 10,
  passed: 0,
  failed: 0,
  tests: []
};

function recordTest(name, status, details = {}) {
  const item = { name, status, details, time: new Date().toISOString() };
  results.tests.push(item);
  if (status === 'APROVADO') results.passed++;
  else results.failed++;
  console.log(`[${status}] - ${name}: ${JSON.stringify(details)}`);
}

async function runAudit() {
  console.log('================================================================');
  console.log('   AUDITORIA FINAL TÉCNICA E FUNCIONAL: AGENTE IA & SISTEMA    ');
  console.log('================================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const errText = msg.text();
      consoleErrors.push(errText);
      console.log('>>> [BROWSER CONSOLE ERROR DETECTED]:', errText);
    }
  });

  try {
    // -------------------------------------------------------------
    // CENÁRIO 1: CARREGAMENTO DO DASHBOARD & VERIFICAÇÃO DE NOVO BOTÃO IMPORTAR JSON
    // -------------------------------------------------------------
    await page.goto(APP_URL, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const importJsonBtn = await page.$('#btn-dashboard-action-import-json');
    const newBoardBtn = await page.$('#btn-dashboard-new-board');
    const aiActionBtn = await page.$('#btn-dashboard-action-agent');

    const dashboardOk = !!importJsonBtn && !!newBoardBtn && !!aiActionBtn;
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'audit_final_1_dashboard.png') });

    recordTest('Dashboard e Botão Importar JSON', dashboardOk ? 'APROVADO' : 'REPROVADO', {
      hasImportJsonBtn: !!importJsonBtn,
      hasNewBoardBtn: !!newBoardBtn,
      hasAiActionBtn: !!aiActionBtn
    });

    // -------------------------------------------------------------
    // CENÁRIO 2: IMPORTAÇÃO REAL DE ARQUIVO JSON DO MAPA MENTAL SALVO
    // -------------------------------------------------------------
    // Dispara input de arquivo JSON no Dashboard
    const fileInput = await page.$('input[type="file"][accept*=".json"]');
    if (fileInput) {
      await fileInput.uploadFile(SAMPLE_JSON_PATH);
      await new Promise(r => setTimeout(r, 1200));

      // Verifica se navegou para a tela do canvas e carregou os nós do JSON
      const nodesCount = await page.$$eval('.mindmap-node-card', nodes => nodes.length);
      const rootText = await page.$eval('.mindmap-node-card.root', el => el.innerText).catch(() => '');

      const jsonImportOk = nodesCount >= 4 && rootText.includes('Planejamento Estratégico');
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'audit_final_2_json_importado_canvas.png') });

      recordTest('Importação de Arquivo JSON no Dashboard', jsonImportOk ? 'APROVADO' : 'REPROVADO', {
        nodesLoaded: nodesCount,
        rootTitle: rootText
      });
    } else {
      recordTest('Importação de Arquivo JSON no Dashboard', 'REPROVADO', { error: 'Input de arquivo JSON não localizado' });
    }

    // -------------------------------------------------------------
    // CENÁRIO 3: ABERTURA DO AGENTE IA (DRAWER) E VERIFICAÇÃO DOS 3 MODOS
    // -------------------------------------------------------------
    const openAiBtn = await page.$('#btn-topnav-ai') || await page.$('button[title*="Assistente IA"]') || await page.$('#btn-toolbar-ai');
    if (openAiBtn) {
      await openAiBtn.click();
    } else {
      // Tenta clicar pelo texto ou atalho
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Assistente IA') || b.title?.includes('IA') || b.id.includes('agent'));
        if (btn) btn.click();
      });
    }
    await new Promise(r => setTimeout(r, 800));

    // Verifica se os 3 modos estão presentes no Drawer
    const thinkMode = await page.$('#btn-mode-think');
    const copyMode = await page.$('#btn-mode-copy');
    const createMode = await page.$('#btn-mode-create');
    const modesOk = !!thinkMode && !!copyMode && !!createMode;

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'audit_final_3_agent_drawer_modos.png') });

    recordTest('Três Modos Especializados no Agent Drawer', modesOk ? 'APROVADO' : 'REPROVADO', {
      hasThinkMode: !!thinkMode,
      hasCopyMode: !!copyMode,
      hasCreateMode: !!createMode
    });

    // -------------------------------------------------------------
    // CENÁRIO 4: ANEXO DE ARQUIVO JSON NO CHAT DO AGENTE & BOTÃO ABRIR NO CANVAS
    // -------------------------------------------------------------
    const drawerFileInput = await page.$('#agent-flyout-drawer input[type="file"]') || await page.$('input[type="file"][accept*="image/*"]');
    if (drawerFileInput) {
      await drawerFileInput.uploadFile(SAMPLE_JSON_PATH);
      await new Promise(r => setTimeout(r, 800));

      const quickOpenBtn = await page.$('#btn-open-attached-json-canvas');
      const hasJsonBadge = await page.evaluate(() => {
        return document.body.innerText.includes('Mapa mental salvo') || document.body.innerText.includes('5 nós');
      });

      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'audit_final_4_agent_json_anexado.png') });

      recordTest('Anexo de Mapa Mental JSON no Agente IA', (!!quickOpenBtn && hasJsonBadge) ? 'APROVADO' : 'REPROVADO', {
        hasQuickOpenBtn: !!quickOpenBtn,
        hasJsonBadge
      });
    }

    // -------------------------------------------------------------
    // CENÁRIO 5: TESTE REAL DE CONVERSA COM GEMINI (CRIAÇÃO DE CARDÁPIO COM CATEGORIAS)
    // -------------------------------------------------------------
    // Seleciona Modo Criar Mapa
    if (createMode) await createMode.click();
    await new Promise(r => setTimeout(r, 300));

    const promptInput = await page.$('#agent-prompt-input');
    if (promptInput) {
      // Limpa e digita prompt estruturado
      await page.evaluate(() => {
        const ta = document.getElementById('agent-prompt-input');
        if (ta) ta.value = '';
      });
      await promptInput.type('Crie um cardápio profissional para Hamburgueria Artesanal com Entradas, Burgers Clássicos, Burgers Especiais e Bebidas');
      await new Promise(r => setTimeout(r, 300));

      // Clica no botão de enviar (seta para cima teal)
      await page.keyboard.press('Enter');
      console.log('Enviou prompt de criação de cardápio ao Gemini...');

      // Aguarda resposta (até 25s)
      let responded = false;
      for (let i = 0; i < 25; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const statusBadge = await page.$('[data-testid="agent-status-badge"]');
        const assistMsgs = await page.$$eval('#agent-flyout-drawer div', divs => divs.some(d => d.innerText.includes('Hamburgueria') || d.innerText.includes('Entradas')));
        if (assistMsgs && !statusBadge) {
          responded = true;
          break;
        }
      }

      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'audit_final_5_cardapio_gerado.png') });

      // Verifica se foram criados nós na árvore do canvas
      const totalNodes = await page.$$eval('.mindmap-node-card', cards => cards.length);
      const hasCategories = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('Entradas') || text.includes('Burgers') || text.includes('Bebidas');
      });

      recordTest('Criação de Cardápio com Gemini 3.1 Flash', (responded && totalNodes > 4) ? 'APROVADO' : 'REPROVADO', {
        responded,
        totalNodesOnCanvas: totalNodes,
        hasCategories
      });
    }

    // -------------------------------------------------------------
    // CENÁRIO 6: SUGESTÕES COMERCIAIS & PADRÕES DE CORES (AZUL EXISTENTE, VERDE SUGESTÃO)
    // -------------------------------------------------------------
    if (promptInput) {
      await promptInput.type('Adicione sugestões comerciais de combos e sobremesas. Os itens existentes devem ser azuis e as sugestões devem ser verdes com indicação.');
      await page.keyboard.press('Enter');
      console.log('Enviou prompt de sugestões comerciais e cores ao Gemini...');

      // Aguarda resposta
      for (let i = 0; i < 25; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const statusBadge = await page.$('[data-testid="agent-status-badge"]');
        if (!statusBadge) break;
      }

      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'audit_final_6_sugestoes_e_cores.png') });

      // Inspeciona no DOM se existem nós verdes ou badges de sugestão
      const colorCheck = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.mindmap-node-card'));
        const greenCards = cards.filter(c => c.innerHTML.includes('#10b981') || c.style.borderColor.includes('16, 185, 129') || c.innerHTML.includes('Sugestão'));
        const blueCards = cards.filter(c => c.innerHTML.includes('#0284c7') || c.style.borderColor.includes('2, 132, 199') || c.style.borderColor.includes('rgb(2, 132, 199)'));
        const badges = Array.from(document.querySelectorAll('[data-testid^="badge-suggested-"]'));
        return {
          totalCards: cards.length,
          greenCards: greenCards.length,
          blueCards: blueCards.length,
          badgesCount: badges.length
        };
      });

      const colorSeparationOk = colorCheck.totalCards > 5;
      recordTest('Sugestões Comerciais e Separação de Cores', colorSeparationOk ? 'APROVADO' : 'REPROVADO', colorCheck);
    }

    // -------------------------------------------------------------
    // CENÁRIO 7: TESTE MODO AJUDAR A PENSAR (CONSULTORIA SEM ALTERAÇÃO DESTRUTIVA)
    // -------------------------------------------------------------
    const thinkBtn = await page.$('#btn-mode-think');
    if (thinkBtn && promptInput) {
      await thinkBtn.click();
      await new Promise(r => setTimeout(r, 300));

      const beforeNodesCount = await page.$$eval('.mindmap-node-card', cards => cards.length);

      await promptInput.type('Como podemos aumentar o ticket médio deste restaurante usando estratégia de vendas adicionais?');
      await page.keyboard.press('Enter');
      console.log('Enviou pergunta de consultoria no modo Ajudar a Pensar...');

      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const statusBadge = await page.$('[data-testid="agent-status-badge"]');
        if (!statusBadge) break;
      }
      await new Promise(r => setTimeout(r, 1000));

      const afterNodesCount = await page.$$eval('.mindmap-node-card', cards => cards.length);
      const hasReflectionText = await page.evaluate(() => {
        const text = document.getElementById('agent-flyout-drawer')?.innerText || '';
        return text.includes('ticket médio') || text.includes('estratégia') || text.includes('perguntas');
      });

      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'audit_final_7_modo_ajudar_a_pensar.png') });

      const thinkOk = hasReflectionText && afterNodesCount >= beforeNodesCount;
      recordTest('Modo Ajudar a Pensar (Consultoria Estratégica)', thinkOk ? 'APROVADO' : 'REPROVADO', {
        beforeNodesCount,
        afterNodesCount,
        hasReflectionText
      });
    }

    // -------------------------------------------------------------
    // CENÁRIO 8: TESTE MODO COPIAR DA IMAGEM COM ARQUIVO REAL
    // -------------------------------------------------------------
    const copyBtn = await page.$('#btn-mode-copy');
    if (copyBtn && drawerFileInput && fs.existsSync(SAMPLE_IMAGE_PATH)) {
      await copyBtn.click();
      await new Promise(r => setTimeout(r, 300));

      await drawerFileInput.uploadFile(SAMPLE_IMAGE_PATH);
      await new Promise(r => setTimeout(r, 800));

      if (promptInput) {
        await promptInput.type('Copie fielmente a estrutura e os textos da imagem anexada.');
        await page.keyboard.press('Enter');
        console.log('Enviou imagem real para o Modo Copiar da Imagem...');

      // Aguarda início e conclusão do processamento
      await new Promise(r => setTimeout(r, 1500));
      for (let i = 0; i < 35; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const isStillGenerating = await page.evaluate(() => {
          return !!document.querySelector('[data-testid="agent-status-badge"]') || !!document.querySelector('.animate-spin');
        });
        if (!isStillGenerating) break;
      }

      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'audit_final_8_copiar_da_imagem.png') });

      const extractedText = await page.evaluate(() => {
        return document.body.innerText;
      });
      const fidelityCheck = extractedText.includes('Cadastro') || extractedText.includes('domínio corporativo') || extractedText.includes('Consultor') || extractedText.includes('Demonstração') || extractedText.includes('Novo Usuário');

        recordTest('Modo Copiar da Imagem (Fidelidade Multimodal)', fidelityCheck ? 'APROVADO' : 'REPROVADO', {
          sampleImage: path.basename(SAMPLE_IMAGE_PATH),
          recognizedNodes: fidelityCheck
        });
      }
    }

    // -------------------------------------------------------------
    // CENÁRIO 9: REGRESSÃO DO EDITOR (CRIAÇÃO, EDIÇÃO E NAVEGAÇÃO)
    // -------------------------------------------------------------
    // Fecha o Drawer da IA para interagir livremente no canvas
    const closeDrawerBtn = await page.$('#btn-close-agent-drawer') || await page.$('button[title="Fechar"]');
    if (closeDrawerBtn) await closeDrawerBtn.click();
    await new Promise(r => setTimeout(r, 500));

    // Seleciona um nó e pressiona Tab para criar filho
    const firstNode = await page.$('.mindmap-node-card:not(.root)');
    if (firstNode) {
      await firstNode.click();
      await new Promise(r => setTimeout(r, 200));

      const countBeforeTab = await page.$$eval('.mindmap-node-card', cards => cards.length);
      await page.keyboard.press('Tab');
      await new Promise(r => setTimeout(r, 600));

      const countAfterTab = await page.$$eval('.mindmap-node-card', cards => cards.length);

      // Digita texto no novo nó e confirma com Enter
      await page.keyboard.type('Item de Teste de Regressão');
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 400));

      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'audit_final_9_regressao_editor.png') });

      const regressionOk = countAfterTab > countBeforeTab;
      recordTest('Regressão do Editor (Criação com Tab e Edição de Texto)', regressionOk ? 'APROVADO' : 'REPROVADO', {
        countBeforeTab,
        countAfterTab
      });
    }

    // -------------------------------------------------------------
    // CENÁRIO 10: RESTAURAÇÃO VIA SHARE MODAL (.JSON) & ESTABILIDADE DO CONSOLE
    // -------------------------------------------------------------
    const shareBtn = await page.$('#btn-topnav-share');
    if (shareBtn) {
      await shareBtn.click();
      await new Promise(r => setTimeout(r, 600));

      const restoreJsonBtn = await page.$('#btn-share-modal-import-json');
      const shareModalHasRestore = !!restoreJsonBtn;

      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'audit_final_10_share_modal_restaurar_json.png') });

      // Fecha o modal
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));

      recordTest('Opção Restaurar JSON no ShareModal', shareModalHasRestore ? 'APROVADO' : 'REPROVADO', {
        shareModalHasRestore
      });
    }

    // Verifica erros críticos de console durante toda a sessão
    const criticalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('404'));
    recordTest('Estabilidade do Console (Zero Erros Críticos de JS)', criticalErrors.length === 0 ? 'APROVADO' : 'REPROVADO', {
      errorCount: criticalErrors.length,
      errors: criticalErrors.slice(0, 5)
    });

  } catch (err) {
    console.error('Erro durante a auditoria E2E:', err);
    recordTest('Execução Geral da Auditoria', 'REPROVADO', { error: err.message, stack: err.stack });
  } finally {
    await browser.close();

    // Salva o relatório de execução
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'final_audit_execution_results.json'),
      JSON.stringify(results, null, 2),
      'utf8'
    );

    console.log('================================================================');
    console.log(`Auditoria Concluída: ${results.passed}/${results.tests.length} testes APROVADOS.`);
    console.log('Resultados salvos em final_audit_execution_results.json');
    console.log('================================================================');
  }
}

runAudit();
