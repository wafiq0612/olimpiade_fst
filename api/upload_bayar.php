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
    echo json_encode(['success' => false, 'message' => 'Upload gagal, error code: ' . $file['error']]);
    exit;
}

$allowedExt = ['jpg', 'jpeg', 'png', 'pdf'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($ext, $allowedExt)) {
    echo json_encode(['success' => false, 'message' => 'Format file tidak didukung']);
    exit;
}

$newName = 'bayar_' . time() . '_' . preg_replace('/[^a-zA-Z0-9.]/', '_', $file['name']);
$uploadDir = __DIR__ . '/../uploads/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$targetPath = $uploadDir . $newName;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan file']);
    exit;
}

// Ambil peserta_id berdasarkan email
$cari = $conn->prepare("SELECT id FROM peserta WHERE email=?");
$cari->bind_param("s", $email);
$cari->execute();
$result = $cari->get_result()->fetch_assoc();
$cari->close();

if (!$result) {
    echo json_encode(['success' => false, 'message' => 'Email peserta tidak ditemukan']);
    exit;
}

$peserta_id = $result['id'];
$path_file  = '../uploads/' . $newName;

// UPDATE tabel peserta (tetap seperti semula)
$stmt = $conn->prepare("UPDATE peserta SET bayar_file=?, bayar_uploaded=1, status='menunggu' WHERE email=?");
$stmt->bind_param("ss", $newName, $email);
$stmt->execute();
$stmt->close();

// INSERT ke tabel pembayaran (baru)
$stmt2 = $conn->prepare("INSERT INTO pembayaran (peserta_id, nama_file, path_file, uploaded_at) VALUES (?, ?, ?, NOW())");
$stmt2->bind_param("iss", $peserta_id, $newName, $path_file);

if ($stmt2->execute()) {
    echo json_encode(['success' => true, 'message' => 'Bukti pembayaran berhasil diupload', 'filename' => $newName]);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal simpan ke pembayaran: ' . $stmt2->error]);
}

$stmt2->close();
$conn->close();