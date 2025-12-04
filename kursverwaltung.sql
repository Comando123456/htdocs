-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 04. Dez 2025 um 14:15
-- Server-Version: 10.4.32-MariaDB
-- PHP-Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `kursverwaltung`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tbl_countries`
--

CREATE TABLE `tbl_countries` (
  `id_country` int(11) NOT NULL,
  `country` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `tbl_countries`
--

INSERT INTO `tbl_countries` (`id_country`, `country`) VALUES
(1, 'Schweiz'),
(2, 'Deutschland'),
(3, 'Österreich');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tbl_dozenten`
--

CREATE TABLE `tbl_dozenten` (
  `id_dozent` int(11) NOT NULL,
  `vorname` varchar(50) NOT NULL,
  `nachname` varchar(50) NOT NULL,
  `strasse` varchar(100) DEFAULT NULL,
  `plz` varchar(10) DEFAULT NULL,
  `ort` varchar(100) DEFAULT NULL,
  `nr_land` int(11) DEFAULT NULL,
  `geschlecht` enum('m','w','d') DEFAULT NULL,
  `telefon` varchar(20) DEFAULT NULL,
  `handy` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `birthdate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `tbl_dozenten`
--

INSERT INTO `tbl_dozenten` (`id_dozent`, `vorname`, `nachname`, `strasse`, `plz`, `ort`, `nr_land`, `geschlecht`, `telefon`, `handy`, `email`, `birthdate`) VALUES
(1, 'Peter', 'Keller', 'Lehrweg 11', '8003', 'Zürich', 1, 'm', '044 660 11 22', '079 660 11 22', 'peter.keller@schule.ch', '1980-02-10'),
(2, 'Sandra', 'Baumann', 'Talstrasse 9', '4052', 'Basel', 1, 'w', '061 889 44 55', '076 889 44 55', 'sandra.baumann@schule.ch', '1985-06-18'),
(3, 'Marco', 'Schmid', 'Hochweg 7', '6003', 'Luzern', 1, 'm', '041 700 33 44', '078 700 33 44', 'marco.schmid@schule.ch', '1978-11-30'),
(4, 'Timon', 'Test', 'Strasse 10', '4000', 'Basel', 1, 'm', '0123456789', '0791234567', 'timon.test@example.com', '1985-02-15');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tbl_kurse`
--

CREATE TABLE `tbl_kurse` (
  `id_kurs` int(11) NOT NULL,
  `kursnummer` varchar(50) DEFAULT NULL,
  `kursthema` varchar(100) DEFAULT NULL,
  `inhalt` text DEFAULT NULL,
  `nr_dozent` int(11) DEFAULT NULL,
  `startdatum` date DEFAULT NULL,
  `enddatum` date DEFAULT NULL,
  `dauer` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `tbl_kurse`
--

INSERT INTO `tbl_kurse` (`id_kurs`, `kursnummer`, `kursthema`, `inhalt`, `nr_dozent`, `startdatum`, `enddatum`, `dauer`) VALUES
(1, 'K101', '- Grundlagen', 'Algebra, Geometrie, Statistik', 1, '2025-01-15', '2025-03-20', 65),
(2, 'K-102', 'Netzwerke Basics', 'TCP/IP, Routing, Switching, Sicherheit.', 2, '2024-03-05', '2024-04-05', 35),
(3, 'K-103', 'Webentwicklung', 'HTML, CSS, JavaScript, Webserver.', 3, '2024-05-01', '2024-06-01', 45),
(4, 'K101', 'Matehmatik', 'Programmieren, Datenbanken', 1, '2025-05-01', '2025-07-01', 60);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tbl_kurse_lernende`
--

CREATE TABLE `tbl_kurse_lernende` (
  `id_kurse_lernende` int(11) NOT NULL,
  `nr_kurs` int(11) NOT NULL,
  `nr_lernende` int(11) NOT NULL,
  `note` decimal(3,1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `tbl_kurse_lernende`
--

INSERT INTO `tbl_kurse_lernende` (`id_kurse_lernende`, `nr_kurs`, `nr_lernende`, `note`) VALUES
(9, 1, 7, 5.0),
(10, 1, 8, 4.5),
(11, 1, 9, 5.5),
(12, 2, 8, 5.0),
(13, 2, 10, 4.0),
(14, 3, 7, 5.0),
(15, 3, 9, 4.5),
(16, 3, 11, 5.5),
(17, 1, 7, 5.5);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tbl_lehrbetriebe`
--

CREATE TABLE `tbl_lehrbetriebe` (
  `id_lehrbetrieb` int(11) NOT NULL,
  `firma` varchar(100) NOT NULL,
  `strasse` varchar(100) DEFAULT NULL,
  `plz` varchar(10) DEFAULT NULL,
  `ort` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `tbl_lehrbetriebe`
--

INSERT INTO `tbl_lehrbetriebe` (`id_lehrbetrieb`, `firma`, `strasse`, `plz`, `ort`) VALUES
(1, 'TechSolutions AG', 'Industriestrasse 12', '8005', 'Zürich'),
(2, 'Müller Informatik GmbH', 'Hauptstrasse 88', '3001', 'Bern'),
(3, 'AlphaMedia AG', 'Seestrasse 45', '6004', 'Luzern'),
(5, 'MatemilAG', 'Hauptstrasse 1', '8000', 'Zürich');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tbl_lehrbetriebe_lernende`
--

CREATE TABLE `tbl_lehrbetriebe_lernende` (
  `id_lehrbetriebe_lernende` int(11) NOT NULL,
  `nr_lehrbetrieb` int(11) NOT NULL,
  `nr_lernende` int(11) NOT NULL,
  `start` date DEFAULT NULL,
  `ende` date DEFAULT NULL,
  `beruf` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `tbl_lehrbetriebe_lernende`
--

INSERT INTO `tbl_lehrbetriebe_lernende` (`id_lehrbetriebe_lernende`, `nr_lehrbetrieb`, `nr_lernende`, `start`, `ende`, `beruf`) VALUES
(6, 1, 7, '2022-08-01', NULL, 'Informatiker EFZ Applikationsentwicklung'),
(7, 2, 8, '2021-08-01', NULL, 'Informatiker EFZ Systemtechnik'),
(8, 1, 9, '2022-08-01', NULL, 'Mediamatiker EFZ'),
(9, 3, 10, '2021-08-01', NULL, 'Kaufmann EFZ');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tbl_lernende`
--

CREATE TABLE `tbl_lernende` (
  `id_lernende` int(11) NOT NULL,
  `vorname` varchar(50) NOT NULL,
  `nachname` varchar(50) NOT NULL,
  `strasse` varchar(100) DEFAULT NULL,
  `plz` varchar(10) DEFAULT NULL,
  `ort` varchar(100) DEFAULT NULL,
  `nr_land` int(11) DEFAULT NULL,
  `geschlecht` enum('m','w','d') DEFAULT NULL,
  `telefon` varchar(20) DEFAULT NULL,
  `handy` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `email_privat` varchar(100) DEFAULT NULL,
  `birthdate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `tbl_lernende`
--

INSERT INTO `tbl_lernende` (`id_lernende`, `vorname`, `nachname`, `strasse`, `plz`, `ort`, `nr_land`, `geschlecht`, `telefon`, `handy`, `email`, `email_privat`, `birthdate`) VALUES
(7, 'Timon', 'Buol', 'Grofenstrasse 3', '7232', 'Wangs', 1, 'm', '077 504 17 49', '077 504 17 49', 'timonbuol08@gmail.com', 'timonbuol08@gmail.com', '2008-08-23'),
(8, 'Selin', 'Kaya', 'Ringstrasse 20', '4051', 'Basel', 1, 'w', '061 777 88 99', '076 555 66 77', 'selin.kaya@lehre.ch', 'selin.kaya@hotmail.com', '2006-01-28'),
(9, 'Jonas', 'Gruber', 'Bergstrasse 44', '3012', 'Bern', 1, 'm', '031 444 55 66', '078 444 55 66', 'jonas.gruber@lehre.ch', 'gruber.jonas@gmail.com', '2005-07-10'),
(10, 'Mira', 'Stadler', 'Seestrasse 99', '6005', 'Luzern', 1, 'd', '041 555 66 77', '079 999 88 77', 'mira.stadler@lehre.ch', 'mira.stadler@outlook.com', '2006-12-03'),
(11, 'Timon', 'Buol', 'Grofenstrasse 3', '7232', 'Wangs', 1, 'm', '077 504 17 49', '077 504 17 49', 'timonbuol08@gmail.com', 'timonbuol08@gmail.com', '2008-08-23'),
(12, 'Lena', 'Neu', 'Beispielstr. 10', '4000', 'Basel', 1, 'w', '0123456789', '0791234567', 'lena.neu@example.com', 'lena.privat@example.com', '2002-07-20');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `tbl_countries`
--
ALTER TABLE `tbl_countries`
  ADD PRIMARY KEY (`id_country`);

--
-- Indizes für die Tabelle `tbl_dozenten`
--
ALTER TABLE `tbl_dozenten`
  ADD PRIMARY KEY (`id_dozent`),
  ADD KEY `nr_land` (`nr_land`);

--
-- Indizes für die Tabelle `tbl_kurse`
--
ALTER TABLE `tbl_kurse`
  ADD PRIMARY KEY (`id_kurs`),
  ADD KEY `nr_dozent` (`nr_dozent`);

--
-- Indizes für die Tabelle `tbl_kurse_lernende`
--
ALTER TABLE `tbl_kurse_lernende`
  ADD PRIMARY KEY (`id_kurse_lernende`),
  ADD KEY `nr_kurs` (`nr_kurs`),
  ADD KEY `nr_lernende` (`nr_lernende`);

--
-- Indizes für die Tabelle `tbl_lehrbetriebe`
--
ALTER TABLE `tbl_lehrbetriebe`
  ADD PRIMARY KEY (`id_lehrbetrieb`);

--
-- Indizes für die Tabelle `tbl_lehrbetriebe_lernende`
--
ALTER TABLE `tbl_lehrbetriebe_lernende`
  ADD PRIMARY KEY (`id_lehrbetriebe_lernende`),
  ADD KEY `nr_lehrbetrieb` (`nr_lehrbetrieb`),
  ADD KEY `nr_lernende` (`nr_lernende`);

--
-- Indizes für die Tabelle `tbl_lernende`
--
ALTER TABLE `tbl_lernende`
  ADD PRIMARY KEY (`id_lernende`),
  ADD KEY `nr_land` (`nr_land`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `tbl_countries`
--
ALTER TABLE `tbl_countries`
  MODIFY `id_country` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT für Tabelle `tbl_dozenten`
--
ALTER TABLE `tbl_dozenten`
  MODIFY `id_dozent` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT für Tabelle `tbl_kurse`
--
ALTER TABLE `tbl_kurse`
  MODIFY `id_kurs` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT für Tabelle `tbl_kurse_lernende`
--
ALTER TABLE `tbl_kurse_lernende`
  MODIFY `id_kurse_lernende` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT für Tabelle `tbl_lehrbetriebe`
--
ALTER TABLE `tbl_lehrbetriebe`
  MODIFY `id_lehrbetrieb` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT für Tabelle `tbl_lehrbetriebe_lernende`
--
ALTER TABLE `tbl_lehrbetriebe_lernende`
  MODIFY `id_lehrbetriebe_lernende` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT für Tabelle `tbl_lernende`
--
ALTER TABLE `tbl_lernende`
  MODIFY `id_lernende` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `tbl_dozenten`
--
ALTER TABLE `tbl_dozenten`
  ADD CONSTRAINT `tbl_dozenten_ibfk_1` FOREIGN KEY (`nr_land`) REFERENCES `tbl_countries` (`id_country`);

--
-- Constraints der Tabelle `tbl_kurse`
--
ALTER TABLE `tbl_kurse`
  ADD CONSTRAINT `tbl_kurse_ibfk_1` FOREIGN KEY (`nr_dozent`) REFERENCES `tbl_dozenten` (`id_dozent`);

--
-- Constraints der Tabelle `tbl_kurse_lernende`
--
ALTER TABLE `tbl_kurse_lernende`
  ADD CONSTRAINT `tbl_kurse_lernende_ibfk_1` FOREIGN KEY (`nr_kurs`) REFERENCES `tbl_kurse` (`id_kurs`),
  ADD CONSTRAINT `tbl_kurse_lernende_ibfk_2` FOREIGN KEY (`nr_lernende`) REFERENCES `tbl_lernende` (`id_lernende`);

--
-- Constraints der Tabelle `tbl_lehrbetriebe_lernende`
--
ALTER TABLE `tbl_lehrbetriebe_lernende`
  ADD CONSTRAINT `tbl_lehrbetriebe_lernende_ibfk_1` FOREIGN KEY (`nr_lehrbetrieb`) REFERENCES `tbl_lehrbetriebe` (`id_lehrbetrieb`),
  ADD CONSTRAINT `tbl_lehrbetriebe_lernende_ibfk_2` FOREIGN KEY (`nr_lernende`) REFERENCES `tbl_lernende` (`id_lernende`);

--
-- Constraints der Tabelle `tbl_lernende`
--
ALTER TABLE `tbl_lernende`
  ADD CONSTRAINT `tbl_lernende_ibfk_1` FOREIGN KEY (`nr_land`) REFERENCES `tbl_countries` (`id_country`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
