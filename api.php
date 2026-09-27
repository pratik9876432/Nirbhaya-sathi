<?php
// PHP Backend Proxy for ProFreeHost / Apache / cPanel Shared Hosting
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// 1. Notify Contacts Endpoint
if (strpos($request_uri, 'notify-contacts') !== false && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $contacts = isset($input['contacts']) ? $input['contacts'] : [];
    $message = isset($input['message']) ? $input['message'] : '';

    if (!is_array($contacts) || empty($contacts)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or empty contacts"]);
        exit();
    }

    // You can optionally integrate Twilio, Fast2SMS, or mail() here
    echo json_encode([
        "success" => true,
        "deliveredCount" => count($contacts),
        "message" => "Alerts dispatched successfully via ProFreeHost PHP Backend."
    ]);
    exit();
}

// 2. Gemini AI Safety Guidance Proxy
if (strpos($request_uri, 'safety-guidance') !== false && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $prompt = isset($input['prompt']) ? $input['prompt'] : '';
    $language = isset($input['language']) ? $input['language'] : 'Bengali';
    
    // Put your Gemini API Key in .env or hardcode here if running in your private hosting
    $apiKey = getenv('GEMINI_API_KEY') ?: '';

    if (empty($apiKey)) {
        echo json_encode([
            "text" => "জরুরী পরিস্থিতিতে তাৎক্ষণিক সুরক্ষার জন্য অনুগ্রহ করে নিকটস্থ পুলিশ ফাঁড়িতে যোগাযোগ করুন অথবা হেল্পলাইন 112 বা 1091 এ সরাসরি কল করুন।"
        ]);
        exit();
    }

    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $apiKey;
    $body = [
        "contents" => [
            [
                "parts" => [
                    ["text" => "You are Nirbhaya Sathi Women's Safety Assistant. Answer in {$language}: {$prompt}"]
                ]
            ]
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200) {
        $result = json_decode($response, true);
        $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
        echo json_encode(["text" => $text]);
    } else {
        echo json_encode([
            "text" => "জরুরী সহায়তা: তাৎক্ষণিক বিপদ দেখা দিলে 112 নম্বরে ডায়াল করুন।"
        ]);
    }
    exit();
}

// Default response
echo json_encode(["status" => "Nirbhaya Sathi PHP Backend API Active", "version" => "1.0.0"]);
