import ExpoModulesCore
import CoreBluetooth

public class BluetoothModule: Module, CBCentralManagerDelegate {
  private var centralManager: CBCentralManager?
  private var isScanning = false

  public func definition() -> ModuleDefinition {
    Name("Bluetooth")

    Events("onDeviceFound", "onBluetoothStateChanged")

    OnCreate {
      centralManager = CBCentralManager(delegate: self, queue: nil)
    }

    Function("isBluetoothAvailable") { () -> Bool in
      guard let manager = centralManager else { return false }
      return manager.state == .poweredOn
    }

    Function("getBluetoothState") { () -> String in
      guard let manager = centralManager else { return "unknown" }
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

    AsyncFunction("startScanning") { (promise: Promise) in
      guard let manager = centralManager else {
        promise.reject("ERR_BLUETOOTH", "Bluetooth manager not initialized")
        return
      }

      if manager.state != .poweredOn {
        promise.reject("ERR_BLUETOOTH", "Bluetooth is not powered on")
        return
      }

      if isScanning {
        promise.reject("ERR_BLUETOOTH", "Already scanning")
        return
      }

      isScanning = true
      manager.scanForPeripherals(withServices: nil, options: nil)
      promise.resolve(true)
    }

    Function("stopScanning") {
      guard let manager = centralManager else { return }
      if isScanning {
        manager.stopScan()
        isScanning = false
      }
    }
  }

  public func centralManagerDidUpdateState(_ central: CBCentralManager) {
    var state: String
    switch central.state {
    case .poweredOn:
      state = "poweredOn"
    case .poweredOff:
      state = "poweredOff"
    case .unsupported:
      state = "unsupported"
    case .unauthorized:
      state = "unauthorized"
    case .resetting:
      state = "resetting"
    default:
      state = "unknown"
    }

    sendEvent("onBluetoothStateChanged", [
      "state": state
    ])
  }

  public func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
    sendEvent("onDeviceFound", [
      "id": peripheral.identifier.uuidString,
      "name": peripheral.name ?? "Unknown",
      "rssi": RSSI.intValue
    ])
  }
}
