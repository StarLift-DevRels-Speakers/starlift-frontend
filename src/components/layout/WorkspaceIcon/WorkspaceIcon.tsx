const shapes = {
  'star': (
    <>
      <path d="m12 1 3.2 7.8L23 12l-7.8 3.2L12 23l-3.2-7.8L1 12l7.8-3.2Z" />
    </>
  ),
  'home-icon': (
    <>
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M9 21v-7h6v7" />
    </>
  ),
  'calendar': (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4m8-4v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01M16 17.5h.01" strokeWidth="2" />
    </>
  ),
  'talk': (
    <>
      <rect x="3" y="3" width="18" height="13" rx="2" />
      <path d="M12 16v5m-4 0h8M7 8h10M7 11h6" />
    </>
  ),
  'tag': (
    <>
      <path d="M3 4h8l10 10-7 7L3 10Z" />
      <circle cx="7.5" cy="8" r="1" />
    </>
  ),
  'event': (
    <>
      <path d="m4 9 16-5v14L4 14Zm3 6 2 6h4l-3-5M3 9v5" />
    </>
  ),
  'file': (
    <>
      <path d="M14 3H5v18h14V8Zm0 0v5h5M8 12h8m-8 4h6" />
    </>
  ),
  'mail': (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  'chat': (
    <>
      <path d="M20 16a9 9 0 1 0-14 2l-2 4 6-2a9 9 0 0 0 10-4Z" />
    </>
  ),
  'cup': (
    <>
      <path d="M7 3h10v7a5 5 0 0 1-10 0Zm0 2H3v3a4 4 0 0 0 5 4m9-7h4v3a4 4 0 0 1-5 4m-4 3v6m-4 0h8" />
    </>
  ),
  'user': (
    <>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-3a8 8 0 0 1 16 0v3Z" />
    </>
  ),
  'image': (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8" cy="9" r="2" />
      <path d="m3 17 6-5 4 4 4-5 4 6" />
    </>
  ),
  'card': (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </>
  ),
  'bell': (
    <>
      <path d="M5 16V9a7 7 0 0 1 14 0v7l2 3H3Zm5 6h4M12 2V1" />
    </>
  ),
  'menu': (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </>
  ),
};

export type WorkspaceIconName = keyof typeof shapes;

export function WorkspaceIcon({ name }: { name: WorkspaceIconName }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {shapes[name]}
    </svg>
  );
}
