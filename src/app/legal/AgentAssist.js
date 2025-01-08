import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const agentHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FarmNamin Agent Assist Program</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 16px;
            background-color: #ffffff;
            text-align: left;
        }
        h1 {
            font-size: 24px;
            margin-top: 16px;
            margin-bottom: 40px;
            text-align: center; 
        }
        h2 {
            font-size: 16px;
            margin-top: 16px;
        }
        p, li {
            font-size: 14px;
            line-height: 1.6;
            margin: 8px 0;
        }
        ul {
            padding-left: 20px;
            margin: 8px 0;
        }
        strong {
            font-weight: bold;
        }
        a {
            color: #4CAF50;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        @media only screen and (max-width: 600px) {
            h1 {
                font-size: 20px;
            }
            h2 {
                font-size: 16px;
            }
            p, li {
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <h1>Agent Assist Program</h1>
    <p><strong>Welcome to the FarmNamin Agent Assist Program!</strong></p>
    <p><strong>What is Agent Assist?</strong> The Agent Assist Program is designed to bridge the gap for traditional farmers who want to post their products online but lack a smartphone. We're here to help you access the FarmNamin marketplace easily, ensuring your products reach more buyers.</p>
    <h2>Purpose:</h2>
    <ul>
        <li><strong>Empower Traditional Farmers:</strong> Provide a way for farmers without smartphones to participate in the digital marketplace.</li>
        <li><strong>Expand Market Reach:</strong> Help farmers reach a wider audience and increase their sales.</li>
        <li><strong>Support and Guidance:</strong> Offer personalized assistance to ensure a smooth and efficient process.</li>
    </ul>
    <h2>How the Agent Assist Program Works:</h2>
    <h2>1. Contact Us:</h2>
    <ul>
        <li><strong>Phone:</strong> You can call us at +63 936 393 2523. Our team is ready to assist you.</li>
        <li><strong>Email:</strong> You can also send us an email at support@transfarmers.com.</li>
    </ul>
    <h2>2. Email Guidelines:</h2>
    <ul>
        <li><strong>Subject:</strong> Use the subject line “Registration”.</li>
        <li><strong>Content:</strong> Include your basic information such as name, contact number, and the purpose of why you want to join this program.</li>
    </ul>
    <h2>3. Verification Process:</h2>
    <ul>
        <li><strong>Interview:</strong> Our team will text or email you to schedule a brief interview to verify your details and guide you through the process. This interview can be conducted face-to-face at your place to ensure all your queries are addressed.</li>
    </ul>
    <h2>4. Account Management:</h2>
    <ul>
        <li><strong>Username and Password:</strong> Once verified, you'll receive a unique username and password for your FarmNamin account.</li>
        <li><strong>Agent Support:</strong> Your dedicated agent will manage your account, handle postings, and communicate with buyers on your behalf.</li>
        <li><strong>Product Listings:</strong> The agent will take photos of your products and list them for sale on the marketplace.</li>
        <li><strong>Regular Updates:</strong> You can access your account anytime to monitor sales and updates. Your agent will ensure you are informed of all activities .</li>
        <li><strong>Compliance:</strong> Agents adhere to strict policies to maintain integrity and trust. They will never misuse your information or account.</li>
    </ul>
    <h2>Important Note:</h2>
    <ul>
        <li><strong>Contact Number:</strong> Your contact number is crucial for effective communication between you and your agent. If you change your contact number, please inform your agent immediately to update your account. The agent will keep you informed via text or call about your products and any important updates. This ensures an efficient and effective experience.</li>
    </ul>
    <h2>Contact Information:</h2>
    <ul>
        <li><strong>Phone:</strong> <a>+63 936 393 2523</a></li>
        <li><strong>Email:</strong> <a href="mailto:maserin.jamesdavid000.com">support@transfarmers.com</a>.</li>
        <li><strong>Office Hours:</strong> Monday to Friday, 9 AM to 5 PM</li>
    </ul>
    <p>We're committed to making technology accessible to all farmers, helping you thrive in the digital marketplace. Reach out to us, and let’s get your products online!</p>
</body>
</html>
`;

export default function AgentAssist() {
  const webviewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [showWebView, setShowWebView] = useState(false);
  const navigation = useNavigation();

  const goBack = () => {
    navigation.goBack();
  };

  const reload = () => {
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
  };

  const onShouldStartLoadWithRequest = (request) => {
    if (request.url.startsWith("mailto:")) {
      Linking.openURL("mailto:maserin.jamesdavid000@gmail.com");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setShowWebView(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden={false} />
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Ionicons name="arrow-back" size={30} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={reload}>
          <Ionicons name="reload" size={30} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : showWebView ? (
        <WebView
          ref={webviewRef}
          originWhitelist={["*"]}
          source={{ html: agentHtml }}
          style={styles.webView}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    height: 50,
    backgroundColor: "#fff",
    zIndex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  webView: {
    flex: 1,
  },
});
