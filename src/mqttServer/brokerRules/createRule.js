import {
  channelExists,
  isValidType,
  isValidOperator,
  isValidValue,
  isValidLogicOperator,
  isSubChannel,
} from "./validationRules.js";

import Rule from "../db/Rule.js";

function evaluateRuleItems(item, topChannel) {
  //Si es un termino
  if (!item.body) {
    //Verificar que el canal exista
    if (!channelExists(item.channel)) {
      throw new Error(
        `Channel does not exist in item\n ${JSON.stringify(item)}`
      );
    }

    if (!isSubChannel(item.channel, topChannel)) {
      throw new Error(
        `Channel ${item.channel} is not a subchannel of ${topChannel}`
      );
    }

    //Verificar que el tipo sea valido
    if (!isValidType(item.type)) {
      throw new Error(`Invalid type in item\n ${JSON.stringify(item)}`);
    }

    //Verificar que el operador sea valido
    if (!isValidOperator(item.operator, item.type)) {
      throw new Error(`Invalid operator in item\n ${JSON.stringify(item)}`);
    }

    //Verificar que el valor sea valido
    if (
      item.operator !== "ANY" &&
      !isValidValue(item.value, item.type, item.argument)
    ) {
      throw new Error(`Invalid value in item\n ${JSON.stringify(item)}`);
    }
  } else {
    //Verficar que el operador logico sea valido
    if (item.body.length > 1 && !isValidLogicOperator(item.logicOperator)) {
      throw new Error(
        `Invalid logic operator in item\n ${JSON.stringify(item)}`
      );
    }

    //Para cada item en el body:
    item.body.forEach((item) => {
      evaluateRuleItems(item, topChannel);
    });
  }
}

function evaluateRule(rule) {
  //Verificar que el canal exista
  if (!channelExists(rule.channel)) {
    throw new Error("Rule's channel does not exist");
  }

  //Evaluar items del body
  evaluateRuleItems(rule, rule.channel);

  return true;
}

async function createRule(rule) {
  if (!rule) {
    throw new Error("Rule is required");
  }

  //Verificar que la regla sea valida
  if (!evaluateRule(rule)) {
    throw new Error("Invalid rule format");
  }

  //Guardar regla en la base de datos
  try {
    await Rule.addRule(rule);
  } catch (error) {
    throw new Error("Error saving rule");
  }
}

export default createRule;
