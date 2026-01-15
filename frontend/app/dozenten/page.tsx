"use client";
import React, { useEffect, useState } from "react";

type Dozent = {
    id_dozent?: number;
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
    birthdate?: string;
};

export default function DozentenPage() {
    const [data, setData] = useState<Dozent[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState<Dozent | null>(null);
    const [editForm, setEditForm] = useState<Partial<Dozent>>({});

    const API_BASE_URL = "http://localhost";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(API_BASE_URL + "/dozenten.php?all");
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const json = await resp.json();
            if (!Array.isArray(json)) throw new Error("Unerwartetes Antwortformat");
            setData(json);
        } catch (e: any) {
            setError(e?.message ?? "Fehler beim Laden");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleNew = () => {
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
            birthdate: "",
        });
        setEditOpen(true);
    };

    const handleEdit = (p: Dozent) => {
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
            birthdate: p.birthdate ?? "",
        });
        setEditOpen(true);
    };

    const handleSave = async () => {
        const isEdit = !!editItem;
        setEditOpen(false);

        try {
            const resp = await fetch(API_BASE_URL + "/dozenten.php", {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    isEdit
                        ? { id_dozent: editItem!.id_dozent, ...editForm }
                        : editForm
                ),
            });

            const text = await resp.text();
            if (!resp.ok) throw new Error(text);

            await fetchData();
        } catch {
            alert("Speichern fehlgeschlagen");
        } finally {
            setEditItem(null);
        }
    };

    const handleDelete = async (p: Dozent) => {
        if (!p.id_dozent) {
            alert("Keine gültige ID");
            return;
        }

        if (!confirm(`Dozent "${p.vorname} ${p.nachname}" löschen?`)) return;

        try {
            const resp = await fetch(
                API_BASE_URL +
                "/dozenten.php?id_dozent=" +
                encodeURIComponent(String(p.id_dozent)),
                { method: "DELETE" }
            );

            const text = await resp.text();
            if (!resp.ok) throw new Error(text);

            await fetchData();
        } catch {
            alert("Löschen fehlgeschlagen");
        }
    };

    return (
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Kursverwaltung – Dozenten</h1>

            <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <button
                    onClick={() => window.history.back()}
                    style={{ marginRight: "0.5rem", padding: "0.5rem 1rem" }}
                >
                    Zurück
                </button>
                <button
                    onClick={handleNew}
                    style={{ padding: "0.5rem 1rem" }}
                >
                    Neuer Dozent
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
                <caption
                    style={{
                        textAlign: "left",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                    }}
                >
                    Dozenten Übersicht
                </caption>
                <thead>
                <tr>
                    {[
                        "Vorname",
                        "Nachname",
                        "E-Mail",
                        "Ort",
                        "Aktionen",
                    ].map((h) => (
                        <th
                            key={h}
                            style={{
                                border: "1px solid #ccc",
                                padding: "0.5rem",
                                textAlign: "left",
                            }}
                        >
                            {h}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {!data || data.length === 0 ? (
                    <tr>
                        <td
                            colSpan={5}
                            style={{
                                border: "1px solid #ccc",
                                padding: "0.5rem",
                            }}
                        >
                            Keine Einträge vorhanden.
                        </td>
                    </tr>
                ) : (
                    data.map((p) => (
                        <tr key={p.id_dozent}>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                {p.vorname ?? "-"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                {p.nachname ?? "-"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                {p.email ?? "-"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                {p.ort ?? "-"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                <button
                                    style={{
                                        marginRight: "0.5rem",
                                        padding: "0.25rem 0.5rem",
                                    }}
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
                        zIndex: 1000,
                    }}
                    onClick={() => setEditOpen(false)}
                >
                    <div
                        style={{
                            background: "white",
                            padding: "2rem",
                            width: "700px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>{editItem ? "Dozent bearbeiten" : "Neuer Dozent"}</h2>

                        <div
                            style={{
                                display: "grid",
                                gap: "1rem",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                marginTop: "1rem",
                            }}
                        >
                            {[
                                ["vorname", "Vorname *"],
                                ["nachname", "Nachname *"],
                                ["strasse", "Strasse"],
                                ["plz", "PLZ"],
                                ["ort", "Ort"],
                                ["nr_land", "Land (ID)"],
                                ["geschlecht", "Geschlecht (m/w/d)"],
                                ["telefon", "Telefon"],
                                ["handy", "Handy"],
                                ["email", "E-Mail"],
                                ["birthdate", "Geburtsdatum"],
                            ].map(([k, label]) => (
                                <label key={k}>
                                    {label}
                                    <input
                                        type={k === "birthdate" ? "date" : "text"}
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            marginTop: "0.25rem",
                                        }}
                                        value={(editForm as any)[k] ?? ""}
                                        onChange={(e) =>
                                            setEditForm((f) => ({
                                                ...f,
                                                [k]: e.target.value,
                                            }))
                                        }
                                    />
                                </label>
                            ))}
                        </div>

                        <div
                            style={{
                                marginTop: "1.5rem",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "0.5rem",
                            }}
                        >
                            <button onClick={() => setEditOpen(false)}>
                                Abbrechen
                            </button>
                            <button onClick={handleSave}>Speichern</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
