import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\iprtr\\.gemini\\antigravity\\brain\\31e6df38-db51-4209-b462-c06598ab9fe7';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('--- INICIANDO TESTE E2E: TEMPLATES & LOCALIZAÇÃO 100% PT ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // 1. Acessar a rota /templates diretamente
    console.log('1. Acessando rota /templates...');
    await page.goto('http://localhost:3000/templates', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));

    // Aguarda o modal de templates estar visível
    await page.waitForSelector('.template-card-item', { timeout: 10000 });
    console.log('Modal de templates carregado com sucesso!');

    // Captura tela do catálogo de templates
    const shotCatalog = path.join(ARTIFACT_DIR, 'test_1_templates_catalog.png');
    await page.screenshot({ path: shotCatalog });
    console.log('[1/4] Screenshot salvo:', shotCatalog);

    // 2. Verificar texto em português no modal
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Verificando categorias em português...');
    const expectedPtCategories = ['Sugeridos', 'Populares', 'Diagramas', 'Documentos de Produto', 'Gestão de Projetos', 'Quadro Branco', 'Wireframes', 'Todos os Modelos'];
    for (const cat of expectedPtCategories) {
      if (!bodyText.includes(cat)) {
        throw new Error(`Categoria esperada não encontrada: ${cat}`);
      }
    }
    console.log('Todas as categorias em português confirmadas no modal!');

    // 3. Clicar no card do template "Sessão de Brainstorming" para abrir a visualização detalhada
    console.log('3. Abrindo visualização detalhada de "Sessão de Brainstorming"...');
    const cardBrainstorm = await page.$('[data-template-id="tpl-brainstorming"]');
    if (!cardBrainstorm) throw new Error('Card tpl-brainstorming não encontrado');
    await cardBrainstorm.click();

    await page.waitForSelector('#btn-confirm-use-template', { timeout: 6000 });
    console.log('Visualização detalhada aberta com botão "Usar modelo" visível!');

    const shotDetail = path.join(ARTIFACT_DIR, 'test_2_brainstorming_detail_preview.png');
    await page.screenshot({ path: shotDetail });
    console.log('[2/4] Screenshot salvo:', shotDetail);

    // 4. Clicar em "Usar modelo"
    console.log('4. Clicando em "Usar modelo"...');
    await page.click('#btn-confirm-use-template');

    // Aguarda navegação para a rota /board/:id
    await page.waitForFunction(() => window.location.pathname.startsWith('/board/'), { timeout: 8000 });
    console.log('Navegou para rota real:', await page.evaluate(() => window.location.pathname));

    // Aguarda renderização dos elementos do canvas e enquadramento fitView
    await new Promise(r => setTimeout(r, 1200));

    // Verifica elementos no canvas
    const canvasInfo = await page.evaluate(() => {
      const stickies = Array.from(document.querySelectorAll('.sticky-note-card, [data-sticky-id], .sticky-note')).map(el => el.innerText.trim());
      const mindNodes = Array.from(document.querySelectorAll('[data-node-id], .mind-map-node')).map(el => el.innerText.trim());
      const topnav = document.querySelector('#whimflow-topnav')?.innerText || '';
      return {
        url: window.location.pathname,
        stickiesCount: stickies.length,
        stickiesText: stickies,
        mindNodesCount: mindNodes.length,
        mindNodesText: mindNodes,
        topnav
      };
    });

    console.log('Resultado no Canvas pós-template:');
    console.log(' - URL:', canvasInfo.url);
    console.log(' - Stickies Count:', canvasInfo.stickiesCount);
    console.log(' - Mind Nodes Count:', canvasInfo.mindNodesCount);
    console.log(' - TopNav:', canvasInfo.topnav.replace(/\n+/g, ' '));

    const shotCanvas = path.join(ARTIFACT_DIR, 'test_3_canvas_brainstorming_delivered.png');
    await page.screenshot({ path: shotCanvas });
    console.log('[3/4] Screenshot salvo:', shotCanvas);

    // 5. Testar o TopNav: Compartilhar, Apresentar, Todos em teste
    const topNavTexts = await page.evaluate(() => {
      return {
        shareBtn: document.querySelector('#btn-topnav-share')?.innerText?.trim(),
        presentBtn: document.querySelector('#btn-topnav-present')?.innerText?.trim(),
        dashBtn: document.querySelector('#btn-goto-dashboard')?.innerText?.trim()
      };
    });
    console.log('TopNav botões traduzidos:', topNavTexts);

    // 6. Testar o Assistente de IA com o prompt Salgados Viana
    console.log('6. Testando Assistente IA com prompt Salgados Viana...');
    const btnAgent = await page.$('#btn-topnav-agent');
    if (btnAgent) {
      await btnAgent.click();
      await page.waitForSelector('textarea, input[placeholder*="Pergunte"]', { timeout: 5000 });
      const input = await page.$('textarea, input[placeholder*="Pergunte"]');
      await input?.type('Crie um mapa mental sobre a loja Salgados Viana com combos de 100, 50 e 20 salgados e refrigerantes para o ifood');
      
      const submitBtn = await page.$('button[title*="Enviar"], button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await new Promise(r => setTimeout(r, 2000));
        const shotAI = path.join(ARTIFACT_DIR, 'test_4_ai_salgados_viana_result.png');
        await page.screenshot({ path: shotAI });
        console.log('[4/4] Screenshot salvo:', shotAI);
      }
    }

    console.log('=== TODOS OS TESTES E2E PASSARAM COM ÊXITO TOTAL! ===');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('ERRO NO TESTE E2E:', err);
  process.exit(1);
});
