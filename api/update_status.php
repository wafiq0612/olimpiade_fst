<?php
header('Content-Type: application/json');
require __DIR__ . '/koneksi.php';

$data = json_decode(file_get_contents('php://input'), true);
$id     = $data['id'] ?? null;
$status = $data['status'] ?? '';

$validStatus = ['belum', 'menunggu', 'diterima', 'ditolak'];

if (!$id || !in_array($status, $validStatus)) {
    echo json_encode(['success' => false, 'message' => 'Data tidak valid']);
    exit;
}

$stmt = $conn->prepare("UPDATE peserta SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Status berhasil diubah']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
