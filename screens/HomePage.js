import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Button,
  ImageBackground,
  Modal,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import tailwind from "tailwind-rn";
import { Switch } from "react-native-elements";
import { getRandomKwh } from "../fakeserver/test";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { convertHMS } from "../utils/helpers.js";
import IonIcons from "react-native-vector-icons/Ionicons";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
let { width, height } = Dimensions.get("window");
export default HomePage = () => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [status, setStatus] = useState(false);
  const [kwh, setKwh] = useState(0.0);
  const [totalBill, setTotalBill] = useState(0.0);
  const [startTime, setStartTime] = useState(0);
  const [elasped, setElasped] = useState(0);

  const [interval, setIntVal] = React.useState(null);
  const [timeInterval, setTimeInterval] = useState(null);
  const [modal, setModal] = useState(false);

  function startTimer() {
    let start = new Date().getTime();
    setStartTime(start);
    let old = kwh;
    var it = setInterval(function () {
      let newKwh = getRandomKwh(old);
      old = newKwh;

      setKwh(newKwh.toFixed(2));
    }, 60000); //every 1 minutes
    setIntVal(it);
    var tv = setInterval(function () {
      let now = new Date().getTime();
      let m = (now - start) / 1000;
      setElasped(m);
      if (m >= 28800) {
        //time more then 8 hours
        clearInterval(timeInterval);
        clearInterval(interval);
        resetAll();
      }
    }, 1000);
    setTimeInterval(tv);
  }

  function resetAll() {
    clearInterval(interval);
    clearInterval(timeInterval);
    setKwh(0.0);
    setStatus(false);
    setTotalBill((elasped / 60 / 60) * 2.25); //2.25 per hours
  }

  function getHour() {
    let t = convertHMS(elasped);
    return t.split(":")[0];
  }

  function getMinutes() {
    let t = convertHMS(elasped);
    return t.split(":")[1];
  }

  function getSeconds() {
    let t = convertHMS(elasped);
    return t.split(":")[2];
  }

  const switched = async (value) => {
    setStatus(value);
    if (value == true) {
      await sendPushNotification(
        expoPushToken,
        "Device Status",
        "Device started successfully."
      );
      setTotalBill(0);
      setElasped(0);
      startTimer();
    } else {
      resetAll();

      await sendPushNotification(
        expoPushToken,
        "Device Status",
        "Device Sopped."
      );
      setModal(true);
    }
  };

  useEffect(() => {
    //mounted state
    let mount = true;
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      mount = false; //unmounted
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const TimerUi = () => {
    return (
      <View
        style={tailwind(
          "flex items-center flex-row border-2 py-3 border-white justify-center mt-4 "
        )}
      >
        <View
          style={tailwind(
            "h-16 w-16  flex items-center justify-center  bg-yellow-400"
          )}
        >
          <Text
            style={[
              tailwind(" text-2xl "),
              { fontFamily: "TimerFont", fontSize: 40 },
            ]}
          >
            {getHour()}
          </Text>
        </View>

        <Text
          style={[
            tailwind("px-2  text-2xl"),
            { fontFamily: "TimerFont", fontSize: 40 },
          ]}
        >
          :
        </Text>
        <View
          style={tailwind(
            "h-16 w-16  flex items-center justify-center  bg-yellow-400"
          )}
        >
          <Text
            style={[
              tailwind(" text-2xl "),
              { fontFamily: "TimerFont", fontSize: 40 },
            ]}
          >
            {getMinutes()}
          </Text>
        </View>
        <Text
          style={[
            tailwind("px-2  text-2xl"),
            { fontFamily: "TimerFont", fontSize: 40 },
          ]}
        >
          :
        </Text>
        <View
          style={tailwind(
            "h-16 w-16  flex items-center justify-center  bg-yellow-400"
          )}
        >
          <Text
            style={[
              tailwind(" text-2xl "),
              { fontFamily: "TimerFont", fontSize: 40 },
            ]}
          >
            {getSeconds()}
          </Text>
        </View>
      </View>
    );
  };

  const Header = () => {
    return (
      <View style={styles.header}>
        <Text style={[styles.headerLogo, { fontFamily: "nunitobold" }]}>
          LOGO
        </Text>
        {/* <ImageBackground
          source={require("../assets/logo.png")}
          style={{ height: 60, width: 200 }}
          resizeMode="contain"
        /> */}
        <Switch
          value={status}
          color={"rgba(59, 130, 246,0.99)"}
          onValueChange={switched}
        />
      </View>
    );
  };
  const TotalModal = () => {
    return (
      <Modal visible={modal} animationType="slide" transparent={false}>
        <View>
          <View
            style={tailwind(
              "flex py-3 px-3 flex-row items-center justify-between"
            )}
          >
            <Text></Text>
            <TouchableOpacity
              onPress={() => {
                setElasped(0);
                setModal(false);
              }}
            >
              <IonIcons name={"close"} size={24} color={"gray"} />
            </TouchableOpacity>
          </View>

          <View style={tailwind("my-2")}>
            <Text
              style={[
                tailwind("text-xl text-center"),
                { fontFamily: "nunitobold" },
              ]}
            >
              Total Bill
            </Text>
          </View>

          <View style={tailwind("relative")}>
            <View
              style={[tailwind("bg-blue-200 mt-16"), { height: height - 120 }]}
            >
              <View
                style={[
                  tailwind(
                    "absolute -top-14 h-32 w-full flex items-center justify-center "
                  ),
                ]}
              >
                <View
                  style={[
                    tailwind(
                      "bg-yellow-500 h-full flex items-center justify-center"
                    ),
                    { width: width - 40, elevation: 4 },
                  ]}
                >
                  <Text
                    style={[
                      tailwind("text-center text-white"),
                      { fontFamily: "nunitosemibold" },
                    ]}
                  >
                    Total Amount
                  </Text>
                  <Text
                    style={[
                      tailwind("text-center text-white"),
                      { fontFamily: "nunitobold", fontSize: 42 },
                    ]}
                  >
                    ₹ {totalBill.toFixed(4)}
                  </Text>
                </View>
              </View>

              <View style={tailwind("mt-28 px-3")}>
                <Text
                  style={[
                    tailwind("text-center "),
                    {
                      fontFamily: "nunitobold",
                      fontSize: 17,
                      textDecorationStyle: "solid",
                      textDecorationLine: "underline",
                    },
                  ]}
                >
                  Summary{" "}
                </Text>
                <View
                  style={[
                    tailwind(
                      "border-b border-gray-200  mt-3 flex flex-row justify-between py-3"
                    ),
                  ]}
                >
                  <Text style={[tailwind(""), { fontFamily: "nunitobold" }]}>
                    {" "}
                    Consumption Time{" "}
                  </Text>
                  <Text style={[tailwind(""), { fontFamily: "nunitobold" }]}>
                    {" "}
                    {convertHMS(elasped)}
                  </Text>
                </View>
                <View
                  style={[
                    tailwind(
                      "border-b border-gray-200  mt-3 flex flex-row justify-between py-3"
                    ),
                  ]}
                >
                  <Text style={[tailwind(""), { fontFamily: "nunitobold" }]}>
                    Amount Calculation
                  </Text>
                  <Text style={[tailwind(""), { fontFamily: "nunitobold" }]}>
                    {(elasped / 60 / 60).toFixed(3) + "* 2.25" + "/hr"}
                  </Text>
                </View>
                <View style={tailwind("h-10")}></View>
                <Button
                  title={"Continue"}
                  color={"orange"}
                  onPress={() => {
                    setElasped(0);
                    setModal(false);
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView>
      <StatusBar />
      {/* <Button title={"show modal"} onPress={() => setModal(true)} /> */}
      <ImageBackground
        style={tailwind("w-full h-full bg-opacity-50")}
        source={require("../assets/bg.jpg")}
        resizeMode="cover"
      >
        <View style={tailwind("bg-white bg-opacity-90")}>
          <Header />
          <View style={tailwind("px-4 mt-3 h-full w-full ")}>
            <View style={styles.rowOne}>
              <Text
                style={[tailwind(" text-lg"), { fontFamily: "nunitosemibold" }]}
              >
                Device Status :
              </Text>
              <Text
                style={[
                  tailwind("font-semibold text-lg"),
                  { fontFamily: "nunitosemibold" },
                ]}
              >
                {status ? "On" : "Off"}
              </Text>
            </View>

            <View style={tailwind("my-3  ")}>
              <Text
                style={[tailwind("text-lg "), { fontFamily: "nunitosemibold" }]}
              >
                Power Consumption{" "}
              </Text>
              <View style={tailwind("flex flex-row justify-center mt-3 ")}>
                <Text
                  style={[
                    tailwind(
                      "text-lg p-3 border-2 border-blue-500 text-blue-500 border-dotted "
                    ),
                    { fontFamily: "nunitobold" },
                  ]}
                >
                  {kwh + "KWH"}
                </Text>
              </View>
            </View>
            <TimerUi />
            <View style={tailwind("hidden")}>
              <Text style={tailwind("font-bold text-lg text-gray-500")}>
                Total Bill
              </Text>
              <View style={[styles.total, { width: "100%" }]}>
                <Text
                  style={tailwind(
                    "text-2xl font-bold text-gray-100 text-center"
                  )}
                >
                  ₹ {totalBill}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
      <TotalModal />
    </SafeAreaView>
  );
};

let styles = StyleSheet.create({
  header: tailwind(
    "flex flex-row items-center justify-between bg-transparent px-4 border-b border-gray-300 py-3"
  ),
  headerLogo: tailwind(" text-lg text-blue-600"),
  rowOne: tailwind("flex flex-row items-center justify-between "),
  rowTwoText: {
    fontWeight: "700",
    fontSize: 25,
  },
  total: tailwind("flex py-4 px-5 rounded bg-blue-500 bg-opacity-90 mt-2"),
});

// Can use this function below, OR use Expo's Push Notification Tool-> https://expo.dev/notifications
async function sendPushNotification(expoPushToken, title = null, body = null) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: title || "Original Title",
    body: body || "And here is the body!",
    data: {},
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}
