<?php
header('Content-Type: application/json');
error_reporting(0);
ini_set('display_errors', 0);

require __DIR__ . '/koneksi.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Data tidak valid']);
    exit;
}

$email = trim($data['email'] ?? '');
$pass  = $data['password'] ?? '';

if ($email === '' || $pass === '') {
    echo json_encode(['success' => false, 'message' => 'Email dan password wajib diisi']);
    exit;
}

$stmt = $conn->prepare("SELECT id, nama, email, password, sekolah, nomor_hp, alamat, bidang, profil_lengkap, bayar_file, status FROM peserta WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Email atau password salah']);
    exit;
}

$stmt->bind_result($id, $nama, $email_db, $password_db, $sekolah, $nomor_hp, $alamat, $bidang, $profil_lengkap, $bayar_file, $status);
$stmt->fetch();

if (md5($pass) !== $password_db) {
    echo json_encode(['success' => false, 'message' => 'Email atau password salah']);
    exit;
}

$user = [
    'id'             => $id,
    'nama'           => $nama,
    'email'          => $email_db,
    'sekolah'        => $sekolah,
    'nomor_hp'       => $nomor_hp,
    'alamat'         => $alamat,
    'bidang'         => $bidang,
    'profil_lengkap' => $profil_lengkap,
    'bayar_file'     => $bayar_file,
    'status'         => $status
];

echo json_encode(['success' => true, 'data' => $user]);

$stmt->close();
$conn->close();