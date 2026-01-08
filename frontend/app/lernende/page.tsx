"use client";
import React, { useEffect, useState } from "react";

type Lernender = {
  id_lernende?: number;
  vorname?: string;
  nachname?: string;
  strasse?: string;
  plz?: string;
  ort?: string;
  nr_land?: number | string;
  geschlecht?: string;
  telefon?: string;
  handy?: string;
  email?: string;
  email_privat?: string;
  birthdate?: string;
  [key: string]: any;
};

export default function LernendePage() {
  const [data, setData] = useState<Lernender[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Lernender | null>(null);
  const [editForm, setEditForm] = useState<Partial<Lernender>>({});
  const [origItem, setOrigItem] = useState<Lernender | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch("http://localhost/lernende.php?all");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (!Array.isArray(json)) throw new Error("Unerwartetes Antwortformat");
        setData(json as Lernender[]);
      } catch (e: any) {
        setError(e?.message ?? "Fehler beim Laden");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "1rem",
  };

  const thTdStyle: React.CSSProperties = {
    border: "1px solid #ccc",
    padding: "0.5rem 0.75rem",
    textAlign: "left",
  };

  const openEdit = (p: Lernender) => {
    setOrigItem(p);
    setEditItem(p);
    setEditForm({
      vorname: p.vorname ?? "",
      nachname: p.nachname ?? "",
      strasse: p.strasse ?? "",
      plz: p.plz ?? "",
      ort: p.ort ?? "",
      nr_land: p.nr_land ?? "",
      geschlecht: p.geschlecht ?? "",
      telefon: p.telefon ?? "",
      handy: p.handy ?? "",
      email: p.email ?? "",
      email_privat: p.email_privat ?? "",
      birthdate: p.birthdate ?? "",
    });
    setEditOpen(true);
  };

  // NEU: "Neuer Lernender" öffnet Dialog im Create-Modus
  const handleNew = () => {
    setOrigItem(null);
    setEditItem(null); // null = create mode
    setEditForm({
      vorname: "",
      nachname: "",
      strasse: "",
      plz: "",
      ort: "",
      nr_land: "",
      geschlecht: "",
      telefon: "",
      handy: "",
      email: "",
      email_privat: "",
      birthdate: "",
    });
    setEditOpen(true);
  };

  const handleEdit = (p: Lernender) => openEdit(p);

  // UPDATE oder CREATE je nachdem ob editItem vorhanden ist
  const handleSave = async () => {
    const isEdit = !!editItem;

    if (isEdit) {
      const idRaw = editItem!.id_lernende ?? editItem!.id;
      if (idRaw == null || String(idRaw).trim() === "") {
        alert("Keine gültige ID gefunden – Update unmöglich");
        return;
      }
      const id = Number(idRaw);
      const prev = origItem;

      // Optimistisch aktualisieren
      setData((cur) =>
        cur
          ? cur.map((it) => {
              const itemId = it.id_lernende ?? it.id ?? "";
              if (String(itemId) === String(idRaw)) {
                return { ...it, ...editForm, id_lernende: id } as Lernender;
              }
              return it;
            })
          : cur
      );

      setEditOpen(false);

      try {
        const resp = await fetch("http://localhost/lernende.php", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_lernende: id,
            ...editForm,
          }),
        });

        const text = await resp.text();
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);
      } catch (e: any) {
        alert("Fehler beim Speichern: " + (e?.message ?? e));

        // Wiederherstellen
        if (prev) {
          const prevId = String(prev.id_lernende ?? prev.id ?? "");
          setData((cur) =>
            cur
              ? cur.map((it) =>
                  String(it.id_lernende ?? it.id ?? "") === prevId ? prev : it
                )
              : cur
          );
        }
      } finally {
        setEditItem(null);
        setOrigItem(null);
      }

      return;
    }

    // CREATE (Neuer Lernender)
    setEditOpen(false);

    try {
      const resp = await fetch("http://localhost/lernende.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const text = await resp.text();
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);

      // Backend liefert JSON; wir holen id_lernende daraus und fügen in UI hinzu (optimistisch)
      let createdId: number | undefined;
      try {
        const j = JSON.parse(text);
        createdId = j?.id_lernende;
      } catch {
        // wenn Response kein JSON ist, ignorieren
      }

      const createdRow: Lernender = {
        ...(editForm as Lernender),
        ...(createdId != null ? { id_lernende: createdId } : {}),
      };

      setData((cur) => (cur ? [createdRow, ...cur] : [createdRow]));
    } catch (e: any) {
      alert("Erstellen fehlgeschlagen: " + (e?.message ?? e));
    } finally {
      setEditItem(null);
      setOrigItem(null);
    }
  };

  const handleDelete = async (p: Lernender) => {
    const idRaw = p.id_lernende ?? p.id;
    if (idRaw == null || String(idRaw).trim() === "") {
      alert("Keine gültige ID gefunden – Löschen unmöglich");
      return;
    }

    const idStr = String(idRaw);

    if (!confirm(`Löschen bestätigen für ID: ${idStr}?`)) return;

    let removed: Lernender | null = null;

    // Optimistisch entfernen
    setData((prev) => {
      if (!prev) return prev;
      const filtered = prev.filter((item) => {
        const itemId = String(item.id_lernende ?? item.id ?? "");
        if (itemId === idStr) {
          removed = item;
          return false;
        }
        return true;
      });
      return filtered;
    });

    try {
      const resp = await fetch(
        `http://localhost/lernende.php?id_lernende=${encodeURIComponent(idStr)}`,
        { method: "DELETE" }
      );

      const text = await resp.text();
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${text}`);
    } catch (e: any) {
      alert("Löschen fehlgeschlagen: " + (e?.message ?? e));

      // Wiederherstellen
      if (removed) {
        setData((prev) => (prev ? [removed!, ...prev] : [removed!]));
      }
    }
  };

  return (
    <main>
      <h1>Willkommen zur Kursverwaltung - Lernende</h1>
      <button onClick={() => history.back()}>Geh zurück</button>

      <button onClick={handleNew}>neuer Lernender</button>

      {loading && <p>Lade Daten …</p>}
      {error && <p style={{ color: "crimson" }}>Fehler: {error}</p>}

      <table style={tableStyle} aria-label="Lernende Tabelle">
        <caption style={{ textAlign: "left", marginTop: "0.5rem", fontWeight: 600 }}>
          Lernende Übersicht
        </caption>
        <thead>
          <tr>
            <th style={thTdStyle}>Vorname</th>
            <th style={thTdStyle}>Nachname</th>
            <th style={thTdStyle}>E-Mail</th>
            <th style={thTdStyle}>Ort</th>
            <th style={thTdStyle}>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {!data || data.length === 0 ? (
            <tr>
              <td style={thTdStyle} colSpan={5}>
                Keine Einträge vorhanden.
              </td>
            </tr>
          ) : (
            data.map((p, idx) => (
              <tr key={p.id_lernende ?? p.id ?? idx}>
                <td style={thTdStyle}>{p.vorname ?? "-"}</td>
                <td style={thTdStyle}>{p.nachname ?? "-"}</td>
                <td style={thTdStyle}>{p.email ?? p.email_privat ?? "-"}</td>
                <td style={thTdStyle}>{p.ort ?? "-"}</td>
                <td style={thTdStyle}>
                  <button
                    style={{ marginRight: 8, padding: "0.25rem 0.5rem" }}
                    onClick={() => handleEdit(p)}
                  >
                    Bearbeiten
                  </button>
                  <button
                    style={{ padding: "0.25rem 0.5rem" }}
                    onClick={() => handleDelete(p)}
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {editOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 6,
              width: "90%",
              maxWidth: 800,
            }}
            role="dialog"
            aria-modal="true"
          >
            <h2>{editItem ? "Bearbeite Lernenden" : "Neuer Lernender"}</h2>

            <div
              style={{
                display: "grid",
                gap: 8,
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              }}
            >
              <label>
                Vorname
                <input
                  style={{ width: "100%" }}
                  value={(editForm.vorname as string) || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, vorname: e.target.value }))}
                />
              </label>

              <label>
                Nachname
                <input
                  style={{ width: "100%" }}
                  value={(editForm.nachname as string) || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, nachname: e.target.value }))}
                />
              </label>

              <label style={{ gridColumn: "1 / -1" }}>
                Strasse
                <input
                  style={{ width: "100%" }}
                  value={(editForm.strasse as string) || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, strasse: e.target.value }))}
                />
              </label>

              <label>
                PLZ
                <input
                  style={{ width: "100%" }}
                  value={(editForm.plz as string) || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, plz: e.target.value }))}
                />
              </label>

              <label>
                Ort
                <input
                  style={{ width: "100%" }}
                  value={(editForm.ort as string) || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, ort: e.target.value }))}
                />
              </label>

              <label>
                Nr. Land
                <input
                  style={{ width: "100%" }}
                  value={String((editForm.nr_land as any) ?? "")}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      nr_land: e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                />
              </label>

              <label>
                Geschlecht (m/w/d)
                <input
                  style={{ width: "100%" }}
                  value={(editForm.geschlecht as string) || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, geschlecht: e.target.value }))}
                />
              </label>

              <label>
                Telefon
                <input
                  style={{ width: "100%" }}
                  value={(editForm.telefon as string) || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, telefon: e.target.value }))}
                />
              </label>

              <label>
                Handy
                <input
                  style={{ width: "100%" }}
                  value={(editForm.handy as string) || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, handy: e.target.value }))}
                />
              </label>

              <label style={{ gridColumn: "1 / -1" }}>
                E-Mail
                <input
                  style={{ width: "100%" }}
                  value={(editForm.email as string) || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                />
              </label>

              <label style={{ gridColumn: "1 / -1" }}>
                E-Mail privat
                <input
                  style={{ width: "100%" }}
                  value={(editForm.email_privat as string) || ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email_privat: e.target.value }))
                  }
                />
              </label>

              <label style={{ gridColumn: "1 / -1" }}>
                Birthdate
                <input
                  type="date"
                  style={{ width: "100%" }}
                  value={(editForm.birthdate as string) || ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, birthdate: e.target.value }))
                  }
                />
              </label>
            </div>

            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
              <button
                style={{ marginRight: 8 }}
                onClick={() => {
                  setEditOpen(false);
                  setEditItem(null);
                  setOrigItem(null);
                }}
              >
                Abbrechen
              </button>
              <button onClick={handleSave}>
                {editItem ? "Speichern" : "Erstellen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
