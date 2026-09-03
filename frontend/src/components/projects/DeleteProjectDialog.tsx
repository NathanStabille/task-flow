import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '../../types';
import { Modal } from '../ui/Modal';

interface DeleteProjectDialogProps {
  project: Project;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteProjectDialog({ project, onClose, onConfirm }: DeleteProjectDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir o projeto.',
      );
      setIsDeleting(false);
    }
  }

  return (
    <Modal title="Excluir projeto" onClose={onClose} size="sm">
      <div className="px-5 py-5 sm:px-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <AlertTriangle size={20} />
        </span>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Tem certeza de que deseja excluir <strong className="text-slate-900">{project.name}</strong>?
        </p>
        {project._count.tasks > 0 && (
          <p className="mt-2 rounded-xl bg-amber-50 px-3.5 py-3 text-xs leading-5 text-amber-800">
            {project._count.tasks} {project._count.tasks === 1 ? 'tarefa vinculada será excluída' : 'tarefas vinculadas serão excluídas'} junto com o projeto.
          </p>
        )}
        {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
      </div>
      <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isDeleting}
          className="inline-flex min-w-24 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
        >
          {isDeleting && <LoaderCircle className="animate-spin" size={14} />}
          Excluir
        </button>
      </div>
    </Modal>
  );
}

