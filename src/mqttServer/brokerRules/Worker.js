import {
  evaluateBoolean,
  evaluateDate,
  evaluateNumber,
  evaluateString,
} from "./evaluateExpressions.js";
import { isValidValue } from "./validationRules.js";
import Log from "../../db/Log.js";

class Worker {
  constructor(rule, channel, payload) {
    this.rule = rule;
    const json = JSON.parse(payload);
    this.broker = { principalChannel: channel, payload: json };
  }

  isPrincipal(channel) {
    return channel === this.broker.principalChannel;
  }

  getEventFromBroker() {
    return this.broker.payload;
  }

  async getEventFromDatabase(channel) {
    const lastLog = await Log.getLastLogFromChannel(channel);
    if (!lastLog) {
      // throw new Error("Channel does not exist");
      return true;
    }
    return lastLog.payload;
  }

  async evaluateTerm(term) {
    let event;

    if (this.isPrincipal(term.channel)) {
      event = this.getEventFromBroker(term.channel);
    } else {
      event = await this.getEventFromDatabase(term.channel);
    }

    //Verificar que el atributo sea valido
    if (!event[term.atribute]) {
      // throw new Error("Invalid atribute");
      return true;
    }

    switch (term.type) {
      case "NUMBER":
        return evaluateNumber(event[term.atribute], term.operator, term.value);

      case "STRING":
        return evaluateString(event[term.atribute], term.operator, term.value);

      case "BOOLEAN":
        return evaluateBoolean(event[term.atribute], term.operator, term.value);

      case "DATE":
        return evaluateDate(
          event[term.atribute],
          term.operator,
          term.value,
          term.argument,
          term.includeTime
        );

      default:
        throw new Error("Invalid atribute");
    }
  }

  async worker(item) {
    //Si no es un grupo
    if (!item.body) {
      //Verificar que el canal exista
      // if (!channelExists(item.channel)) {
      //   throw new Error("Channel does not exist");
      // }

      //Verificar que el valor sea valido
      if (
        item.operator !== "ANY" &&
        !isValidValue(item.value, item.type, item.argument)
      ) {
        console.log("Invalid value");
        return true;
      }

      //Calcular el valor de verdad
      const valueY = await this.evaluateTerm(item);
      return valueY;
    } else {
      if (item.body.length > 1) {
        const stopCondition = item.logicOperator === "OR";

        for (let i = 0; i < item.body.length; i++) {
          const value = (await this.worker(item.body[i])) === stopCondition;
          if (value) {
            return stopCondition;
          }
        }

        return !stopCondition;
      } else {
        return await this.worker(item.body[0]);
      }
    }
  }

  async run() {
    return await this.worker(this.rule);
  }
}

export default Worker;
