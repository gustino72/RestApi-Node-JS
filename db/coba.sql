-- phpMyAdmin SQL Dump
-- version 4.9.10
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 23 Des 2022 pada 00.10
-- Versi server: 10.1.22-MariaDB
-- Versi PHP: 7.2.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `coba`
--
CREATE DATABASE IF NOT EXISTS `coba` DEFAULT CHARACTER SET latin1 COLLATE latin1_general_ci;
USE `coba`;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tb_coba`
--

DROP TABLE IF EXISTS `tb_coba`;
CREATE TABLE `tb_coba` (
  `kode` varchar(25) COLLATE latin1_general_ci NOT NULL,
  `nama` varchar(50) COLLATE latin1_general_ci DEFAULT NULL,
  `jenis_kelamin` enum('Laki-Laki','Perempuan') COLLATE latin1_general_ci DEFAULT NULL,
  `tgl_lahir` date DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data untuk tabel `tb_coba`
--

INSERT INTO `tb_coba` (`kode`, `nama`, `jenis_kelamin`, `tgl_lahir`) VALUES
('A-1', 'Peter Parker', 'Laki-Laki', '2000-03-10'),
('A-2', 'John Cena', 'Laki-Laki', '1983-03-10'),
('A-3', 'Undertaker', 'Laki-Laki', '1978-03-12'),
('A-4', 'Lara Croft', 'Perempuan', '1983-03-10'),
('A-5', 'Emma Watson', 'Perempuan', '1983-03-10'),
('A-6', 'TES input', 'Laki-Laki', '1980-11-21');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tb_pendidikan`
--

DROP TABLE IF EXISTS `tb_pendidikan`;
CREATE TABLE `tb_pendidikan` (
  `kd_pendidikan` int(10) UNSIGNED NOT NULL,
  `nama_instansi` varchar(150) COLLATE latin1_general_ci DEFAULT NULL,
  `range_tahun` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `jurusan` varchar(100) COLLATE latin1_general_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tb_pengalaman_kerja`
--

DROP TABLE IF EXISTS `tb_pengalaman_kerja`;
CREATE TABLE `tb_pengalaman_kerja` (
  `kd_pengalaman` int(10) UNSIGNED NOT NULL,
  `nama_instansi` varchar(150) COLLATE latin1_general_ci DEFAULT NULL,
  `jabatan_terakhir` varchar(150) COLLATE latin1_general_ci DEFAULT NULL,
  `terakhir_bekerja` year(4) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tb_pengguna`
--

DROP TABLE IF EXISTS `tb_pengguna`;
CREATE TABLE `tb_pengguna` (
  `nm_pengguna` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `psw_pengguna` varchar(50) COLLATE latin1_general_ci DEFAULT NULL,
  `level_user` enum('Admin','Operator') COLLATE latin1_general_ci DEFAULT NULL,
  `status_akun` enum('Aktif','Suspend') COLLATE latin1_general_ci NOT NULL,
  `terakhir_login` datetime DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data untuk tabel `tb_pengguna`
--

INSERT INTO `tb_pengguna` (`nm_pengguna`, `psw_pengguna`, `level_user`, `status_akun`, `terakhir_login`) VALUES
('JeanRiko', '4321', 'Admin', 'Aktif', '2022-12-17 22:54:15'),
('operator', '1234', 'Operator', 'Aktif', NULL),
('admin', '5678', 'Admin', 'Aktif', '2022-12-17 22:53:53');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tb_pengguna_histori`
--

DROP TABLE IF EXISTS `tb_pengguna_histori`;
CREATE TABLE `tb_pengguna_histori` (
  `kd_histori` int(11) NOT NULL,
  `nm_pengguna` varchar(50) COLLATE latin1_general_ci DEFAULT NULL,
  `keterangan` varchar(500) COLLATE latin1_general_ci DEFAULT NULL,
  `tgl_wkt` datetime DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data untuk tabel `tb_pengguna_histori`
--

INSERT INTO `tb_pengguna_histori` (`kd_histori`, `nm_pengguna`, `keterangan`, `tgl_wkt`) VALUES
(1, 'Jeanriko', 'Pengguna ini barusan login', '2022-12-16 11:31:58'),
(2, 'JeanRiko', 'Pengguna ini barusan login', '2022-12-16 11:33:13'),
(3, 'JeanRiko', 'Pengguna ini barusan login', '2022-12-16 11:42:10'),
(4, 'JeanRiko', 'Pengguna ini barusan login', '2022-12-17 13:58:24'),
(5, 'JeanRiko', 'Pengguna ini barusan login', '2022-12-17 21:06:01'),
(6, 'JeanRiko', 'Pengguna ini barusan login', '2022-12-17 21:07:59'),
(7, 'JeanRiko', 'Pengguna ini barusan login', '2022-12-17 21:10:22'),
(8, 'JeanRiko', 'Pengguna ini barusan login', '2022-12-17 21:17:21'),
(9, 'JeanRiko', 'Pengguna ini barusan login', '2022-12-17 21:18:37'),
(10, 'JeanRiko', 'Pengguna ini barusan login', '2022-12-17 22:13:03'),
(11, 'JeanRiko', 'Pengguna ini barusan login', '2022-12-17 22:14:21'),
(12, 'JeanRiko', 'Pengguna ini barusan login', '2022-12-17 22:32:16'),
(13, 'JeanRiko', 'Barusan mengubah status : \'Suspend\', data pengguna dengan nama : \'operator\'.', '2022-12-17 22:32:29'),
(14, 'JeanRiko', 'Barusan mengubah status : \'Aktif\', data pengguna dengan nama : \'operator\'.', '2022-12-17 22:32:38'),
(15, 'admin', 'Pengguna ini barusan login', '2022-12-17 22:48:07'),
(16, 'admin', 'Pengguna ini barusan login', '2022-12-17 22:48:10'),
(17, 'admin', 'Pengguna ini barusan login', '2022-12-17 22:48:26'),
(18, 'admin', 'Pengguna ini barusan login', '2022-12-17 22:48:52'),
(19, 'admin', 'Barusan mengubah status : \'Suspend\', data pengguna dengan nama : \'JeanRiko\'.', '2022-12-17 22:51:59'),
(20, 'admin', 'Pengguna ini barusan login', '2022-12-17 22:53:53'),
(21, 'admin', 'Barusan mengubah status : \'Aktif\', data pengguna dengan nama : \'JeanRiko\'.', '2022-12-17 22:54:03'),
(22, 'JeanRiko', 'Pengguna ini barusan login', '2022-12-17 22:54:15');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `tb_coba`
--
ALTER TABLE `tb_coba`
  ADD PRIMARY KEY (`kode`);

--
-- Indeks untuk tabel `tb_pendidikan`
--
ALTER TABLE `tb_pendidikan`
  ADD PRIMARY KEY (`kd_pendidikan`);

--
-- Indeks untuk tabel `tb_pengalaman_kerja`
--
ALTER TABLE `tb_pengalaman_kerja`
  ADD PRIMARY KEY (`kd_pengalaman`);

--
-- Indeks untuk tabel `tb_pengguna`
--
ALTER TABLE `tb_pengguna`
  ADD PRIMARY KEY (`nm_pengguna`);

--
-- Indeks untuk tabel `tb_pengguna_histori`
--
ALTER TABLE `tb_pengguna_histori`
  ADD PRIMARY KEY (`kd_histori`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `tb_pendidikan`
--
ALTER TABLE `tb_pendidikan`
  MODIFY `kd_pendidikan` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `tb_pengalaman_kerja`
--
ALTER TABLE `tb_pengalaman_kerja`
  MODIFY `kd_pengalaman` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `tb_pengguna_histori`
--
ALTER TABLE `tb_pengguna_histori`
  MODIFY `kd_histori` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
