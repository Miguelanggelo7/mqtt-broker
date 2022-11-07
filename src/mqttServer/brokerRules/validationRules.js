import {
  evaluateBoolean,
  evaluateDate,
  evaluateNumber,
  evaluateString,
} from "./evaluateExpressions.js";

import Channel from "../../db/Channel.js";

function channelExists(channel) {
  return Channel.exists(channel);
}

function isSubChannel(channel, topChannel) {
  return channel.includes(topChannel);
}

function isValidLogicOperator(operator) {
  if (!operator) return false;
  return operator === "AND" || operator === "OR";
}

function isValidType(type) {
  return (
    type === "NUMBER" ||
    type === "STRING" ||
    type === "BOOLEAN" ||
    type === "DATE"
  );
}

function isValidOperator(operator, type) {
  try {
    switch (type) {
      case "NUMBER":
        evaluateNumber(0, operator, 0);
        break;

      case "STRING":
        evaluateString("", operator, "");
        break;

      case "BOOLEAN":
        evaluateBoolean(false, operator, false);
        break;

      case "DATE":
        evaluateDate(new Date(), operator, "NOW", null, false);
        break;

      default:
        throw new Error("Invalid type");
    }
  } catch (error) {
    return false;
  }

  return true;
}

function isValidValue(value, type, argument) {
  switch (type) {
    case "NUMBER":
      return !isNaN(value);

    case "STRING":
      return typeof value === "string";

    case "BOOLEAN":
      return typeof value === "boolean";

    case "DATE":
      try {
        evaluateDate(new Date(), "EQUAL", value, argument, false);
      } catch (error) {
        console.error(error);
        return false;
      }

      return true;

    default:
      return false;
  }
}

export {
  channelExists,
  isValidType,
  isValidOperator,
  isValidValue,
  isValidLogicOperator,
  isSubChannel,
};
