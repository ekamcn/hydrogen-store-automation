import * as React from "react";
import { createPortal } from "react-dom";

// Utility for portal
const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (typeof window === "undefined") return null;
  return createPortal(children, document.body);
};

export const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [position, setPosition] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  // Provide context for children
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef, position, handleOpen, handleClose }}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

const DropdownMenuContext = React.createContext<any>(null);

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, ...props }, ref) => {
    const ctx = React.useContext(DropdownMenuContext);
    return (
      <button
        ref={(node) => {
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          if (ctx) ctx.triggerRef.current = node;
        }}
        onClick={() => (ctx.open ? ctx.handleClose() : ctx.handleOpen())}
        style={{
          background: "none",
          border: "none",
          borderRadius: 6,
          padding: 4,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
        tabIndex={0}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export const DropdownMenuContent: React.FC<{ children: React.ReactNode; align?: string }> = ({ children }) => {
  const ctx = React.useContext(DropdownMenuContext);
  if (!ctx.open) return null;
  return (
    <Portal>
      <div
        style={{
          position: "absolute",
          top: ctx.position.top,
          left: ctx.position.left,
          minWidth: 180,
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          padding: 8,
          zIndex: 1000,
          animation: "fadeIn 0.15s",
        }}
        onMouseLeave={ctx.handleClose}
      >
        {children}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </Portal>
  );
};

export const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontWeight: 'bold', padding: '4px 8px', color: '#333', fontSize: 13 }}>{children}</div>
);

export const DropdownMenuItem = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
  <div
    onClick={onClick}
    style={{
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: 6,
      transition: 'background 0.15s',
      fontSize: 14,
      color: '#222',
      margin: '2px 0',
    }}
    onMouseDown={e => e.preventDefault()}
    onMouseOver={e => (e.currentTarget.style.background = '#f3f4f6')}
    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
  >
    {children}
  </div>
);

export const DropdownMenuSeparator = () => <hr style={{ margin: '6px 0', border: 0, borderTop: '1px solid #eee' }} />;

export const DropdownMenuCheckboxItem = ({ children, checked, onCheckedChange }: { children: React.ReactNode, checked?: boolean, onCheckedChange?: (checked: boolean) => void }) => (
  <div
    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '8px 12px', borderRadius: 6, fontSize: 14 }}
    onClick={() => onCheckedChange && onCheckedChange(!checked)}
    onMouseOver={e => (e.currentTarget.style.background = '#f3f4f6')}
    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
  >
    <input type="checkbox" checked={checked} readOnly style={{ marginRight: 8, accentColor: '#6366f1', width: 16, height: 16, borderRadius: 4 }} />
    {children}
  </div>
); 