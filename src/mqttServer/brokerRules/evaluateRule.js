import {
  // channelExists,
  isValidType,
  isValidOperator,
  isValidValue,
  isValidLogicOperator,
  isSubChannel,
  // superChannelExists,
} from "./validationRules.js";

async function evaluateRuleItems(item, topChannel) {
  //Si es un termino
  if (!item.body) {
    //Verificar que el canal exista
    // if (!(await channelExists(item.channel))) {
    //   return new Error(
    //     `Channel does not exist in item\n ${JSON.stringify(item)}`
    //   );
    // }

    // if (!isSubChannel(item.channel, topChannel)) {
    //   return new Error(
    //     `Channel ${item.channel} is not a subchannel of ${topChannel}`
    //   );
    // }

    //Verificar que el tipo sea valido
    if (!isValidType(item.type)) {
      return new Error(`Invalid type in item\n ${JSON.stringify(item)}`);
    }

    //Verificar que el operador sea valido
    if (!isValidOperator(item.operator, item.type)) {
      return new Error(`Invalid operator in item\n ${JSON.stringify(item)}`);
    }

    //Verificar que el valor sea valido
    if (
      item.operator !== "ANY" &&
      !isValidValue(item.value, item.type, item.argument)
    ) {
      return new Error(`Invalid value in item\n ${JSON.stringify(item)}`);
    }

    return true;
  } else {
    //Verficar que el operador logico sea valido
    if (item.body.length > 1 && !isValidLogicOperator(item.logicOperator)) {
      return new Error(
        `Invalid logic operator in item\n ${JSON.stringify(item)}`
      );
    }

    //Para cada item en el body:
    for (let i = 0; i < item.body.length; i++) {
      const error = await evaluateRuleItems(item.body[i], topChannel);
      if (error instanceof Error) {
        return error;
      }
    }

    return true;
  }
}

async function evaluateRule(rule) {
  //Verificar que el canal exista
  // if (!(await superChannelExists(rule.channel))) {
  //   return new Error("Rule's channel does not exist");
  // }

  //Evaluar items del body
  return await evaluateRuleItems(rule, rule.channel);
}

export default evaluateRule;
