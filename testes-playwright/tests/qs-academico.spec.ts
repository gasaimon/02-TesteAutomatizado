import { test, expect, Page } from '@playwright/test';

async function cadastrarAluno(
  page: Page,
  nome: string,
  nota1: string,
  nota2: string,
  nota3: string
) {
  await page.getByLabel('Nome do Aluno').fill(nome);
  await page.getByLabel('Nota 1').fill(nota1);
  await page.getByLabel('Nota 2').fill(nota2);
  await page.getByLabel('Nota 3').fill(nota3);
  await page.getByRole('button', { name: 'Cadastrar' }).click();
}

//erro no page goto antes
test.describe('QS Acadêmico', () => {
  test.beforeEach(async ({ page }) => {
  await page.goto('');
});

  test('deve exibir os elementos principais da página', async ({ page }) => {
    await expect(page.getByLabel('Nome do Aluno')).toBeVisible();
    await expect(page.getByLabel('Nota 1')).toBeVisible();
    await expect(page.getByLabel('Nota 2')).toBeVisible();
    await expect(page.getByLabel('Nota 3')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cadastrar' })).toBeVisible();
    await expect(page.getByLabel('Buscar por nome')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Limpar Tudo' })).toBeVisible();
  });

  test('deve cadastrar um aluno com dados válidos', async ({ page }) => {
    await cadastrarAluno(page, 'João Silva', '7', '8', '6');

    await expect(page.getByText('João Silva')).toBeVisible();
    await expect(page.locator('#mensagem')).toContainText('cadastrado com sucesso');
  });

  test('não deve cadastrar aluno sem nome', async ({ page }) => {
    await page.getByLabel('Nota 1').fill('7');
    await page.getByLabel('Nota 2').fill('8');
    await page.getByLabel('Nota 3').fill('6');
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.locator('#mensagem')).toContainText('preencha o nome');
    await expect(page.getByText('Nenhum aluno cadastrado.')).toBeVisible();
  });

  test('não deve cadastrar aluno com nota inválida', async ({ page }) => {
    await cadastrarAluno(page, 'Aluno Inválido', '11', '8', '7');

    await expect(page.locator('#mensagem')).toContainText('entre 0 e 10');
    await expect(page.getByText('Nenhum aluno cadastrado.')).toBeVisible();
  });

  test('deve calcular a média corretamente', async ({ page }) => {
    await cadastrarAluno(page, 'Pedro Santos', '8', '6', '10');

    const linha = page.locator('#tabela-alunos tbody tr').first();
    const celulaMedia = linha.locator('td').nth(4);

    await expect(celulaMedia).toHaveText('8.00');
  });

  test('deve classificar aluno como Aprovado', async ({ page }) => {
    await cadastrarAluno(page, 'Ana Souza', '8', '7', '9');

    const linha = page.locator('#tabela-alunos tbody tr').first();
    await expect(linha.locator('td').nth(5)).toContainText('Aprovado');
  });

  test('deve classificar aluno como Recuperação', async ({ page }) => {
    await cadastrarAluno(page, 'Bruno Lima', '5', '6', '7');

    const linha = page.locator('#tabela-alunos tbody tr').first();
    await expect(linha.locator('td').nth(5)).toContainText('Recuperação');
  });

  test('deve classificar aluno como Reprovado', async ({ page }) => {
    await cadastrarAluno(page, 'Carla Rocha', '2', '4', '3');

    const linha = page.locator('#tabela-alunos tbody tr').first();
    await expect(linha.locator('td').nth(5)).toContainText('Reprovado');
  });

  test('deve buscar aluno pelo nome', async ({ page }) => {
    await cadastrarAluno(page, 'Ana Silva', '8', '7', '9');
    await cadastrarAluno(page, 'Carlos Lima', '5', '4', '6');

    await page.getByLabel('Buscar por nome').fill('Ana');

    await expect(page.getByText('Ana Silva')).toBeVisible();
    await expect(page.getByText('Carlos Lima')).not.toBeVisible();
  });

  test('deve excluir um aluno', async ({ page }) => {
    await cadastrarAluno(page, 'João Silva', '7', '8', '6');

    await page.getByRole('button', { name: 'Excluir João Silva' }).click();

    await expect(page.getByText('Nenhum aluno cadastrado.')).toBeVisible();
    await expect(page.locator('#mensagem')).toContainText('removido com sucesso');
  });

  test('deve limpar todos os registros ao confirmar', async ({ page }) => {
    await cadastrarAluno(page, 'Aluno 1', '8', '7', '9');
    await cadastrarAluno(page, 'Aluno 2', '5', '6', '7');

    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'Limpar Tudo' }).click();

    await expect(page.getByText('Nenhum aluno cadastrado.')).toBeVisible();
    await expect(page.locator('#stat-total')).toHaveText('0');
  });

  test('deve atualizar corretamente as estatísticas', async ({ page }) => {
    await cadastrarAluno(page, 'Aluno Aprovado', '8', '9', '7');
    await cadastrarAluno(page, 'Aluno Recuperacao', '5', '6', '7');
    await cadastrarAluno(page, 'Aluno Reprovado', '2', '4', '3');

    await expect(page.locator('#stat-total')).toHaveText('3');
    await expect(page.locator('#stat-aprovados')).toHaveText('1');
    await expect(page.locator('#stat-recuperacao')).toHaveText('1');
    await expect(page.locator('#stat-reprovados')).toHaveText('1');
  });
});