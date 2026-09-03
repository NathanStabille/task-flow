import { LoaderCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { Project, Task, TaskInput, TaskPriority, TaskStatus, User } from '../../types';
import { Modal } from '../ui/Modal';

interface TaskFormModalProps {
  task?: Task;
  projects: Project[];
  users: User[];
  onClose: () => void;
  onSubmit: (data: TaskInput) => Promise<void>;
}

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50';

export function TaskFormModal({ task, projects, users, onClose, onSubmit }: TaskFormModalProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [projectId, setProjectId] = useState(String(task?.projectId ?? projects[0]?.id ?? ''));
  const [assigneeId, setAssigneeId] = useState(String(task?.assigneeId ?? ''));
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'TODO');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'MEDIUM');
  const [dueDate, setDueDate] = useState(task?.dueDate?.slice(0, 10) ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError('Informe um título para a tarefa.');
      return;
    }

    if (!projectId) {
      setError('Selecione um projeto.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        projectId: Number(projectId),
        assigneeId: assigneeId ? Number(assigneeId) : null,
        status,
        priority,
        dueDate: dueDate || null,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Não foi possível salvar a tarefa.',
      );
      setIsSaving(false);
    }
  }

  return (
    <Modal
      title={task ? 'Editar tarefa' : 'Nova tarefa'}
      description={
        task
          ? 'Atualize o planejamento e os responsáveis pela entrega.'
          : 'Adicione uma nova entrega ao fluxo de trabalho.'
      }
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="max-h-[calc(92vh-150px)] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700"
            >
              {error}
            </div>
          )}

          {projects.length === 0 && (
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
              Crie um projeto antes de adicionar uma tarefa.
            </div>
          )}

          <label className="block text-xs font-semibold text-slate-700">
            Título <span className="text-rose-500">*</span>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Atualizar documentação"
              maxLength={120}
              disabled={isSaving}
              className={fieldClass}
            />
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Descrição
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Inclua detalhes importantes para a execução."
              rows={3}
              maxLength={600}
              disabled={isSaving}
              className={`${fieldClass} resize-none`}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-700">
              Projeto <span className="text-rose-500">*</span>
              <select
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                disabled={isSaving || projects.length === 0}
                className={fieldClass}
              >
                {projects.length === 0 && <option value="">Nenhum projeto disponível</option>}
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-semibold text-slate-700">
              Responsável
              <select
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
                disabled={isSaving}
                className={fieldClass}
              >
                <option value="">Sem responsável</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-semibold text-slate-700">
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as TaskStatus)}
                disabled={isSaving}
                className={fieldClass}
              >
                <option value="TODO">A fazer</option>
                <option value="IN_PROGRESS">Em andamento</option>
                <option value="DONE">Concluída</option>
              </select>
            </label>

            <label className="block text-xs font-semibold text-slate-700">
              Prioridade
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority)}
                disabled={isSaving}
                className={fieldClass}
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
              </select>
            </label>
          </div>

          <label className="block text-xs font-semibold text-slate-700 sm:max-w-[calc(50%-0.5rem)]">
            Prazo
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              disabled={isSaving}
              className={fieldClass}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || projects.length === 0}
            className="inline-flex min-w-28 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving && <LoaderCircle className="animate-spin" size={14} />}
            {task ? 'Salvar alterações' : 'Criar tarefa'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
