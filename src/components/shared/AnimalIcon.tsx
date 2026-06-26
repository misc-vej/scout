interface AnimalIconProps {
  type: string;
  color: string;
}

export function AnimalIcon({ type, color }: AnimalIconProps): React.ReactElement {
  const c = color || "#72cc4a88";
  if (type === "fox") return (
    <svg viewBox="0 0 48 48" fill="none" style={{width:"54%",height:"54%"}}>
      <path d="M12 36 L14 28 C14 22 18 18 24 18 C30 18 34 22 34 28 L36 36" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M18 18 L14 10 L20 16" stroke={c} strokeWidth="1.3" fill="none"/>
      <path d="M30 18 L34 10 L28 16" stroke={c} strokeWidth="1.3" fill="none"/>
      <path d="M20 18 C22 14 26 14 28 18" stroke={c} strokeWidth="1.2" fill="none"/>
      <circle cx="21" cy="20" r="1" fill={c}/>
      <circle cx="27" cy="20" r="1" fill={c}/>
      <path d="M36 36 C40 34 44 36 42 40 C40 38 36 38 36 36Z" stroke={c} strokeWidth="1.1" fill="none"/>
    </svg>
  );
  if (type === "owl") return (
    <svg viewBox="0 0 48 48" fill="none" style={{width:"54%",height:"54%"}}>
      <path d="M16 38 C16 30 12 24 14 18 C16 12 22 10 24 10 C26 10 32 12 34 18 C36 24 32 30 32 38Z" stroke={c} strokeWidth="1.5" fill="none"/>
      <circle cx="20" cy="22" r="3.5" stroke={c} strokeWidth="1.3" fill="none"/>
      <circle cx="28" cy="22" r="3.5" stroke={c} strokeWidth="1.3" fill="none"/>
      <circle cx="20" cy="22" r="1" fill={c}/><circle cx="28" cy="22" r="1" fill={c}/>
      <path d="M22 28 L24 30 L26 28" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M20 10 L22 14" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M28 10 L26 14" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
  if (type === "raptor") return (
    <svg viewBox="0 0 48 48" fill="none" style={{width:"54%",height:"54%"}}>
      <path d="M6 28 C10 20 18 18 24 20 C30 22 38 20 42 28" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M18 20 C20 14 26 12 28 18" stroke={c} strokeWidth="1.3" fill="none"/>
      <path d="M22 20 L20 30 L24 28 L28 30 L26 20" stroke={c} strokeWidth="1.2" fill="none"/>
      <circle cx="25" cy="15" r="1.5" fill={c}/>
    </svg>
  );
  if (type === "squirrel") return (
    <svg viewBox="0 0 48 48" fill="none" style={{width:"54%",height:"54%"}}>
      <path d="M20 36 L18 28 C16 22 18 16 22 14 C26 12 30 14 30 20 C30 26 26 30 26 36" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M20 14 C20 10 16 8 16 12" stroke={c} strokeWidth="1.2" fill="none"/>
      <path d="M26 14 C26 10 22 8 22 12" stroke={c} strokeWidth="1.2" fill="none"/>
      <path d="M30 20 C34 18 38 20 38 26 C38 32 34 36 30 34 C28 30 28 24 30 20Z" stroke={c} strokeWidth="1.2" fill="none"/>
      <circle cx="22" cy="16" r="1" fill={c}/>
    </svg>
  );
  if (type === "duck") return (
    <svg viewBox="0 0 48 48" fill="none" style={{width:"54%",height:"54%"}}>
      <ellipse cx="24" cy="28" rx="12" ry="8" stroke={c} strokeWidth="1.5" fill="none"/>
      <circle cx="32" cy="18" r="6" stroke={c} strokeWidth="1.5" fill="none"/>
      <path d="M36 18 L42 17 L38 21Z" stroke={c} strokeWidth="1.2" fill="none"/>
      <circle cx="34" cy="16" r="1" fill={c}/>
    </svg>
  );
  if (type === "heron") return (
    <svg viewBox="0 0 48 48" fill="none" style={{width:"54%",height:"54%"}}>
      <path d="M24 10 L22 20 L18 26 L18 38" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M18 38 L14 42" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M18 38 L22 42" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M22 20 C26 16 34 18 34 24 C34 28 30 28 26 26" stroke={c} strokeWidth="1.3" fill="none"/>
      <circle cx="25" cy="10" r="1" fill={c}/>
    </svg>
  );
  if (type === "rabbit") return (
    <svg viewBox="0 0 48 48" fill="none" style={{width:"54%",height:"54%"}}>
      <ellipse cx="24" cy="30" rx="9" ry="8" stroke={c} strokeWidth="1.5" fill="none"/>
      <path d="M18 24 C16 16 14 10 16 8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M22 22 C20 14 20 8 22 6" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="20" cy="28" r="1" fill={c}/><circle cx="26" cy="27" r="1" fill={c}/>
      <path d="M16 36 L14 40" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M30 36 L32 40" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
  if (type === "hedgehog") return (
    <svg viewBox="0 0 48 48" fill="none" style={{width:"54%",height:"54%"}}>
      <ellipse cx="22" cy="32" rx="13" ry="8" stroke={c} strokeWidth="1.5" fill="none"/>
      <path d="M12 28 C12 20 16 14 22 14 C28 14 32 20 32 28" stroke={c} strokeWidth="1.3" fill="none"/>
      <path d="M16 20 L14 14" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M20 16 L19 10" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M24 16 L24 10" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M28 18 L30 13" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
      <circle cx="32" cy="28" r="1.5" fill={c}/>
    </svg>
  );
  if (type === "otter") return (
    <svg viewBox="0 0 48 48" fill="none" style={{width:"54%",height:"54%"}}>
      <path d="M8 28 C8 20 14 14 22 14 C30 14 38 18 40 26 C38 32 32 36 24 36 C16 36 10 34 8 28Z" stroke={c} strokeWidth="1.5" fill="none"/>
      <circle cx="18" cy="22" r="1.2" fill={c}/><circle cx="26" cy="21" r="1.2" fill={c}/>
      <path d="M20 26 C22 28 24 28 26 26" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M40 26 L44 30" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
  if (type === "badger") return (
    <svg viewBox="0 0 48 48" fill="none" style={{width:"54%",height:"54%"}}>
      <ellipse cx="22" cy="28" rx="14" ry="10" stroke={c} strokeWidth="1.5" fill="none"/>
      <path d="M14 20 C14 14 18 10 22 10 C26 10 30 14 30 20" stroke={c} strokeWidth="1.3" fill="none"/>
      <path d="M16 16 C16 12 18 10 18 10" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M26 16 C26 12 26 10 26 10" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M20 18 L20 22" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="18" cy="22" r="1" fill={c}/><circle cx="26" cy="22" r="1" fill={c}/>
    </svg>
  );
  if (type === "cat") return (
    <svg viewBox="0 0 48 48" fill="none" style={{width:"54%",height:"54%"}}>
      <path d="M14 38 L16 28 C16 22 20 18 24 18 C28 18 32 22 32 28 L34 38" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M18 18 L14 10 L20 16" stroke={c} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M30 18 L34 10 L28 16" stroke={c} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <circle cx="21" cy="22" r="1.2" fill={c}/><circle cx="27" cy="22" r="1.2" fill={c}/>
      <path d="M20 26 C22 28 26 28 28 26" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
  if (type === "marten") return (
    <svg viewBox="0 0 48 48" fill="none" style={{width:"54%",height:"54%"}}>
      <ellipse cx="24" cy="24" rx="4" ry="5" stroke={c} strokeWidth="1.5" fill="none"/>
      <ellipse cx="24" cy="28" rx="9" ry="7" stroke={c} strokeWidth="1.5" fill="none"/>
      <ellipse cx="14" cy="26" rx="3.5" ry="5" stroke={c} strokeWidth="1.3" fill="none"/>
      <ellipse cx="34" cy="26" rx="3.5" ry="5" stroke={c} strokeWidth="1.3" fill="none"/>
      <ellipse cx="20" cy="22" rx="3" ry="4" stroke={c} strokeWidth="1.3" fill="none"/>
      <ellipse cx="28" cy="22" rx="3" ry="4" stroke={c} strokeWidth="1.3" fill="none"/>
    </svg>
  );
  // default: generic bird
  return (
    <svg viewBox="0 0 48 48" fill="none" style={{width:"54%",height:"54%"}}>
      <path d="M24 32 C18 32 10 28 8 20 C12 22 16 20 18 16 C20 12 24 10 28 12 C34 14 38 20 36 26 C34 30 30 32 24 32Z" stroke={c} strokeWidth="1.5" fill="none"/>
      <path d="M24 32 L22 40" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M24 32 L26 40" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M8 20 C6 18 4 16 6 14" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="30" cy="16" r="1.5" fill={c}/>
    </svg>
  );
}
