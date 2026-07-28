import { useEffect, useState } from "react";
import { getDatabase, initDatabase } from "../db/database";

export function useDatabase() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    initDatabase()
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch((err) => {
        if (mounted) setError((err as Error).message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { ready, error, db: getDatabase() };
}
