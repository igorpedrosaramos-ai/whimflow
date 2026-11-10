import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\iprtr\\.gemini\\antigravity\\brain\\31e6df38-db51-4209-b462-c06598ab9fe7';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log('===========================================================');
  console.log('   TESTE DE ALINHAMENTO EM LOTE (BATCH ALIGNMENT & TOOLBAR)   ');
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

    console.log('✓ Dashboard acessado.');

    // 2. Abre o modal de templates para criar um board rico com múltiplos nós (igual à imagem do usuário)
    await page.waitForSelector('#btn-dashboard-action-template', { timeout: 5000 });
    await page.click('#btn-dashboard-action-template');
    await delay(1000);

    // Clica no template "Simple Org Chart"
    const cardFound = await page.evaluate(() => {
      const card = (document.querySelector('[data-template-id="tpl-simple-org-chart"]') ||
                    document.querySelector('.template-card-item')) as HTMLElement;
      if (card) {
        card.click();
        return true;
      }
      return false;
    });
    console.log(`Card de template clicado: ${cardFound}`);
    await delay(1000);

    // Clica em "Use template"
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.trim().toLowerCase().includes('use template'));
      if (btn) btn.click();
    });
    await delay(1500);

    // 3. Verifica nós no canvas
    const allNodeIds = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.mindmap-node-card:not(.root)'));
      return cards.map(el => el.id);
    });
    console.log(`✓ Quadro carregado com ${allNodeIds.length} nós não-root.`);

    if (allNodeIds.length < 3) {
      throw new Error(`Número insuficiente de nós carregados: ${allNodeIds.length}`);
    }

    // 4. Seleciona 4 nós para teste de alinhamento
    const testIds = allNodeIds.slice(0, 4);
    console.log(`Selecionando nós para alinhamento em lote: ${JSON.stringify(testIds)}`);

    // Dispara clique sequencial com shiftKey para multi-seleção
    for (const id of testIds) {
      await page.evaluate((elId) => {
        const el = document.getElementById(elId);
        if (el) {
          el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, shiftKey: true }));
        }
      }, id);
      await delay(100);
    }

    await delay(600);

    // 5. Verifica visibilidade e conteúdo da barra flutuante
    const toolbar = await page.$('#batch-actions-toolbar');
    if (!toolbar) {
      throw new Error('Falha: #batch-actions-toolbar não apareceu após multi-seleção!');
    }

    const toolbarInfo = await page.evaluate(() => {
      const tb = document.getElementById('batch-actions-toolbar');
      if (!tb) return null;
      const buttons = Array.from(tb.querySelectorAll('button')).map(b => ({
        id: b.id,
        text: (b.innerText || '').trim(),
        title: b.title
      }));
      return {
        text: (tb.innerText || '').replace(/\n/g, ' '),
        buttons
      };
    });

    console.log('✓ Barra flutuante detectada com sucesso:');
    console.log(`   Texto: "${toolbarInfo?.text}"`);
    console.log(`   Botões encontrados: ${JSON.stringify(toolbarInfo?.buttons)}`);

    // Valida nomes executivos em português
    const requiredButtons = [
      'btn-batch-duplicate',
      'btn-batch-align-left',
      'btn-batch-align-center',
      'btn-batch-align-right',
      'btn-batch-align-top',
      'btn-batch-distribute-v',
      'btn-batch-delete'
    ];
    for (const reqId of requiredButtons) {
      const exists = toolbarInfo?.buttons.some(b => b.id === reqId);
      if (!exists) {
        throw new Error(`Botão obrigatório ${reqId} não encontrado na barra de lote!`);
      }
    }

    // 6. TESTE DE ALINHAMENTO À ESQUERDA
    console.log('\n--- 1. Executando Alinhar à Esquerda ---');
    await page.click('#btn-batch-align-left');
    await delay(600);

    const leftCoords = await page.evaluate((ids) => {
      return ids.map(id => {
        const el = document.getElementById(id);
        const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
        return { id, left: Math.round(rect.left), top: Math.round(rect.top) };
      });
    }, testIds);

    console.log('Coordenadas após Alinhar à Esquerda:', leftCoords);
    const baseLeft = leftCoords[0].left;
    const isLeftAligned = leftCoords.every(c => Math.abs(c.left - baseLeft) <= 3);
    if (!isLeftAligned) {
      throw new Error(`Coordenadas não alinharam à esquerda: ${JSON.stringify(leftCoords)}`);
    }
    console.log('✓ ALINHAMENTO À ESQUERDA VALIDADO!');

    // 7. TESTE DE CENTRALIZAR
    console.log('\n--- 2. Executando Centralizar ---');
    await page.click('#btn-batch-align-center');
    await delay(600);

    const centerCoords = await page.evaluate((ids) => {
      return ids.map(id => {
        const el = document.getElementById(id);
        const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
        return { id, centerX: Math.round(rect.left + rect.width / 2), top: Math.round(rect.top) };
      });
    }, testIds);

    console.log('Coordenadas após Centralizar:', centerCoords);
    const baseCenter = centerCoords[0].centerX;
    const isCenterAligned = centerCoords.every(c => Math.abs(c.centerX - baseCenter) <= 3);
    if (!isCenterAligned) {
      throw new Error(`Coordenadas não centralizaram: ${JSON.stringify(centerCoords)}`);
    }
    console.log('✓ CENTRALIZAÇÃO VALIDADA!');

    // 8. TESTE DE ALINHAMENTO À DIREITA
    console.log('\n--- 3. Executando Alinhar à Direita ---');
    await page.click('#btn-batch-align-right');
    await delay(600);

    const rightCoords = await page.evaluate((ids) => {
      return ids.map(id => {
        const el = document.getElementById(id);
        const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
        return { id, right: Math.round(rect.left + rect.width), top: Math.round(rect.top) };
      });
    }, testIds);

    console.log('Coordenadas após Alinhar à Direita:', rightCoords);
    const baseRight = rightCoords[0].right;
    const isRightAligned = rightCoords.every(c => Math.abs(c.right - baseRight) <= 3);
    if (!isRightAligned) {
      throw new Error(`Coordenadas não alinharam à direita: ${JSON.stringify(rightCoords)}`);
    }
    console.log('✓ ALINHAMENTO À DIREITA VALIDADO!');

    // 9. TESTE DE ALINHAMENTO AO TOPO
    console.log('\n--- 4. Executando Alinhar ao Topo ---');
    await page.click('#btn-batch-align-top');
    await delay(600);

    const topCoords = await page.evaluate((ids) => {
      return ids.map(id => {
        const el = document.getElementById(id);
        const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
        return { id, top: Math.round(rect.top) };
      });
    }, testIds);

    console.log('Coordenadas após Alinhar ao Topo:', topCoords);
    const baseTop = topCoords[0].top;
    const isTopAligned = topCoords.every(c => Math.abs(c.top - baseTop) <= 3);
    if (!isTopAligned) {
      throw new Error(`Coordenadas não alinharam ao topo: ${JSON.stringify(topCoords)}`);
    }
    console.log('✓ ALINHAMENTO AO TOPO VALIDADO!');

    // 10. Tira screenshot comprobatório
    const screenshotPath = path.join(ARTIFACTS_DIR, 'batch_align_validated.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`\n✓ Screenshot comprobatório salvo em: ${screenshotPath}`);

    console.log('\n===========================================================');
    console.log('   TODOS OS ALINHAMENTOS E BARRA FLUTUANTE 100% VALIDADOS! ');
    console.log('===========================================================');
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
