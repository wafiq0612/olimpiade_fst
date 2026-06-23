<?php
header('Content-Type: application/json');
$host     = "sql210.infinityfree.com";
$user     = "if0_42249247";
$password = "wafiqasmad";
$database = "if0_42249247_osn_fst_unpatti";

$conn = mysqli_connect($host, $user, $password, $database);
if (!$conn) {
    echo json_encode(['success' => false, 'error' => mysqli_connect_error()]);
} else {
    echo json_encode(['success' => true, 'message' => 'Koneksi berhasil!']);
}