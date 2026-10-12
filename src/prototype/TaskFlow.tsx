import { useEffect, useLayoutEffect, useState } from 'react'
import { TaskFlowOverlay, type FlowGraph, type TaskFlowRenderScreen } from '@/components/tools/task-flow-view'
import flow from './flow-cnh-phase2.json'
import './task-flow.css'

/* Prototype runner only — the "Task flow" button over every screen. The graph
 * is the webds flow archive's cnh-phase2 entry (r/flows/cnh-phase2.json,
 * fetched 2026-10-12); each screen renders the live route in an iframe with
 * `?panel=0`, which keeps this button out of the frame. Not product UI: never
 * hand this file to a dev team. */
const graph = flow as unknown as FlowGraph

const renderScreen: TaskFlowRenderScreen = (route, { w, h }) => (
  <iframe
    src={`/?panel=0${route}`}
    title={route}
    loading="lazy"
    tabIndex={-1}
    style={{ width: w, height: h, border: 0, display: 'block' }}
  />
)

const KEY = 'cnh-taskflow-hidden'
const readHidden = () => {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}
const writeHidden = (hidden: boolean) => {
  try {
    localStorage.setItem(KEY, hidden ? '1' : '0')
  } catch {
    /* storage blocked — the choice lasts until reload */
  }
}

/** × on the trigger hides it; a 12-wide tab on the main area's edge brings it back. */
function HideToggle() {
  const [hidden, setHidden] = useState(readHidden)
  const [corner, setCorner] = useState<{ x: number; y: number } | null>(null)

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('cnh-tf-hidden', hidden)
    writeHidden(hidden)
    const measure = () => {
      const r = document.querySelector('.webds-tfv-trigger')?.getBoundingClientRect()
      setCorner(r && r.width ? { x: r.right, y: r.top } : null)
    }
    measure()
    const t = setTimeout(measure, 300)
    addEventListener('resize', measure)
    return () => {
      clearTimeout(t)
      removeEventListener('resize', measure)
    }
  }, [hidden])

  if (hidden)
    return (
      <button type="button" className="cnh-tf-tab" aria-label="Show Task flow" title="Show Task flow" onClick={() => setHidden(false)}>
        ›
      </button>
    )
  if (!corner) return null
  return (
    <button
      type="button"
      className="cnh-tf-hide"
      aria-label="Hide Task flow"
      title="Hide Task flow"
      style={{ left: corner.x - 10, top: corner.y - 10 }}
      onClick={() => setHidden(true)}
    >
      ×
    </button>
  )
}

export function TaskFlow() {
  const [route, setRoute] = useState(location.hash || '#/list')
  useEffect(() => {
    const onChange = () => setRoute(location.hash)
    addEventListener('hashchange', onChange)
    return () => removeEventListener('hashchange', onChange)
  }, [])

  if (new URLSearchParams(location.search).get('panel') === '0') return null
  return (
    <>
      <HideToggle />
      <TaskFlowOverlay
        graph={graph}
        renderScreen={renderScreen}
        currentRoute={route}
        onNavigate={(r) => {
          location.hash = r.replace(/^#/, '')
        }}
        title="CNH Phase 2"
      />
    </>
  )
}
