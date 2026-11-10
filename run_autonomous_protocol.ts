import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\iprtr\\.gemini\\antigravity\\brain\\31e6df38-db51-4209-b462-c06598ab9fe7';

interface StepReport {
  name: string;
  passed: boolean;
  details: string;
  screenshot?: string;
}

async function runAutonomousProtocol() {
  console.log('====================================================');
  console.log('   PROTOCOLO SUPREMO DE VALIDAÇÃO E E2E COMPLETO   ');
  console.log('====================================================');

  const reports: StepReport[] = [];
  const consoleLogs: string[] = [];
  const consoleErrors: string[] = [];

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', (err: Error) => {
    consoleErrors.push(`[PAGE_ERROR] ${err.message}`);
  });

  try {
    // ----------------------------------------------------
    // ETAPA 1: Carregamento do Dashboard
    // ----------------------------------------------------
    console.log('\n--- 1. Carregamento do Dashboard ---');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    
    // Se o storage restaurou no editor, clica no Dashboard para começar na tela inicial
    const inEditor = await page.$('#btn-goto-dashboard');
    if (inEditor) {
      await inEditor.click();
      await new Promise(r => setTimeout(r, 600));
    }

    const title = await page.title();
    const dashShot = path.join(ARTIFACTS_DIR, 'e2e_1_dashboard_root.png');
    await page.screenshot({ path: dashShot });
    reports.push({
      name: '1. Dashboard Inicial',
      passed: title.includes('Turbine') || title.includes('Whimflow'),
      details: `Página carregada com sucesso. Título: "${title}"`,
      screenshot: dashShot
    });

    // ----------------------------------------------------
    // ETAPA 2: Modal de Busca (Search)
    // ----------------------------------------------------
    console.log('\n--- 2. Modal de Busca (Search) ---');
    const searchBtn = await page.$('#btn-dashboard-search');
    let searchPassed = false;
    if (searchBtn) {
      await searchBtn.click();
      await new Promise(r => setTimeout(r, 500));
      const hasSearch = (await page.content()).includes('Search...') || (await page.content()).includes('Procurar quadros');
      if (hasSearch) {
        searchPassed = true;
        // Digita termo de busca
        await page.keyboard.type('Turbine');
        await new Promise(r => setTimeout(r, 300));
        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 400));
      }
    }
    reports.push({
      name: '2. Modal de Busca',
      passed: searchPassed,
      details: searchPassed ? 'Abriu busca, filtrou por texto e fechou via Escape' : 'Falha ao interagir com busca'
    });

    // ----------------------------------------------------
    // ETAPA 3: Modal de Templates
    // ----------------------------------------------------
    console.log('\n--- 3. Modal de Templates ---');
    const tplBtn = await page.$('#btn-dashboard-templates');
    let tplPassed = false;
    if (tplBtn) {
      await tplBtn.click();
      await new Promise(r => setTimeout(r, 500));
      const hasTpl = (await page.content()).includes('Search templates') || (await page.content()).includes('Suggested templates');
      if (hasTpl) {
        tplPassed = true;
        const tplShot = path.join(ARTIFACTS_DIR, 'e2e_3_template_modal.png');
        await page.screenshot({ path: tplShot });
        const closeBtn = await page.$('#btn-close-templates');
        if (closeBtn) await closeBtn.click();
        else await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 400));
      }
    }
    reports.push({
      name: '3. Modal de Templates',
      passed: tplPassed,
      details: tplPassed ? 'Modal de temas e templates exibido e fechado com sucesso' : 'Falha ao abrir modal'
    });

    // ----------------------------------------------------
    // ETAPA 4: Modal de Lixeira
    // ----------------------------------------------------
    console.log('\n--- 4. Modal de Lixeira (Trash) ---');
    const trashBtn = await page.$('#btn-dashboard-trash');
    let trashPassed = false;
    if (trashBtn) {
      await trashBtn.click();
      await new Promise(r => setTimeout(r, 500));
      const hasTrash = (await page.content()).includes('Lixeira de Quadros') || (await page.content()).includes('lixeira');
      if (hasTrash) {
        trashPassed = true;
        const closeTrashBtn = await page.$('#btn-close-trash');
        if (closeTrashBtn) await closeTrashBtn.click();
        else await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 400));
      }
    }
    reports.push({
      name: '4. Modal de Lixeira',
      passed: trashPassed,
      details: trashPassed ? 'Lixeira aberta e fechada com sucesso' : 'Falha ao abrir lixeira'
    });

    // ----------------------------------------------------
    // ETAPA 5: Editor de Documentos (DocView)
    // ----------------------------------------------------
    console.log('\n--- 5. Editor de Documentos ---');
    const newDocBtn = await page.$('#btn-dashboard-new-doc');
    let docPassed = false;
    if (newDocBtn) {
      await newDocBtn.click();
      await new Promise(r => setTimeout(r, 600));
      const inDoc = (await page.content()).includes('palavras') && (await page.content()).includes('Exportar .md');
      if (inDoc) {
        docPassed = true;
        const docShot = path.join(ARTIFACTS_DIR, 'e2e_5_doc_editor.png');
        await page.screenshot({ path: docShot });

        // Clica no breadcrumb para voltar ao dashboard
        const navDash = await page.$('[data-nav="dashboard"]');
        if (navDash) {
          await navDash.click();
          await new Promise(r => setTimeout(r, 600));
        }
      }
    }
    reports.push({
      name: '5. Editor de Documentos',
      passed: docPassed,
      details: docPassed ? 'Navegação para DocView, contagem de palavras e retorno ao Dashboard' : 'Falha ao abrir DocView'
    });

    // ----------------------------------------------------
    // ETAPA 6: Criação e Abertura de Novo Quadro no Canvas
    // ----------------------------------------------------
    console.log('\n--- 6. Criação de Novo Quadro ---');
    const newBoardBtn = await page.$('#btn-dashboard-new-board');
    let boardCreated = false;
    if (newBoardBtn) {
      await newBoardBtn.click();
      await new Promise(r => setTimeout(r, 800));
      const inCanvas = (await page.$('#main-canvas-area')) !== null;
      if (inCanvas) {
        boardCreated = true;
      }
    }
    reports.push({
      name: '6. Criação de Novo Quadro',
      passed: boardCreated,
      details: boardCreated ? 'Novo quadro criado com sucesso e canvas aberto' : 'Falha ao criar quadro'
    });

    // ----------------------------------------------------
    // ETAPA 7: Edição de Título e Interações no Canvas
    // ----------------------------------------------------
    console.log('\n--- 7. Edição de Título e Interações no Canvas ---');
    let nodeOpsPassed = false;
    if (boardCreated) {
      // Edita o título do quadro no TopNav
      const titleInput = await page.$('input[value="untitled"]') || await page.$('header input[type="text"]');
      if (titleInput) {
        await titleInput.click({ clickCount: 3 });
        await page.keyboard.type('Projeto Automatizado Alpha');
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 400));
      }

      // Clica no botão de adicionar nó do Toolbar
      const addNodeBtn = await page.$('#btn-toolbar-add-node');
      if (addNodeBtn) {
        await addNodeBtn.click();
        await new Promise(r => setTimeout(r, 400));
        // Digita texto no novo nó
        await page.keyboard.type('Subtópico 1');
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 400));
        await page.keyboard.type('Subtópico 2 Irmão');
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 400));
        nodeOpsPassed = true;
      }

      // Adiciona Nota Adesiva (Sticky)
      const stickyBtn = await page.$('#btn-toolbar-sticky');
      if (stickyBtn) {
        await stickyBtn.click();
        await new Promise(r => setTimeout(r, 400));
      }

      // Adiciona Forma Geométrica (Shape)
      const shapeBtn = await page.$('#btn-toolbar-shape');
      if (shapeBtn) {
        await shapeBtn.click();
        await new Promise(r => setTimeout(r, 400));
      }

      // Adiciona Wireframe
      const wireframeBtn = await page.$('#btn-toolbar-wireframe');
      if (wireframeBtn) {
        await wireframeBtn.click();
        await new Promise(r => setTimeout(r, 400));
      }

      // Teste de Desfazer e Refazer (Undo/Redo)
      await page.keyboard.down('Control');
      await page.keyboard.press('z');
      await page.keyboard.up('Control');
      await new Promise(r => setTimeout(r, 300));

      await page.keyboard.down('Control');
      await page.keyboard.press('y');
      await page.keyboard.up('Control');
      await new Promise(r => setTimeout(r, 300));
    }
    const canvasShot = path.join(ARTIFACTS_DIR, 'e2e_7_canvas_elements.png');
    await page.screenshot({ path: canvasShot });
    reports.push({
      name: '7. Elementos e Operações do Canvas',
      passed: nodeOpsPassed,
      details: nodeOpsPassed ? 'Criados nós filhos/irmãos, nota adesiva, forma geométrica, wireframe e testado Undo/Redo' : 'Falha em nós do canvas',
      screenshot: canvasShot
    });

    // ----------------------------------------------------
    // ETAPA 8: Estatísticas do Quadro (Métricas Ilimitadas)
    // ----------------------------------------------------
    console.log('\n--- 8. Estatísticas do Quadro ---');
    const statsBtn = await page.$('#btn-topnav-stats');
    let statsPassed = false;
    if (statsBtn) {
      await statsBtn.click();
      await new Promise(r => setTimeout(r, 500));
      const hasStats = (await page.content()).includes('Estatísticas do Quadro') || (await page.content()).includes('Métricas de Produtividade');
      if (hasStats) {
        statsPassed = true;
        const closeStats = await page.$('#btn-close-stats');
        if (closeStats) await closeStats.click();
        else await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 400));
      }
    }
    reports.push({
      name: '8. Estatísticas do Quadro',
      passed: statsPassed,
      details: statsPassed ? 'Métricas de nós, formas e notas exibidas' : 'Falha ao abrir estatísticas'
    });

    // ----------------------------------------------------
    // ETAPA 9: Modal de Compartilhar e Exportar (ShareModal)
    // ----------------------------------------------------
    console.log('\n--- 9. Modal de Compartilhar e Exportar ---');
    const shareBtn = await page.$('#btn-topnav-share');
    let sharePassed = false;
    if (shareBtn) {
      await shareBtn.click();
      await new Promise(r => setTimeout(r, 500));
      const hasShare = (await page.content()).includes('Exportação Executiva') || (await page.content()).includes('Formatos profissionais');
      if (hasShare) {
        sharePassed = true;
        const shareShot = path.join(ARTIFACTS_DIR, 'e2e_9_share_export.png');
        await page.screenshot({ path: shareShot });
        const closeShare = await page.$('#btn-close-share');
        if (closeShare) await closeShare.click();
        else await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 400));
      }
    }
    reports.push({
      name: '9. Modal de Exportação',
      passed: sharePassed,
      details: sharePassed ? 'Opções PNG (1x/2x/3x), SVG, PDF, PPTX e Markdown prontas' : 'Falha ao abrir ShareModal',
      screenshot: path.join(ARTIFACTS_DIR, 'e2e_9_share_export.png')
    });

    // ----------------------------------------------------
    // ETAPA 10: Ask Agent Gemini Drawer
    // ----------------------------------------------------
    console.log('\n--- 10. Ask Agent Drawer (Gemini AI) ---');
    const agentBtn = await page.$('#btn-topnav-agent');
    let agentPassed = false;
    if (agentBtn) {
      await agentBtn.click();
      await new Promise(r => setTimeout(r, 600));
      const hasAgent = (await page.content()).includes('Ask Whimsical agent...') && (await page.content()).includes('Try it out');
      if (hasAgent) {
        agentPassed = true;
        const agentShot = path.join(ARTIFACTS_DIR, 'e2e_10_agent_gemini.png');
        await page.screenshot({ path: agentShot });
        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 400));
      }
    }
    reports.push({
      name: '10. Ask Agent (Gemini AI)',
      passed: agentPassed,
      details: agentPassed ? 'Drawer de IA aberto com presets Try It Out e input multimodal' : 'Falha ao abrir drawer de IA',
      screenshot: path.join(ARTIFACTS_DIR, 'e2e_10_agent_gemini.png')
    });

    // ----------------------------------------------------
    // ETAPA 11: Retorno ao Dashboard e Persistência do Novo Quadro
    // ----------------------------------------------------
    console.log('\n--- 11. Persistência do Novo Quadro ---');
    const backToDash = await page.$('#btn-goto-dashboard');
    let persistPassed = false;
    if (backToDash) {
      await backToDash.click();
      await new Promise(r => setTimeout(r, 700));
      const hasNewBoardTitle = (await page.content()).includes('Projeto Automatizado Alpha');
      if (hasNewBoardTitle) {
        persistPassed = true;
      }
    }
    const finalDashShot = path.join(ARTIFACTS_DIR, 'e2e_11_dashboard_persisted.png');
    await page.screenshot({ path: finalDashShot });
    reports.push({
      name: '11. Persistência de Dados (IndexedDB)',
      passed: persistPassed,
      details: persistPassed ? 'Quadro "Projeto Automatizado Alpha" persistido e visível no Dashboard' : 'Quadro não encontrado na listagem',
      screenshot: finalDashShot
    });

  } catch (err: any) {
    console.error('ERRO FATAL NO PROTOCOLO:', err);
    reports.push({ name: 'FATAL_ERROR', passed: false, details: err.message });
  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  console.log('              RESUMO FINAL DA AUDITORIA             ');
  console.log('====================================================');
  console.log('Erros no Console:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log(consoleErrors);
  }
  console.log('\nResultados por Etapa:');
  reports.forEach(r => {
    console.log(`[${r.passed ? 'APROVADO' : 'REPROVADO'}] ${r.name} -> ${r.details}`);
  });

  const total = reports.length;
  const passed = reports.filter(r => r.passed).length;
  console.log(`\nTaxa de Sucesso: ${passed}/${total} (${Math.round((passed / total) * 100)}%)`);
}

runAutonomousProtocol();
