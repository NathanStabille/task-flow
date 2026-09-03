import { LoaderCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { Project, ProjectInput, ProjectStatus } from '../../types';
import { Modal } from '../ui/Modal';

interface ProjectFormModalProps {
  project?: Project;
  onClose: () => void;
  onSubmit: (data: ProjectInput) => Promise<void>;
}

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50';

export function ProjectFormModal({ project, onClose, onSubmit }: ProjectFormModalProps) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'ACTIVE');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError('Informe um nome para o projeto.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSubmit({ name: name.trim(), description: description.trim(), status });
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Não foi possível salvar o projeto.',
      );
      setIsSaving(false);
    }
  }

  return (
    <Modal
      title={project ? 'Editar projeto' : 'Novo projeto'}
      description={
        project
          ? 'Atualize as informações e o status do projeto.'
          : 'Preencha as informações principais para começar.'
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-5 px-5 py-5 sm:px-6">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700"
            >
              {error}
            </div>
          )}

          <label className="block text-xs font-semibold text-slate-700">
            Nome do projeto <span className="text-rose-500">*</span>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Portal Institucional"
              maxLength={100}
              disabled={isSaving}
              className={fieldClass}
            />
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Descrição
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descreva brevemente o objetivo do projeto."
              rows={4}
              maxLength={500}
              disabled={isSaving}
              className={`${fieldClass} resize-none`}
            />
            <span className="mt-1.5 block text-right text-[10px] font-normal text-slate-400">
              {description.length}/500
            </span>
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ProjectStatus)}
              disabled={isSaving}
              className={fieldClass}
            >
              <option value="ACTIVE">Ativo</option>
              <option value="COMPLETED">Concluído</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-w-28 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving && <LoaderCircle className="animate-spin" size={14} />}
            {project ? 'Salvar alterações' : 'Criar projeto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
