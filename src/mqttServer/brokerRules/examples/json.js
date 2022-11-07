const json1 = {
  channel: "lights/controllers",
  name: "rule1",
  logicOperator: "OR",
  body: [
    {
      channel: "lights/controllers/sensor1",
      atribute: "order",
      type: "STRING",
      operator: "ANY",
    },
    {
      logicOperator: "AND",
      body: [
        {
          channel: "lights/controllers/switch1",
          atribute: "order",
          type: "STRING",
          operator: "ANY",
        },
        {
          channel: "lights/controllers/sensor1",
          atribute: "order",
          operator: "EQUAL",
          type: "STRING",
          value: "OFF",
        },
      ],
    },
  ],
};

const json2 = {
  channel: "lights/controllers",
  //logicOperator: "OR",
  body: [
    {
      channel: "lights/controllers/principal",
      atribute: "order",
      type: "DATE",
      operator: "EQUAL",
      value: "RELATIVE_DATE",
      argument: "2,  WEEKS",
      includeTime: false,
    },
  ],
};

export default { json1, json2 };

/**
 EVALUATE RULE
 1.- Verificar que el canal exista
 2.- Verificar que el operador logico sea valido
 3.- Para cada item en el body:
	3.1.- Si es un termino
		3.1.1.- Verificar que el canal exista
		3.1.2.- Verificar que el tipo sea valido
		3.1.3.- Verificar que el operador sea valido
		3.1.4.- Verificar que el valor sea valido

	3.2.- si es un grupo 
		3.2.1.- Llamar recursivamente a evaluateRule



WORKER
 1.- Verificar que el canal exista
 2.- Verificar que el operador logico sea valido
 3.- Para cada item en el body:
	3.1.- Si es un termino
		3.1.1.- Verificar que el canal exista
		3.1.2.- Verificar que el valor sea valido
		3.1.3.- Calcular valor de verdad

	3.2.- si es un grupo 
		3.2.1.- El operador es AND?
			3.2.1.1.- Si, asignar a stopCondition true
			3.2.1.2.- No, asignar a stopCondition false
		3.2.2.- Por cada item en el body:
			3.2.2.1.- Llamar a worker
			3.2.2.2.- El valor de verdad es stopCondition?
				3.2.2.2.1.- Si, retornar stopCondition
				3.2.2.2.2.- No, continuar
			3.2.2.3.- Retornar !stopCondition
	3.3.- Si no es ninguno de los dos, retornar error

OPERADORES
1.- Texto
	1.1.- EQUAL
	1.2.- NOT_EQUAL
	1.3.- CONTAINS
	1.4.- NOT_CONTAINS
	1.5.- STARTS_WITH
	1.6.- ENDS_WITH
	1.7.- NOT_STARTS_WITH
	1.8.- NOT_ENDS_WITH
	1.9.- IS_EMPTY
	1.10.- IS_NOT_EMPTY

2.- Numerico
	2.1.- EQUAL
	2.2.- NOT_EQUAL
	2.3.- GREATER_THAN
	2.4.- LESS_THAN
	2.5.- GREATER_THAN_OR_EQUAL
	2.6.- LESS_THAN_OR_EQUAL
	2.7.- IS_EMPTY
	2.8.- IS_NOT_EMPTY

3.- Booleano
	3.1.- EQUAL
	3.2.- NOT_EQUAL
	3.3.- IS_EMPTY
	3.4.- IS_NOT_EMPTY

4.- Fecha
	4.1.- EQUAL
	4.2.- NOT_EQUAL
	4.3.- GREATER_THAN
	4.4.- LESS_THAN
	4.5.- GREATER_THAN_OR_EQUAL
	4.6.- LESS_THAN_OR_EQUAL
	4.7.- IS_EMPTY
	4.8.- IS_NOT_EMPTY
	4.9.- IS_BETWEEN

6.- Opciones fecha
	6.1.- NOW
	6.2.- (Number, Unit)
	6.3.- CUSTOM_DATE

 */
