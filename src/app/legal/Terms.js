import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const termsHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Terms and Conditions</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
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
  <h1>Terms and Conditions</h1>
  <h2>Welcome to FarmNamin!</h2>
  <p>These terms and conditions outline the rules and regulations for the use of the FarmNamin application. By accessing this application, we assume you accept these terms and conditions in full. Do not continue to use FarmNamin if you do not accept all the terms and conditions stated on this page.</p>
  <h2>1. Overview</h2>
  <p>FarmNamin is an online marketplace where farmers can list and sell their products. Consumers can browse, purchase, and contact farmers directly through the mobile platform.</p>
  <h2>2. Account Registration</h2>
  <p>To use FarmNamin, you must create an account. You agree to provide accurate and complete information during the registration process and to keep this information up to date. You are responsible for maintaining the confidentiality of your account information and password.</p>
  <h2>3. Selling Products</h2>
  <p>Farmers can list their products on FarmNamin. By listing a product, you represent and warrant that:</p>
  <ul>
    <li>You have the right to sell the product.</li>
    <li>The product is accurately described.</li>
    <li>The product complies with all applicable laws and regulations.</li>
    <li>You will deliver the product as described and in a timely manner.</li>
  </ul>
  <h2>4. Purchasing Products</h2>
  <p>Consumers can purchase products listed by farmers. When you make a purchase, you agree to pay the price listed, plus any applicable taxes and shipping fees. All sales are final unless otherwise stated by the farmer.</p>
  <h2>5. Payment Options</h2>
  <p>Farmers can add their phone number for GCash payments or opt for direct contact. Consumers can choose their preferred payment method as provided by the farmer. FarmNamin is not responsible for any transaction issues between the farmer and the consumer.</p>
  <h2>6. Direct Contact</h2>
  <p>Farmers have the option to provide their contact details for direct communication with consumers. By choosing this option, you agree to handle all communications and transactions in a professional manner. FarmNamin does not monitor these communications and is not responsible for any disputes that arise.</p>
  <h2>7. User Conduct</h2>
  <p>You agree not to:</p>
  <ul>
    <li>Post false, inaccurate, misleading, or defamatory content.</li>
    <li>Use FarmNamin for any illegal or unauthorized purposes.</li>
    <li>Interfere with the security of the application or its users.</li>
    <li>Engage in fraudulent activities or transactions.</li>
  </ul>
  <h2>8. Limitation of Liability</h2>
  <p>FarmNamin is not liable for any damages that arise from the use of this application. This includes, but is not limited to, direct, indirect, incidental, or consequential damages. The service is provided "as is" and "as available" without any warranties of any kind, either express or implied.</p>
  <h2>9. Changes to the Terms</h2>
  <p>We reserve the right to make changes to these terms and conditions at any time. Your continued use of FarmNamin following any changes indicates your acceptance of the new terms. We will notify you of any significant changes through the application or via email.</p>
  <h2>10. Termination</h2>
  <p>We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the terms. All provisions of the terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
  <h2>Contact Us</h2>
  <p>If you have any questions or concerns about this privacy policy, please email us at 
    <a href="mailto:maserin.jamesdavid000@gmail.com">support@transfarmers.com</a>.
  </p>
</body>
</html>
`;

export default function App() {
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
          source={{ html: termsHtml }}
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
