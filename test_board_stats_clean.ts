import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\iprtr\\.gemini\\antigravity\\brain\\31e6df38-db51-4209-b462-c06598ab9fe7';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log('===========================================================');
  console.log('   TESTE DE VALIDAÇÃO: MODAL DE ESTATÍSTICAS DO QUADRO     ');
  console.log('===========================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  try {
    // 1. Acessa aplicação
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await delay(500);

    // Se estiver no dashboard, abre o primeiro quadro
    const firstBoardCard = await page.$('.board-card');
    if (firstBoardCard) {
      await firstBoardCard.click();
      await delay(1000);
    }

    // 2. Abre o modal de estatísticas pelo botão do TopNav
    const statsBtn = await page.$('#btn-topnav-stats');
    if (!statsBtn) {
      throw new Error('Botão #btn-topnav-stats não encontrado no TopNav');
    }
    await statsBtn.click();
    await delay(600);

    // 3. Lê o conteúdo do modal
    const modalContent = await page.evaluate(() => {
      const heading = document.querySelector('h2');
      const allText = document.body.innerText;
      return {
        headingText: heading ? heading.innerText : '',
        allText
      };
    });

    console.log('Título do Modal:', modalContent.headingText);

    // 4. Verificação rigorosa: A informação de plano individual NÃO pode existir
    const hasPlanoIndividual = modalContent.allText.toLowerCase().includes('plano individual');
    const hasCapacidadeIlimitada = modalContent.allText.toLowerCase().includes('capacidade ilimitada');
    const has50Objetos = modalContent.allText.toLowerCase().includes('50 objetos');

    console.log('Verificação de ausência de informações de plano comercial:');
    console.log(`   - "Plano Individual" presente? ${hasPlanoIndividual}`);
    console.log(`   - "Capacidade Ilimitada" presente? ${hasCapacidadeIlimitada}`);
    console.log(`   - "50 objetos" presente? ${has50Objetos}`);

    if (hasPlanoIndividual || hasCapacidadeIlimitada || has50Objetos) {
      throw new Error('Falha: Informações de plano individual ainda estão presentes no modal!');
    }
    console.log('✓ Informações de plano individual removidas com 100% de sucesso.');

    // 5. Verifica se as métricas executivas reais continuam visíveis
    const hasTopicos = modalContent.allText.includes('TÓPICOS / NÓS') || modalContent.allText.includes('Tópicos / Nós');
    const hasProfundidade = modalContent.allText.includes('PROFUNDIDADE') || modalContent.allText.includes('Profundidade');
    const hasPalavras = modalContent.allText.includes('PALAVRAS') || modalContent.allText.includes('Palavras');
    const hasTempoLeitura = modalContent.allText.includes('TEMPO LEITURA') || modalContent.allText.includes('Tempo Leitura');

    console.log(`Métricas executivas: Tópicos=${hasTopicos}, Profundidade=${hasProfundidade}, Palavras=${hasPalavras}, Leitura=${hasTempoLeitura}`);
    if (!hasTopicos || !hasProfundidade || !hasPalavras || !hasTempoLeitura) {
      throw new Error('Falha: Métricas executivas essenciais desapareceram do modal!');
    }
    console.log('✓ Todas as métricas executivas reais (nós, profundidade, palavras, tempo de leitura) estão intactas.');

    // 6. Tira screenshot comprobatório
    const screenshotPath = path.join(ARTIFACTS_DIR, 'board_stats_clean_validated.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`✓ Screenshot comprobatório salvo em: ${screenshotPath}`);

    // 7. Fecha modal
    const closeBtn = await page.$('#btn-close-stats');
    if (closeBtn) await closeBtn.click();
    await delay(300);

    console.log('\n===========================================================');
    console.log('   MODAL DE ESTATÍSTICAS 100% LIMPO E VALIDADO!            ');
    console.log('===========================================================');
  } catch (err: any) {
    console.error('❌ ERRO NO TESTE:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTest();
