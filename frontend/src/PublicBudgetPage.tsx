import { useEffect, useState } from 'react'
import type { PublicBudgetResponse } from './lib/api'
import { fetchPublicBudget } from './lib/api'
import "./PublicBudgetPage.scss";

type StatusState = { type: 'error' | 'info'; message: string }

type ApiError = Error & { status?: number }

type Props = {
  budgetId: string
}

function PublicBudgetPage({ budgetId }: Props) {
  const [data, setData] = useState<PublicBudgetResponse | null>(null)
  const [status, setStatus] = useState<StatusState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setStatus(null)
      try {
        const response = await fetchPublicBudget(budgetId)
        setData(response)
      } catch (error) {
        const apiError = error as ApiError
        if (apiError.status === 404) {
          setStatus({ type: 'error', message: 'No encontramos ese presupuesto.' })
        } else {
          setStatus({ type: 'error', message: 'No pude cargar el presupuesto.' })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [budgetId])

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '--'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="public-budget">
      <header className="public-header">
        <div>
          <p className="eyebrow">LGQ · Presupuesto compartido</p>
          <h1>Presupuesto de reforma</h1>
          <p className="subtitle">
            {data?.projectName ? data.projectName : `Proyecto ${budgetId}`}
          </p>
        </div>
        <div className="public-actions">
          <button className="btn ghost" type="button" onClick={() => window.print()}>
            Imprimir / PDF
          </button>
        </div>
      </header>

      {loading && <div className="loading">Cargando presupuesto…</div>}
      {status && <div className={`status ${status.type}`}>{status.message}</div>}

      {data && (
        <main className="public-grid">
          <section className="card">
            <h3>Resumen económico</h3>
            <div className="summary-row">
              <span>Materiales</span>
              <strong>{formatCurrency(data.materials)}</strong>
            </div>
            <div className="summary-row">
              <span>Equipamiento</span>
              <strong>{formatCurrency(data.equipment)}</strong>
            </div>
            <div className="summary-row">
              <span>Mano de obra</span>
              <strong>{formatCurrency(data.labor)}</strong>
            </div>
            <div className="summary-row">
              <span>Extras</span>
              <strong>{formatCurrency(data.extras)}</strong>
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(data.base)}</strong>
            </div>
            <div className="summary-row">
              <span>Margen</span>
              <strong>{data.marginPercentage?.toFixed(2)}%</strong>
            </div>
            <div className="summary-row">
              <span>Contingencia</span>
              <strong>{data.contingencyPercentage?.toFixed(2)}%</strong>
            </div>
            <div className="summary-row highlight">
              <span>Total estimado</span>
              <strong>{formatCurrency(data.total)}</strong>
            </div>
          </section>

          <section className="card">
            <h3>Desglose por capítulos</h3>
            {data.categories.length ? (
              data.categories.map((item) => (
                <div key={item.category} className="summary-row">
                  <span>{item.category}</span>
                  <strong>{formatCurrency(item.total)}</strong>
                </div>
              ))
            ) : (
              <p className="muted">Aún no hay capítulos detallados.</p>
            )}
          </section>
        </main>
      )}
    </div>
  )
}

export default PublicBudgetPage
