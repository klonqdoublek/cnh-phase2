import { useEffect, useState } from 'react'

/* Hash routing, as the cnh-tm-phase2 build does it: every state has its own
 * `#/…` route, and the webds flow archive (cnh-phase2) records those routes. */
export function useHash() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const onChange = () => setHash(location.hash)
    addEventListener('hashchange', onChange)
    return () => removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export const go = (path: string) => {
  location.hash = path
}
