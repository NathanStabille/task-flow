import {
  Archive,
  CheckCircle2,
  CircleAlert,
  FolderKanban,
  FolderOpen,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { DeleteProjectDialog } from '../components/projects/DeleteProjectDialog';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectDetailsModal } from '../components/projects/ProjectDetailsModal';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import { useProjects } from '../hooks/use-projects';
import { projectService } from '../services/projects';
import type { Project, ProjectInput, ProjectStatus } from '../types';

type ProjectFilter = 'ALL' | ProjectStatus;
type FormState = { mode: 'create' } | { mode: 'edit'; project: Project };

function ProjectsSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-64 rounded-2xl border border-slate-200 bg-white" />
      ))}
    </div>
  );
}

export function ProjectsPage() {
  const { projects, isLoading, error, reload } = useProjects();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ProjectFilter>('ALL');
  const [formState, setFormState] = useState<FormState | null>(null);
  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');

    return projects.filter((project) => {
      const matchesStatus = filter === 'ALL' || project.status === filter;
      const matchesSearch =
        !normalizedSearch ||
        project.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        project.description.toLocaleLowerCase('pt-BR').includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [filter, projects, search]);

  const counts = {
    active: projects.filter((project) => project.status === 'ACTIVE').length,
    completed: projects.filter((project) => project.status === 'COMPLETED').length,
    archived: projects.filter((project) => project.status === 'ARCHIVED').length,
  };

  async function handleSave(data: ProjectInput) {
    if (formState?.mode === 'edit') {
      await projectService.update(formState.project.id, data);
      setNotice(`Projeto ${data.name} atualizado com sucesso.`);
    } else {
      await projectService.create(data);
      setNotice(`Projeto ${data.name} criado com sucesso.`);
    }

    setFormState(null);
    reload();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const projectName = deleteTarget.name;
    await projectService.delete(deleteTarget.id);
    setDeleteTarget(null);
    setNotice(`Projeto ${projectName} excluído com sucesso.`);
    reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-indigo-600">Workspace</p>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-[28px]">
            Projetos
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Organize iniciativas e acompanhe suas tarefas em um só lugar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormState({ mode: 'create' })}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-700"
        >
          <Plus size={16} />
          Novo projeto
        </button>
      </div>

      {notice && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700"
        >
          <CheckCircle2 size={16} />
          <span className="flex-1">{notice}</span>
          <button
            type="button"
            aria-label="Fechar mensagem"
            onClick={() => setNotice(null)}
            className="rounded-md p-1 hover:bg-emerald-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setFilter(filter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
          className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-card transition-colors ${filter === 'ACTIVE' ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-200/80 hover:border-slate-300'}`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <FolderOpen size={17} />
          </span>
          <span>
            <span className="block text-lg font-black text-slate-900">{counts.active}</span>
            <span className="block text-[11px] font-medium text-slate-500">Projetos ativos</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setFilter(filter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
          className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-card transition-colors ${filter === 'COMPLETED' ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-slate-200/80 hover:border-slate-300'}`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={17} />
          </span>
          <span>
            <span className="block text-lg font-black text-slate-900">{counts.completed}</span>
            <span className="block text-[11px] font-medium text-slate-500">Concluídos</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setFilter(filter === 'ARCHIVED' ? 'ALL' : 'ARCHIVED')}
          className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-card transition-colors ${filter === 'ARCHIVED' ? 'border-slate-400 ring-2 ring-slate-500/10' : 'border-slate-200/80 hover:border-slate-300'}`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Archive size={17} />
          </span>
          <span>
            <span className="block text-lg font-black text-slate-900">{counts.archived}</span>
            <span className="block text-[11px] font-medium text-slate-500">Arquivados</span>
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-card sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Buscar projetos</span>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou descrição..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
        </label>
        <select
          aria-label="Filtrar por status"
          value={filter}
          onChange={(event) => setFilter(event.target.value as ProjectFilter)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
        >
          <option value="ALL">Todos os status</option>
          <option value="ACTIVE">Ativos</option>
          <option value="COMPLETED">Concluídos</option>
          <option value="ARCHIVED">Arquivados</option>
        </select>
      </div>

      {isLoading && <ProjectsSkeleton />}

      {error && !isLoading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
          <CircleAlert className="mx-auto text-rose-500" size={24} />
          <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!isLoading && !error && filteredProjects.length > 0 && (
        <>
          <p className="text-xs font-medium text-slate-400">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'projeto encontrado' : 'projetos encontrados'}
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onView={() => setDetailsId(project.id)}
                onEdit={() => setFormState({ mode: 'edit', project })}
                onDelete={() => setDeleteTarget(project)}
              />
            ))}
          </div>
        </>
      )}

      {!isLoading && !error && filteredProjects.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
          <FolderKanban className="mx-auto text-slate-300" size={30} />
          <h3 className="mt-4 text-sm font-bold text-slate-800">Nenhum projeto encontrado</h3>
          <p className="mt-1.5 text-xs text-slate-500">
            {projects.length === 0
              ? 'Crie o primeiro projeto para começar.'
              : 'Tente alterar a busca ou o filtro selecionado.'}
          </p>
          {projects.length === 0 && (
            <button
              type="button"
              onClick={() => setFormState({ mode: 'create' })}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white"
            >
              <Plus size={15} /> Criar projeto
            </button>
          )}
        </div>
      )}

      {formState && (
        <ProjectFormModal
          project={formState.mode === 'edit' ? formState.project : undefined}
          onClose={() => setFormState(null)}
          onSubmit={handleSave}
        />
      )}

      {detailsId !== null && (
        <ProjectDetailsModal
          projectId={detailsId}
          onClose={() => setDetailsId(null)}
          onEdit={(project) => {
            setDetailsId(null);
            setFormState({ mode: 'edit', project });
          }}
        />
      )}

      {deleteTarget && (
        <DeleteProjectDialog
          project={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
