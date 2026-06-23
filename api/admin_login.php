<?php
header('Content-Type: application/json');
require __DIR__ . '/koneksi.php';

$data = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

if ($username === '' || $password === '') {
    echo json_encode(['success' => false, 'message' => 'Username dan password wajib diisi']);
    exit;
}

$stmt = $conn->prepare("SELECT id, username, password FROM admin WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Username atau password salah']);
    exit;
}

$admin = $result->fetch_assoc();

if (!password_verify($password, $admin['password'])) {
    echo json_encode(['success' => false, 'message' => 'Username atau password salah']);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Login berhasil', 'username' => $admin['username']]);

$stmt->close();
$conn->close();
