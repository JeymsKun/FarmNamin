import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, ActivityIndicator, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const privacyHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FarmNamin Privacy Policy</title>
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
    <h1>Privacy Policy</h1>
    <p><strong>FarmNamin Privacy Policy 1.0.0</strong></p>
    <p><strong>Effective Date:</strong> November 1, 2024</p>

    <h2>1. Introduction</h2>
    <p>Welcome to <strong>FarmNamin</strong>. We value your privacy and are committed to protecting your personal information. This privacy policy outlines how we collect, use, and safeguard your data when you use our application and services.</p>

    <h2>2. Information We Collect</h2>
    <ul>
        <li><strong>Personal Information:</strong> When you register, we collect information such as your name, email address, phone number, and payment details.</li>
        <li><strong>Usage Data:</strong> We collect information on how you interact with our application, including your browsing history, search queries, and transaction history.</li>
        <li><strong>Device Information:</strong> Information about your device, such as IP address, operating system, and browser type.</li>
    </ul>
    
    <h2>3. How We Use Your Information</h2>
    <ul>
        <li><strong>To Provide Services:</strong> We use your information to facilitate transactions, communicate with you, and provide customer support.</li>
        <li><strong>To Improve Our Services:</strong> We analyze usage data to improve our application and services.</li>
        <li><strong>For Marketing Purposes:</strong> With your consent, we may send you promotional materials and updates about FarmNamin.</li>
    </ul>

    <h2>4. Sharing Your Information</h2>
    <ul>
        <li><strong>With Service Providers:</strong> We may share your information with third-party service providers who assist us in providing our services.</li>
        <li><strong>For Legal Reasons:</strong> We may disclose your information if required by law or to protect the rights, property, or safety of FarmNamin, our users, or others.</li>
        <li><strong>With Your Consent:</strong> We will share your information when you have given us explicit consent to do so.</li>
    </ul>

    <h2>5. Security</h2>
    <p>We take the security of your data seriously and implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.</p>

    <h2>6. Your Rights</h2>
    <ul>
        <li><strong>Access and Correction:</strong> You have the right to access and correct your personal information.</li>
        <li><strong>Data Deletion:</strong> You can request the deletion of your personal data from our systems.</li>
        <li><strong>Opt-Out:</strong> You can opt out of receiving marketing communications from us at any time.</li>
    </ul>

    <h2>7. Changes to This Privacy Policy</h2>
    <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the effective date.</p>

    <h2>8. Contact Us</h2>
    <p>If you have any questions or concerns about this privacy policy, please email us at <a href="mailto:maserin.jamesdavid000.com">support@transfarmers.com</a>.</p>
</body>
</html>
`;


export default function PrivacyPolicy() {
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
      if (request.url.startsWith('mailto:')) {
        Linking.openURL('mailto:maserin.jamesdavid000@gmail.com'); 
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
          originWhitelist={['*']}
          source={{ html: privacyHtml }}
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
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    height: 50, 
    backgroundColor: '#fff',
    zIndex: 1, 
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    flex: 1,
  },
});