<?php

$host = 'localhost'; 
$dbname = 'farmnamin';
$username = 'root'; 
$password = ''; 

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['Message' => 'Connection failed: ' . $conn->connect_error]));
}

session_start();
$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

$data = json_decode(file_get_contents("php://input"), true);

$firstName = isset($data['FirstName']) ? $data['FirstName'] : null;
$lastName = isset($data['LastName']) ? $data['LastName'] : null;
$middleName = isset($data['MiddleName']) ? $data['MiddleName'] : null;
$suffix = isset($data['Suffix']) ? $data['Suffix'] : null;
$birthMonth = isset($data['BirthMonth']) ? $data['BirthMonth'] : null;
$birthDay = isset($data['BirthDay']) ? (int)$data['BirthDay'] : null; 
$birthYear = isset($data['BirthYear']) ? (int)$data['BirthYear'] : null; 
$gender = isset($data['gender']) ? $data['gender'] : null; 
$age = isset($data['Age']) ? (int)$data['Age'] : null; 

if (!isset($data['FirstName']) && !isset($data['LastName']) && !isset($data['MiddleName']) && !isset($data['Suffix']) && !isset($data['BirthMonth']) && !isset($data['BirthDay']) && !isset($data['BirthYear']) && !isset($data['gender']) && !isset($data['Age'])) {
    echo json_encode(['Message' => 'Please provide at least one field to update.']);
    exit();
}

$sql = "UPDATE users SET ";
$params = [];
$paramTypes = '';

if ($firstName !== null) {
    $sql .= "first_name = ?, ";
    $params[] = $firstName;
    $paramTypes .= 's'; 
}
if ($lastName !== null) {
    $sql .= "last_name = ?, ";
    $params[] = $lastName;
    $paramTypes .= 's'; 
}
if ($middleName !== null) {
    $sql .= "middle_name = ?, ";
    $params[] = $middleName;
    $paramTypes .= 's'; 
}
if ($suffix !== null) {
    $sql .= "suffix = ?, ";
    $params[] = $suffix;
    $paramTypes .= 's'; 
}
if ($birthMonth !== null) {
    $sql .= "birth_month = ?, ";
    $params[] = $birthMonth;
    $paramTypes .= 's'; 
}
if ($birthDay !== null) {
    $sql .= "birth_day = ?, ";
    $params[] = $birthDay;
    $paramTypes .= 'i'; 
}
if ($birthYear !== null) {
    $sql .= "birth_year = ?, ";
    $params[] = $birthYear;
    $paramTypes .= 'i'; 
}
if ($gender !== null) {
    $sql .= "gender = ?, ";
    $params[] = $gender; 
    $paramTypes .= 's';
}
if ($age !== null) {
    $sql .= "age = ? ";
    $params[] = $age; 
    $paramTypes .= 'i'; 
}

$sql = rtrim($sql, ', ');

$sql .= " WHERE id_user = ?";

$params[] = $user_id;
$paramTypes .= 'i'; 

error_log("SQL Query: " . $sql);
error_log("Parameters: " . json_encode($params));

$stmt = $conn->prepare($sql);
if (!$stmt) {
    die(json_encode(['Message' => 'Prepare failed: ' . $conn->error]));
}

$stmt->bind_param($paramTypes, ...$params);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['Message' => 'Your information has been successfully updated!']);
    } else {
        echo json_encode (['Message' => 'No changes were made.']);
    }
} else {
    echo json_encode(['Message' => 'Error: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>