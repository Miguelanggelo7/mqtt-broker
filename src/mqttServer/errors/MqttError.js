class MqttError extends Error {
  constructor(errorTemplate, mqttId, domain) {
    super(errorTemplate.message);
    this.errorId = errorTemplate.id;
    this.name = errorTemplate.name;
    this.mqttId = mqttId;
    this.returnCode = errorTemplate.returnCode;
    this.domain = domain;
  }

  static get ERROR_ID() {
    return {
      id: 1,
      name: "ERROR_ID",
      message: "Client without mqttId",
      returnCode: 2,
    };
  }

  static get ERROR_CLEAN() {
    return {
      id: 2,
      name: "ERROR_CLEAN",
      message: "Clean session is required",
      returnCode: 5,
    };
  }

  static get ERROR_MISSING_CREDENTIALS() {
    return {
      id: 3,
      name: "ERROR_MISSING_CREDENTIALS",
      message: "Username or password is missing",
      returnCode: 4,
    };
  }

  static get ERROR_INVALID_CREDENTIALS() {
    return {
      id: 4,
      name: "ERROR_INVALID_CREDENTIALS",
      message: "Invalid username or password",
      returnCode: 4,
    };
  }
}

export default MqttError;
