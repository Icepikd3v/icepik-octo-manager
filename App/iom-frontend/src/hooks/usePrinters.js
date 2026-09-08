import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../utils/api";
export default function usePrinters(endpoint = "/printers") {
  const [data, setData] = useState({ printers: [], loading: true, error: "", updatedAt: null });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let disposed = false, timer;
    const controller = new AbortController();
    async function poll() {
      try {
        const { data: result } = await api.get(endpoint, { signal: controller.signal });
        if (!disposed) setData({ printers: result.printers, loading: false, error: "", updatedAt: new Date() });
      } catch (err) {
        if (!disposed) setData(previous => ({ ...previous, loading: false, error: errorMessage(err) }));
      } finally { if (!disposed) timer = setTimeout(poll, 15000); }
    }
    poll();
    return () => { disposed = true; clearTimeout(timer); controller.abort(); };
  }, [revision, endpoint]);
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  return { ...data, refresh };
}
