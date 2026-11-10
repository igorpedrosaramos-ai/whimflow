import puppeteer from 'puppeteer-core';
import * as path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\iprtr\\.gemini\\antigravity\\brain\\31e6df38-db51-4209-b462-c06598ab9fe7';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function goToDashboard(page: any) {
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await delay(500);
  const currentView = await page.evaluate(() => {
    return localStorage.getItem('whimflow_current_view');
  });
  if (currentView && currentView !== '"dashboard"') {
    await page.evaluate(() => {
      localStorage.setItem('whimflow_current_view', '"dashboard"');
    });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await delay(500);
  }
}

async function runVisualTemplatesTest() {
  console.log('🚀 Iniciando Teste Visual Rigoroso de Templates...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  try {
    await goToDashboard(page);

    // ==========================================
    // TESTE 1: STARTER PROJECT TIMELINE (Foto 4 e 5)
    // ==========================================
    console.log('\n--- TESTE 1: Starter Project Timeline ---');
    
    // Clica no botão "+ Criar de Modelo"
    await page.waitForSelector('#btn-dashboard-action-template', { timeout: 5000 });
    await page.click('#btn-dashboard-action-template');
    await delay(1000);

    // Clica diretamente no card do timeline
    const cardFound = await page.evaluate(() => {
      const card = document.querySelector('[data-template-id="tpl-project-timeline"]') as HTMLElement;
      if (card) {
        card.click();
        return true;
      }
      return false;
    });
    console.log(`Card do tpl-project-timeline encontrado e clicado: ${cardFound}`);
    await delay(1000);

    // Na visualização detalhada, clica no botão "Use template"
    const useBtnClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.trim().toLowerCase().includes('use template'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log(`Botão 'Use template' clicado: ${useBtnClicked}`);
    await delay(1500);

    // Valida nós renderizados no MindMapCanvas
    const nodeTextsTimeline = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.mindmap-node-card'));
      return nodes.map(n => (n.textContent || '').trim());
    });
    console.log('Nós encontrados no Canvas do Timeline:', nodeTextsTimeline);

    const hasQ1 = nodeTextsTimeline.some(t => t.includes('Q1'));
    const hasProto = nodeTextsTimeline.some(t => t.includes('Prototype'));
    const hasBeta = nodeTextsTimeline.some(t => t.includes('MVP Beta'));
    const hasScale = nodeTextsTimeline.some(t => t.includes('Scale'));
    console.log(`Validação Timeline: Q1=${hasQ1}, Proto=${hasProto}, Beta=${hasBeta}, Scale=${hasScale}`);

    if (!hasQ1 || !hasProto) {
      throw new Error(`Falha na validação dos nós do Timeline! Nós encontrados: ${nodeTextsTimeline.join(', ')}`);
    }

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'template_1_timeline_validated.png'),
      fullPage: false
    });
    console.log('✅ Screenshot salvo: template_1_timeline_validated.png');

    // ==========================================
    // TESTE 2: SITE MAP VARIATIONS (Foto 2)
    // ==========================================
    console.log('\n--- TESTE 2: Site Map Variations ---');
    await goToDashboard(page);

    await page.waitForSelector('#btn-dashboard-action-template', { timeout: 5000 });
    await page.click('#btn-dashboard-action-template');
    await delay(1000);

    const sitemapCardFound = await page.evaluate(() => {
      const card = document.querySelector('[data-template-id="tpl-sitemap-variations"]') as HTMLElement;
      if (card) {
        card.click();
        return true;
      }
      return false;
    });
    console.log(`Card do tpl-sitemap-variations encontrado e clicado: ${sitemapCardFound}`);
    await delay(1000);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.trim().toLowerCase().includes('use template'));
      if (btn) btn.click();
    });
    await delay(1500);

    const nodeTextsSitemap = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.mindmap-node-card'));
      return nodes.map(n => (n.textContent || '').trim());
    });
    console.log('Nós encontrados no Canvas do Site Map:', nodeTextsSitemap);

    const hasPlatform = nodeTextsSitemap.some(t => t.includes('Platform'));
    const hasMarketing = nodeTextsSitemap.some(t => t.includes('Marketing Website'));
    const hasDocs = nodeTextsSitemap.some(t => t.includes('Documentation Hub'));
    console.log(`Validação Sitemap: Platform=${hasPlatform}, Marketing=${hasMarketing}, Docs=${hasDocs}`);

    if (!hasPlatform || !hasMarketing) {
      throw new Error(`Falha na validação do Sitemap! Nós encontrados: ${nodeTextsSitemap.join(', ')}`);
    }

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'template_2_sitemap_validated.png'),
      fullPage: false
    });
    console.log('✅ Screenshot salvo: template_2_sitemap_validated.png');

    // ==========================================
    // TESTE 3: PRODUCT TEAM POD STRUCTURE (Foto 3)
    // ==========================================
    console.log('\n--- TESTE 3: Product Team Pod Structure ---');
    await goToDashboard(page);

    await page.waitForSelector('#btn-dashboard-action-template', { timeout: 5000 });
    await page.click('#btn-dashboard-action-template');
    await delay(1000);

    // Clica diretamente no card do pod structure
    const podCardFound = await page.evaluate(() => {
      const card = document.querySelector('[data-template-id="tpl-product-pod-structure"]') as HTMLElement;
      if (card) {
        card.click();
        return true;
      }
      return false;
    });
    console.log(`Card do tpl-product-pod-structure encontrado e clicado: ${podCardFound}`);
    await delay(1000);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.trim().toLowerCase().includes('use template'));
      if (btn) btn.click();
    });
    await delay(1500);

    const nodeTextsPods = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.mindmap-node-card'));
      return nodes.map(n => (n.textContent || '').trim());
    });
    console.log(`Total de nós no Pod Structure: ${nodeTextsPods.length}`);

    const hasRole = nodeTextsPods.some(t => t.includes('Role Title'));
    const hasName = nodeTextsPods.some(t => t.includes('Full Name'));
    console.log(`Validação Pod Structure: Role Title=${hasRole}, Full Name=${hasName}`);

    if (!hasRole || !hasName) {
      throw new Error(`Falha na validação do Pod Structure! Nós encontrados: ${nodeTextsPods.join(', ')}`);
    }

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'template_3_orgchart_validated.png'),
      fullPage: false
    });
    console.log('✅ Screenshot salvo: template_3_orgchart_validated.png');

    console.log('\n======================================================');
    console.log('🎉 SUCESSO TOTAL: TODOS OS 3 TEMPLATES FORAM VALIDADOS COM ÊXITO!');
    console.log('======================================================');

  } catch (err) {
    console.error('❌ Erro no teste visual de templates:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runVisualTemplatesTest();
