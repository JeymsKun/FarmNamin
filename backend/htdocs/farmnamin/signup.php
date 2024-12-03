<?php
header('Content-Type: application/json');

session_start(); 

$data = json_decode(file_get_contents('php://input'), true);

function sendResponse($message, $userId = null) {
    $response = [["Message" => $message]];
    if ($userId) {
        $response[0]['User ID'] = $userId;
    }
    echo json_encode($response);
    exit();
}

if (!isset($data['username']) || !isset($data['email']) || !isset($data['phoneNumber']) || 
    !isset($data['password']) || !isset($data['confirmPassword']) || !isset($data['agree']) || 
    !isset($data['role'])) {
    sendResponse("All fields are required.");
}

$username = $data['username'];
$email = $data['email'];
$phoneNumber = $data['phoneNumber'];
$password = $data['password'];
$confirmPassword = $data['confirmPassword'];
$agree = $data['agree']; 
$role = $data['role'];

if ($role !== 'farmer' && $role !== 'consumer') {
    sendResponse("Invalid role specified.");
}

if ($agree !== 'yes') {
    sendResponse("You must agree to the terms and conditions.");
}

if ($password !== $confirmPassword) {
    sendResponse("Passwords do not match.");
}

if (strlen($phoneNumber) !== 11) {
    sendResponse("Invalid phone number.");
}

$servername = "localhost";
$username_db = "root";
$password_db = "";
$dbname = "farmnamin";

$conn = new mysqli($servername, $username_db, $password_db, $dbname);

if ($conn->connect_error) {
    sendResponse("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT * FROM users WHERE username = ? OR email = ? OR phoneNumber = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $username, $email, $phoneNumber);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    sendResponse("Username, email, or phone number already exists.");
}

$sql = "INSERT INTO users (username, email, phoneNumber, password, agree, role) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);  
$stmt->bind_param("ssssss", $username, $email, $phoneNumber, $hashedPassword, $agree, $role);

if ($stmt->execute()) {
    $userId = $stmt->insert_id; 


    $_SESSION['user_id'] = $userId;

    sendResponse("You have successfully signed up!", $userId);
} else {
    sendResponse("Error: " . $stmt->error);
}

$stmt->close();
$conn->close();
?>