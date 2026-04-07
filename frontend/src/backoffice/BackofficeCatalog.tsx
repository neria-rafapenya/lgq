import { useEffect, useMemo, useState } from "react";
import type {
  LgqCatalogItem,
  LgqCatalogItemUpsertRequest,
  LgqCatalogResponse,
  LgqCatalogSummary,
  LgqCatalogVariantUpsertRequest,
} from "../lib/api";
import {
  createCatalogItem,
  createCatalogVariant,
  deleteCatalogItem,
  deleteCatalogVariant,
  fetchCatalogByCode,
  fetchCatalogs,
  updateCatalogItem,
  updateCatalogVariant,
} from "../lib/api";

const emptyItemForm: LgqCatalogItemUpsertRequest = {
  code: "",
  name: "",
  unit: "ud",
  description: "",
  imageUrl: "",
  isActive: true,
};

const emptyVariantForm: LgqCatalogVariantUpsertRequest = {
  name: "",
  material: "",
  quality: "",
  imageUrl: "",
  sizeXcm: null,
  sizeYcm: null,
  sizeZcm: null,
  price: 0,
  isDefault: false,
  isActive: true,
};

const STORAGE_KEY = "lgq_backoffice_catalog";

const BackofficeCatalog = () => {
  const [catalogs, setCatalogs] = useState<LgqCatalogSummary[]>([]);
  const [selectedCatalog, setSelectedCatalog] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.localStorage.getItem(STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });
  const [catalog, setCatalog] = useState<LgqCatalogResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [newItemForm, setNewItemForm] =
    useState<LgqCatalogItemUpsertRequest>(emptyItemForm);
  const [itemDrafts, setItemDrafts] = useState<
    Record<number, LgqCatalogItemUpsertRequest>
  >({});
  const [variantDrafts, setVariantDrafts] = useState<
    Record<number, LgqCatalogVariantUpsertRequest>
  >({});
  const [variantModalItemId, setVariantModalItemId] = useState<number | null>(
    null,
  );
  const [variantModalForm, setVariantModalForm] =
    useState<LgqCatalogVariantUpsertRequest>(emptyVariantForm);
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  const selectedCatalogLabel = useMemo(
    () => catalogs.find((item) => item.code === selectedCatalog)?.name || "",
    [catalogs, selectedCatalog],
  );

  const refreshCatalogs = async () => {
    const data = await fetchCatalogs();
    setCatalogs(data);
    const stored =
      typeof window === "undefined"
        ? ""
        : (() => {
            try {
              return window.localStorage.getItem(STORAGE_KEY) || "";
            } catch {
              return "";
            }
          })();
    const storedExists = stored && data.some((entry) => entry.code === stored);
    const fallback = data[0]?.code || "";
    const nextCode = storedExists ? stored : fallback;
    if (nextCode && nextCode !== selectedCatalog) {
      setSelectedCatalog(nextCode);
    }
  };

  const refreshCatalog = async (code: string) => {
    const data = await fetchCatalogByCode(code);
    setCatalog(data);
  };

  useEffect(() => {
    refreshCatalogs().catch(() => setStatus("No pude cargar los catálogos."));
  }, []);

  useEffect(() => {
    if (!selectedCatalog) return;
    refreshCatalog(selectedCatalog).catch(() =>
      setStatus("No pude cargar el catálogo seleccionado."),
    );
  }, [selectedCatalog]);

  useEffect(() => {
    if (!selectedCatalog || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, selectedCatalog);
    } catch {
      // Ignore storage errors.
    }
  }, [selectedCatalog]);

  const handleItemCreate = async () => {
    if (!selectedCatalog) return;
    if (!newItemForm.code || !newItemForm.name || !newItemForm.unit) {
      setStatus("Completa código, nombre y unidad del artículo.");
      return;
    }
    setLoading(true);
    try {
      await createCatalogItem(selectedCatalog, newItemForm);
      setNewItemForm(emptyItemForm);
      await refreshCatalog(selectedCatalog);
    } catch {
      setStatus("No pude guardar el artículo.");
    } finally {
      setLoading(false);
    }
  };

  const handleVariantCreate = async () => {
    if (!variantModalItemId) return;
    if (!variantModalForm.name || variantModalForm.price <= 0) {
      setStatus("Completa nombre y precio de la variante.");
      return;
    }
    setLoading(true);
    try {
      await createCatalogVariant(variantModalItemId, variantModalForm);
      setVariantModalForm(emptyVariantForm);
      setVariantModalItemId(null);
      if (selectedCatalog) {
        await refreshCatalog(selectedCatalog);
      }
    } catch {
      setStatus("No pude guardar la variante.");
    } finally {
      setLoading(false);
    }
  };

  const getItemDraft = (item: LgqCatalogItem) =>
    itemDrafts[item.id] ?? {
      code: item.code,
      name: item.name,
      unit: item.unit,
      description: item.description ?? "",
      imageUrl: item.imageUrl ?? "",
      isActive: true,
    };

  const getVariantDraft = (
    _itemId: number,
    variant: LgqCatalogItem["variants"][number],
  ) =>
    variantDrafts[variant.id] ?? {
      name: variant.name,
      material: variant.material ?? "",
      quality: variant.quality ?? "",
      imageUrl: variant.imageUrl ?? "",
      sizeXcm: variant.sizeXcm ?? null,
      sizeYcm: variant.sizeYcm ?? null,
      sizeZcm: variant.sizeZcm ?? null,
      price: Number(variant.price),
      isDefault: variant.isDefault,
      isActive: true,
    };

  const updateItemDraft = (
    itemId: number,
    next: LgqCatalogItemUpsertRequest,
  ) => {
    setItemDrafts((prev) => ({ ...prev, [itemId]: next }));
  };

  const updateVariantDraft = (
    variantId: number,
    next: LgqCatalogVariantUpsertRequest,
  ) => {
    setVariantDrafts((prev) => ({ ...prev, [variantId]: next }));
  };

  const handleItemSave = async (itemId: number) => {
    const draft = itemDrafts[itemId];
    if (!draft) return;
    if (!draft.code || !draft.name || !draft.unit) {
      setStatus("Código, nombre y unidad son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      await updateCatalogItem(itemId, draft);
      await refreshCatalog(selectedCatalog);
    } catch (error) {
      setStatus(
        error instanceof Error && error.message
          ? error.message
          : "No pude actualizar el artículo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSave = async (variantId: number) => {
    const draft = variantDrafts[variantId];
    if (!draft) return;
    if (!draft.name || draft.price <= 0) {
      setStatus("Nombre y precio son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      await updateCatalogVariant(variantId, draft);
      await refreshCatalog(selectedCatalog);
    } catch (error) {
      setStatus(
        error instanceof Error && error.message
          ? error.message
          : "No pude actualizar la variante.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    setLoading(true);
    try {
      await deleteCatalogItem(itemId);
      if (selectedCatalog) {
        await refreshCatalog(selectedCatalog);
      }
    } catch {
      setStatus("No pude eliminar el artículo.");
    } finally {
      setLoading(false);
    }
  };

  const toggleItemOpen = (itemId: number) => {
    setOpenItems((prev) => {
      const nextOpen = !prev[itemId];
      return nextOpen ? { [itemId]: true } : {};
    });
  };

  const handleDeleteVariant = async (variantId: number) => {
    setLoading(true);
    try {
      await deleteCatalogVariant(variantId);
      if (selectedCatalog) {
        await refreshCatalog(selectedCatalog);
      }
    } catch {
      setStatus("No pude eliminar la variante.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backoffice-catalog">
      <aside className="backoffice-catalog__sidebar">
        <h3>Catálogos</h3>
        <ul>
          {catalogs.map((entry) => (
            <li key={entry.code}>
              <button
                type="button"
                className={entry.code === selectedCatalog ? "is-active" : ""}
                onClick={() => setSelectedCatalog(entry.code)}
              >
                {entry.code} · {entry.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="backoffice-catalog__content">
        <header>
          <div>
            <h2>{selectedCatalogLabel || "Catálogo"}</h2>
            <p>Gestiona artículos y variantes del catálogo seleccionado.</p>
          </div>
          {status && <span className="backoffice-status">{status}</span>}
        </header>

        <div className="backoffice-forms">
          <div className="backoffice-form">
            <h4>Nuevo artículo</h4>
            <div className="backoffice-form__grid">
              <div className="backoffice-field">
                <label className="backoffice-label">Código</label>
                <input
                  className="form-control"
                  placeholder="Código"
                  value={newItemForm.code}
                  onChange={(event) =>
                    setNewItemForm({ ...newItemForm, code: event.target.value })
                  }
                />
              </div>
              <div className="backoffice-field">
                <label className="backoffice-label">Nombre</label>
                <input
                  className="form-control"
                  placeholder="Nombre"
                  value={newItemForm.name}
                  onChange={(event) =>
                    setNewItemForm({ ...newItemForm, name: event.target.value })
                  }
                />
              </div>
              <div className="backoffice-field">
                <label className="backoffice-label">Unidad</label>
                <input
                  className="form-control"
                  placeholder="Unidad"
                  value={newItemForm.unit}
                  onChange={(event) =>
                    setNewItemForm({ ...newItemForm, unit: event.target.value })
                  }
                />
              </div>
              <div className="backoffice-field">
                <label className="backoffice-label">Imagen (URL)</label>
                <input
                  className="form-control"
                  placeholder="Imagen (URL)"
                  value={newItemForm.imageUrl ?? ""}
                  onChange={(event) =>
                    setNewItemForm({
                      ...newItemForm,
                      imageUrl: event.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="backoffice-field">
              <label className="backoffice-label">Descripción</label>
              <textarea
                className="form-control"
                placeholder="Descripción"
                value={newItemForm.description ?? ""}
                onChange={(event) =>
                  setNewItemForm({
                    ...newItemForm,
                    description: event.target.value,
                  })
                }
              />
            </div>
            <div className="backoffice-form__actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleItemCreate}
                disabled={loading}
              >
                Crear artículo
              </button>
            </div>
          </div>
        </div>

        <div className="backoffice-list">
          {catalog?.items.map((item) =>
            (() => {
              const draft = getItemDraft(item);
              return (
                <div key={item.id} className="backoffice-item">
                  <div className="backoffice-item__header">
                    <div>
                      <strong>{draft.name || item.name}</strong>
                      <span>
                        {item.code} · {item.unit}
                      </span>
                    </div>
                    <div className="backoffice-item__actions">
                      <button
                        className="btn btn-tertiary btn-tertiary-dark btn-small"
                        type="button"
                        onClick={() => handleItemSave(item.id)}
                      >
                        Guardar
                      </button>
                      <button
                        className="btn btn-tertiary btn-tertiary-dark btn-small"
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        Eliminar
                      </button>
                      <button
                        className="btn btn-primary btn-small"
                        type="button"
                        onClick={() => {
                          setVariantModalItemId(item.id);
                          setVariantModalForm(emptyVariantForm);
                        }}
                      >
                        Añadir variante
                      </button>
                      <button
                        className="backoffice-item__toggle"
                        type="button"
                        aria-label={
                          openItems[item.id]
                            ? "Cerrar artículo"
                            : "Abrir artículo"
                        }
                        onClick={() => toggleItemOpen(item.id)}
                      >
                        {openItems[item.id] ? (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M6 15l6-6 6 6" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {!openItems[item.id] ? null : (
                    <>
                      <div className="backoffice-item__fields">
                        {draft.imageUrl && (
                          <div className="backoffice-thumb">
                            <img src={draft.imageUrl} alt={draft.name} />
                          </div>
                        )}
                        <div className="backoffice-field">
                          <label className="backoffice-label">Código</label>
                          <input
                            className="form-control"
                            value={draft.code}
                            onChange={(event) =>
                              updateItemDraft(item.id, {
                                ...draft,
                                code: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="backoffice-field">
                          <label className="backoffice-label">Nombre</label>
                          <input
                            className="form-control"
                            value={draft.name}
                            onChange={(event) =>
                              updateItemDraft(item.id, {
                                ...draft,
                                name: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="backoffice-field">
                          <label className="backoffice-label">Unidad</label>
                          <input
                            className="form-control"
                            value={draft.unit}
                            onChange={(event) =>
                              updateItemDraft(item.id, {
                                ...draft,
                                unit: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="backoffice-image-field">
                          <div className="backoffice-field">
                            <label className="backoffice-label">
                              Imagen (URL)
                            </label>
                            <input
                              className="form-control"
                              placeholder="Imagen (URL)"
                              value={draft.imageUrl ?? ""}
                              onChange={(event) =>
                                updateItemDraft(item.id, {
                                  ...draft,
                                  imageUrl: event.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="backoffice-field">
                          <label className="backoffice-label">
                            Descripción
                          </label>
                          <textarea
                            className="form-control"
                            value={draft.description ?? ""}
                            onChange={(event) =>
                              updateItemDraft(item.id, {
                                ...draft,
                                description: event.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="backoffice-variants">
                        {item.variants.map((variant) =>
                          (() => {
                            const variantDraft = getVariantDraft(
                              item.id,
                              variant,
                            );
                            return (
                              <div
                                key={variant.id}
                                className="backoffice-variant"
                              >
                                <div>
                                  {variantDraft.imageUrl && (
                                    <div className="backoffice-variant__thumb">
                                      <img
                                        src={variantDraft.imageUrl}
                                        alt={variantDraft.name}
                                      />
                                    </div>
                                  )}
                                  <div className="backoffice-field">
                                    <label className="backoffice-label">
                                      Nombre variante
                                    </label>
                                    <input
                                      className="form-control"
                                      value={variantDraft.name}
                                      onChange={(event) =>
                                        updateVariantDraft(variant.id, {
                                          ...variantDraft,
                                          name: event.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="backoffice-variant__grid">
                                    <div className="backoffice-field">
                                      <label className="backoffice-label">
                                        Imagen variante (URL)
                                      </label>
                                      <input
                                        className="form-control"
                                        placeholder="Imagen variante (URL)"
                                        value={variantDraft.imageUrl ?? ""}
                                        onChange={(event) =>
                                          updateVariantDraft(variant.id, {
                                            ...variantDraft,
                                            imageUrl: event.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="backoffice-field">
                                      <label className="backoffice-label">
                                        Tamaño X (cm)
                                      </label>
                                      <input
                                        className="form-control"
                                        type="number"
                                        step={0.01}
                                        placeholder="Ej. 50"
                                        value={variantDraft.sizeXcm ?? ""}
                                        onChange={(event) =>
                                          updateVariantDraft(variant.id, {
                                            ...variantDraft,
                                            sizeXcm: event.target.value
                                              ? Number(event.target.value)
                                              : null,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="backoffice-field">
                                      <label className="backoffice-label">
                                        Tamaño Y (cm)
                                      </label>
                                      <input
                                        className="form-control"
                                        type="number"
                                        step={0.01}
                                        placeholder="Ej. 50"
                                        value={variantDraft.sizeYcm ?? ""}
                                        onChange={(event) =>
                                          updateVariantDraft(variant.id, {
                                            ...variantDraft,
                                            sizeYcm: event.target.value
                                              ? Number(event.target.value)
                                              : null,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="backoffice-field">
                                      <label className="backoffice-label">
                                        Tamaño Z (cm)
                                      </label>
                                      <input
                                        className="form-control"
                                        type="number"
                                        step={0.01}
                                        placeholder="Ej. 1"
                                        value={variantDraft.sizeZcm ?? ""}
                                        onChange={(event) =>
                                          updateVariantDraft(variant.id, {
                                            ...variantDraft,
                                            sizeZcm: event.target.value
                                              ? Number(event.target.value)
                                              : null,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="backoffice-field">
                                      <label className="backoffice-label">
                                        Material o color
                                      </label>
                                      <input
                                        className="form-control"
                                        placeholder="Material o color (hex)"
                                        value={variantDraft.material ?? ""}
                                        onChange={(event) =>
                                          updateVariantDraft(variant.id, {
                                            ...variantDraft,
                                            material: event.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="backoffice-field">
                                      <label className="backoffice-label">
                                        Calidad
                                      </label>
                                      <input
                                        className="form-control"
                                        placeholder="Calidad"
                                        value={variantDraft.quality ?? ""}
                                        onChange={(event) =>
                                          updateVariantDraft(variant.id, {
                                            ...variantDraft,
                                            quality: event.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="backoffice-field">
                                      <label className="backoffice-label">
                                        Precio
                                      </label>
                                      <input
                                        className="form-control"
                                        type="number"
                                        placeholder="Precio"
                                        value={variantDraft.price}
                                        onChange={(event) =>
                                          updateVariantDraft(variant.id, {
                                            ...variantDraft,
                                            price: Number(event.target.value),
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <label className="backoffice-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={variantDraft.isDefault ?? false}
                                      onChange={(event) =>
                                        updateVariantDraft(variant.id, {
                                          ...variantDraft,
                                          isDefault: event.target.checked,
                                        })
                                      }
                                    />
                                    Variante por defecto
                                  </label>
                                </div>
                                <div className="backoffice-item__actions">
                                  <button
                                    className="btn btn-tertiary btn-tertiary-dark btn-small"
                                    type="button"
                                    onClick={() =>
                                      handleVariantSave(variant.id)
                                    }
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    className="btn btn-tertiary btn-tertiary-dark btn-small"
                                    type="button"
                                    onClick={() =>
                                      handleDeleteVariant(variant.id)
                                    }
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            );
                          })(),
                        )}
                        {item.variants.length === 0 && (
                          <p className="backoffice-hint">Sin variantes aún.</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })(),
          )}
        </div>
        {variantModalItemId && (
          <div className="backoffice-modal">
            <div className="backoffice-modal__panel">
              <header>
                <h3>Nueva variante</h3>
                <button
                  className="btn btn-tertiary btn-tertiary-dark btn-small"
                  type="button"
                  onClick={() => setVariantModalItemId(null)}
                >
                  Cerrar
                </button>
              </header>
              <div className="backoffice-form__grid">
                <div className="backoffice-field">
                  <label className="backoffice-label">Nombre variante</label>
                  <input
                    className="form-control"
                    placeholder="Nombre"
                    value={variantModalForm.name}
                    onChange={(event) =>
                      setVariantModalForm({
                        ...variantModalForm,
                        name: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="backoffice-field">
                  <label className="backoffice-label">
                    Imagen variante (URL)
                  </label>
                  <input
                    className="form-control"
                    placeholder="Imagen variante (URL)"
                    value={variantModalForm.imageUrl ?? ""}
                    onChange={(event) =>
                      setVariantModalForm({
                        ...variantModalForm,
                        imageUrl: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="backoffice-field">
                  <label className="backoffice-label">Tamaño X (cm)</label>
                  <input
                    className="form-control"
                    type="number"
                    step={0.01}
                    placeholder="Ej. 50"
                    value={variantModalForm.sizeXcm ?? ""}
                    onChange={(event) =>
                      setVariantModalForm({
                        ...variantModalForm,
                        sizeXcm: event.target.value
                          ? Number(event.target.value)
                          : null,
                      })
                    }
                  />
                </div>
                <div className="backoffice-field">
                  <label className="backoffice-label">Tamaño Y (cm)</label>
                  <input
                    className="form-control"
                    type="number"
                    step={0.01}
                    placeholder="Ej. 50"
                    value={variantModalForm.sizeYcm ?? ""}
                    onChange={(event) =>
                      setVariantModalForm({
                        ...variantModalForm,
                        sizeYcm: event.target.value
                          ? Number(event.target.value)
                          : null,
                      })
                    }
                  />
                </div>
                <div className="backoffice-field">
                  <label className="backoffice-label">Tamaño Z (cm)</label>
                  <input
                    className="form-control"
                    type="number"
                    step={0.01}
                    placeholder="Ej. 1"
                    value={variantModalForm.sizeZcm ?? ""}
                    onChange={(event) =>
                      setVariantModalForm({
                        ...variantModalForm,
                        sizeZcm: event.target.value
                          ? Number(event.target.value)
                          : null,
                      })
                    }
                  />
                </div>
                <div className="backoffice-field">
                  <label className="backoffice-label">Material o color</label>
                  <input
                    className="form-control"
                    placeholder="Material o color (hex)"
                    value={variantModalForm.material ?? ""}
                    onChange={(event) =>
                      setVariantModalForm({
                        ...variantModalForm,
                        material: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="backoffice-field">
                  <label className="backoffice-label">Calidad</label>
                  <input
                    className="form-control"
                    placeholder="Calidad"
                    value={variantModalForm.quality ?? ""}
                    onChange={(event) =>
                      setVariantModalForm({
                        ...variantModalForm,
                        quality: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="backoffice-field">
                  <label className="backoffice-label">Precio</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Precio"
                    value={variantModalForm.price}
                    onChange={(event) =>
                      setVariantModalForm({
                        ...variantModalForm,
                        price: Number(event.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <label className="backoffice-checkbox">
                <input
                  type="checkbox"
                  checked={variantModalForm.isDefault ?? false}
                  onChange={(event) =>
                    setVariantModalForm({
                      ...variantModalForm,
                      isDefault: event.target.checked,
                    })
                  }
                />
                Variante por defecto
              </label>
              <div className="backoffice-form__actions">
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={handleVariantCreate}
                  disabled={loading}
                >
                  Guardar variante
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default BackofficeCatalog;
