import { StatusBar } from "expo-status-bar";
import React from "react";
import { Button, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as Font from "expo-font";
// import useFonts hook
import { useFonts } from "@use-expo/font";
const Stack = createNativeStackNavigator();

import HomePage from "./screens/HomePage";

const customFonts = {
  TimerFont: require("./assets/fonts/digital-7(mono).ttf"),
  nunitobold: require("./assets/fonts/Nunito-Bold.ttf"),
  nunitoregular: require("./assets/fonts/Nunito-Regular.ttf"),
  nunitosemibold: require("./assets/fonts/Nunito-SemiBold.ttf"),
};
export default function App() {
  const [isLoaded] = useFonts(customFonts);

  if (!isLoaded) {
    return <Text>Loading... </Text>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomePage">
        <Stack.Screen
          name="HomePage"
          component={HomePage}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
