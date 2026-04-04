const HostPage = () => {
  return (
    <div className="host-shell">
      <header className="host-nav">
        <strong>Portal demo</strong>
        <span>Simulación host · LGQ Widget</span>
      </header>

      <section className="host-hero">
        <div className="host-hero__copy">
          <p className="host-kicker">Reformas con diseño, gestión y calma.</p>
          <h1>Tu reforma, sin ruido y con todo controlado.</h1>
          <p>
            Esta pantalla simula la web del host. El widget de LGQ se monta como
            overlay flotante encima del portal.
          </p>
          <button className="btn btn-light">Explorar servicios</button>
        </div>
        <div className="host-hero__mock" aria-hidden="true" />
      </section>

      <section className="host-content">
        {[
          {
            title: "Reformas integrales",
            body: "Planificación, diseño y ejecución con control de costes.",
          },
          {
            title: "Parciales",
            body: "Actualiza espacios concretos sin interrumpir tu día a día.",
          },
          {
            title: "Asesoría IA",
            body: "Resuelve dudas y obtén presupuesto en minutos.",
          },
        ].map((card) => (
          <article key={card.title} className="host-card">
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default HostPage;
