<?php
header('Content-Type: application/json');
require __DIR__ . '/koneksi.php';

$email = trim($_POST['email'] ?? '');

if (!$email || !isset($_FILES['bukti'])) {
    echo json_encode(['success' => false, 'message' => 'Data tidak lengkap']);
    exit;
}

$file = $_FILES['bukti'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'Upload gagal']);
    exit;
}

$allowedExt = ['jpg', 'jpeg', 'png', 'pdf'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($ext, $allowedExt)) {
    echo json_encode(['success' => false, 'message' => 'Format file tidak didukung']);
    exit;
}

$newName = 'bayar_' . time() . '_bukti.' . $ext;
$uploadDir = __DIR__ . '/../uploads/';

if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

if (!move_uploaded_file($file['tmp_name'], $uploadDir . $newName)) {
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan file']);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM peserta WHERE email=?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($peserta_id);
$stmt->fetch();
$stmt->close();

if (!$peserta_id) {
    echo json_encode(['success' => false, 'message' => 'Email tidak ditemukan']);
    exit;
}

$stmt = $conn->prepare("UPDATE peserta SET bayar_file=?, status='menunggu' WHERE email=?");
$stmt->bind_param("ss", $newName, $email);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Upload berhasil', 'filename' => $newName]);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal: ' . $stmt->error]);
}

$stmt->close();
$conn->close();