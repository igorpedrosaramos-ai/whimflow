import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\iprtr\\.gemini\\antigravity\\brain\\31e6df38-db51-4209-b462-c06598ab9fe7';

async function testAISalgados() {
  console.log('===========================================================');
  console.log('   TESTE E2E: IA SALGADOS VIANA & RENDERIZAÇÃO NO CANVAS   ');
  console.log('===========================================================');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    console.log('1. Aplicação carregada no navegador.');

    // Se estiver no Dashboard, cria um novo quadro
    const newBoardBtn = await page.$('#btn-dashboard-new-board');
    if (newBoardBtn) {
      await newBoardBtn.click();
      console.log('2. Clicou em criar novo quadro no Dashboard.');
      await new Promise(r => setTimeout(r, 800));
    }

    // Aguarda o canvas carregar
    await page.waitForSelector('#main-canvas-area', { timeout: 8000 });
    console.log('3. Canvas do editor carregado.');

    // Abre o Drawer do Agente IA (pelo TopNav ou pelo Toolbar)
    const agentBtn = (await page.$('#btn-topnav-agent')) || (await page.$('#btn-toolbar-ai'));
    if (agentBtn) {
      await agentBtn.click();
      console.log('4. Clicou no botão do Assistente IA.');
    } else {
      throw new Error('Botão do Assistente IA não encontrado.');
    }

    await page.waitForSelector('#agent-flyout-drawer', { timeout: 5000 });
    console.log('5. Drawer do Assistente IA aberto.');

    const promptText = 'Crie um mapa mental estratégico e detalhado sobre: uma loja de salgados chamada salgados viana, que vende 100, 50 e 20 salgados tamanho festa, crie combnos com coca e refrigerante avulso, que seja estrategico, ideal para ifood com foco em conversao';

    // Digita o prompt do usuário
    await page.waitForSelector('#agent-prompt-input', { timeout: 4000 });
    await page.type('#agent-prompt-input', promptText);
    console.log('6. Prompt exato do usuário digitado no campo de texto.');

    // Clica no botão de enviar
    await page.click('#btn-agent-send');
    console.log('7. Requisição enviada. Processando com IA Gemini...');

    // Aguarda a resposta com o botão #btn-insert-to-canvas
    await page.waitForSelector('#btn-insert-to-canvas', { timeout: 25000 });
    console.log('8. IA respondeu com sucesso!');

    // Captura o texto da mensagem gerada no chat
    const chatDetails = await page.evaluate(() => {
      const drawer = document.querySelector('#agent-flyout-drawer');
      const text = drawer ? drawer.innerText : '';
      return {
        preview: text.slice(0, 300),
        hasSalgados: text.includes('Salgados') || text.includes('salgados') || text.includes('Viana'),
        hasCombos: text.includes('Combo') || text.includes('combos') || text.includes('Coca') || text.includes('iFood'),
        hasQuestions: text.includes('Perguntas para Aprofundar') || text.includes('margem') || text.includes('iFood')
      };
    });
    console.log('9. Análise do conteúdo no chat:', {
      hasSalgados: chatDetails.hasSalgados,
      hasCombos: chatDetails.hasCombos,
      hasQuestions: chatDetails.hasQuestions
    });

    // Clica no botão "Inserir no Canvas"
    await page.click('#btn-insert-to-canvas');
    console.log('10. Clicou no botão "Inserir no Canvas".');

    await new Promise(r => setTimeout(r, 1200));

    // Fecha o drawer do agente para inspecionar o canvas
    const closeBtn = await page.$('#btn-close-agent');
    if (closeBtn) {
      await closeBtn.click();
      console.log('11. Fechou o drawer do agente.');
    } else {
      await page.keyboard.press('Escape');
    }
    await new Promise(r => setTimeout(r, 800));

    // Inspeciona os nós que agora residem no canvas
    const canvasNodes = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('.mindmap-node-card'));
      return els.map((el, i) => ({
        index: i,
        id: el.getAttribute('data-node-id') || '',
        text: (el.textContent || '').trim().replace(/\s+/g, ' ')
      }));
    });

    console.log(`\n12. NÓS RENDERIZADOS NO CANVAS (${canvasNodes.length} nós encontrados):`);
    canvasNodes.forEach(n => {
      console.log(`    - [${n.id}]: "${n.text.slice(0, 75)}"`);
    });

    // Verificações rigorosas:
    const rootNode = canvasNodes.find(n => n.id === 'root') || canvasNodes[0];
    const isRootBlank = !rootNode || !rootNode.text || rootNode.text === '-' || rootNode.text === '--';
    const isRootSalgados = rootNode && (rootNode.text.includes('Salgados') || rootNode.text.includes('Viana') || rootNode.text.includes('iFood'));
    const hasKits = canvasNodes.some(n => n.text.includes('Kit') || n.text.includes('100') || n.text.includes('50') || n.text.includes('20') || n.text.includes('Festa'));
    const hasCombos = canvasNodes.some(n => n.text.includes('Combo') || n.text.includes('Coca') || n.text.includes('Bebida') || n.text.includes('Refrigerante'));
    const hasIFood = canvasNodes.some(n => n.text.includes('iFood') || n.text.includes('Conversão') || n.text.includes('Cardápio'));
    const hasOldStub = canvasNodes.some(n => n.text.includes('1. Diagnóstico & Descoberta'));

    console.log('\n===========================================================');
    console.log('              RELATÓRIO DE CONFORMIDADE E2E               ');
    console.log('===========================================================');
    console.log('1. Nó raiz tem texto (NÃO ESTÁ EM BRANCO):', !isRootBlank ? '✅ APROVADO' : '❌ FALHA');
    console.log('2. Nó raiz identifica Salgados Viana:', isRootSalgados ? '✅ APROVADO' : '❌ FALHA');
    console.log('3. Contém Kits 100/50/20 salgados festa:', hasKits ? '✅ APROVADO' : '❌ FALHA');
    console.log('4. Contém Combos com Coca e Bebidas:', hasCombos ? '✅ APROVADO' : '❌ FALHA');
    console.log('5. Contém Estratégia de Conversão iFood:', hasIFood ? '✅ APROVADO' : '❌ FALHA');
    console.log('6. Eliminou stub genérico "Diagnóstico & Descoberta":', !hasOldStub ? '✅ APROVADO' : '❌ FALHA');
    console.log('===========================================================');

    // Tira screenshot do canvas validado
    const shotPath = path.join(ARTIFACTS_DIR, 'ai_salgados_validated.png');
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Screenshot salva em: ${shotPath}`);

    if (!isRootBlank && isRootSalgados && hasKits && hasCombos && hasIFood && !hasOldStub) {
      console.log('\n🌟 RESULTADO FINAL: SUCESSO ABSOLUTO! A IA entregou exatamente o solicitado!');
    } else {
      console.error('\n⚠️ ATENÇÃO: Uma ou mais verificações falharam!');
    }

  } catch (err: any) {
    console.error('Erro no teste:', err);
  } finally {
    await browser.close();
  }
}

testAISalgados();
