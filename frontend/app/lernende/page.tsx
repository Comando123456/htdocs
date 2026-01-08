"use client";
import React, { useEffect, useState } from 'react';

type Lernender = {
  id_lernende?: number;
  vorname?: string;
  nachname?: string;
  email?: string;
  ort?: string;
  [key: string]: any;
};

export default function LernendePage() {
  const [data, setData] = useState<Lernender[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch('http://localhost/lernende.php?all');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (!Array.isArray(json)) throw new Error('Unerwartetes Antwortformat');
        setData(json as Lernender[]);
      } catch (e: any) {
        setError(e?.message ?? 'Fehler beim Laden');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
  };

  const thTdStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    padding: '0.5rem 0.75rem',
    textAlign: 'left',
  };

  return (
    <main>
      <h1>Willkommen zur Kursverwaltung - Lernende</h1>
      <button onClick={() => history.back()}>Geh zurück</button>

      {loading && <p>Lade Daten …</p>}
      {error && <p style={{ color: 'crimson' }}>Fehler: {error}</p>}

      <table style={tableStyle} aria-label="Lernende Tabelle">
        <caption style={{ textAlign: 'left', marginTop: '0.5rem', fontWeight: 600 }}>Lernende Übersicht</caption>
        <thead>
          <tr>
            <th style={thTdStyle}>Vorname</th>
            <th style={thTdStyle}>Nachname</th>
            <th style={thTdStyle}>E-Mail</th>
            <th style={thTdStyle}>Ort</th>
          </tr>
        </thead>
        <tbody>
          {!data || data.length === 0 ? (
            <tr>
              <td style={thTdStyle} colSpan={5}>Keine Einträge vorhanden.</td>
            </tr>
          ) : (
            data.map((p, idx) => (
              <tr key={p.id_lernende ?? p.id ?? idx}>
                <td style={thTdStyle}>{p.vorname ?? '-'}</td>
                <td style={thTdStyle}>{p.nachname ?? '-'}</td>
                <td style={thTdStyle}>{p.email ?? p.email_privat ?? '-'}</td>
                <td style={thTdStyle}>{p.ort ?? '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}