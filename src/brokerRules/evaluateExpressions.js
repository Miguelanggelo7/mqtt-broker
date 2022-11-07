function evaluateNumber(atribute, operator, value) {
  switch (operator) {
    case "EQUAL":
      return atribute == value;

    case "NOT_EQUAL":
      return atribute != value;

    case "GREATER_THAN":
      return atribute > value;

    case "LESS_THAN":
      return atribute < value;

    case "GREATER_THAN_OR_EQUAL":
      return atribute >= value;

    case "LESS_THAN_OR_EQUAL":
      return atribute <= value;

    case "ANY":
      return true;

    default:
      throw new Error("Invalid operator");
  }
}

function evaluateString(atribute, operator, value) {
  switch (operator) {
    case "EQUAL":
      return atribute == value;

    case "NOT_EQUAL":
      return atribute != value;

    case "CONTAINS":
      return atribute.includes(value);

    case "NOT_CONTAINS":
      return !atribute.includes(value);

    case "STARTS_WITH":
      return atribute.startsWith(value);

    case "ENDS_WITH":
      return atribute.endsWith(value);

    case "ANY":
      return true;

    default:
      throw new Error("Invalid operator");
  }
}

function evaluateBoolean(atribute, operator, value) {
  switch (operator) {
    case "EQUAL":
      return atribute == value;

    case "NOT_EQUAL":
      return atribute != value;

    case "ANY":
      return true;

    default:
      throw new Error("Invalid operator");
  }
}

function evaluateDate(atribute, operator, ruleValue, argument, includeTime) {
  let value;
  let number, unit, today, array;

  switch (ruleValue) {
    case "NOW":
      value = new Date();
      break;

    case "CUSTOM_DATE":
      try {
        value = new Date(argument);
      } catch (error) {
        throw new Error("Invalid argument for CUSTOM_DATE");
      }
      break;

    case "RELATIVE_DATE":
      array = argument.split(",");
      array[0] = array[0].trim();
      array[1] = array[1].trim();

      if (array.length !== 2) {
        throw new Error(
          "Invalid argument for RELATIVE_DATE: 2 arguments are required"
        );
      }

      number = Number.parseInt(array[0]);
      unit = array[1];

      if (typeof number !== "number" || typeof unit !== "string") {
        throw new Error(
          "Invalid argument for RELATIVE_DATE: wrong argument types"
        );
      }

      today = new Date();

      switch (unit) {
        case "SECONDS":
          value = new Date(today.setSeconds(today.getSeconds() + number));
          break;

        case "MINUTES":
          value = new Date(today.setMinutes(today.getMinutes() + number));
          break;

        case "HOURS":
          value = new Date(today.setHours(today.getHours() + number));
          break;

        case "DAYS":
          value = new Date(today.setDate(today.getDate() + number));
          break;

        case "WEEKS":
          value = new Date(today.setDate(today.getDate() + number * 7));
          break;

        case "MONTHS":
          value = new Date(today.setMonth(today.getMonth() + number));
          break;

        case "YEARS":
          value = new Date(today.setFullYear(today.getFullYear() + number));
          break;

        default:
          throw new Error("Invalid date unit");
      }

      break;

    default:
      throw new Error("Invalid date value");
  }

  atribute = new Date(atribute);

  if (!includeTime) {
    atribute.setHours(0, 0, 0);
    value.setHours(0, 0, 0, 0);
  }

  switch (operator) {
    case "EQUAL":
      // console.log(atribute, value);
      return atribute.getTime() === value.getTime();

    case "NOT_EQUAL":
      return atribute.getTime() !== value.getTime();

    case "GREATER_THAN":
      return atribute.getTime() > value.getTime();

    case "LESS_THAN":
      return atribute.getTime() < value.getTime();

    case "GREATER_THAN_OR_EQUAL":
      return atribute.getTime() >= value.getTime();

    case "LESS_THAN_OR_EQUAL":
      return atribute.getTime() <= value.getTime();

    case "ANY":
      return true;

    default:
      throw new Error("Invalid operator");
  }
}

export { evaluateNumber, evaluateString, evaluateBoolean, evaluateDate };
