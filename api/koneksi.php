<?php
$host     = "sql210.infinityfree.com";
$user     = "if0_42249247";
$password = "wafiqasmad";
$database = "if0_42249247_osn_fst_unpatti";

$conn = mysqli_connect($host, $user, $password, $database);
if (!$conn) {
    http_response_code(500);
    die(json_encode(["success" => false, "message" => "Koneksi gagal: " . mysqli_connect_error()]));
}
mysqli_set_charset($conn, "utf8mb4");