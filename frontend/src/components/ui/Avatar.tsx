interface AvatarProps {
  name: string;
  initials?: string | null;
  size?: 'sm' | 'md';
}

export function Avatar({ name, initials, size = 'md' }: AvatarProps) {
  const fallback = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 ring-2 ring-white ${
        size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs'
      }`}
    >
      {initials || fallback}
    </span>
  );
}
