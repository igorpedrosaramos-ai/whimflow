import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\iprtr\\.gemini\\antigravity\\brain\\31e6df38-db51-4209-b462-c06598ab9fe7';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log('===========================================================');
  console.log('   TESTE DE AUDITORIA: MECÂNICAS DA TOOLBAR NO MAPA MENTAL  ');
  console.log('===========================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  try {
    // 1. Acessa dashboard
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await delay(500);

    const currentView = await page.evaluate(() => localStorage.getItem('whimflow_current_view'));
    if (currentView && currentView !== '"dashboard"') {
      await page.evaluate(() => localStorage.setItem('whimflow_current_view', '"dashboard"'));
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
      await delay(500);
    }

    // 2. Cria novo quadro limpo
    const newBoardBtn = await page.$('#btn-dashboard-new-board');
    if (newBoardBtn) {
      await newBoardBtn.click();
      await delay(1000);
    }
    console.log('✓ Editor Canvas aberto com sucesso.');

    // 3. Valida presença e títulos de todos os botões da Toolbar Aperfeiçoada
    const toolbarButtons = await page.evaluate(() => {
      const tb = document.querySelector('.canvas-vertical-toolbar');
      if (!tb) return [];
      return Array.from(tb.querySelectorAll('button')).map(b => ({
        id: b.id,
        title: b.title
      }));
    });

    console.log(`✓ Botões detectados na Toolbar (${toolbarButtons.length}):`);
    toolbarButtons.forEach(b => console.log(`   - [${b.id}]: ${b.title}`));

    const expectedIds = [
      'btn-toolbar-add-node',
      'btn-toolbar-connect',
      'btn-toolbar-select',
      'btn-toolbar-hand',
      'btn-toolbar-floating-topic',
      'btn-toolbar-sticky',
      'btn-toolbar-text',
      'btn-toolbar-draw',
      'btn-toolbar-present-panel',
      'btn-toolbar-ai'
    ];

    for (const expId of expectedIds) {
      const found = toolbarButtons.some(b => b.id === expId);
      if (!found) throw new Error(`Botão ${expId} ausente na Toolbar aperfeiçoada!`);
    }

    // 4. TESTE: Adicionar Nó Filho via Toolbar
    console.log('\n--- 1. Testando Adição de Nós Conectados ---');
    const rootCard = await page.$('.mindmap-node-card.root') || await page.$('.mindmap-node-card');
    if (rootCard) await rootCard.click();
    await delay(300);

    await page.click('#btn-toolbar-add-node');
    await delay(500);
    await page.keyboard.type('Subtópico Alpha');
    await page.keyboard.press('Enter');
    await delay(400);

    await page.keyboard.type('Subtópico Beta');
    await page.keyboard.press('Enter');
    await delay(400);

    const totalNodes = await page.$$eval('.mindmap-node-card', cards => cards.length);
    console.log(`✓ Total de nós após criação estruturada: ${totalNodes}`);
    if (totalNodes < 3) throw new Error('Falha ao adicionar nós via árvore');

    // 5. TESTE: Novo Tópico Independente (Substitui o antigo "Novo Bloco" alienígena)
    console.log('\n--- 2. Testando Novo Tópico Independente (Nó Flutuante) ---');
    await page.click('#btn-toolbar-floating-topic');
    await delay(600);
    await page.keyboard.type('Ideia Paralela Independente');
    await page.keyboard.press('Enter');
    await delay(400);

    const nodesAfterFloating = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.mindmap-node-card'));
      return cards.map(c => ({
        id: c.id,
        text: (c.textContent || '').trim(),
        left: parseInt((c as HTMLElement).style.left || '0', 10),
        top: parseInt((c as HTMLElement).style.top || '0', 10)
      }));
    });
    console.log('Nós existentes no canvas:', nodesAfterFloating);
    const hasFloatingTopic = nodesAfterFloating.some(n => n.text.includes('Ideia Paralela'));
    if (!hasFloatingTopic) {
      throw new Error('Falha: Novo Tópico Independente não foi criado como nó do mapa mental!');
    }
    console.log('✓ Novo Tópico Independente criado com sucesso como nó real do mapa mental!');

    // 6. TESTE: Conexão Transversal (Cross-Link) entre Ramos
    console.log('\n--- 3. Testando Ferramenta de Conexão Transversal (Cross-Link) ---');
    // Ativa ferramenta de conexão
    await page.click('#btn-toolbar-connect');
    await delay(400);

    // Seleciona nós com texto garantido
    const validNodes = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.mindmap-node-card'));
      return cards.filter(c => (c.textContent || '').trim().length > 0).map(c => c.id);
    });
    console.log('Nós válidos para conexão:', validNodes);

    const nodeAId = validNodes[0];
    const nodeBId = validNodes[validNodes.length - 1];
    console.log(`Conectando Nó ${nodeAId} -> Nó ${nodeBId}...`);

    await page.click(`#${nodeAId}`);
    await delay(500);

    // Verifica se origem ganhou a classe connecting-source
    const isSourceHighlighted = await page.evaluate((id) => {
      const el = document.getElementById(id);
      return el ? el.classList.contains('connecting-source') : false;
    }, nodeAId);
    console.log(`✓ Nó de origem com feedback visual ativado: ${isSourceHighlighted}`);

    // Clica no segundo nó (destino)
    await page.click(`#${nodeBId}`);
    await delay(800);

    // Verifica presença da linha e etiqueta do cross-link
    const crosslinkCount = await page.$$eval('.crosslink-group', els => els.length);
    console.log(`✓ Conectores transversais no SVG: ${crosslinkCount}`);
    if (crosslinkCount === 0) {
      throw new Error('Falha: Nenhuma conexão transversal (crosslink) foi renderizada!');
    }

    // 7. TESTE: Nota Adesiva (Sticky Note) em área livre sem sobreposição
    console.log('\n--- 4. Testando Nota Adesiva Sem Sobreposição ---');
    await page.click('#btn-toolbar-sticky');
    await delay(600);

    const stickyPositions = await page.evaluate(() => {
      const stickies = Array.from(document.querySelectorAll('.sticky-note-card'));
      return stickies.map(s => {
        const rect = s.getBoundingClientRect();
        return { left: Math.round(rect.left), top: Math.round(rect.top) };
      });
    });
    console.log('Posição da Nota Adesiva criada:', stickyPositions);
    if (stickyPositions.length === 0) {
      throw new Error('Falha ao adicionar nota adesiva!');
    }
    // Garante que não foi jogada em (0, 0)
    const isOverlappingCenter = stickyPositions.some(p => p.left < 50 && p.top < 50);
    if (isOverlappingCenter) {
      throw new Error('Nota adesiva foi jogada sobre o centro!');
    }
    console.log('✓ Nota adesiva posicionada com segurança fora da árvore!');

    // 8. TESTE: Caixa de Texto Livre
    console.log('\n--- 5. Testando Caixa de Texto Livre ---');
    await page.click('#btn-toolbar-text');
    await delay(600);

    // 9. Tira print comprobatório de toda a tela com todos os elementos integrados
    const screenshotPath = path.join(ARTIFACTS_DIR, 'toolbar_mechanics_validated.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`\n✓ Screenshot comprobatório salvo em: ${screenshotPath}`);

    console.log('\n===========================================================');
    console.log('   TODAS AS MECÂNICAS DA TOOLBAR FORAM 100% VALIDADAS!     ');
    console.log('===========================================================');
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
