export function EmptyState({icon:Icon, title, message}) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'48px 24px',gap:'12px',textAlign:'center'}} role="status">
      {Icon && <Icon size={36} style={{color:'var(--text-muted)',opacity:.5}} aria-hidden="true"/>}
      <p style={{color:'var(--text-muted)',fontSize:'.875rem',fontWeight:500,color:'var(--text)'}}>{title}</p>
      {message && <p style={{fontSize:'.8rem',color:'var(--text-muted)',maxWidth:300}}>{message}</p>}
    </div>
  );
}
