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

    const API_BASE_URL = "http://localhost";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(API_BASE_URL + "/lernende.php?all");
            if (!resp.ok) {
                throw new Error("HTTP " + resp.status + ": " + resp.statusText);
            }
            const json = await resp.json();
            if (!Array.isArray(json)) {
                throw new Error("Unerwartetes Antwortformat");
            }
            setData(json as Lernender[]);
        } catch (e: any) {
            console.error("Fehler beim Laden:", e);
            setError(e?.message ?? "Fehler beim Laden");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleNew = () => {
        setOrigItem(null);
        setEditItem(null);
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

    const handleEdit = (p: Lernender) => {
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

    const handleSave = async () => {
        const isEdit = !!editItem;

        if (isEdit) {
            // UPDATE
            const idRaw = editItem!.id_lernende;
            if (idRaw == null || String(idRaw).trim() === "") {
                alert("Keine gültige ID gefunden – Update unmöglich");
                return;
            }
            const id = Number(idRaw);

            setEditOpen(false);

            try {
                const resp = await fetch(API_BASE_URL + "/lernende.php", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_lernende: id,
                        ...editForm,
                    }),
                });

                const text = await resp.text();
                console.log("PUT Response:", resp.status, text);

                if (!resp.ok) {
                    throw new Error("HTTP " + resp.status + ": " + text);
                }

                // Daten neu laden
                await fetchData();
                alert("Erfolgreich aktualisiert!");
            } catch (e: any) {
                console.error("Fehler beim Speichern:", e);
                alert("Fehler beim Speichern: " + (e?.message ?? e));
            } finally {
                setEditItem(null);
                setOrigItem(null);
            }
        } else {
            // CREATE
            setEditOpen(false);

            try {
                const resp = await fetch(API_BASE_URL + "/lernende.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editForm),
                });

                const text = await resp.text();
                console.log("POST Response:", resp.status, text);

                if (!resp.ok) {
                    throw new Error("HTTP " + resp.status + ": " + text);
                }

                // Daten neu laden
                await fetchData();
                alert("Erfolgreich erstellt!");
            } catch (e: any) {
                console.error("Erstellen fehlgeschlagen:", e);
                alert("Erstellen fehlgeschlagen: " + (e?.message ?? e));
            } finally {
                setEditItem(null);
                setOrigItem(null);
            }
        }
    };

    const handleDelete = async (p: Lernender) => {
        const idRaw = p.id_lernende;
        if (idRaw == null || String(idRaw).trim() === "") {
            alert("Keine gültige ID gefunden – Löschen unmöglich");
            return;
        }

        const idStr = String(idRaw);

        if (!confirm(`Löschen bestätigen für ID: ${idStr}?`)) return;

        try {
            const resp = await fetch(
                API_BASE_URL + "/lernende.php?id_lernende=" + encodeURIComponent(idStr),
                { method: "DELETE" }
            );

            const text = await resp.text();
            console.log("DELETE Response:", resp.status, text);

            if (!resp.ok) {
                throw new Error("HTTP " + resp.status + ": " + text);
            }

            // Daten neu laden
            await fetchData();
            alert("Erfolgreich gelöscht!");
        } catch (e: any) {
            console.error("Löschen fehlgeschlagen:", e);
            alert("Löschen fehlgeschlagen: " + (e?.message ?? e));
        }
    };

    return (
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Kursverwaltung - Lernende</h1>
            <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <button
                    onClick={() => window.history.back()}
                    style={{
                        marginRight: "0.5rem",
                        padding: "0.5rem 1rem",
                        cursor: "pointer",
                    }}
                >
                    Zurück
                </button>
                <button
                    onClick={handleNew}
                    style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                >
                    Neuer Lernender
                </button>
            </div>

            {loading && <p>Lade Daten …</p>}
            {error && <p style={{ color: "crimson" }}>Fehler: {error}</p>}

            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "1rem",
                }}
            >
                <caption style={{ textAlign: "left", marginBottom: "0.5rem", fontWeight: 600 }}>
                    Lernende Übersicht
                </caption>
                <thead>
                <tr>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem", textAlign: "left" }}>
                        Vorname
                    </th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem", textAlign: "left" }}>
                        Nachname
                    </th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem", textAlign: "left" }}>
                        E-Mail
                    </th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem", textAlign: "left" }}>
                        Ort
                    </th>
                    <th style={{ border: "1px solid #ccc", padding: "0.5rem", textAlign: "left" }}>
                        Aktionen
                    </th>
                </tr>
                </thead>
                <tbody>
                {!data || data.length === 0 ? (
                    <tr>
                        <td
                            style={{ border: "1px solid #ccc", padding: "0.5rem" }}
                            colSpan={5}
                        >
                            Keine Einträge vorhanden.
                        </td>
                    </tr>
                ) : (
                    data.map((p, idx) => (
                        <tr key={p.id_lernende ?? idx}>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                {p.vorname ?? "-"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                {p.nachname ?? "-"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                {p.email ?? p.email_privat ?? "-"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                {p.ort ?? "-"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                <button
                                    style={{ marginRight: "0.5rem", padding: "0.25rem 0.5rem", cursor: "pointer" }}
                                    onClick={() => handleEdit(p)}
                                >
                                    Bearbeiten
                                </button>
                                <button
                                    style={{ padding: "0.25rem 0.5rem", cursor: "pointer" }}
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
                        zIndex: 1000,
                    }}
                    onClick={() => setEditOpen(false)}
                >
                    <div
                        style={{
                            background: "white",
                            padding: "2rem",
                            borderRadius: "8px",
                            width: "90%",
                            maxWidth: "800px",
                            maxHeight: "80vh",
                            overflow: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>{editItem ? "Bearbeite Lernenden" : "Neuer Lernender"}</h2>

                        <div
                            style={{
                                display: "grid",
                                gap: "1rem",
                                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                marginTop: "1rem",
                            }}
                        >
                            <label>
                                Vorname *
                                <input
                                    type="text"
                                    style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                                    value={(editForm.vorname as string) || ""}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, vorname: e.target.value }))
                                    }
                                />
                            </label>

                            <label>
                                Nachname *
                                <input
                                    type="text"
                                    style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                                    value={(editForm.nachname as string) || ""}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, nachname: e.target.value }))
                                    }
                                />
                            </label>

                            <label style={{ gridColumn: "1 / -1" }}>
                                Strasse
                                <input
                                    type="text"
                                    style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                                    value={(editForm.strasse as string) || ""}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, strasse: e.target.value }))
                                    }
                                />
                            </label>

                            <label>
                                PLZ
                                <input
                                    type="text"
                                    style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                                    value={(editForm.plz as string) || ""}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, plz: e.target.value }))
                                    }
                                />
                            </label>

                            <label>
                                Ort
                                <input
                                    type="text"
                                    style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                                    value={(editForm.ort as string) || ""}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, ort: e.target.value }))
                                    }
                                />
                            </label>

                            <label>
                                Nr. Land
                                <input
                                    type="number"
                                    style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
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
                                    type="text"
                                    style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                                    value={(editForm.geschlecht as string) || ""}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, geschlecht: e.target.value }))
                                    }
                                    maxLength={1}
                                />
                            </label>

                            <label>
                                Telefon
                                <input
                                    type="text"
                                    style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                                    value={(editForm.telefon as string) || ""}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, telefon: e.target.value }))
                                    }
                                />
                            </label>

                            <label>
                                Handy
                                <input
                                    type="text"
                                    style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                                    value={(editForm.handy as string) || ""}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, handy: e.target.value }))
                                    }
                                />
                            </label>

                            <label style={{ gridColumn: "1 / -1" }}>
                                E-Mail *
                                <input
                                    type="email"
                                    style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                                    value={(editForm.email as string) || ""}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, email: e.target.value }))
                                    }
                                />
                            </label>

                            <label style={{ gridColumn: "1 / -1" }}>
                                E-Mail privat
                                <input
                                    type="email"
                                    style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                                    value={(editForm.email_privat as string) || ""}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, email_privat: e.target.value }))
                                    }
                                />
                            </label>

                            <label style={{ gridColumn: "1 / -1" }}>
                                Geburtsdatum
                                <input
                                    type="date"
                                    style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                                    value={(editForm.birthdate as string) || ""}
                                    onChange={(e) =>
                                        setEditForm((f) => ({ ...f, birthdate: e.target.value }))
                                    }
                                />
                            </label>
                        </div>

                        <div
                            style={{
                                marginTop: "1.5rem",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "0.5rem",
                            }}
                        >
                            <button
                                style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
                                onClick={() => {
                                    setEditOpen(false);
                                    setEditItem(null);
                                    setOrigItem(null);
                                }}
                            >
                                Abbrechen
                            </button>
                            <button
                                style={{ padding: "0.5rem 1rem", cursor: "pointer", background: "#007bff", color: "white", border: "none", borderRadius: "4px" }}
                                onClick={handleSave}
                            >
                                {editItem ? "Speichern" : "Erstellen"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}