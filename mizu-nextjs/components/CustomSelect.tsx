// Used inside the Pricing client boundary.
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import styles from "./CustomSelect.module.css";

type Props = {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onFocus?: () => void;
  disabled?: boolean;
  describedBy?: string;
};

export default function CustomSelect({ label, placeholder, value, options, onChange, onFocus, disabled = false, describedBy }: Props) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const search = useRef({ text: "", time: 0 });
  const items = useMemo(() => [{ value: "", label: placeholder }, ...options.map(option => ({ value: option, label: option }))], [options, placeholder]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const selected = Math.max(0, items.findIndex(item => item.value === value));
  const visible = open && !disabled;
  const positioned = position !== null;

  const show = (index = selected) => {
    setActive(index);
    setPosition(null);
    setOpen(true);
  };
  const choose = (index: number) => {
    onChange(items[index].value);
    setOpen(false);
  };

  useLayoutEffect(() => {
    if (!visible) return;
    let frame = 0;
    const place = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
        setOpen(false);
        return;
      }
      const gap = 8;
      const desired = Math.min(288, items.length * 44 + 14);
      const below = window.innerHeight - rect.bottom - gap * 2;
      const above = rect.top - gap * 2;
      const upward = below < desired && above > below;
      const maxHeight = Math.min(desired, Math.max(0, upward ? above : below));
      if (maxHeight < 44) { setOpen(false); return; }
      const width = Math.min(rect.width, window.innerWidth - gap * 2);
      setPosition({
        top: upward ? rect.top - gap - maxHeight : rect.bottom + gap,
        left: Math.max(gap, Math.min(rect.left, window.innerWidth - width - gap)),
        width,
        maxHeight,
      });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(place); };
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !list.current?.contains(target)) setOpen(false);
    };
    place();
    const observer = new ResizeObserver(schedule);
    if (trigger.current) observer.observe(trigger.current);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    document.addEventListener("pointerdown", outside);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      document.removeEventListener("pointerdown", outside);
    };
  }, [visible, items.length]);

  useEffect(() => {
    if (!visible || !positioned) return;
    const panel = list.current;
    const option = panel?.children[active] as HTMLElement | undefined;
    if (!panel || !option) return;
    // Scroll only the popup, never the underlying pricing page.
    if (option.offsetTop < panel.scrollTop) panel.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > panel.scrollTop + panel.clientHeight) {
      panel.scrollTop = option.offsetTop + option.offsetHeight - panel.clientHeight;
    }
  }, [active, visible, positioned]);

  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = items.length - 1;
    if (event.key === "Escape") { if (open) event.preventDefault(); setOpen(false); return; }
    if (event.key === "Tab") { if (open) choose(active); return; }
    if (["Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (open) choose(active); else show();
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End", "PageDown", "PageUp"].includes(event.key)) {
      event.preventDefault();
      if (!open) { show(event.key === "End" ? last : event.key === "Home" ? 0 : selected); return; }
      if (event.key === "ArrowUp" && event.altKey) { choose(active); return; }
      setActive(previous => event.key === "Home" ? 0 : event.key === "End" ? last :
        Math.max(0, Math.min(last, previous + (event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : event.key === "PageDown" ? 10 : -10))));
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      const text = now - search.current.time < 650 ? search.current.text + event.key.toLowerCase() : event.key.toLowerCase();
      search.current = { text, time: now };
      const query = [...text].every(letter => letter === text[0]) ? text[0] : text;
      const start = open ? active : selected;
      const match = Array.from({ length: items.length }, (_, i) => (start + i + (query.length === 1 ? 1 : 0)) % items.length)
        .find(index => items[index].label.toLowerCase().startsWith(query));
      if (!open) show(match ?? selected);
      else if (match !== undefined) setActive(match);
    }
  };

  return <>
    <button ref={trigger} type="button" role="combobox" aria-label={label}
      aria-expanded={visible} aria-haspopup="listbox" aria-controls={visible ? `${id}-list` : undefined}
      aria-activedescendant={visible && position ? `${id}-${active}` : undefined}
      aria-describedby={describedBy} aria-required="true" disabled={disabled}
      className={styles.trigger} data-filled={Boolean(value)} onFocus={onFocus}
      onBlur={() => setOpen(false)} onKeyDown={onKeyDown}
      onClick={() => { if (open) setOpen(false); else show(); }}>
      <span>{value || placeholder}</span>
      <svg viewBox="0 0 12 8" width="12" height="8" fill="none" aria-hidden="true"><path d="m1 1.5 5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
    {visible && position && createPortal(
      <div ref={list} id={`${id}-list`} role="listbox" aria-label={label} className={styles.list}
        style={position} data-lenis-prevent onPointerDown={event => event.preventDefault()}>
        {items.map((item, index) => <div key={item.value} id={`${id}-${index}`} role="option"
          aria-selected={item.value === value} data-active={active === index} data-placeholder={!item.value}
          className={styles.option} onClick={() => choose(index)}
          onPointerMove={event => { if (event.pointerType === "mouse") setActive(index); }}>
          <span>{item.label}</span>
          {item.value === value && <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 8 3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </div>)}
      </div>, document.body)}
  </>;
}
