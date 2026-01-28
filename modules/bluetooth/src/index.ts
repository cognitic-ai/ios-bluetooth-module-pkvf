import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

const BluetoothModule = NativeModulesProxy.Bluetooth;
const emitter = new EventEmitter(BluetoothModule);

export type BluetoothState = 'poweredOn' | 'poweredOff' | 'unsupported' | 'unauthorized' | 'resetting' | 'unknown';

export type BluetoothDevice = {
  id: string;
  name: string;
  rssi: number;
};

export type BluetoothStateChangeEvent = {
  state: BluetoothState;
};

export function isBluetoothAvailable(): boolean {
  return BluetoothModule.isBluetoothAvailable();
}

export function getBluetoothState(): BluetoothState {
  return BluetoothModule.getBluetoothState();
}

export async function startScanning(): Promise<boolean> {
  return await BluetoothModule.startScanning();
}

export function stopScanning(): void {
  BluetoothModule.stopScanning();
}

export function addDeviceFoundListener(listener: (device: BluetoothDevice) => void): Subscription {
  return emitter.addListener('onDeviceFound', listener);
}

export function addBluetoothStateChangedListener(listener: (event: BluetoothStateChangeEvent) => void): Subscription {
  return emitter.addListener('onBluetoothStateChanged', listener);
}
