import { test as base, expect } from '@playwright/test';

const STORAGE_KEY = 'tasks';

export const test = base.extend({
  tasks: async ({ context }, use) => {
    const seedTasks = async (tasks = []) => {
      await context.addInitScript((payload) => {
        try {
          localStorage.setItem(payload.key, JSON.stringify(payload.tasks));
        } catch (e) {
          // localStorage may be unavailable; the app tolerates that too.
        }
      }, { key: STORAGE_KEY, tasks });
    };

    const readTasks = async (page) => {
      return page.evaluate((key) => {
        try {
          const parsed = JSON.parse(localStorage.getItem(key));
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }, STORAGE_KEY);
    };

    await use({ seedTasks, readTasks });
  }
});

export { expect };
