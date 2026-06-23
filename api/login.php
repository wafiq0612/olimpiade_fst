<?php
header('Content-Type: application/json');
require __DIR__ . '/koneksi.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$pass  = $data['password'] ?? '';

$stmt = $conn->prepare("SELECT id, nama, email, password, sekolah, nomor_hp, alamat, bidang, profil_lengkap, bayar_file, status FROM peserta WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Email atau password salah']);
    exit;
}

$user = $result->fetch_assoc();

if (!password_verify($pass, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Email atau password salah']);
    exit;
}

unset($user['password']);
echo json_encode(['success' => true, 'data' => $user]);

$stmt->close();
$conn->close();