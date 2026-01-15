"use client";
import React, { useEffect, useState } from "react";

type Kurs = {
    id_kurs?: number;
    kursnummer?: string;
    kursthema?: string;
    inhalt?: string;
    nr_dozent?: number | string;
    startdatum?: string;
    enddatum?: string;
    dauer?: number | string;
};

export default function KursePage() {
    const [data, setData] = useState<Kurs[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState<Kurs | null>(null);
    const [editForm, setEditForm] = useState<Partial<Kurs>>({});

    const API_BASE_URL = "http://localhost";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(API_BASE_URL + "/kurse.php?all");
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
            kursnummer: "",
            kursthema: "",
            inhalt: "",
            nr_dozent: "",
            startdatum: "",
            enddatum: "",
            dauer: "",
        });
        setEditOpen(true);
    };

    const handleEdit = (p: Kurs) => {
        setEditItem(p);
        setEditForm({
            kursnummer: p.kursnummer ?? "",
            kursthema: p.kursthema ?? "",
            inhalt: p.inhalt ?? "",
            nr_dozent: p.nr_dozent ?? "",
            startdatum: p.startdatum ?? "",
            enddatum: p.enddatum ?? "",
            dauer: p.dauer ?? "",
        });
        setEditOpen(true);
    };

    const handleSave = async () => {
        const isEdit = !!editItem;
        setEditOpen(false);

        try {
            const resp = await fetch(API_BASE_URL + "/kurse.php", {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    isEdit
                        ? { id_kurs: editItem!.id_kurs, ...editForm }
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

    const handleDelete = async (p: Kurs) => {
        if (!p.id_kurs) {
            alert("Keine gültige ID");
            return;
        }

        if (!confirm(`Kurs "${p.kursthema}" löschen?`)) return;

        try {
            const resp = await fetch(
                API_BASE_URL +
                "/kurse.php?id_kurs=" +
                encodeURIComponent(String(p.id_kurs)),
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
            <h1>Kursverwaltung – Kurse</h1>

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
                    Neuer Kurs
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
                    Kurse Übersicht
                </caption>
                <thead>
                <tr>
                    {[
                        "Kursnr.",
                        "Thema",
                        "Dozent (ID)",
                        "Start",
                        "Ende",
                        "Dauer",
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
                            colSpan={7}
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
                        <tr key={p.id_kurs}>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                {p.kursnummer ?? "-"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                {p.kursthema ?? "-"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                {p.nr_dozent ?? "-"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                {p.startdatum ?? "-"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                {p.enddatum ?? "-"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                                {p.dauer ?? "-"}
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
                    }}
                    onClick={() => setEditOpen(false)}
                >
                    <div
                        style={{ background: "white", padding: "2rem", width: 700 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>{editItem ? "Kurs bearbeiten" : "Neuer Kurs"}</h2>

                        {[
                            ["kursnummer", "Kursnummer"],
                            ["kursthema", "Kursthema"],
                            ["inhalt", "Inhalt"],
                            ["nr_dozent", "Dozent (ID)"],
                            ["startdatum", "Startdatum"],
                            ["enddatum", "Enddatum"],
                            ["dauer", "Dauer (h)"],
                        ].map(([k, label]) => (
                            <label key={k} style={{ display: "block", marginTop: "0.75rem" }}>
                                {label}
                                <input
                                    type={k.includes("datum") ? "date" : "text"}
                                    style={{ width: "100%", padding: "0.5rem" }}
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
