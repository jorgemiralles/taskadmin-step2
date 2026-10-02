import { test, expect } from './fixtures.js';

test.describe('Task Management CRUD', () => {
  test('Create a new task', async ({ page, tasks }) => {
    await tasks.seedTasks([]);
    await page.goto('/');

    await page.getByRole('button', { name: 'Add Task' }).click();
    await expect(page.locator('#form-view')).toBeVisible();
    await expect(page.locator('#form-title')).toHaveText('New Task');

    await page.getByLabel('Title').fill('Write project report');
    await page.getByLabel('Description').fill('Document the findings of the Q3 review');
    await page.getByLabel('Priority').selectOption('High');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.locator('#toast')).toBeVisible();
    await expect(page.locator('#toast')).toHaveText('Task created successfully');
    await expect(page.locator('#list-view')).toBeVisible();

    const row = page.locator('#task-list tr').filter({ hasText: 'Write project report' });
    await expect(row).toHaveCount(1);
    await expect(row.locator('td').nth(1)).toHaveText('High');
    await expect(row.locator('td').nth(2)).toHaveText('Open');

    const persisted = await tasks.readTasks(page);
    expect(persisted.length).toBe(1);
    expect(persisted[0].title).toBe('Write project report');
    expect(persisted[0].priority).toBe('High');
    expect(persisted[0].status).toBe('Open');
  });

  test('View a task', async ({ page, tasks }) => {
    const now = Date.now();
    await tasks.seedTasks([
      {
        id: 'task-1',
        title: 'Write project report',
        description: 'Document the findings of the Q3 review',
        priority: 'High',
        status: 'Open',
        createdAt: now,
        updatedAt: now
      }
    ]);

    await page.goto('/');
    await expect(page.locator('#task-list tr')).toHaveCount(1);

    await page.locator('#task-list tr').filter({ hasText: 'Write project report' }).click();

    await expect(page.locator('#details-view')).toBeVisible();
    await expect(page.locator('#detail-title')).toHaveText('Write project report');
    await expect(page.locator('#detail-description')).toHaveText('Document the findings of the Q3 review');
    await expect(page.locator('#detail-priority')).toHaveText('High');
    await expect(page.locator('#detail-status')).toHaveText('Open');
  });

  test('Update a task', async ({ page, tasks }) => {
    const now = Date.now();
    await tasks.seedTasks([
      {
        id: 'task-1',
        title: 'Write project report',
        description: 'Document the findings of the Q3 review',
        priority: 'High',
        status: 'Open',
        createdAt: now,
        updatedAt: now
      }
    ]);

    await page.goto('/');
    await page.locator('#task-list tr').filter({ hasText: 'Write project report' }).click();
    await expect(page.locator('#details-view')).toBeVisible();

    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.locator('#form-view')).toBeVisible();
    await expect(page.locator('#form-title')).toHaveText('Edit Task');
    await expect(page.locator('#status-field')).toBeVisible();

    await page.getByLabel('Status').selectOption('Completed');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.locator('#toast')).toBeVisible();
    await expect(page.locator('#toast')).toHaveText('Task updated successfully');
    await expect(page.locator('#details-view')).toBeVisible();
    await expect(page.locator('#detail-status')).toHaveText('Completed');

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.locator('#list-view')).toBeVisible();
    const row = page.locator('#task-list tr').filter({ hasText: 'Write project report' });
    await expect(row.locator('td').nth(2)).toHaveText('Completed');

    const persisted = await tasks.readTasks(page);
    expect(persisted[0].status).toBe('Completed');
  });

  test('Delete a task', async ({ page, tasks }) => {
    const now = Date.now();
    await tasks.seedTasks([
      {
        id: 'task-1',
        title: 'Write project report',
        description: 'Document the findings of the Q3 review',
        priority: 'High',
        status: 'Open',
        createdAt: now,
        updatedAt: now
      }
    ]);

    await page.goto('/');
    await page.locator('#task-list tr').filter({ hasText: 'Write project report' }).click();
    await expect(page.locator('#details-view')).toBeVisible();

    await page.locator('#details-view').getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('#confirm-modal')).toBeVisible();
    await expect(page.locator('#modal-task-title')).toHaveText('Write project report');

    await page.locator('#confirm-modal').getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('#toast')).toBeVisible();
    await expect(page.locator('#toast')).toHaveText('Task deleted successfully');
    await expect(page.locator('#list-view')).toBeVisible();
    await expect(page.locator('#task-list tr')).toHaveCount(0);
    await expect(page.locator('#empty-state')).toBeVisible();

    const persisted = await tasks.readTasks(page);
    expect(persisted.length).toBe(0);
  });
});
