export type ActivityCategory = 'PROJECT' | 'TASK' | 'STATUS' | 'ASSIGNMENT' | 'USER';

export function getActivityCategory(description: string): ActivityCategory {
  const text = description.toLocaleLowerCase('pt-BR');

  if (text.includes('usuário')) return 'USER';
  if (text.includes('responsável')) return 'ASSIGNMENT';
  if (text.includes('conclu') || text.includes('movida')) return 'STATUS';
  if (text.includes('projeto')) return 'PROJECT';
  return 'TASK';
}
