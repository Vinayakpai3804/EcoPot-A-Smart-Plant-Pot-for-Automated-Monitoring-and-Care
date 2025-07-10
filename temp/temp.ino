#include <Wire.h>
#include <BH1750.h>
#include "DHT.h"
#include "ESP_I2S.h"
#include "BluetoothA2DPSink.h"
#include "RTClib.h"
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <WiFi.h>

// Wi-Fi credentials
const char* ssid = " ";
const char* wifi_password = " ";

// MQTT broker details
const char* mqtt_server = " ";
const int mqtt_port = ;
const char* mqtt_user = " ";
const char* mqtt_password = " ";

const char* moistureTopic = "plant/moisture";
const char* humidityTopic = "plant/humidity";
const char* airTopic = "plant/air";
const char* waterTopic = "plant/water";
const char* lightTopic = "plant/light";
const char* temperatureTopic = "plant/temperature";

// Create a WiFiClientSecure instance
WiFiClientSecure espClient;
PubSubClient client(espClient);

RTC_DS3231 rtc;
#define RELAY_PIN 27  // Define relay pin
// Set the target date and time to turn on the pump
const int targetYear = 2025;
const int targetMonth = 4;
const int targetDay = 2;
const int targetHour = 14;
const int targetMinute = 30;

const uint8_t I2S_SCK = 5;       /* Audio data bit clock */
const uint8_t I2S_WS = 25;       /* Audio data left and right clock */
const uint8_t I2S_SDOUT = 26;    /* ESP32 audio data output (to speakers) */
I2SClass i2s;
BluetoothA2DPSink a2dp_sink(i2s);

// Constants for gas calculation (Calibrate based on your environment)
#define MQ135_PIN 33        // Analog pin connected to the MQ135 sensor
#define RZERO 76.63  // Calibration value (change based on your calibration)
#define RL 10.0      // Load resistance in kΩ

#define SOIL_MOISTURE_PIN 34  // Analog pin connected to the sensor
// Replace these with your actual readings after calibration
#define AIR_VALUE 2600   // Analog value when sensor is in air (dry)
#define WATER_VALUE 1460  // Analog value when sensor is in water (wet)

BH1750 lightMeter;

#define DHTPIN 4       // D4 pin on ESP32
#define DHTTYPE DHT22  // Sensor type
DHT dht(DHTPIN, DHTTYPE);
// Number of samples to average
const int numSamples = 5;  

#define SENSOR_PIN 32       // GPIO32 for ADC input
#define NUM_SAMPLES 10      // Number of readings to average
#define NUM_SAMPLES2 10 

// Function to calculate resistance from raw analog value
float getSensorResistance(int raw_adc) {
  return ((4095.0 * RL) / raw_adc) - RL;
}
// Function to calculate gas concentration using log formula
float getGasPPM(float Rs, float Ro, float a, float b) {
  return pow(10, ((log10(Rs / Ro) - b) / a));
}

int readSensorAverage() {
  long sum = 0;
  for (int i = 0; i < NUM_SAMPLES2; i++) {
    sum += analogRead(SENSOR_PIN);
    delay(10);  // Small delay between samples for stability
  }
  return sum / NUM_SAMPLES;
}

void setup_wifi() {
  Serial.print("Connecting to Wi-Fi...");
  WiFi.begin(ssid, wifi_password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected!");
}

void reconnect() {
  espClient.setInsecure(); // TLS without cert
  while (!client.connected()) {
    Serial.print("Connecting to MQTT broker...");
    String clientId = "ESP32Client-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
      Serial.println("Connected!");
    } else {
      Serial.print("Failed. Error code: ");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}
 
void setup() {
  Serial.begin(115200);
  analogReadResolution(12);  // ESP32 ADC resolution (0-4095)
  Serial.println("🛠️ MQ135 Sensor Initialization...");

  Serial.println("🌱 Soil Moisture Sensor Calibration Started.");

  Wire.begin(21, 22);  // Initialize I2C on GPIO 21 (SDA) & 22 (SCL)
  delay(500);  // Small delay for I2C to stabilize
  if (!lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23)) {  
    Serial.println("Error initializing BH1750!");
    while (1);  // Stop execution if sensor not found
  }
  Serial.println("BH1750 initialized.");

  dht.begin();
  Serial.println("DHT22 Sensor Initialized with Averaging.");

  analogSetAttenuation(ADC_11db);          // Full range (up to ~3.3V)
  Serial.println("Water Level Sensor Initialized");

  i2s.setPins(I2S_SCK, I2S_WS, I2S_SDOUT);
  if (!i2s.begin(I2S_MODE_STD, 44100, I2S_DATA_BIT_WIDTH_16BIT, I2S_SLOT_MODE_STEREO, I2S_STD_SLOT_BOTH)) {
    Serial.println("Failed to initialize I2S!");
    while (1); // do nothing
  }
  a2dp_sink.start("MyMusic");

  if (!rtc.begin()) {
    Serial.println("Couldn't find RTC");
    while (1);
  }
  if (rtc.lostPower()) {
    Serial.println("RTC lost power, setting default time!");
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__))); // Set RTC to compile time
  }
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Relay off by default (active HIGH logic)
  
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
 
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  int waterLevel = readSensorAverage();
  String waterStatus = (waterLevel > 1700) ? "HIGH" : (waterLevel > 800) ? "HALFWAY" : "LOW";
  client.publish(waterTopic, waterStatus.c_str());

  float temperatureSum = 0;
  float humiditySum = 0;
  int validReadings = 0;

  for (int i = 0; i < numSamples; i++) {
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    if (!isnan(humidity) && !isnan(temperature)) {
      humiditySum += humidity;
      temperatureSum += temperature;
      validReadings++;
    }
    delay(500);
  }

  if (validReadings > 0) {
    float avgHumidity = humiditySum / validReadings;
    float avgTemperature = temperatureSum / validReadings;

    client.publish(temperatureTopic, String(avgTemperature).c_str());
    client.publish(humidityTopic, String(avgHumidity).c_str());
  } else {
    Serial.println("❌ Failed to read from DHT sensor!");
  }

  float lux = lightMeter.readLightLevel();
  String lightLevel;
  if (lux < 50) {
    lightLevel = "Low";
  } else if (lux <= 500) {
    lightLevel = "Medium";
  } else {
    lightLevel = "High";
  }
  client.publish(lightTopic, lightLevel.c_str());

  int sensorValue = analogRead(SOIL_MOISTURE_PIN);
  int moisturePercent = map(sensorValue, AIR_VALUE, WATER_VALUE, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);
  client.publish(moistureTopic, String(moisturePercent).c_str());

  int rawValue = analogRead(MQ135_PIN);
  float Rs = getSensorResistance(rawValue);
  float CO2 = getGasPPM(Rs, RZERO, -0.42, 1.92);
  float NH3 = getGasPPM(Rs, RZERO, -0.58, 1.83);
  float Benzene = getGasPPM(Rs, RZERO, -0.45, 2.18);
  float Alcohol = getGasPPM(Rs, RZERO, -0.52, 1.9);
  float CO = getGasPPM(Rs, RZERO, -0.48, 2.00);
  float NO2 = getGasPPM(Rs, RZERO, -0.50, 1.85);

  String airQuality;
  if (CO2 < 400 && NH3 < 0.5 && Benzene < 0.1 && CO < 5) {
    airQuality = "Good";
  } else if (CO2 < 1000 && NH3 < 1 && Benzene < 0.3 && CO < 10) {
    airQuality = "Neutral";
  } else {
    airQuality = "Bad";
  }
  client.publish(airTopic, airQuality.c_str());
 
    DateTime now = rtc.now();  // Get current time

    // Check if current time matches the target time
    if (now.year() == targetYear &&
        now.month() == targetMonth &&
        now.day() == targetDay &&
        now.hour() == targetHour &&
        now.minute() == targetMinute) {
        
        Serial.println("Turning ON water pump!");
        digitalWrite(RELAY_PIN, HIGH);  // Turn ON relay (motor ON)
        delay(5000);                   // Keep ON for 5 seconds
        digitalWrite(RELAY_PIN, LOW);   // Turn OFF relay (motor OFF)
        Serial.println("Turning OFF water pump!");
    }

  delay(10000);  // Update every second
}
