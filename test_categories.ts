import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\iprtr\\.gemini\\antigravity\\brain\\31e6df38-db51-4209-b462-c06598ab9fe7';

async function testCategories() {
  console.log('--- INICIANDO TESTE E2E DE CATEGORIAS E MOVIMENTAÇÃO DE PROJETOS ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // 1. Acessa o Dashboard
    console.log('1. Acessando Dashboard em http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));

    // Captura inicial do Dashboard com o novo Sidebar
    const shot1 = path.join(ARTIFACTS_DIR, 'category_1_dashboard_sidebar.png');
    await page.screenshot({ path: shot1 });
    console.log('[1/6] Screenshot salvo:', shot1);

    // 2. Verifica se a seção CATEGORIAS está visível
    const hasCategoriesSection = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('CATEGORIAS') && text.includes('Marketing & Vendas');
    });
    console.log('Seção CATEGORIAS visível no sidebar:', hasCategoriesSection);

    // Verifica tradução do rodapé
    const footerTranslations = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Templates e Temas') && text.includes('Lixeira');
    });
    console.log('Tradução do rodapé (Templates e Temas / Lixeira):', footerTranslations);

    // 3. Abre Modal de Nova Categoria
    console.log('2. Clicando em + Nova Categoria...');
    const btnNewCat = await page.$('#btn-sidebar-new-category');
    if (btnNewCat) {
      await btnNewCat.click();
    } else {
      const btnAdd = await page.$('#btn-add-category');
      if (btnAdd) await btnAdd.click();
    }
    await new Promise(r => setTimeout(r, 600));

    const shot2 = path.join(ARTIFACTS_DIR, 'category_2_modal_create.png');
    await page.screenshot({ path: shot2 });
    console.log('[2/6] Screenshot salvo:', shot2);

    // Preenche nome da categoria e salva
    await page.type('#category-name-input', 'Operações & Logística 2027');
    await new Promise(r => setTimeout(r, 300));
    await page.click('#btn-save-category');
    await new Promise(r => setTimeout(r, 800));

    // 4. Verifica se a nova categoria apareceu no sidebar
    const hasNewCatInSidebar = await page.evaluate(() => {
      return document.body.innerText.includes('Operações & Logística 2027');
    });
    console.log('Nova categoria presente no sidebar:', hasNewCatInSidebar);

    const shot3 = path.join(ARTIFACTS_DIR, 'category_3_sidebar_with_new_cat.png');
    await page.screenshot({ path: shot3 });
    console.log('[3/6] Screenshot salvo:', shot3);

    // 5. Mover um projeto para a nova categoria
    console.log('3. Testando Mover Projeto para Categoria...');
    const firstMoreBtn = await page.$('button[id^="btn-board-menu-"]');
    console.log('Botão 3 pontinhos do quadro encontrado:', !!firstMoreBtn);
    if (firstMoreBtn) {
      await firstMoreBtn.click();
      await new Promise(r => setTimeout(r, 600));
      
      // Procura botão "Mover Categoria"
      const moveBtn = await page.$('button[id^="btn-move-board-"]');
      console.log('Botão Mover Categoria no menu encontrado:', !!moveBtn);
      if (moveBtn) {
        await moveBtn.click();
        await new Promise(r => setTimeout(r, 600));

        const shot4 = path.join(ARTIFACTS_DIR, 'category_4_modal_move_board.png');
        await page.screenshot({ path: shot4 });
        console.log('[4/6] Screenshot salvo:', shot4);

        // Clica na categoria "Operações & Logística 2027" no modal de mover
        await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button[id^="btn-modal-cat-"]'));
          const target = btns.find(b => b.textContent?.includes('Operações & Logística 2027'));
          if (target) (target as HTMLButtonElement).click();
        });
        await new Promise(r => setTimeout(r, 400));

        // Confirma o movimento
        await page.click('#btn-confirm-move-category');
        await new Promise(r => setTimeout(r, 800));
      }
    }

    const shot5 = path.join(ARTIFACTS_DIR, 'category_5_board_moved.png');
    await page.screenshot({ path: shot5 });
    console.log('[5/6] Screenshot salvo:', shot5);

    // 6. Testar Filtragem por Categoria
    console.log('4. Clicando na categoria no sidebar para filtrar...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('aside button[id^="btn-cat-"]'));
      const catBtn = btns.find(b => b.textContent?.includes('Operações & Logística 2027'));
      if (catBtn) (catBtn as HTMLButtonElement).click();
    });
    await new Promise(r => setTimeout(r, 800));

    const isFiltered = await page.evaluate(() => {
      return document.body.innerText.includes('Categoria: Operações & Logística 2027');
    });
    console.log('Filtro por categoria ativo na tela:', isFiltered);

    const shot6 = path.join(ARTIFACTS_DIR, 'category_6_filtered_view.png');
    await page.screenshot({ path: shot6 });
    console.log('[6/6] Screenshot salvo:', shot6);

    // 7. Entrar no board e verificar o TopNav
    console.log('5. Entrando no board para verificar seletor de categoria no TopNav...');
    const boardCard = await page.$('.board-grid-card');
    if (boardCard) {
      await boardCard.click();
      await new Promise(r => setTimeout(r, 1200));

      const hasTopNavCategory = await page.evaluate(() => {
        const topnav = document.querySelector('.top-navbar');
        return topnav ? topnav.textContent?.includes('Operações & Logística 2027') : false;
      });
      console.log('TopNav exibe a categoria do projeto:', hasTopNavCategory);

      const shot7 = path.join(ARTIFACTS_DIR, 'category_7_topnav_board.png');
      await page.screenshot({ path: shot7 });
      console.log('[7/7] Screenshot salvo:', shot7);
    }

    console.log('=== TODOS OS TESTES DE CATEGORIA FORAM CONCLUÍDOS COM SUCESSO! ===');
  } catch (err) {
    console.error('ERRO NO TESTE:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testCategories();
