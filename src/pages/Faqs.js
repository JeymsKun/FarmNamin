import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity, Platform, StatusBar, SafeAreaView, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const faqsContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>FAQs</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 15px;
      }

      h1, h2 {
        text-align: center;
        color: #4CAF50;
      }

      .search-container {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 600px; 
        margin: 0 auto 20px; 
        border: 1px solid #4CAF50; 
        border-radius: 5px; 
        overflow: hidden; 
      }

      .search-bar {
        flex: 1; 
        padding: 12px 20px;
        font-size: 16px; 
        border: none; 
        outline: none;
      }

      .search-icon {
        padding: 10px; 
        color: #4CAF50; 
        cursor: pointer; 
      }

      .faq-container {
        margin-top: 20px;
      }

      .faq-item {
        cursor: pointer;
        margin-bottom: 10px;
      }

      .faq-question {
        font-size: 16px;
        color: #333;
        display: flex;
        align-items: center;
      }

      .arrow {
        margin-right: 10px;
        transition: transform 0.3s ease;
      }

      .rotated {
        transform: rotate(180deg);
      }

      .faq-answer {
        font-size: 14px;
        color: #555;
        display: none;
        margin-left: 20px;
      }

      .faq-answer.active {
        display: block;
      }

      .thumbs-container {
        display: none; 
        margin-top: 10px;
        align-items: center; 
      }

      .thumbs-container.active {
        display: flex; 
      }

      .thumbs-button {
        cursor: pointer;
        margin-right: 10px; 
        display: flex; 
        align-items: center; 
        font-size: 18px; 
      }

      .count {
        margin-left: 5px; 
        font-size: 12px; 
        font-weight: normal; 
      }
    </style>
    <script>
      let thumbsUpCount = 0;
      let thumbsDownCount = 0;

      function toggleAnswer(index) {
        var answer = document.getElementById('answer-' + index);
        var arrow = document.getElementById('arrow-' + index);
        var thumbs = document.getElementById('thumbs-' + index);
        answer.classList.toggle('active');
        arrow.classList.toggle('rotated');
        thumbs.classList.toggle('active'); 
      }

      function filterFAQs() {
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
          const questionText = item.querySelector('.faq-question').innerText.toLowerCase();
          if (questionText.includes(searchQuery)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      }

      function searchFAQs() {
        const searchInput = document.getElementById('searchInput');
        searchInput.focus();
        filterFAQs();
      }

      function incrementThumbsUp(event) {
        event.stopPropagation(); 
        thumbsUpCount++;
        document.getElementById('thumbsUpCount').innerText = thumbsUpCount;
      }

      function incrementThumbsDown(event) {
        event.stopPropagation(); 
        thumbsDownCount++;
        document.getElementById('thumbsDownCount').innerText = thumbsDownCount;
      }

      document.addEventListener('click', function(event) {
        const faqItems = document.querySelectorAll('.faq-item');
        let isFAQClicked = false;
        
        faqItems.forEach(item => {
          if (item.contains(event.target)) {
            isFAQClicked = true;
          }
        });
        
        if (!isFAQClicked) {
          const allAnswers = document.querySelectorAll('.faq-answer');
          allAnswers.forEach(ans => {
            ans.classList.remove('active');
            const otherArrow = ans.previousElementSibling.querySelector('.arrow');
            if (otherArrow) otherArrow.classList.remove('rotated');
                const thumbs = ans.querySelector('.thumbs-container');
            if (thumbs) thumbs.classList.remove('active'); 
          });
        }
      });
    </script>
  </head>
  <body>
    <h2>FAQs</h2>
    <div class="search-container">
      <input
        type="text"
        id="searchInput"
        placeholder="Search FAQs..."
        class="search-bar"
        onkeyup="filterFAQs()"
      />
      <span class="search-icon" onclick="searchFAQs()">🔍</span>
    </div>
    <div class="faq-container">
      <div class="faq-item" onclick="toggleAnswer(1)">
        <div class="faq-question">
          <span id="arrow-1" class="arrow">▼</span>
          <span>How do I contact a buyer/seller?</span>
        </div>
        <div class="faq-answer" id="answer-1">
          <ul>
            <li>You can contact a buyer or seller through the messaging feature on our platform.</li>
            Go to the user’s profile.
            Click on the ‘Message’ button to start a conversation</li>
          </ul>
          <div class="thumbs-container" id="thumbs-1">
            <span class="thumbs-button" onclick="incrementThumbsUp(event)">👍
              <span id="thumbsUpCount" class="count">0</span>
            </span> <!-- Thumbs up -->
            <span class="thumbs-button" onclick="incrementThumbsDown(event)">👎
              <span id="thumbsDownCount" class="count">0</span>
            </span> <!-- Thumbs down -->
          </div>
        </div>
      </div>
      <div class="faq-item" onclick="toggleAnswer(2)">
        <div class="faq-question">
          <span id="arrow-2" class="arrow">▼</span>
          <span>How do I contact a buyer/seller?</span>
        </div>
        <div class="faq-answer" id="answer-2">
          <ul>
            <li>You can contact a buyer or seller through the messaging feature on our platform.</li>
            Go to the user’s profile.
            Click on the ‘Message’ button to start a conversation</li>
          </ul>
          <div class="thumbs-container" id="thumbs-2">
            <span class="thumbs-button" onclick="incrementThumbsUp(event)">👍
              <span id="thumbsUpCount" class="count">0</span>
            </span> <!-- Thumbs up -->
            <span class="thumbs-button" onclick="incrementThumbsDown(event)">👎
              <span id="thumbsDownCount" class="count">0</span>
            </span> <!-- Thumbs down -->
          </div>
        </div>
      </div>
      <!-- Add more FAQs as needed -->
    </div>
  </body>
  </html>
`;

const AboutUs = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [showWebView, setShowWebView] = useState(false);
    const webviewRef = useRef(null);

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
            source={{ html: faqsContent }}
            style={styles.webView}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        />
      ) : null}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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

export default AboutUs;
