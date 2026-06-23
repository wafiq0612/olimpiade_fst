<?php
header('Content-Type: application/json');
require __DIR__ . '/koneksi.php';

$result = $conn->query("SELECT id, nama, email, sekolah, nomor_hp, alamat, bidang, profil_lengkap, bayar_uploaded, bayar_file, status, created_at FROM peserta ORDER BY created_at DESC");

$list = [];
while ($row = $result->fetch_assoc()) {
    $list[] = [
        'id'            => (int)$row['id'],
        'nama'          => $row['nama'],
        'email'         => $row['email'],
        'sekolah'       => $row['sekolah'],
        'hp'            => $row['nomor_hp'],
        'alamat'        => $row['alamat'],
        'bidang'        => $row['bidang'],
        'profilLengkap' => (bool)$row['profil_lengkap'],
        'bayarUploaded' => (bool)$row['bayar_uploaded'],
        'bayarFile'     => $row['bayar_file'],
        'status'        => $row['status'],
        'createdAt'     => $row['created_at'],
    ];
}

echo json_encode(['success' => true, 'data' => $list]);
$conn->close();
