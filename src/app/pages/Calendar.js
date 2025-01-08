import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import PlantingData from "../data/PlantingData";
import Feather from "@expo/vector-icons/Feather";
import { useFocusEffect } from "@react-navigation/native";
import { format, parseISO } from "date-fns";
import { Calendar } from "react-native-calendars";
import RNPickerSelect from "react-native-picker-select";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import useAuth from "../hooks/useAuth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import checkAndDeleteExpiredSchedules from "../utils/checkAndDeleteExpiredSchedules";
import fetchSchedules from "../utils/fetchSchedules";
import deleteSchedule from "../utils/deleteSchedule";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import useRealTimeUpdates from "../hooks/useRealTimeUpdates";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const CalendarScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [month, setMonth] = useState("January");
  const [year, setYear] = useState("2024");
  const [selectedDateCalendar, setSelectedDateCalendar] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const queryClient = useQueryClient();
  const [selectedSchedule, setSelectedSchedule] = useState(null);

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

  useRealTimeUpdates(user?.id_user);

  const { data: selectedSchedules = [], refetch } = useQuery({
    queryKey: ["schedules", user?.id_user],
    queryFn: () => fetchSchedules(user.id_user),
    enabled: !!user,
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries(["schedules", user?.id_user]);
    },
  });

  useEffect(() => {
    if (selectedSchedules.length > 0) {
      checkAndDeleteExpiredSchedules(selectedSchedules);
    }
  }, [selectedSchedules]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        refetch();
      }
    }, [user])
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthNumbers = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const onMonthChange = (value) => {
    setMonth(value);
  };

  const onYearChange = (value) => {
    setYear(value);
  };

  const philippineEvents = [
    { dateEvent: "2024-01-01", descriptionEvent: "New Year's Day" },
    {
      dateEvent: "2024-02-25",
      descriptionEvent: "EDSA People Power Revolution Anniversary",
    },
    {
      dateEvent: "2024-04-09",
      descriptionEvent: "Araw ng Kagitingan (Day of Valor)",
    },
    { dateEvent: "2024-06-12", descriptionEvent: "Independence Day" },
    { dateEvent: "2024-08-21", descriptionEvent: "Ninoy Aquino Day" },
    { dateEvent: "2024-08-26", descriptionEvent: "National Heroes Day" },
    { dateEvent: "2024-11-30", descriptionEvent: "Bonifacio Day" },
    { dateEvent: "2024-12-25", descriptionEvent: "Christmas Day" },
    { dateEvent: "2024-12-30", descriptionEvent: "Rizal Day" },
    { dateEvent: "2025-01-01", descriptionEvent: "New Year's Day" },
    {
      dateEvent: "2025-02-25",
      descriptionEvent: "EDSA People Power Revolution Anniversary",
    },
    {
      dateEvent: "2025-04-09",
      descriptionEvent: "Araw ng Kagitingan (Day of Valor)",
    },
    { dateEvent: "2025-06-12", descriptionEvent: "Independence Day" },
    { dateEvent: "2025-08-21", descriptionEvent: "Ninoy Aquino Day" },
    { dateEvent: "2025-08-26", descriptionEvent: "National Heroes Day" },
    { dateEvent: "2025-11-30", descriptionEvent: "Bonifacio Day" },
    { dateEvent: "2025-12-25", descriptionEvent: "Christmas Day" },
    { dateEvent: "2025-12-30", descriptionEvent: "Rizal Day" },
  ];

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const date = parseISO(`1970-01-01T${timeString}`);
    return format(date, "h:mm a");
  };

  const onDayPress = (day) => {
    const selectedDate = day.dateString;
    setSelectedDateCalendar(selectedDate);

    const schedule = selectedSchedules.find(
      (schedule) => schedule.date === selectedDate
    );

    if (schedule) {
      setSelectedSchedule(schedule);
      return;
    }

    const philippineEvent = philippineEvents.find(
      (event) => event.dateEvent === selectedDate
    );

    setSelectedSchedule(
      philippineEvent ? { ...philippineEvent, time: null } : null
    );
  };

  const onShowCalendar = () => {
    setShowCalendar(false);
    setTimeout(() => setShowCalendar(true), 0);
  };

  const markedDates = selectedSchedules.reduce((acc, schedule) => {
    acc[schedule.date] = {
      selected: true,
      marked: true,
      selectedDayBackgroundColor: "#4CAF50",
      description: schedule.description,
      time: schedule.time || "",
    };
    return acc;
  }, {});

  philippineEvents.forEach((event) => {
    if (!markedDates[event.dateEvent]) {
      markedDates[event.dateEvent] = {
        marked: true,
        dotColor: "#FF5733",
        descriptionEvent: event.descriptionEvent,
      };
    }
  });

  const handleDelete = async (scheduleId) => {
    if (!scheduleId) return;
    deleteScheduleMutation.mutate(scheduleId);
  };

  const SwipeableItem = ({ schedule }) => {
    const translateX = useSharedValue(0);
    const SWIPE_THRESHOLD = 50;
    const MAX_SWIPE = 150;

    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        translateX.value = Math.min(Math.max(0, event.translationX), MAX_SWIPE);
      })
      .onEnd(() => {
        if (translateX.value > SWIPE_THRESHOLD) {
          translateX.value = withSpring(MAX_SWIPE);
        } else {
          translateX.value = withSpring(0);
        }
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: -translateX.value }],
    }));

    const calculateFontSize = (text) => {
      if (text.length <= 40) {
        return 14;
      } else if (text.length <= 80) {
        return 11;
      } else {
        return 9;
      }
    };

    return (
      <View style={styles.swipeableContainer}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.swipeableItem, animatedStyle]}>
            <View style={styles.scheduleItem}>
              <View style={styles.descriptionRow}>
                <Text
                  style={[
                    styles.productDescriptionText,
                    { fontSize: calculateFontSize(schedule.description) },
                  ]}
                >
                  {schedule.description}
                </Text>
              </View>

              <View style={styles.detailLine} />
              <View style={styles.dateTimeRow}>
                <Text style={styles.details}>
                  {format(new Date(schedule.date), "MMMM dd, yyyy")}
                </Text>

                {schedule.start_time && schedule.end_time ? (
                  <Text style={styles.details}>
                    {`${formatTime(schedule.start_time)} - ${formatTime(
                      schedule.end_time
                    )}`}
                  </Text>
                ) : schedule.start_time ? (
                  <Text style={styles.details}>
                    {`${formatTime(schedule.start_time)}`}
                  </Text>
                ) : null}
              </View>
            </View>

            <Animated.View style={[styles.deleteButton]}>
              <TouchableOpacity onPress={() => handleDelete(schedule.id)}>
                <MaterialIcons name="delete" size={24} color="white" />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    );
  };

  const today = new Date();
  const formattedDate = format(today, "EEEE!, MMMM dd, yyyy");

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      scrollEventThrottle={16}
    >
      <StatusBar hidden={false} />
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>
            Hello, {user?.first_name.trim() || "User"}!
          </Text>
        </View>
        <View style={styles.headerGreet}>
          <Text style={styles.headerTitleText}>Today is {formattedDate}</Text>
        </View>
      </View>

      <View style={styles.carouselSection}>
        <View style={styles.titleContainer}>
          <View style={styles.title}>
            <Text style={styles.titleText}>Planting Calendar</Text>
          </View>
          <View style={styles.title}>
            <Text style={styles.titleTextBy}>by Department of Agriculture</Text>
          </View>
        </View>

        <Carousel
          loop
          autoPlay
          autoPlayInterval={4000}
          width={width}
          height={width * 0.5}
          data={PlantingData}
          scrollAnimationDuration={1000}
          onSnapToItem={(index) => setActiveIndex(index)}
          renderItem={({ item }) => (
            <View style={styles.carouselItem}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.carouselImage}
                resizeMode="contain"
              />
            </View>
          )}
        />

        <View style={styles.dotContainer}>
          {PlantingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    activeIndex === index ? "#4AF146" : "#4CAF50",
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.scheduleContainer}>
        <Text style={styles.scheduleText}>Your Schedule</Text>

        {selectedSchedules.length > 0 ? (
          selectedSchedules.map((schedule, index) => (
            <SwipeableItem
              key={index}
              schedule={schedule}
              handleDelete={handleDelete}
            />
          ))
        ) : (
          <View style={styles.noSchedulesContainer}>
            <Text style={styles.noSchedulesText}>No schedules available.</Text>
          </View>
        )}

        <View style={styles.line} />
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.titleCalendar}>
          <Text style={styles.textCalendar}>Calendar</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={onMonthChange}
              items={months.map((monthName) => ({
                label: monthName,
                value: monthName,
              }))}
              value={month}
            />
          </View>

          <View style={styles.pickerWrapper}>
            <RNPickerSelect
              onValueChange={onYearChange}
              items={[...Array(3000 - 2025 + 1)].map((_, index) => ({
                label: String(2025 + index),
                value: String(2025 + index),
              }))}
              value={year}
            />
          </View>

          <TouchableOpacity
            style={styles.showCalendarButton}
            onPress={onShowCalendar}
          >
            <Text style={styles.showCalendarText}>Show Calendar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.placeholderContainer}>
          {!showCalendar ? (
            <Text style={styles.placeholderText}>
              Calendar will appear here.
            </Text>
          ) : (
            <Calendar
              current={`${year}-${monthNumbers[month]}-01`}
              minDate={"2025-01-01"}
              maxDate={"3000-12-31"}
              onDayPress={onDayPress}
              markedDates={markedDates}
              style={styles.calendar}
              theme={{
                calendarBackground: "transparent",
                selectedDayBackgroundColor: "#4CAF50",
                selectedDayTextColor: "white",
                todayTextColor: "#4CAF50",
                dayTextColor: "black",
                textDisabledColor: "#585858",
                arrowColor: "#4CAF50",
                monthTextColor: "black",
                textSectionTitleColor: "#585858",
                textDayFontFamily: "regular",
                textMonthFontFamily: "medium",
                textDayHeaderFontFamily: "regular",
                textDayFontSize: 11,
                textMonthFontSize: 12,
                textDayHeaderFontSize: 12,
                dotColor: "transparent",
                selectedDotColor: "transparent",
                "stylesheet.day.basic": {
                  base: {
                    marginBottom: -10,
                    borderRadius: 25,
                    width: 20,
                    height: 20,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                },
              }}
            />
          )}
        </View>

        <View style={styles.placeholderResult}>
          {showCalendar && selectedSchedule ? (
            <View style={styles.wrapperScheduleCalendar}>
              {selectedSchedule.descriptionEvent ? null : (
                <View style={styles.rowSelectedDate}>
                  <Text style={styles.selectedDateCalendar}>
                    You have selected date for the schedule. Please review it.
                  </Text>
                </View>
              )}
              <View style={styles.rowScheduleDetails}>
                {selectedSchedule.descriptionEvent ? null : (
                  <>
                    <Icon name="bell" size={18} color="#4CAF50" />
                    <Text style={styles.scheduleDetails}>
                      {format(
                        new Date(selectedSchedule.date),
                        "EEEE, MMMM dd, yyyy"
                      )}
                    </Text>
                  </>
                )}

                {selectedSchedule.start_time && selectedSchedule.end_time ? (
                  <Text style={styles.scheduleDetails}>
                    {`  ${formatTime(
                      selectedSchedule.start_time
                    )} - ${formatTime(selectedSchedule.end_time)}`}
                  </Text>
                ) : selectedSchedule.start_time ? (
                  <Text style={styles.scheduleDetails}>
                    {`  ${formatTime(selectedSchedule.start_time)}`}
                  </Text>
                ) : null}

                {selectedSchedule.descriptionEvent && (
                  <Text style={styles.scheduleEventDetails}>
                    This date is marked for event:
                    <Text style={styles.scheduleEventName}>
                      {" "}
                      {selectedSchedule.descriptionEvent}
                    </Text>
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.rowPlaceholder}>
              <Text style={styles.placeholderScheduleText}>
                No schedule or event selected for this date.
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.createScheduleButton}
          onPress={() => router.push("/pages/Schedule")}
        >
          <Text style={styles.doneText}>Create Schedule</Text>
          <Feather name="arrow-right" size={30} color="#28B805" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
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
    fontSize: 13,
    fontFamily: "regular",
  },
  headerGreet: {
    marginTop: 1,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  titleText: {
    fontSize: 15,
    fontFamily: "medium",
    textAlign: "center",
    marginBottom: 0,
  },
  titleTextBy: {
    fontSize: 9,
    color: "#4CAF50",
    fontFamily: "medium",
    textAlign: "center",
    marginTop: -5,
  },
  carouselSection: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  carouselItem: {
    width: width,
    height: width * 0.5,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  textContainer: {
    position: "absolute",
    left: 10,
    bottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  dot: {
    margin: 3,
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
  scheduleContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  scheduleText: {
    fontSize: 14,
    fontFamily: "medium",
  },
  noSchedulesContainer: {
    padding: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  noSchedulesText: {
    fontSize: 14,
    color: "black",
    fontFamily: "regular",
    textAlign: "center",
  },
  swipeableContainer: {
    marginBottom: 10,
    overflow: "hidden",
  },
  swipeableItem: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  scheduleItem: {
    backgroundColor: "#4CAF50",
    padding: 20,
    borderRadius: 10,
    flex: 1,
  },
  descriptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  productDescriptionText: {
    fontSize: 16,
    color: "white",
    fontFamily: "regular",
  },
  detailLine: {
    marginVertical: 10,
    width: "100%",
    height: 3,
    backgroundColor: "white",
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  details: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "medium",
  },
  deleteButton: {
    position: "absolute",
    top: 0,
    right: -60,
    width: 60,
    height: "100%",
    backgroundColor: "#D32F2F",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    zIndex: 2,
  },
  line: {
    marginTop: 10,
    borderBottomWidth: 5,
    borderColor: "#4CAF50",
    borderRadius: 5,
    width: "100%",
    marginVertical: 10,
  },
  calendarContainer: {
    padding: 20,
  },
  titleCalendar: {
    marginBottom: 10,
    alignItems: "flex-start",
  },
  textCalendar: {
    fontSize: 14,
    fontFamily: "medium",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  pickerWrapper: {
    width: "33%",
    borderRadius: 20,
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
    height: 35,
  },
  showCalendarButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  showCalendarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "medium",
  },
  placeholderContainer: {
    backgroundColor: "#D9D9D9",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    width: "100%",
    marginBottom: 10,
    height: "auto",
    minHeight: 300,
  },
  placeholderResult: {
    backgroundColor: "#D9D9D9",
    padding: 10,
    justifyContent: "center",
    borderRadius: 10,
    width: "100%",
    marginTop: 10,
    height: 100,
  },
  wrapperScheduleCalendar: {
    margin: 5,
  },
  rowSelectedDate: {
    alignItems: "center",
    paddingVertical: 5,
  },
  selectedDateCalendar: {
    fontSize: 11,
    fontFamily: "regular",
    color: "#000",
  },
  rowScheduleDetails: {
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
  },
  scheduleDetails: {
    fontSize: 12,
    fontFamily: "regular",
    color: "#585858",
  },
  scheduleEventDetails: {
    fontSize: 12,
    fontFamily: "regular",
    color: "#000",
  },
  scheduleEventName: {
    fontSize: 12,
    fontFamily: "bold",
    color: "#4CAF50",
  },
  rowPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  placeholderScheduleText: {
    fontSize: 14,
    fontFamily: "regular",
    color: "#585858",
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: "regular",
    color: "#585858",
  },
  calendar: {
    width: "100%",
    marginBottom: 20,
  },
  createScheduleButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 5,
    marginTop: 50,
  },
  doneText: {
    padding: 5,
    fontSize: 14,
    color: "#28B805",
    fontFamily: "bold",
  },
});

export default CalendarScreen;
