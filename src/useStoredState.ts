import { useEffect, useRef, useState } from "react";

export function useStoredState<T>(
  key: string,
  initial: T,
  validate: (value: unknown) => value is T,
) {
  const initialValue = useRef(initial);
  const [value, setValue] = useState<T>(initial);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  useEffect(() => {
    let stored = initialValue.current;
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (validate(parsed)) stored = parsed;
      }
    } catch {
      /* Storage may be unavailable in private browsing. */
    }
    setValue(stored);
    setLoadedKey(key);
  }, [key, validate]);

  useEffect(() => {
    if (loadedKey !== key) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* The current session still works without persistent storage. */
    }
  }, [key, loadedKey, value]);

  return [value, setValue] as const;
}
