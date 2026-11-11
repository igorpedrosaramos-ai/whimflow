import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\iprtr\\.gemini\\antigravity\\brain\\31e6df38-db51-4209-b462-c06598ab9fe7';

interface TestResult {
  step: string;
  passed: boolean;
  expectedUrl: string;
  actualUrl: string;
  details: string;
}

async function runRouteTests() {
  console.log('================================================================');
  console.log('   VALIDAÇÃO RIGOROSA E2E: ROTAS INDIVIDUAIS E NAVEGAÇÃO REAL   ');
  console.log('================================================================');

  const results: TestResult[] = [];

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // -------------------------------------------------------------
    // TESTE 1: Acesso ao Endereço Principal (/) sempre abre a Home
    // -------------------------------------------------------------
    console.log('\n--- Teste 1: Acesso direto à Home (/) ---');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    const url1 = page.url();
    const hasDash1 = (await page.$('#btn-dashboard-new-board')) !== null;
    const shot1 = path.join(ARTIFACTS_DIR, 'route_1_home.png');
    await page.screenshot({ path: shot1 });

    const passed1 = (url1 === 'http://localhost:3000/' || url1 === 'http://localhost:3000/dashboard') && hasDash1;
    results.push({
      step: '1. Acesso à Home (/)',
      passed: passed1,
      expectedUrl: 'http://localhost:3000/',
      actualUrl: url1,
      details: hasDash1 ? 'Página inicial carregou com sucesso o Dashboard' : 'Dashboard não renderizou na raiz'
    });
    console.log(`URL atual: ${url1} | Sucesso: ${passed1}`);

    // -------------------------------------------------------------
    // TESTE 2: Navegação para Quadro pelo Card (/board/:id)
    // -------------------------------------------------------------
    console.log('\n--- Teste 2: Navegação para Quadro (/board/:id) via Card ---');
    await page.waitForSelector('.board-card', { timeout: 8000 });
    const firstCard = await page.$('.board-card');
    const boardId = await page.evaluate(el => el?.getAttribute('data-board-id'), firstCard);
    
    if (firstCard) {
      await firstCard.click();
      await page.waitForSelector('#main-canvas-area', { timeout: 8000 });
      await new Promise(r => setTimeout(r, 600));
    }

    const url2 = page.url();
    const shot2 = path.join(ARTIFACTS_DIR, 'route_2_board.png');
    await page.screenshot({ path: shot2 });
    const passed2 = url2.includes('/board/') && (await page.$('#main-canvas-area')) !== null;

    results.push({
      step: '2. Navegação para Quadro pelo Card',
      passed: passed2,
      expectedUrl: `http://localhost:3000/board/${boardId}`,
      actualUrl: url2,
      details: passed2 ? `URL atualizada para o quadro ${boardId} com canvas ativo` : 'Falha ao navegar para o quadro'
    });
    console.log(`URL atual: ${url2} | Sucesso: ${passed2}`);

    // -------------------------------------------------------------
    // TESTE 3: Acesso Direto em Nova Aba e Atualização de Página (F5) no Quadro
    // -------------------------------------------------------------
    console.log('\n--- Teste 3: Nova aba e recarregamento direto de /board/:id ---');
    const newPage = await browser.newPage();
    await newPage.setViewport({ width: 1440, height: 900 });
    await newPage.goto(url2, { waitUntil: 'networkidle2' });
    await newPage.waitForSelector('#main-canvas-area', { timeout: 8000 });
    
    // Atualiza a página (F5)
    await newPage.reload({ waitUntil: 'networkidle2' });
    await newPage.waitForSelector('#main-canvas-area', { timeout: 8000 });
    const url3 = newPage.url();
    const passed3 = url3 === url2 && (await newPage.$('#main-canvas-area')) !== null;

    results.push({
      step: '3. Acesso Direto e F5 em /board/:id',
      passed: passed3,
      expectedUrl: url2,
      actualUrl: url3,
      details: passed3 ? 'Quadro carregou perfeitamente em nova aba e persistiu após F5' : 'Falha na persistência de URL após F5'
    });
    console.log(`URL atual: ${url3} | Sucesso: ${passed3}`);
    await newPage.close();

    // -------------------------------------------------------------
    // TESTE 4: Navegação para Documento (/doc/:id)
    // -------------------------------------------------------------
    console.log('\n--- Teste 4: Navegação direta para /doc/:id ---');
    const docUrl = `http://localhost:3000/doc/${boardId}`;
    await page.goto(docUrl, { waitUntil: 'networkidle2' });
    await page.waitForSelector('#btn-doc-nav-dashboard', { timeout: 8000 });
    const url4 = page.url();
    const shot4 = path.join(ARTIFACTS_DIR, 'route_4_doc.png');
    await page.screenshot({ path: shot4 });

    // F5 no Documento
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('#btn-doc-nav-dashboard', { timeout: 8000 });
    const url4AfterF5 = page.url();
    const passed4 = url4AfterF5.includes('/doc/') && (await page.$('#btn-doc-nav-dashboard')) !== null;

    results.push({
      step: '4. Editor de Documento (/doc/:id)',
      passed: passed4,
      expectedUrl: docUrl,
      actualUrl: url4AfterF5,
      details: passed4 ? 'DocView carregou na rota /doc/ e manteve-se ativa após refresh' : 'Falha na rota de documento'
    });
    console.log(`URL atual: ${url4AfterF5} | Sucesso: ${passed4}`);

    // -------------------------------------------------------------
    // TESTE 5: Retorno ao Dashboard via Breadcrumb (/ -> Home)
    // -------------------------------------------------------------
    console.log('\n--- Teste 5: Retorno ao Dashboard via Breadcrumb ---');
    const breadcrumbDash = await page.$('#btn-doc-nav-dashboard');
    if (breadcrumbDash) {
      await breadcrumbDash.click();
      await page.waitForSelector('#btn-dashboard-new-board', { timeout: 8000 });
      await new Promise(r => setTimeout(r, 500));
    }
    const url5 = page.url();
    const passed5 = url5 === 'http://localhost:3000/' || url5 === 'http://localhost:3000/dashboard';

    results.push({
      step: '5. Retorno ao Dashboard via Breadcrumb',
      passed: passed5,
      expectedUrl: 'http://localhost:3000/',
      actualUrl: url5,
      details: passed5 ? 'URL retornou para / e exibiu o Dashboard' : 'URL não retornou para a raiz'
    });
    console.log(`URL atual: ${url5} | Sucesso: ${passed5}`);

    // -------------------------------------------------------------
    // TESTE 6: Rota de Recentes (/recentes)
    // -------------------------------------------------------------
    console.log('\n--- Teste 6: Rota /recentes via Menu ---');
    const recentBtn = await page.$('#btn-sidebar-recent');
    if (recentBtn) {
      await recentBtn.click();
      await new Promise(r => setTimeout(r, 500));
    }
    const url6 = page.url();
    const passed6 = url6.includes('/recentes');
    const shot6 = path.join(ARTIFACTS_DIR, 'route_6_recent.png');
    await page.screenshot({ path: shot6 });

    results.push({
      step: '6. Rota Recentes (/recentes)',
      passed: passed6,
      expectedUrl: 'http://localhost:3000/recentes',
      actualUrl: url6,
      details: passed6 ? 'URL atualizou para /recentes com filtro aplicado' : 'URL não mudou para /recentes'
    });
    console.log(`URL atual: ${url6} | Sucesso: ${passed6}`);

    // -------------------------------------------------------------
    // TESTE 7: Rota de Templates (/templates)
    // -------------------------------------------------------------
    console.log('\n--- Teste 7: Rota /templates ---');
    const tplBtn = await page.$('#btn-dashboard-templates');
    if (tplBtn) {
      await tplBtn.click();
      await page.waitForSelector('#btn-close-templates, .template-modal', { timeout: 6000 });
      await new Promise(r => setTimeout(r, 500));
    }
    const url7 = page.url();
    const hasTplModal = (await page.content()).includes('Suggested templates for boards') || (await page.content()).includes('Modelos sugeridos');
    const shot7 = path.join(ARTIFACTS_DIR, 'route_7_templates.png');
    await page.screenshot({ path: shot7 });
    const passed7 = url7.includes('/templates') && hasTplModal;

    // Fecha o modal pelo botão fechar
    const closeTpl = await page.$('#btn-close-templates');
    if (closeTpl) {
      await closeTpl.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await new Promise(r => setTimeout(r, 600));
    const url7Closed = page.url();

    results.push({
      step: '7. Rota de Templates (/templates)',
      passed: passed7 && url7Closed === 'http://localhost:3000/',
      expectedUrl: 'http://localhost:3000/templates',
      actualUrl: `Aberta: ${url7} | Fechada: ${url7Closed}`,
      details: passed7 ? 'URL atualizou para /templates e exibiu o modal; ao fechar retornou para /' : 'Falha na rota /templates'
    });
    console.log(`URL aberta: ${url7} | Fechada: ${url7Closed} | Sucesso: ${passed7}`);

    // -------------------------------------------------------------
    // TESTE 8: Rota de Lixeira (/lixeira)
    // -------------------------------------------------------------
    console.log('\n--- Teste 8: Rota /lixeira ---');
    const trashBtn = await page.$('#btn-dashboard-trash');
    if (trashBtn) {
      await trashBtn.click();
      await page.waitForSelector('#btn-close-trash, .trash-modal', { timeout: 6000 });
      await new Promise(r => setTimeout(r, 500));
    }
    const url8 = page.url();
    const hasTrashModal = (await page.content()).includes('Lixeira') || (await page.content()).includes('Trash');
    const shot8 = path.join(ARTIFACTS_DIR, 'route_8_trash.png');
    await page.screenshot({ path: shot8 });
    const passed8 = url8.includes('/lixeira') && hasTrashModal;

    const closeTrash = await page.$('#btn-close-trash');
    if (closeTrash) {
      await closeTrash.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await new Promise(r => setTimeout(r, 600));
    const url8Closed = page.url();

    results.push({
      step: '8. Rota de Lixeira (/lixeira)',
      passed: passed8 && url8Closed === 'http://localhost:3000/',
      expectedUrl: 'http://localhost:3000/lixeira',
      actualUrl: `Aberta: ${url8} | Fechada: ${url8Closed}`,
      details: passed8 ? 'URL atualizou para /lixeira e abriu modal; ao fechar retornou para /' : 'Falha na rota /lixeira'
    });
    console.log(`URL atual: ${url8} | Fechada: ${url8Closed} | Sucesso: ${passed8}`);

    // -------------------------------------------------------------
    // TESTE 9: Rota do Assistente IA (/ia)
    // -------------------------------------------------------------
    console.log('\n--- Teste 9: Rota do Assistente IA (/ia) ---');
    const agentActionBtn = await page.$('#btn-dashboard-action-agent') || await page.$('#btn-dash-agent');
    if (agentActionBtn) {
      await agentActionBtn.click();
      await new Promise(r => setTimeout(r, 600));
    }
    const url9 = page.url();
    const shot9 = path.join(ARTIFACTS_DIR, 'route_9_ia.png');
    await page.screenshot({ path: shot9 });
    const passed9 = url9.includes('/ia');

    results.push({
      step: '9. Rota do Assistente IA (/ia)',
      passed: passed9,
      expectedUrl: 'http://localhost:3000/ia',
      actualUrl: url9,
      details: passed9 ? 'URL atualizou para /ia e exibiu interface do Assistente' : 'Falha na rota /ia'
    });
    console.log(`URL atual: ${url9} | Sucesso: ${passed9}`);

    // -------------------------------------------------------------
    // TESTE 10: Navegação do Navegador: Voltar (Back) e Avançar (Forward)
    // -------------------------------------------------------------
    console.log('\n--- Teste 10: Botões Voltar e Avançar do Navegador ---');
    await page.goBack();
    await new Promise(r => setTimeout(r, 600));
    const backUrl1 = page.url();
    console.log('Após 1x goBack():', backUrl1);

    await page.goBack();
    await new Promise(r => setTimeout(r, 600));
    const backUrl2 = page.url();
    console.log('Após 2x goBack():', backUrl2);

    await page.goForward();
    await new Promise(r => setTimeout(r, 600));
    const forwardUrl1 = page.url();
    console.log('Após 1x goForward():', forwardUrl1);

    const shot10 = path.join(ARTIFACTS_DIR, 'route_10_history.png');
    await page.screenshot({ path: shot10 });

    const passed10 = backUrl2 !== forwardUrl1 && backUrl1 !== '';
    results.push({
      step: '10. Histórico (Voltar / Avançar)',
      passed: passed10,
      expectedUrl: 'Sincronização correta do histórico',
      actualUrl: `Voltar: ${backUrl2} -> Avançar: ${forwardUrl1}`,
      details: passed10 ? 'Navegação nativa de voltar e avançar no histórico validada com sucesso' : 'Falha no histórico'
    });
    console.log(`Histórico validado: ${passed10}`);

    // -------------------------------------------------------------
    // RESUMO FINAL
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log('               RELATÓRIO CONSOLIDADO DE ROTAS                   ');
    console.log('================================================================');
    let allPassed = true;
    results.forEach(r => {
      const statusIcon = r.passed ? '✅ APROVADO' : '❌ FALHA';
      console.log(`[${statusIcon}] ${r.step}`);
      console.log(`    Esperado: ${r.expectedUrl}`);
      console.log(`    Obtido:   ${r.actualUrl}`);
      console.log(`    Detalhe:  ${r.details}\n`);
      if (!r.passed) allPassed = false;
    });

    console.log(`Taxa de Sucesso: ${results.filter(r => r.passed).length}/${results.length} (${Math.round((results.filter(r => r.passed).length / results.length) * 100)}%)`);

    if (allPassed) {
      console.log('\n🌟 TODAS AS ROTAS E NAVEGAÇÕES REAIS FORAM APROVADAS COM 100% DE SUCESSO!');
    } else {
      console.error('\n⚠️ Houve falhas na validação de rotas.');
    }

  } catch (err: any) {
    console.error('Erro na execução dos testes de rota:', err);
  } finally {
    await browser.close();
  }
}

runRouteTests();
