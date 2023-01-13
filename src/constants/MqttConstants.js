class MqttConstants {
  static get ADMIN_SUB_CHANNEL() {
    return "workstation/admin/subscriptions";
  }
  static get ADMIN_CHANNEL_CHANNEL() {
    return "workstation/admin/channels";
  }
  static get ADMIN_DEVICE_CHANNEL() {
    return "workstation/admin/devices";
  }
  static get CLIENT_PUB_CHANNEL() {
    return "broker/admin/publish";
  }
  static get BROKER_DEVICE_CHANNEL() {
    return "broker/admin/device";
  }
}

export default MqttConstants;
