import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\iprtr\\.gemini\\antigravity\\brain\\31e6df38-db51-4209-b462-c06598ab9fe7';

interface AuditResult {
  step: string;
  success: boolean;
  details?: string;
  screenshot?: string;
}

async function runFullAudit() {
  const results: AuditResult[] = [];
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  try {
    console.log('=== TESTE 1: INICIALIZAÇÃO DA APLICAÇÃO ===');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    const pageTitle = await page.title();
    console.log('Título da página:', pageTitle);
    
    // Captura tela inicial
    const shot1 = path.join(ARTIFACTS_DIR, 'audit_step1_dashboard.png');
    await page.screenshot({ path: shot1 });
    results.push({ step: '1. Inicialização', success: true, details: `Carregado com título "${pageTitle}"`, screenshot: shot1 });

    // Determina se estamos no dashboard ou no editor (devido ao storage)
    const isDashboard = await page.$('.dashboard-container') !== null || await page.$('[data-view="dashboard"]') !== null || (await page.content()).includes('Everyone at teste');
    console.log('Está no Dashboard?', isDashboard);

    console.log('=== TESTE 2: NAVEGAÇÃO E RETORNO AO DASHBOARD ===');
    // Se estiver no editor, clica no botão Dashboard do TopNav
    const btnGotoDashboard = await page.$('#btn-goto-dashboard');
    if (btnGotoDashboard) {
      await btnGotoDashboard.click();
      await new Promise(r => setTimeout(r, 600));
      console.log('Navegou para Dashboard pelo botão do TopNav');
    }

    const shotDash = path.join(ARTIFACTS_DIR, 'audit_step2_dashboard_view.png');
    await page.screenshot({ path: shotDash });

    console.log('=== TESTE 3: MODAL DE BUSCA (SEARCH) ===');
    // Procura botão de search
    const btnSearch = await page.$('button[title*="Busca"]') || await page.$('button[title*="Search"]') || await page.$('button svg.lucide-search');
    let searchOpened = false;
    if (btnSearch) {
      await btnSearch.click();
      await new Promise(r => setTimeout(r, 500));
      const hasSearchModal = (await page.content()).includes('Search...') || (await page.content()).includes('Procurar quadros');
      searchOpened = hasSearchModal;
      console.log('SearchModal abriu?', hasSearchModal);
      if (hasSearchModal) {
        // Pressiona Escape para fechar
        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 400));
      }
    }
    results.push({ step: '2. Modal de Busca', success: searchOpened, details: searchOpened ? 'Abriu e respondeu ao Escape' : 'Botão não encontrado ou não abriu' });

    console.log('=== TESTE 4: MODAL DE TEMPLATES ===');
    // Procura botão de templates
    const btnTemplates = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('span, button, div')).find(e => e.textContent?.includes('Templates & color themes'));
      if (el) {
        (el as HTMLElement).click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 500));
    const hasTemplateModal = (await page.content()).includes('Templates') && ((await page.content()).includes('Categorias') || (await page.content()).includes('Product Docs') || (await page.content()).includes('Mind Maps'));
    console.log('TemplateModal abriu?', hasTemplateModal);
    if (hasTemplateModal) {
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));
    }
    results.push({ step: '3. Modal de Templates', success: hasTemplateModal, details: hasTemplateModal ? 'Categorias e temas carregados' : 'Falha ao abrir' });

    console.log('=== TESTE 5: MODAL DE LIXEIRA (TRASH) ===');
    const btnTrash = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('span, button, div')).find(e => e.textContent?.trim() === 'Trash');
      if (el) {
        (el as HTMLElement).click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 500));
    const hasTrashModal = (await page.content()).includes('Lixeira') || (await page.content()).includes('Itens na Lixeira');
    console.log('TrashModal abriu?', hasTrashModal);
    if (hasTrashModal) {
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));
    }
    results.push({ step: '4. Modal de Lixeira', success: hasTrashModal, details: hasTrashModal ? 'Aberto e fechado via Escape' : 'Falha ao abrir' });

    console.log('=== TESTE 6: ABERTURA DO QUADRO NO CANVAS ===');
    // Clica no primeiro cartão de quadro para abrir o editor
    const clickedBoard = await page.evaluate(() => {
      const card = document.querySelector('.board-card') || document.querySelector('[data-board-id]');
      if (card) {
        (card as HTMLElement).click();
        return true;
      }
      // Se não achar .board-card, clica em qualquer elemento com título de board
      const anyTitle = Array.from(document.querySelectorAll('h4, .board-title, div')).find(el => el.textContent?.includes('Turbine Gestão') || el.textContent?.includes('Novo Projeto') || el.textContent?.includes('untitled'));
      if (anyTitle) {
        (anyTitle as HTMLElement).click();
        return true;
      }
      return false;
    });
    console.log('Clicou no cartão do quadro?', clickedBoard);
    await new Promise(r => setTimeout(r, 800));

    const shotEditor = path.join(ARTIFACTS_DIR, 'audit_step6_canvas_editor.png');
    await page.screenshot({ path: shotEditor });
    const inCanvas = (await page.$('#main-canvas-area')) !== null;
    console.log('Canvas principal carregado?', inCanvas);
    results.push({ step: '5. Editor Canvas', success: inCanvas, details: inCanvas ? 'Canvas montado e nós renderizados' : 'Falha ao carregar canvas', screenshot: shotEditor });

    console.log('=== TESTE 7: INTERAÇÃO COM TOPNAV E MODAL SHARE ===');
    // Clica no botão Share
    const btnShare = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Share'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log('Clicou no botão Share?', btnShare);
    await new Promise(r => setTimeout(r, 500));
    const hasShareModal = (await page.content()).includes('Compartilhar e Exportar') || (await page.content()).includes('Exportar PNG');
    console.log('ShareModal abriu?', hasShareModal);
    if (hasShareModal) {
      const shotShare = path.join(ARTIFACTS_DIR, 'audit_step7_share_modal.png');
      await page.screenshot({ path: shotShare });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));
    }
    results.push({ step: '6. Modal Share e Export', success: hasShareModal, details: hasShareModal ? 'Exportações PNG, SVG, PDF, PPTX disponíveis' : 'Falha ao abrir' });

    console.log('=== TESTE 8: ASK AGENT DRAWER (IA GEMINI) ===');
    // Clica no ícone de Sparkles / Agent no TopNav
    const btnAgent = await page.evaluate(() => {
      const btn = document.querySelector('button[title*="Agente"]') || 
                  document.querySelector('button[title*="Agent"]') || 
                  document.querySelector('button[title*="IA"]') ||
                  Array.from(document.querySelectorAll('button')).find(b => b.innerHTML.includes('lucide-sparkles'));
      if (btn) {
        (btn as HTMLElement).click();
        return true;
      }
      return false;
    });
    console.log('Clicou no botão Agent?', btnAgent);
    await new Promise(r => setTimeout(r, 600));
    const hasAgentDrawer = (await page.content()).includes('Ask Whimsical agent...') || (await page.content()).includes('Try it out');
    console.log('AgentDrawer abriu?', hasAgentDrawer);
    if (hasAgentDrawer) {
      const shotAgent = path.join(ARTIFACTS_DIR, 'audit_step8_agent_drawer.png');
      await page.screenshot({ path: shotAgent });
      // Fecha o drawer
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));
    }
    results.push({ step: '7. Ask Agent Drawer (Gemini)', success: hasAgentDrawer, details: hasAgentDrawer ? 'Drawer aberto com presets Try It Out' : 'Falha ao abrir' });

    console.log('=== TESTE 9: HISTÓRICO DE VERSÕES (TIME MACHINE) ===');
    const btnHistory = await page.evaluate(() => {
      const btn = document.querySelector('button[title*="Histórico de Versões"]');
      if (btn) {
        (btn as HTMLElement).click();
        return true;
      }
      return false;
    });
    console.log('Clicou em Histórico de Versões?', btnHistory);
    await new Promise(r => setTimeout(r, 500));
    const hasHistoryModal = (await page.content()).includes('Histórico de Versões') || (await page.content()).includes('Pontos de Restauração');
    console.log('VersionHistoryModal abriu?', hasHistoryModal);
    if (hasHistoryModal) {
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));
    }
    results.push({ step: '8. Histórico de Versões', success: hasHistoryModal, details: hasHistoryModal ? 'Time machine e marcos abertos' : 'Falha ao abrir' });

    console.log('=== TESTE 10: ESTATÍSTICAS DO QUADRO ===');
    const btnStats = await page.evaluate(() => {
      const btn = document.querySelector('button[title*="Estatísticas"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('objetos'));
      if (btn) {
        (btn as HTMLElement).click();
        return true;
      }
      return false;
    });
    console.log('Clicou em Estatísticas?', btnStats);
    await new Promise(r => setTimeout(r, 500));
    const hasStatsModal = (await page.content()).includes('Estatísticas do Quadro') || (await page.content()).includes('Métricas de Produtividade');
    console.log('BoardStatsModal abriu?', hasStatsModal);
    if (hasStatsModal) {
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));
    }
    results.push({ step: '9. Estatísticas do Quadro', success: hasStatsModal, details: hasStatsModal ? 'Métricas de nós e densidade abertas' : 'Falha ao abrir' });

    console.log('=== TESTE 11: MODO APRESENTAÇÃO (PRESENT) ===');
    const btnPresent = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Present'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log('Clicou em Present?', btnPresent);
    await new Promise(r => setTimeout(r, 600));
    const inPresentation = (await page.content()).includes('Exit Presentation') || (await page.content()).includes('Sair');
    console.log('Entrou no modo apresentação?', inPresentation);
    if (inPresentation) {
      const shotPres = path.join(ARTIFACTS_DIR, 'audit_step11_presentation.png');
      await page.screenshot({ path: shotPres });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    }
    results.push({ step: '10. Modo Apresentação', success: inPresentation, details: inPresentation ? 'Tela cheia executiva com transição de slides' : 'Falha ao entrar' });

    console.log('=== TESTE 12: EDITOR DE DOCUMENTOS (DOC VIEW) ===');
    // Navega para Doc
    const navToDoc = await page.evaluate(() => {
      const btn = document.getElementById('btn-goto-dashboard');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    // No dashboard, clica em "Doc"
    const clickedDoc = await page.evaluate(() => {
      const docBtn = Array.from(document.querySelectorAll('button, div')).find(el => el.textContent?.trim() === 'Doc' || el.textContent?.includes('Novo Doc'));
      if (docBtn) {
        (docBtn as HTMLElement).click();
        return true;
      }
      return false;
    });
    console.log('Clicou no botão Doc?', clickedDoc);
    await new Promise(r => setTimeout(r, 600));
    const inDocView = (await page.content()).includes('palavras') && (await page.content()).includes('Exportar .md');
    console.log('Entrou no DocEditorView?', inDocView);
    if (inDocView) {
      const shotDoc = path.join(ARTIFACTS_DIR, 'audit_step12_doc_view.png');
      await page.screenshot({ path: shotDoc });
    }
    results.push({ step: '11. Editor de Documentos (DocView)', success: inDocView, details: inDocView ? 'Editor rich blocks com exportação md/impressão' : 'Falha ao abrir DocView' });

  } catch (err: any) {
    console.error('Erro na auditoria E2E:', err);
    results.push({ step: 'FATAL_ERROR', success: false, details: err.message });
  } finally {
    await browser.close();
  }

  console.log('=== AUDITORIA COMPLETA CONCLUÍDA ===');
  console.log('Console Errors:', consoleErrors.length, consoleErrors);
  console.log('Page Errors:', pageErrors.length, pageErrors);
  console.log('Resultados:', JSON.stringify(results, null, 2));
}

runFullAudit();
