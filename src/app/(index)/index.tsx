import { ScrollView, Text, Pressable, View } from "react-native";
import { useEffect, useState } from "react";
import * as Bluetooth from "../../../modules/bluetooth";
import type { BluetoothDevice, BluetoothState } from "../../../modules/bluetooth";
import AC from "@bacons/apple-colors";

export default function IndexRoute() {
  const [bluetoothState, setBluetoothState] = useState<BluetoothState>("unknown");
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);

  useEffect(() => {
    const state = Bluetooth.getBluetoothState();
    setBluetoothState(state);

    const stateSubscription = Bluetooth.addBluetoothStateChangedListener((event) => {
      setBluetoothState(event.state);
    });

    const deviceSubscription = Bluetooth.addDeviceFoundListener((device) => {
      setDevices((prev) => {
        const existing = prev.find((d) => d.id === device.id);
        if (existing) {
          return prev.map((d) => (d.id === device.id ? device : d));
        }
        return [...prev, device];
      });
    });

    return () => {
      stateSubscription.remove();
      deviceSubscription.remove();
    };
  }, []);

  const handleStartScanning = async () => {
    try {
      setDevices([]);
      await Bluetooth.startScanning();
      setIsScanning(true);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleStopScanning = () => {
    Bluetooth.stopScanning();
    setIsScanning(false);
  };

  const getStateColor = () => {
    switch (bluetoothState) {
      case "poweredOn":
        return AC.systemGreen;
      case "poweredOff":
        return AC.systemRed;
      case "unauthorized":
        return AC.systemOrange;
      default:
        return AC.systemGray;
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{
        flex: 1,
      }}
    >
      <View style={{ padding: 16, gap: 16 }}>
        <View
          style={{
            padding: 16,
            backgroundColor: AC.secondarySystemBackground as any,
            borderRadius: 12,
            borderCurve: "continuous",
            gap: 8,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "600",
              color: AC.label as any,
            }}
          >
            Bluetooth Status
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: getStateColor() as any,
              }}
            />
            <Text
              style={{
                fontSize: 15,
                color: AC.secondaryLabel as any,
              }}
            >
              {bluetoothState}
            </Text>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Pressable
            onPress={isScanning ? handleStopScanning : handleStartScanning}
            disabled={bluetoothState !== "poweredOn"}
            style={({ pressed }) => ({
              padding: 16,
              backgroundColor:
                bluetoothState !== "poweredOn"
                  ? (AC.systemGray5 as any)
                  : pressed
                  ? (AC.systemBlue as any)
                  : (AC.systemBlue as any),
              borderRadius: 12,
              borderCurve: "continuous",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: bluetoothState !== "poweredOn" ? (AC.systemGray as any) : "white",
                textAlign: "center",
              }}
            >
              {isScanning ? "Stop Scanning" : "Start Scanning"}
            </Text>
          </Pressable>
        </View>

        {devices.length > 0 && (
          <View style={{ gap: 12 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: AC.label as any,
              }}
            >
              Devices Found ({devices.length})
            </Text>

            {devices.map((device) => (
              <View
                key={device.id}
                style={{
                  padding: 16,
                  backgroundColor: AC.secondarySystemBackground as any,
                  borderRadius: 12,
                  borderCurve: "continuous",
                  gap: 4,
                }}
              >
                <Text
                  selectable
                  style={{
                    fontSize: 17,
                    fontWeight: "500",
                    color: AC.label as any,
                  }}
                >
                  {device.name}
                </Text>
                <Text
                  selectable
                  style={{
                    fontSize: 13,
                    color: AC.secondaryLabel as any,
                    fontFamily: "monospace",
                  }}
                >
                  {device.id}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: AC.tertiaryLabel as any,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  RSSI: {device.rssi} dBm
                </Text>
              </View>
            ))}
          </View>
        )}

        {isScanning && devices.length === 0 && (
          <View
            style={{
              padding: 32,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                color: AC.secondaryLabel as any,
                textAlign: "center",
              }}
            >
              Scanning for devices...
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
