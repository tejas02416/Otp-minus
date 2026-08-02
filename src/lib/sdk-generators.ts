export function getSdkCodeSnippet(
  language: string,
  apiKey: string = 'opt_live_9a8b7c6d5e4f3a2b1c',
  baseUrl: string = 'https://api.otpminus.io'
): { sendOtp: string; verifyOtp: string } {
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'js':
      return {
        sendOtp: `// Universal OTP JavaScript SDK
import { OtpClient } from '@otpminus/sdk';

const otp = new OtpClient({ apiKey: '${apiKey}' });

async function sendVerificationCode() {
  const response = await otp.send({
    recipient: '+15550192834',
    channel: 'sms', // 'sms' | 'email' | 'whatsapp' | 'voice'
    codeLength: 6,
    expiresInSeconds: 300,
  });

  console.log('OTP Request ID:', response.requestId);
  return response.requestId;
}`,
        verifyOtp: `// Verify OTP code
async function verifyUserCode(requestId, userEnteredCode) {
  const result = await otp.verify({
    requestId,
    code: userEnteredCode,
  });

  if (result.success) {
    console.log('Verification successful!');
  } else {
    console.error('Invalid OTP code:', result.reason);
  }
}`
      };

    case 'nodejs':
    case 'node':
      return {
        sendOtp: `// Node.js Backend Integration
const axios = require('axios');

async function sendOtp(recipient, channel = 'sms') {
  const response = await axios.post(
    '${baseUrl}/api/v1/otp/send',
    {
      recipient,
      channel,
      code_length: 6,
      expires_in_seconds: 300,
    },
    {
      headers: {
        'X-API-Key': '${apiKey}',
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}`,
        verifyOtp: `// Node.js Verify OTP
async function verifyOtp(requestId, code) {
  const response = await axios.post(
    '${baseUrl}/api/v1/otp/verify',
    {
      request_id: requestId,
      code: code,
    },
    {
      headers: {
        'X-API-Key': '${apiKey}',
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}`
      };

    case 'python':
      return {
        sendOtp: `# Python SDK Integration
import requests

API_KEY = "${apiKey}"
BASE_URL = "${baseUrl}"

def send_otp(recipient, channel="sms"):
    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "recipient": recipient,
        "channel": channel,
        "code_length": 6,
        "expires_in_seconds": 300
    }
    res = requests.post(f"{BASE_URL}/api/v1/otp/send", json=payload, headers=headers)
    return res.json()`,
        verifyOtp: `# Python Verify OTP
def verify_otp(request_id, code):
    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "request_id": request_id,
        "code": code
    }
    res = requests.post(f"{BASE_URL}/api/v1/otp/verify", json=payload, headers=headers)
    return res.json()`
      };

    case 'php':
      return {
        sendOtp: `<?php
// PHP cURL Integration
function sendOtp($recipient, $channel = 'sms') {
    $ch = curl_init('${baseUrl}/api/v1/otp/send');
    $payload = json_encode([
        'recipient' => $recipient,
        'channel' => $channel,
        'code_length' => 6,
        'expires_in_seconds' => 300
    ]);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-API-Key: ${apiKey}',
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}`,
        verifyOtp: `<?php
// PHP Verify OTP
function verifyOtp($requestId, $code) {
    $ch = curl_init('${baseUrl}/api/v1/otp/verify');
    $payload = json_encode([
        'request_id' => $requestId,
        'code' => $code
    ]);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-API-Key: ${apiKey}',
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}`
      };

    case 'java':
      return {
        sendOtp: `// Java 11+ HttpClient Integration
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class OtpService {
    private static final String API_KEY = "${apiKey}";
    private static final HttpClient client = HttpClient.newHttpClient();

    public static String sendOtp(String recipient) throws Exception {
        String json = "{\\"recipient\\":\\"" + recipient + "\\",\\"channel\\":\\"sms\\",\\"code_length\\":6}";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("${baseUrl}/api/v1/otp/send"))
                .header("X-API-Key", API_KEY)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }
}`,
        verifyOtp: `// Java Verify OTP
public static String verifyOtp(String requestId, String code) throws Exception {
    String json = "{\\"request_id\\":\\"" + requestId + "\\",\\"code\\":\\"" + code + "\\"}";
    HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${baseUrl}/api/v1/otp/verify"))
            .header("X-API-Key", API_KEY)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
    return response.body();
}`
      };

    case 'kotlin':
      return {
        sendOtp: `// Kotlin OkHttp Integration
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

val client = OkHttpClient()
val JSON = "application/json; charset=utf-8".toMediaType()

fun sendOtp(recipient: String) {
    const json = """
        {
            "recipient": "$recipient",
            "channel": "sms",
            "code_length": 6
        }
    """.trimIndent()

    val request = Request.Builder()
        .url("${baseUrl}/api/v1/otp/send")
        .addHeader("X-API-Key", "${apiKey}")
        .post(json.toRequestBody(JSON))
        .build()

    client.newCall(request).execute().use { response ->
        println(response.body?.string())
    }
}`,
        verifyOtp: `// Kotlin Verify OTP
fun verifyOtp(requestId: String, code: String) {
    val json = """
        {
            "request_id": "$requestId",
            "code": "$code"
        }
    """.trimIndent()

    val request = Request.Builder()
        .url("${baseUrl}/api/v1/otp/verify")
        .addHeader("X-API-Key", "${apiKey}")
        .post(json.toRequestBody(JSON))
        .build()

    client.newCall(request).execute().use { response ->
        println(response.body?.string())
    }
}`
      };

    case 'swift':
      return {
        sendOtp: `// Swift URLSession Integration
import Foundation

func sendOtp(recipient: String, completion: @escaping (String?) -> Void) {
    guard let url = URL(string: "${baseUrl}/api/v1/otp/send") else { return }
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.addValue("${apiKey}", forHTTPHeaderField: "X-API-Key")
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")

    let body: [String: Any] = ["recipient": recipient, "channel": "sms", "code_length": 6]
    request.httpBody = try? JSONSerialization.data(withJSONObject: body)

    URLSession.shared.dataTask(with: request) { data, response, error in
        guard let data = data else { return }
        print(String(data: data, encoding: .utf8) ?? "")
    }.resume()
}`,
        verifyOtp: `// Swift Verify OTP
func verifyOtp(requestId: String, code: String) {
    guard let url = URL(string: "${baseUrl}/api/v1/otp/verify") else { return }
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.addValue("${apiKey}", forHTTPHeaderField: "X-API-Key")
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")

    let body: [String: Any] = ["request_id": requestId, "code": code]
    request.httpBody = try? JSONSerialization.data(withJSONObject: body)

    URLSession.shared.dataTask(with: request) { data, response, error in
        guard let data = data else { return }
        print(String(data: data, encoding: .utf8) ?? "")
    }.resume()
}`
      };

    case 'flutter':
      return {
        sendOtp: `// Flutter / Dart Integration
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Map<String, dynamic>> sendOtp(String recipient) async {
  final url = Uri.parse('${baseUrl}/api/v1/otp/send');
  final response = await http.post(
    url,
    headers: {
      'X-API-Key': '${apiKey}',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'recipient': recipient,
      'channel': 'sms',
      'code_length': 6,
    }),
  );

  return jsonDecode(response.body);
}`,
        verifyOtp: `// Flutter Verify OTP
Future<Map<String, dynamic>> verifyOtp(String requestId, String code) async {
  final url = Uri.parse('${baseUrl}/api/v1/otp/verify');
  final response = await http.post(
    url,
    headers: {
      'X-API-Key': '${apiKey}',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'request_id': requestId,
      'code': code,
    }),
  );

  return jsonDecode(response.body);
}`
      };

    case 'react-native':
    default:
      return {
        sendOtp: `// React Native Integration
export async function sendOtp(recipient, channel = 'sms') {
  const response = await fetch('${baseUrl}/api/v1/otp/send', {
    method: 'POST',
    headers: {
      'X-API-Key': '${apiKey}',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipient,
      channel,
      code_length: 6,
      expires_in_seconds: 300,
    }),
  });

  return await response.json();
}`,
        verifyOtp: `// React Native Verify OTP
export async function verifyOtp(requestId, code) {
  const response = await fetch('${baseUrl}/api/v1/otp/verify', {
    method: 'POST',
    headers: {
      'X-API-Key': '${apiKey}',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request_id: requestId,
      code,
    }),
  });

  return await response.json();
}`
      };
  }
}
