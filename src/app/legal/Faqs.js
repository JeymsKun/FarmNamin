import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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
          <span>What payment methods are accepted?</span>
        </div>
        <div class="faq-answer" id="answer-1">
          <ul>
            <li>Payment methods may vary by farmer. Please confirm with the farmer directly regarding accepted payment options.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(2)">
        <div class="faq-question">
          <span id="arrow-2" class="arrow">▼</span>
          <span>Can farmers set their own prices?</span>
        </div>
        <div class="faq-answer" id="answer-2">
          <ul>
            <li>Yes, farmers have the freedom to set their own prices for the products they list on the marketplace. It depends on the farmers if they choose to base their prices on the market rates.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(3)">
        <div class="faq-question">
          <span id="arrow-3" class="arrow">▼</span>
          <span>How can consumers find products on FarmNamin?</span>
        </div>
        <div class="faq-answer" id="answer-3">
          <ul>
            <li>Consumers can find products on FarmNamin by navigating to the 'Marketplace' tab. There, they can browse and search for the products available.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(4)">
        <div class="faq-question">
          <span id="arrow-4" class="arrow">▼</span>
          <span>How do I contact a farmer directly?</span>
        </div>
        <div class="faq-answer" id="answer-4">
          <ul>
            <li>Each product listing includes the farmer's contact number, allowing consumers to reach out directly for inquiries or purchases.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(5)">
        <div class="faq-question">
          <span id="arrow-5" class="arrow">▼</span>
          <span>What types of products can I find on FarmNamin?</span>
        </div>
        <div class="faq-answer" id="answer-5">
          <ul>
            <li>You can find a variety of products, including fruits, vegetables, dairy, grains, and other farm-fresh items.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(6)">
        <div class="faq-question">
          <span id="arrow-6" class="arrow">▼</span>
          <span>Can I return products if I am not satisfied?</span>
        </div>
        <div class="faq-answer" id="answer-6">
          <ul>
            <li>Return policies are determined by individual farmers. Please discuss return options directly with the farmer before purchasing. Please read the terms and conditions.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(7)">
        <div class="faq-question">
          <span id="arrow-7" class="arrow">▼</span>
          <span>How can I report a problem with a listing?</span>
        </div>
        <div class="faq-answer" id="answer-7">
          <ul>
            <li>If you encounter any issues with a listing, please contact our support team through the provided contact email or contact number, and we will investigate the matter.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(8)">
        <div class="faq-question">
          <span id="arrow-8" class="arrow">▼</span>
          <span>Can I leave a review for a farmer?</span>
        </div>
        <div class="faq-answer" id="answer-8">
          <ul>
            <li>Yes, consumers can leave reviews and ratings for farmers based on their experience with the products and service.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(9)">
        <div class="faq-question">
          <span id="arrow-9" class="arrow">▼</span>
          <span>Can I list my farm products if I am not a registered farmer?</span>
        </div>
        <div class="faq-answer" id="answer-9">
          <ul>
            <li>Only registered farmers can list products on FarmNamin to ensure quality and authenticity.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(10)">
        <div class="faq-question">
          <span id="arrow-10" class="arrow">▼</span>
          <span>What should I do if I forget my password?</span>
        </div>
        <div class="faq-answer" id="answer-10">
          <ul>
            <li>If you forget your password, you can reset it by clicking on the "Forgot Password" link on the login page.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(11)">
        <div class="faq-question">
          <span id="arrow-11" class="arrow">▼</span>
          <span>Why can't I log into my account?</span>
        </div>
        <div class="faq-answer" id="answer-11">
          <ul>
            <li>If you're unable to log in, double-check your username and password. If you've forgotten your password, use the "Forgot Password" link to reset it.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(12)">
        <div class="faq-question">
          <span id="arrow-12" class="arrow">▼</span>
          <span>Why is my product listing not appearing?</span>
        </div>
        <div class="faq-answer" id="answer-12">
          <ul>
            <li>If your product listing is not showing, it may be due to a submission error. Please check for any missing information and try resubmitting. Additionally, please reload the app or check your internet connection.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(13)">
        <div class="faq-question">
          <span id="arrow-13" class="arrow">▼</span>
          <span>Why are my search results not relevant?</span>
        </div>
        <div class="faq-answer" id="answer-13">
          <ul>
            <li>If the search function is not returning relevant results, try refining your search terms or checking your internet connection.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(14)">
        <div class="faq-question">
          <span id="arrow-14" class="arrow">▼</span>
          <span>What should I do if the farmer's contact number is missing?</span>
        </div>
        <div class="faq-answer" id="answer-14">
          <ul>
            <li>If you notice a missing contact number, please report the issue to our support team so we can rectify it.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(15)">
        <div class="faq-question">
          <span id="arrow-15" class="arrow">▼</span>
          <span>What can I do if the app crashes?</span>
        </div>
        <div class="faq-answer" id="answer-15">
          <ul>
            <li>If the app crashes, try restarting it or reinstalling it. If the problem continues, please report it to our support team.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(16)">
        <div class="faq-question">
          <span id="arrow-16" class="arrow">▼</span>
          <span>Why is the app not working on my device?</span>
        </div>
        <div class="faq-answer" id="answer-16">
          <ul>
            <li>The app may have compatibility issues with certain devices or operating systems. Please check for updates or try reinstalling the app.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(17)">
        <div class="faq-question">
          <span id="arrow-17" class="arrow">▼</span>
          <span>Why did you choose the name FarmNamin?</span>
        </div>
        <div class="faq-answer" id="answer-17">
          <ul>
            <li>The name "FarmNamin" combines "Farm" and "Namin," which signifies a connection between farmers and consumers, emphasizing the marketplace aspect of our platform.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(18)">
        <div class="faq-question">
          <span id="arrow-18" class="arrow">▼</span>
          <span>What does FarmNamin mean?</span>
        </div>
        <div class="faq-answer" id="answer-18">
          <ul>
            <li>FarmNamin represents a community-driven marketplace where farmers can showcase their products, and consumers can access fresh, locally sourced goods.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(19)">
        <div class="faq-question">
          <span id="arrow-19" class="arrow">▼</span>
          <span>What is the purpose of FarmNamin?</span>
        </div>
        <div class="faq-answer" id="answer-19">
          <ul>
            <li>The primary purpose of FarmNamin is to bridge the gap between farmers and consumers, promoting direct sales and supporting local agriculture.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(20)">
        <div class="faq-question">
          <span id="arrow-20" class="arrow">▼</span>
          <span>What are the main goals of FarmNamin?</span>
        </div>
        <div class="faq-answer" id="answer-20">
          <ul>
            <li>Our main goals include empowering farmers, providing consumers with access to fresh produce, and fostering sustainable agricultural practices.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(21)">
        <div class="faq-question">
          <span id="arrow-21" class="arrow">▼</span>
          <span>Is FarmNamin breaking the middlemen?</span>
        </div>
        <div class="faq-answer" id="answer-21">
          <ul>
            <li>No, FarmNamin does not break the middlemen; rather, it provides farmers with an option to sell their products online using modern smartphone technology, allowing them to reach consumers directly.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(22)">
        <div class="faq-question">
          <span id="arrow-22" class="arrow">▼</span>
          <span>Why is it important to provide farmers with the option to sell online?</span>
        </div>
        <div class="faq-answer" id="answer-22">
          <ul>
            <li>Providing farmers with the option to sell online empowers them to access a broader market, increase their sales potential, and connect directly with consumers, enhancing their business opportunities.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(23)">
        <div class="faq-question">
          <span id="arrow-23" class="arrow">▼</span>
          <span>How does FarmNamin facilitate direct sales between farmers and consumers?</span>
        </div>
        <div class="faq-answer" id="answer-23">
          <ul>
            <li>FarmNamin offers a platform where farmers can list their products, and consumers can browse and contact them directly, utilizing technology to streamline the buying process.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(24)">
        <div class="faq-question">
          <span id="arrow-24" class="arrow">▼</span>
          <span>Why should consumers consider buying directly from farmers?</span>
        </div>
        <div class="faq-answer" id="answer-24">
          <ul>
            <li>Consumers benefit from fresher products, potentially lower prices, and the opportunity to support local agriculture when they buy directly from farmers.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(25)">
        <div class="faq-question">
          <span id="arrow-25" class="arrow">▼</span>
          <span>How does offering an online selling option impact product pricing?</span>
        </div>
        <div class="faq-answer" id="answer-25">
          <ul>
            <li>By allowing farmers to sell online, they can set their own prices, which may lead to more competitive pricing for consumers while ensuring fair compensation for the farmers.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(26)">
        <div class="faq-question">
          <span id="arrow-26" class="arrow">▼</span>
          <span>Why might some farmers still choose to work with middlemen?</span>
        </div>
        <div class="faq-answer" id="answer-26">
          <ul>
            <li>Some farmers may prefer to work with middlemen for convenience, as they handle logistics, marketing, and distribution, allowing farmers to focus on production without the added responsibilities of direct sales.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(27)">
        <div class="faq-question">
          <span id="arrow-27" class="arrow">▼</span>
          <span>What are the benefits of using FarmNamin for farmers who want to sell online?</span>
        </div>
        <div class="faq-answer" id="answer-27">
          <ul>
            <li>Farmers can reach a wider audience, increase their sales opportunities, and have more control over their pricing and marketing strategies by using FarmNamin.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(28)">
        <div class="faq-question">
          <span id="arrow-28" class="arrow">▼</span>
          <span>Can farmers still sell through traditional channels while using FarmNamin?</span>
        </div>
        <div class="faq-answer" id="answer-28">
          <ul>
            <li>Yes, farmers can continue to sell through traditional channels while also utilizing FarmNamin to expand their market reach and diversify their sales strategies.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(29)">
        <div class="faq-question">
          <span id="arrow-29" class="arrow">▼</span>
          <span>How does FarmNamin support farmers in transitioning to online sales?</span>
        </div>
        <div class="faq-answer" id="answer-29">
          <ul>
            <li>FarmNamin provides resources, guidance, and a user-friendly platform to help farmers navigate the process of selling their products online effectively.</li>
          </ul>
        </div>
      </div>

      <div class="faq-item" onclick="toggleAnswer(30)">
        <div class="faq-question">
          <span id="arrow-30" class="arrow">▼</span>
          <span>Why is it beneficial for farmers to embrace modern technology?</span>
        </div>
        <div class="faq-answer" id="answer-30">
          <ul>
            <li>Embracing modern technology allows farmers to streamline their operations, improve marketing efforts, and enhance customer engagement, ultimately leading to increased sales.</li>
          </ul>
        </div>
      </div>
      <!-- Add more FAQs as needed -->
    </div>
  </body>
  </html>
`;

const AboutUs = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showWebView, setShowWebView] = useState(false);
  const webviewRef = useRef(null);

  const goBack = () => {
    router.back();
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
    backgroundColor: "#f5f5f5",
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

export default AboutUs;
