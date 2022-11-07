import {
  evaluateBoolean,
  evaluateDate,
  evaluateNumber,
  evaluateString,
} from "./evaluateExpressions.js";
import { channelExists, isValidValue } from "./validationRules.js";
import Log from "../db/Log.js";

class Worker {
  constructor(rule, broker) {
    this.rule = rule;
    this.broker = broker;
  }

  isPrincipal(channel) {
    return channel === this.broker.principalChannel;
  }

  getEventFromBroker(channel) {
    return this.broker.getEvent(channel);
  }

  async getEventFromDatabase(channel) {
    const lastLog = await Log.getLastLog(channel);
    if (!lastLog) {
      throw new Error("Channel does not exist");
    }
    return JSON.parse(lastLog.message);
  }

  async evaluateTerm(term) {
    let event;

    if (this.isPrincipal(term.channel)) {
      event = this.getEventFromBroker(term.channel);
    } else {
      try {
        event = await this.getEventFromDatabase(term.channel);
      } catch (error) {
        return true;
      }
    }

    //Verificar que el atributo sea valido
    if (!event[term.atribute]) {
      throw new Error("Invalid atribute");
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

  worker(item) {
    //Si no es un grupo
    if (!item.body) {
      //Verificar que el canal exista
      if (!channelExists(item.channel)) {
        throw new Error("Channel does not exist");
      }

      //Verificar que el valor sea valido
      if (!isValidValue(item.value, item.type, item.argument)) {
        throw new Error("Invalid value");
      }

      //Calcular el valor de verdad
      return this.evaluateTerm(item);
    } else {
      if (item.body.length > 1) {
        const stopCondition = item.logicOperator === "AND";

        item.body.forEach((item) => {
          if (this.worker(item) === stopCondition) {
            return stopCondition;
          }
        });

        return !stopCondition;
      } else {
        return this.worker(item.body[0]);
      }
    }
  }

  run() {
    return this.worker(this.rule);
  }
}

export default Worker;
