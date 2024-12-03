<?php
header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();  

$cn = mysqli_connect("localhost", "root", "", "farmnamin");

if (!$cn) {
    echo json_encode([
        "Message" => "Connection failed: " . mysqli_connect_error(),
        "Success" => false
    ]);
    exit();
}

$encodedData = file_get_contents('php://input');
$decodedData = json_decode($encodedData, true);

if (!$decodedData || !isset($decodedData['username']) || !isset($decodedData['password']) || !isset($decodedData['role'])) {
    echo json_encode([
        "Message" => "Invalid JSON input.",
        "Success" => false
    ]);
    exit();
}

$username = $decodedData['username'];
$password = $decodedData['password'];
$role = $decodedData['role']; 

$stmt = $cn->prepare("SELECT * FROM users WHERE username = ? AND role = ?");
$stmt->bind_param("ss", $username, $role);
$stmt->execute();
$result = $stmt->get_result();

if ($result && mysqli_num_rows($result) > 0) {
    $user = mysqli_fetch_assoc($result);
    
    if (password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id_user'];
        $_SESSION['role'] = $user['role']; 

        session_regenerate_id(true);

        $isInfoComplete = !is_null($user['first_name']) && !is_null($user['last_name']) && !is_null($user['birth_month']) && !is_null($user['birth_day']) && !is_null($user['birth_year']);

        if ($isInfoComplete) {
            $response = [
                "Message" => "Login successful!",
                "Success" => true,
                "id_user" => $user['id_user'],
                "role" => $user['role'],
                "isInfoComplete" => true 
            ];
        } else {
            $response = [
                "Message" => "Login successful, but your information is incomplete.",
                "Success" => true,
                "id_user" => $user['id_user'],
                "role" => $user['role'],
                "isInfoComplete" => false 
            ];
        }
    } else {
        $response = [
            "Message" => "Incorrect password.",
            "Success" => false,
        ];
    }
} else {
    $response = [
        "Message" => "Username not found or role mismatch.",
        "Success" => false,
    ];
}

echo json_encode($response);
$stmt->close();
mysqli_close($cn);
?>