<?php
header('Content-Type: application/json');
require 'koneksi.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// Test insert langsung
$nama  = 'test';
$email = 'test@test.com';
$hashed = md5('test123');

$stmt = $conn->prepare("INSERT INTO peserta (nama, email, password, status) VALUES (?, ?, ?, 'belum')");
$stmt->bind_param("sss", $nama, $email, $hashed);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Insert berhasil!']);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error, 'errno' => $stmt->errno]);
}