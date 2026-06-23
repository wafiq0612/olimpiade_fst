<?php
$host     = "localhost";
$user     = "root";
$password = "";
$database = "olimpiade_fst";

$conn = mysqli_connect($host, $user, $password, $database);
if (!$conn) {
    http_response_code(500);
    die(json_encode(["success" => false, "message" => "Koneksi gagal: " . mysqli_connect_error()]));
}
mysqli_set_charset($conn, "utf8mb4");
