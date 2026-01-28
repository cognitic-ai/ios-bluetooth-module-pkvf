import ExpoModulesCore
import CoreBluetooth

public class BluetoothModule: Module, CBCentralManagerDelegate {
  private var centralManager: CBCentralManager?
  private var isScanning = false

  public func definition() -> ModuleDefinition {
    Name("Bluetooth")

    Events("onDeviceFound", "onBluetoothStateChanged")

    OnCreate {
      self.centralManager = CBCentralManager(delegate: self, queue: nil)
    }

    OnDestroy {
      self.stopScanning()
      self.centralManager = nil
    }

    Function("isBluetoothAvailable") {
      guard let manager = self.centralManager else { return nil }
      return manager.state == .poweredOn
    }

    Function("getBluetoothState") {
      return self.getStateString()
    }

    AsyncFunction("startScanning") {
      guard let manager = self.centralManager else {
        throw BluetoothException("Bluetooth manager not initialized")
      }

      guard manager.state == .poweredOn else {
        throw BluetoothException("Bluetooth is not powered on. Current state: \(self.getStateString())")
      }

      guard !self.isScanning else {
        throw BluetoothException("Already scanning")
      }

      self.isScanning = true
      manager.scanForPeripherals(withServices: nil, options: nil)
    }

    Function("stopScanning") {
      self.stopScanning()
    }
  }

  private func stopScanning() {
    guard let manager = self.centralManager, self.isScanning else { return }
    manager.stopScan()
    self.isScanning = false
  }

  private func getStateString() -> String {
    guard let manager = self.centralManager else { return "unknown" }
    switch manager.state {
    case .poweredOn:
      return "poweredOn"
    case .poweredOff:
      return "poweredOff"
    case .unsupported:
      return "unsupported"
    case .unauthorized:
      return "unauthorized"
    case .resetting:
      return "resetting"
    default:
      return "unknown"
    }
  }

  public func centralManagerDidUpdateState(_ central: CBCentralManager) {
    self.sendEvent("onBluetoothStateChanged", [
      "state": self.getStateString()
    ])
  }

  public func centralManager(
    _ central: CBCentralManager,
    didDiscover peripheral: CBPeripheral,
    advertisementData: [String: Any],
    rssi RSSI: NSNumber
  ) {
    self.sendEvent("onDeviceFound", [
      "id": peripheral.identifier.uuidString,
      "name": peripheral.name ?? "Unknown",
      "rssi": RSSI.intValue
    ])
  }
}

internal final class BluetoothException: Exception {
  override var reason: String {
    return param as? String ?? "Bluetooth error"
  }
}
