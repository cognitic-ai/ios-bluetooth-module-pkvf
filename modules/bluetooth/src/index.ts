import { NativeModule, EventEmitter, Subscription } from "expo";

/**
 * Represents the current state of the device's Bluetooth adapter.
 */
export type BluetoothState =
  | "poweredOn"
  | "poweredOff"
  | "unsupported"
  | "unauthorized"
  | "resetting"
  | "unknown";

/**
 * Represents a discovered Bluetooth device.
 */
export type BluetoothDevice = {
  /** UUID of the device */
  id: string;
  /** Human-readable name of the device */
  name: string;
  /** Signal strength in dBm */
  rssi: number;
};

export type BluetoothStateChangeEvent = {
  state: BluetoothState;
};

export type BluetoothEvents = {
  onDeviceFound: (device: BluetoothDevice) => void;
  onBluetoothStateChanged: (event: BluetoothStateChangeEvent) => void;
};

declare class BluetoothModule extends NativeModule<BluetoothEvents> {
  /**
   * Get the current Bluetooth state.
   * @returns The current Bluetooth adapter state
   */
  getBluetoothState(): BluetoothState;

  /**
   * Start scanning for nearby Bluetooth devices.
   * @throws Error if Bluetooth is not powered on or already scanning
   */
  startScanning(): Promise<void>;

  /**
   * Stop scanning for Bluetooth devices.
   */
  stopScanning(): void;

  /**
   * Check if Bluetooth is available and powered on.
   * Only available when Bluetooth is supported on the device.
   * @platform iOS 13.0+
   */
  isBluetoothAvailable?: () => boolean;
}

const BluetoothNative =
  typeof expo !== "undefined"
    ? (expo.modules.Bluetooth as BluetoothModule)
    : ({} as BluetoothModule);

const emitter = new EventEmitter(BluetoothNative);

/**
 * Get the current Bluetooth adapter state.
 * @returns The current state of the Bluetooth adapter
 */
export function getBluetoothState(): BluetoothState {
  return BluetoothNative.getBluetoothState();
}

/**
 * Start scanning for nearby Bluetooth devices.
 * Emits `onDeviceFound` events as devices are discovered.
 * @throws Error if Bluetooth is not powered on or already scanning
 */
export async function startScanning(): Promise<void> {
  return await BluetoothNative.startScanning();
}

/**
 * Stop the active Bluetooth device scan.
 */
export function stopScanning(): void {
  BluetoothNative.stopScanning();
}

/**
 * Register a listener for discovered Bluetooth devices.
 * @param listener Callback invoked when a device is found
 * @returns Subscription object to remove the listener
 */
export function addDeviceFoundListener(
  listener: (device: BluetoothDevice) => void
): Subscription {
  return emitter.addListener("onDeviceFound", listener);
}

/**
 * Register a listener for Bluetooth state changes.
 * @param listener Callback invoked when Bluetooth state changes
 * @returns Subscription object to remove the listener
 */
export function addBluetoothStateChangedListener(
  listener: (event: BluetoothStateChangeEvent) => void
): Subscription {
  return emitter.addListener("onBluetoothStateChanged", listener);
}

/**
 * Check if Bluetooth is available and powered on.
 * Uses optional chaining for availability checking.
 * @returns true if Bluetooth is available and powered on, false otherwise
 * @example
 * if (isBluetoothAvailable?.()) {
 *   await startScanning();
 * }
 */
export const isBluetoothAvailable = BluetoothNative.isBluetoothAvailable;

export { BluetoothNative };
