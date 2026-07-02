import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, createTask, updateTask, deleteTask } from '../api/taskApi';

const mockTask = {
    id: 1,
    title: 'Test',
    description: null,
    completed: false,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('taskApi', () => {
    it('getTasks returns array', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve([mockTask]),
            })
        );

        const tasks = await getTasks();
        expect(tasks).toEqual([mockTask]);
        expect(fetch).toHaveBeenCalledWith('/api/tasks');
    });

    it('createTask returns new task', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockTask),
            })
        );

        const newTask = await createTask({ title: 'Test', description: '' });
        expect(newTask).toEqual(mockTask);
        expect(fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({ method: 'POST' }));
    });

    it('updateTask returns updated task', async () => {
        const updatedTask = { ...mockTask, completed: true };
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(updatedTask),
            })
        );

        const result = await updateTask(1, { completed: true });
        expect(result).toEqual(updatedTask);
        expect(fetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({ method: 'PUT' }));
    });

    it('deleteTask returns success', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            })
        );

        await deleteTask(1);
        expect(fetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({ method: 'DELETE' }));
    });
});