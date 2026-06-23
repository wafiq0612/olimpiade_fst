<?php
header('Content-Type: application/json');

require 'koneksi.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Data tidak valid']);
    exit;
}

$nama  = mysqli_real_escape_string($conn, trim($data['nama'] ?? ''));
$email = mysqli_real_escape_string($conn, trim($data['email'] ?? ''));
$pass  = $data['password'] ?? '';

if ($nama === '' || $email === '' || $pass === '') {
    echo json_encode(['success' => false, 'message' => 'Semua field wajib diisi']);
    exit;
}

$cek = mysqli_query($conn, "SELECT id FROM peserta WHERE email='$email'");
if (mysqli_num_rows($cek) > 0) {
    echo json_encode(['success' => false, 'message' => 'Email sudah terdaftar']);
    exit;
}

$hashed = md5($pass);
$insert = mysqli_query($conn, "INSERT INTO peserta (nama, email, password, status) VALUES ('$nama', '$email', '$hashed', 'belum')");

if ($insert) {
    echo json_encode(['success' => true, 'message' => 'Registrasi berhasil']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal: ' . mysqli_error($conn)]);
}

mysqli_close($conn);