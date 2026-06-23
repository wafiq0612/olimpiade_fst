<?php
header('Content-Type: application/json');
require __DIR__ . '/koneksi.php';

$result = mysqli_query($conn, "SELECT id, nama, email, sekolah, nomor_hp, alamat, bidang, profil_lengkap, bayar_file, status FROM peserta ORDER BY id DESC");

$list = [];
while ($row = mysqli_fetch_assoc($result)) {
    $list[] = [
        'id'            => (int)$row['id'],
        'nama'          => $row['nama'],
        'email'         => $row['email'],
        'sekolah'       => $row['sekolah'],
        'hp'            => $row['nomor_hp'],
        'alamat'        => $row['alamat'],
        'bidang'        => $row['bidang'],
        'profilLengkap' => (bool)$row['profil_lengkap'],
        'bayarUploaded' => !empty($row['bayar_file']),
        'bayarFile'     => $row['bayar_file'],
        'status'        => $row['status'],
    ];
}

echo json_encode(['success' => true, 'data' => $list]);
mysqli_close($conn);