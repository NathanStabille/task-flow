import {
  CheckCircle2,
  CircleDot,
  Clock3,
  FolderKanban,
  Pencil,
  Trash2,
  UserRoundCheck,
} from 'lucide-react';

interface ActivityIconProps {
  description: string;
}

export function ActivityIcon({ description }: ActivityIconProps) {
  const text = description.toLocaleLowerCase('pt-BR');

  let Icon = CircleDot;
  let style = 'bg-indigo-50 text-indigo-600';

  if (text.includes('excluiu')) {
    Icon = Trash2;
    style = 'bg-rose-50 text-rose-600';
  } else if (text.includes('conclu')) {
    Icon = CheckCircle2;
    style = 'bg-emerald-50 text-emerald-600';
  } else if (text.includes('responsável')) {
    Icon = UserRoundCheck;
    style = 'bg-blue-50 text-blue-600';
  } else if (text.includes('movida')) {
    Icon = Clock3;
    style = 'bg-amber-50 text-amber-600';
  } else if (text.includes('projeto')) {
    Icon = FolderKanban;
    style = 'bg-violet-50 text-violet-600';
  } else if (text.includes('atualizou')) {
    Icon = Pencil;
    style = 'bg-sky-50 text-sky-600';
  }

  return (
    <span
      className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style}`}
    >
      <Icon size={15} aria-hidden="true" />
    </span>
  );
}
