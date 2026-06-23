<?php
header('Content-Type: application/json');
error_reporting(0);
ini_set('display_errors', 0);

require 'koneksi.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Data tidak valid']);
    exit;
}

$nama  = trim($data['nama'] ?? '');
$email = trim($data['email'] ?? '');
$pass  = $data['password'] ?? '';

if ($nama === '' || $email === '' || $pass === '') {
    echo json_encode(['success' => false, 'message' => 'Semua field wajib diisi']);
    exit;
}

// Cek email sudah terdaftar
$stmt = $conn->prepare("SELECT id FROM peserta WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email sudah terdaftar']);
    exit;
}
$stmt->close();

$hashed = password_hash($pass, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO peserta (nama, email, password, status) VALUES (?, ?, ?, 'belum')");
$stmt->bind_param("sss", $nama, $email, $hashed);
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Registrasi berhasil']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan: ' . $stmt->error]);
}
$stmt->close();
$conn->close();