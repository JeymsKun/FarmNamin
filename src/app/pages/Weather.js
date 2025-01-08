import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Image,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { WEATHER_API_KEY, WEATHER_API_URL } from "@env";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Picker } from "@react-native-picker/picker";
import useAuth from "../hooks/useAuth";
import { useRouter } from "expo-router";
import axios from "axios";

const { width } = Dimensions.get("window");

const MINDANAO_LOCATIONS = [
  "Cagayan de Oro",
  "Davao City",
  "General Santos",
  "Iligan City",
  "Butuan City",
  "Zamboanga City",
  "Surigao City",
  "Cotabato City",
  "Pagadian City",
  "Dipolog City",
  "Koronadal",
];

const WeatherScreeen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState(MINDANAO_LOCATIONS[0]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showInfoMessageAlert, setShowInfoMessageAlert] = useState(false);
  const [showInfoMessageGuide, setShowInfoMessageGuide] = useState(false);

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [router]);

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInfoMessageAlert(false);
      setShowInfoMessageGuide(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [showInfoMessageAlert, showInfoMessageGuide]);

  const handlePress = (url, text) => {
    const queryParams = new URLSearchParams({
      link: url,
      title: text,
    }).toString();

    router.push(`/support/WebBrowser?${queryParams}`);
  };

  const fetchWeather = useCallback(async () => {
    if (!location) return Console.log("Error", "Please select a location.");

    const formattedLocation = `${location}, Philippines`;
    setLoading(true);
    try {
      const response = await axios.get(WEATHER_API_URL, {
        params: {
          q: formattedLocation,
          appid: WEATHER_API_KEY,
          units: "metric",
        },
      });

      if (response.status === 200) {
        setWeather(response.data);
        checkAlerts(response.data);
      } else {
        console.log("Error", "Failed to fetch weather data.");
      }
    } catch (error) {
      console.error(
        "Error fetching weather data:",
        error.response?.data || error.message
      );
      console.log(
        "Error",
        error.response?.data?.message || "Failed to fetch weather data."
      );
    } finally {
      setLoading(false);
    }
  }, [location]);

  const checkAlerts = (data) => {
    const { weather, main } = data;
    const alertCondition = weather[0].main;

    if (alertCondition === "Rain" || main.temp < 10) {
      console.log(
        "Weather Alert",
        "Heavy rain or cold weather detected. Take necessary precautions!"
      );
    }
  };

  const getTemperatureStatus = (temp) => {
    if (temp < 10 || temp > 30) {
      return "Bad";
    }
    return "Good";
  };

  const BulletText = ({ text, style, styleThunderstorm }) => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={styles.bullet}>•</Text>
      <Text style={[styles.guideText, style, styleThunderstorm]}> {text}</Text>
    </View>
  );

  const BulletLink = ({ text, url, stylePagasa }) => (
    <TouchableOpacity onPress={() => handlePress(url, text)}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={styles.bullet}>• </Text>
        <Text style={[styles.linkText, stylePagasa]}>{text}</Text>
      </View>
    </TouchableOpacity>
  );

  const getHumidityStyle = (humidity) => {
    if (humidity < 30 || humidity > 72) {
      return { color: "red" };
    }
    return { color: "#FFEB3B" };
  };

  const getWindSpeedStyle = (windSpeed) => {
    if (windSpeed > 30) {
      return { color: "red" };
    }
    return { color: "#FFEB3B" };
  };

  const getConditionStyle = (condition) => {
    if (
      condition === "Thunderstorm" ||
      condition === "Rain" ||
      condition === "Fog"
    ) {
      return { color: "red" };
    }
    return { color: "#FFEB3B" };
  };

  const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      return "Good Morning";
    } else if (currentHour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  const getDynamicGreeting = () => {
    const timeGreeting = getTimeBasedGreeting();

    if (!weather) {
      return `${timeGreeting}, Jojo! Stay prepared for any weather today.`;
    }

    const condition = weather.weather[0].main;
    const temperature = weather.main.temp;
    const location = weather.name;

    let weatherDescription = "";

    if (condition === "Rain") {
      weatherDescription = "It's raining outside. Don't forget your umbrella!";
    } else if (condition === "Clear") {
      weatherDescription = "It's a sunny day. Perfect for outdoor activities!";
    } else if (condition === "Clouds") {
      weatherDescription = "It's a bit cloudy. Enjoy the cool weather!";
    } else if (condition === "Thunderstorm") {
      weatherDescription = "Stormy weather ahead. Stay safe indoors!";
    } else {
      weatherDescription = `Current temperature is ${temperature}°C in ${location}.`;
    }

    return `${timeGreeting}, ${
      user?.first_name.trim() || "User"
    }! ${weatherDescription}`;
  };

  return (
    <ScrollView style={styles.container} scrollEventThrottle={16}>
      <StatusBar hidden={false} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>
            Hello, {user?.first_name.trim() || "User"}!
          </Text>
        </View>
        <View style={styles.headerGreet}>
          <Text style={styles.headerTitleTextGreet}>
            {getDynamicGreeting()}
          </Text>
        </View>
      </View>

      {/* Weather Container */}
      <View style={styles.weatherContainer}>
        <View style={styles.rowWeather}>
          <Text style={styles.titleWeather}>Farmer's Weather Alerts</Text>
          <TouchableOpacity
            onPress={() => setShowInfoMessageAlert((prev) => !prev)}
          >
            <AntDesign name="questioncircleo" size={14} color="black" />
          </TouchableOpacity>
          {showInfoMessageAlert && (
            <View style={styles.infoMessage}>
              <Text style={styles.infoText}>
                Weather alerts notify you of adverse weather like heavy rain,
                storms, or extreme heat.
              </Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={30} color="#4CAF50" />
          </View>
        ) : weather ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weather in {weather.name}</Text>
            <View style={styles.weatherInfo}>
              <Image
                source={{
                  uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`,
                }}
                style={styles.icon}
              />
              <View style={styles.weatherDetails}>
                <Text style={styles.label}>Temperature:</Text>
                <Text style={styles.temperature}>
                  {weather.main.temp} °C -{" "}
                  {getTemperatureStatus(weather.main.temp)}
                </Text>
                <Text style={styles.condition}>
                  Condition:{" "}
                  <Text style={getConditionStyle(weather.weather[0].main)}>
                    {weather.weather[0].description}
                  </Text>
                </Text>
                <Text style={styles.label}>Humidity:</Text>
                <Text
                  style={[
                    styles.humidity,
                    getHumidityStyle(weather.main.humidity),
                  ]}
                >
                  {weather.main.humidity}%
                </Text>
                <Text style={styles.label}>Wind Speed:</Text>
                <Text
                  style={[
                    styles.windSpeed,
                    getWindSpeedStyle(weather.wind.speed),
                  ]}
                >
                  {weather.wind.speed} m/s
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={location}
            onValueChange={(itemValue) => {
              setLocation(itemValue);
              fetchWeather();
            }}
          >
            {MINDANAO_LOCATIONS.map((loc) => (
              <Picker.Item key={loc} label={loc} value={loc} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Weather Condition Guide Container */}
      <View style={styles.weatherGuideContainer}>
        <View style={styles.rowWeather}>
          <Text style={styles.titleWeather}>Weather Condition Guide</Text>
          <TouchableOpacity
            onPress={() => setShowInfoMessageGuide((prev) => !prev)}
          >
            <AntDesign name="questioncircleo" size={14} color="black" />
          </TouchableOpacity>
          {showInfoMessageGuide && (
            <View style={styles.infoMessage}>
              <Text style={styles.infoText}>
                Learn about weather conditions and their impact on agriculture.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.guideContainer}>
          <View style={styles.temperatureWrapper}>
            <Text style={styles.titleGuide}>Temperature</Text>
            <Text style={[styles.guideText, { fontSize: 12 }]}>
              Good Measurement: Range: 15°C to 30°C
            </Text>
            <Text style={[styles.guideText, { fontSize: 12 }]}>
              Bad Measurement: Below 10°C or Above 30°C
            </Text>
          </View>

          <View style={styles.conditionWrapper}>
            <Text style={styles.titleGuide}>Condition</Text>
            <Text style={styles.titleCondition}>Clear Sky:</Text>
            <BulletText text="No clouds, full sunshine." />
            <Text style={styles.titleCondition}>Few Clouds:</Text>
            <BulletText text="Generally good weather." />
            <Text style={styles.titleCondition}>Scattered Clouds:</Text>
            <BulletText text="Good growing conditions." />
            <Text style={styles.titleCondition}>Overcast Clouds:</Text>
            <BulletText
              text="Reduced sunlight: may affect photosynthesis."
              style={{ fontSize: 13 }}
            />
            <Text style={styles.titleCondition}>Light Rain:</Text>
            <BulletText text="Generally beneficial for crops" />
            <Text style={styles.titleCondition}>Rain:</Text>
            <BulletText text="Good for crops if not excessive." />
            <Text style={styles.titleCondition}>Thunderstorm:</Text>
            <BulletText
              text="Potential damage from strong winds and heavy rain."
              styleThunderstorm={{ fontSize: 12 }}
            />
            <Text style={styles.titleCondition}>Mist:</Text>
            <BulletText text="Can affect field activities." />
            <Text style={styles.titleCondition}>Fog:</Text>
            <BulletText text="Similar to mist." />
          </View>

          <View style={styles.humidityWrapper}>
            <Text style={styles.titleGuide}>Humidity</Text>
            <Text style={[styles.guideText, { fontSize: 12 }]}>
              Good Measurement Range: 40% to 60%
            </Text>
            <Text style={[styles.guideText, { fontSize: 12 }]}>
              Bad Measurement Range: Below 30% or Above 72%
            </Text>
          </View>

          <View style={styles.windSpeedWrapper}>
            <Text style={styles.titleGuide}>Wind Speed</Text>
            <Text style={[styles.guideText, { fontSize: 12 }]}>
              Good Measurement Range: 5 km/h to 15 km/h
            </Text>
            <Text style={[styles.guideText, { fontSize: 12 }]}>
              Bad Measurement Range: Above 30 km/h
            </Text>
          </View>
        </View>

        {/*More Information */}
        <View style={styles.informationContainer}>
          <Text style={styles.titleInformation}>For more information?</Text>

          <View style={styles.wrapperInformation}>
            <Text style={styles.titleGuide}>PAGASA</Text>
            <BulletLink
              text="Climate Impact Assessment for Philippines Agriculture: "
              stylePagasa={{ fontSize: 12 }}
              url="https://www.pagasa.dost.gov.ph/agri-weather/impact-assessment-for-agriculture?form=MG0AV3"
            />
            <Text style={styles.titleGuide}>World Bank</Text>
            <BulletLink
              text="Climate-Resilient Agriculture in the Philippines: "
              url="https://climateknowledgeportal.worldbank.org/country/philippines?form=MG0AV3"
            />
            <Text style={styles.titleGuide}>World Food Programme</Text>
            <BulletLink
              text="Climate Change and Food Security Analysis: "
              url="https://www.wfp.org/news/wfp-study-provides-first-ever-look-links-between-climate-change-and-food-security-philippines?form=MG0AV3"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  headerTitle: {
    marginBottom: 1,
  },
  headerTitleText: {
    fontSize: 14,
    fontFamily: "regular",
  },
  headerGreet: {
    marginTop: 1,
  },
  headerTitleTextGreet: {
    fontSize: 12,
    fontFamily: "regular",
  },
  weatherContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  rowWeather: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 5,
  },
  titleWeather: {
    fontSize: 15,
    fontFamily: "bold",
  },
  pickerContainer: {
    marginTop: 20,
    height: 50,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 10,
    borderColor: "#ccc",
    elevation: 2,
    overflow: "hidden",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: "auto",
  },
  card: {
    marginTop: 10,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    height: "auto",
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "medium",
    marginBottom: 10,
  },
  weatherInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherDetails: {
    marginLeft: 20,
  },
  temperature: {
    fontSize: 24,
    fontFamily: "bold",
    color: "#2196F3",
  },
  condition: {
    fontSize: 14,
    fontFamily: "regular",
    marginVertical: 5,
    color: "#828282",
  },
  label: {
    fontSize: 12,
    fontFamily: "regular",
  },
  humidity: {
    fontSize: 12,
    fontFamily: "bold",
  },
  windSpeed: {
    fontSize: 12,
    fontFamily: "bold",
  },
  icon: {
    width: 100,
    height: 100,
  },
  weatherGuideContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  guideContainer: {
    marginTop: 10,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  temperatureWrapper: {
    padding: 10,
  },
  conditionWrapper: {
    padding: 10,
  },
  humidityWrapper: {
    padding: 10,
  },
  windSpeedWrapper: {
    padding: 10,
  },
  titleGuide: {
    fontSize: 14,
    fontFamily: "medium",
  },
  titleCondition: {
    fontSize: 13,
    fontFamily: "regular",
  },
  guideText: {
    color: "#666666",
    fontFamily: "regular",
  },
  bullet: {
    color: "black",
    fontFamily: "regular",
  },
  linkText: {
    color: "#2196F3",
    textDecorationLine: "underline",
    fontFamily: "regular",
  },
  informationContainer: {
    paddingVertical: 30,
  },
  titleInformation: {
    fontSize: 15,
    fontFamily: "medium",
  },
  wrapperInformation: {
    marginTop: 10,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  infoMessage: {
    position: "absolute",
    top: 20,
    left: 10,
    width: 250,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    zIndex: 10,
    elevation: 5,
  },
  infoText: {
    fontSize: 12,
    color: "#333",
    fontFamily: "regular",
  },
});

export default WeatherScreeen;
