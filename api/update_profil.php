<?php
header('Content-Type: application/json');
require __DIR__ . '/koneksi.php';

$data = json_decode(file_get_contents('php://input'), true);

$email   = trim($data['email'] ?? '');
$nama    = trim($data['nama'] ?? '');
$sekolah = trim($data['sekolah'] ?? '');
$hp      = trim($data['nomor_hp'] ?? '');
$alamat  = trim($data['alamat'] ?? '');
$bidang  = trim($data['bidang'] ?? '');

if (!$email || !$nama || !$sekolah || !$hp || !$alamat || !$bidang) {
    echo json_encode(['success' => false, 'message' => 'Semua field wajib diisi']);
    exit;
}

$stmt = $conn->prepare("UPDATE peserta SET nama=?, sekolah=?, nomor_hp=?, alamat=?, bidang=?, profil_lengkap=1 WHERE email=?");
$stmt->bind_param("ssssss", $nama, $sekolah, $hp, $alamat, $bidang, $email);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Profil berhasil disimpan']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal: ' . $stmt->error]);
}
$stmt->close();
$conn->close();
