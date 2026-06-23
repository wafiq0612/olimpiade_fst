<?php
header('Content-Type: application/json');
require __DIR__ . '/koneksi.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? null;

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'ID tidak valid']);
    exit;
}

// Ambil nama file bukti bayar dulu supaya filenya juga bisa dihapus dari folder uploads
$stmt = $conn->prepare("SELECT bayar_file FROM peserta WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();
$stmt->close();

$stmt = $conn->prepare("DELETE FROM peserta WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    if ($row && $row['bayar_file']) {
        $filePath = __DIR__ . '/../uploads/' . $row['bayar_file'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }
    echo json_encode(['success' => true, 'message' => 'Peserta berhasil dihapus']);
} else {
    echo json_encode(['success' => false, 'message' => 'Gagal: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
