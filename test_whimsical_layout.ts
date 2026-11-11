import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\iprtr\\.gemini\\antigravity\\brain\\31e6df38-db51-4209-b462-c06598ab9fe7';

async function testWhimsicalLayout() {
  console.log('--- Executando Auditoria Visual: Layout Whimsical Oficial (Imagem 2) ---');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1680,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1680, height: 1050 });

  try {
    await page.goto('http://localhost:3000/board/board-onegai', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));

    // 1. Screenshot Modo Claro: Visão Geral sem caixinhas
    const shotLight = path.join(ARTIFACTS_DIR, 'whimsical_light_overview.png');
    await page.screenshot({ path: shotLight });
    console.log('[1/4] Salvo:', shotLight);

    // 2. Ativar Tema Escuro (idêntico à imagem 2 do usuário)
    const themeBtn = await page.$('button[title*="Tema Escuro"]');
    if (themeBtn) {
      await themeBtn.click();
      await new Promise(r => setTimeout(r, 600));
    } else {
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('whimflow_theme', 'dark');
      });
      await new Promise(r => setTimeout(r, 400));
    }

    const shotDark = path.join(ARTIFACTS_DIR, 'whimsical_dark_overview.png');
    await page.screenshot({ path: shotDark });
    console.log('[2/4] Salvo:', shotDark);

    // 3. Selecionar um nó (ex: 'ped-3' que tem sub-filhos com bifurcação)
    const targetNode = await page.evaluateHandle(() => {
      const all = Array.from(document.querySelectorAll('.mindmap-node-card'));
      return all.find(el => (el.textContent || '').includes('2 Temakis Hot Roll')) || all[2];
    });

    if (targetNode) {
      await (targetNode as any).click();
      await new Promise(r => setTimeout(r, 600));

      const shotSelected = path.join(ARTIFACTS_DIR, 'whimsical_dark_selected.png');
      await page.screenshot({ path: shotSelected });
      console.log('[3/4] Salvo nó selecionado com menu flutuante:', shotSelected);
    }

    // 4. Zoom detalhado na bifurcação de 'Os Mais Pedidos'
    await page.evaluate(() => {
      // Pan no canvas para centralizar os nós em alta resolução
      const boardContainer = document.querySelector('.canvas-pan-container') as HTMLElement;
      if (boardContainer) {
        boardContainer.style.transform = 'translate(100px, 350px) scale(1.15)';
      }
    });
    await new Promise(r => setTimeout(r, 500));

    const shotZoom = path.join(ARTIFACTS_DIR, 'whimsical_dark_branch_zoom.png');
    await page.screenshot({ path: shotZoom });
    console.log('[4/4] Salvo zoom da bifurcação orgânica:', shotZoom);

    console.log('--- Auditoria Visual Concluída com Sucesso! ---');
  } catch (err) {
    console.error('Erro na auditoria visual:', err);
  } finally {
    await browser.close();
  }
}

testWhimsicalLayout();
