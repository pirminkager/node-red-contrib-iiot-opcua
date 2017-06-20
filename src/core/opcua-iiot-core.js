/**
 The BSD 3-Clause License

 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-iiot-opcua
 */
'use strict'

/**
 * Nested namespace settings.
 *
 * @type {{biancoroyal: {opcua: {iiot: {core: {}}}}}}
 *
 * @Namesapce de.biancoroyal.opcua.iiot.core
 */
var de = de || {biancoroyal: {opcua: {iiot: {core: {}}}}} // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.nodeOPCUA = de.biancoroyal.opcua.iiot.core.nodeOPCUA || require('node-opcua') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.nodeOPCUAId = de.biancoroyal.opcua.iiot.core.nodeOPCUAId || require('node-opcua/lib/datamodel/nodeid') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.internalDebugLog = de.biancoroyal.opcua.iiot.core.internalDebugLog || require('debug')('opcuaIIoT:core') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.detailDebugLog = de.biancoroyal.opcua.iiot.core.detailDebugLog || require('debug')('opcuaIIoT:core:details') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.specialDebugLog = de.biancoroyal.opcua.iiot.core.specialDebugLog || require('debug')('opcuaIIoT:core:special') // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.OBJECTS_ROOT = de.biancoroyal.opcua.iiot.core.OBJECTS_ROOT || 'ns=0;i=84' // eslint-disable-line no-use-before-define
de.biancoroyal.opcua.iiot.core.TEN_SECONDS_TIMEOUT = de.biancoroyal.opcua.iiot.core.TEN_SECONDS_TIMEOUT || 10 // eslint-disable-line no-use-before-define

de.biancoroyal.opcua.iiot.core.getTimeUnitName = function (unit) {
  let unitAbbreviation = ''

  switch (unit) {
    case 'ms':
      unitAbbreviation = 'msec.'
      break
    case 's':
      unitAbbreviation = 'sec.'
      break
    case 'm':
      unitAbbreviation = 'min.'
      break
    case 'h':
      unitAbbreviation = 'h.'
      break
    default:
      break
  }

  return unitAbbreviation
}

de.biancoroyal.opcua.iiot.core.calcMillisecondsByTimeAndUnit = function (time, unit) {
  let convertedTime

  switch (unit) {
    case 'ms':
      convertedTime = time
      break
    case 's':
      convertedTime = time * 1000 // seconds
      break
    case 'm':
      convertedTime = time * 60000 // minutes
      break
    case 'h':
      convertedTime = time * 3600000 // hours
      break
    default:
      convertedTime = 10000 // 10 sec.
      break
  }

  return convertedTime
}

de.biancoroyal.opcua.iiot.core.buildBrowseMessage = function (topic) {
  return {
    'topic': topic,
    'nodeId': '',
    'browseName': '',
    'nodeClassType': '',
    'typeDefinition': '',
    'payload': ''
  }
}

de.biancoroyal.opcua.iiot.core.toInt32 = function (x) {
  let uintSixteen = x

  if (uintSixteen >= Math.pow(2, 15)) {
    uintSixteen = x - Math.pow(2, 16)
    return uintSixteen
  } else {
    return uintSixteen
  }
}

de.biancoroyal.opcua.iiot.core.getNodeStatus = function (statusValue, statusLog) {
  let fillValue = 'yellow'
  let shapeValue = 'ring'

  switch (statusValue) {
    case 'initialize':
    case 'connecting':
      fillValue = 'yellow'
      break
    case 'connected':
    case 'keepalive':
    case 'subscribe':
    case 'started':
      if (!statusLog) {
        statusValue = 'active'
        shapeValue = 'dot'
      }
      fillValue = 'green'
      break
    case 'active':
    case 'subscribed':
    case 'listening':
      fillValue = 'green'
      shapeValue = 'dot'
      break
    case 'disconnected':
    case 'terminated':
      fillValue = 'red'
      break
    case 'waiting':
      fillValue = 'blue'
      shapeValue = 'dot'
      statusValue = 'waiting ...'
      break
    case 'error':
      fillValue = 'red'
      shapeValue = 'dot'
      break
    default:
      if (!statusValue) {
        fillValue = 'blue'
        statusValue = 'waiting ...'
      }
  }

  return {fill: fillValue, shape: shapeValue, status: statusValue}
}

de.biancoroyal.opcua.iiot.core.buildNewVariant = function (datatype, value) {
  let opcua = de.biancoroyal.opcua.iiot.core.nodeOPCUA
  let variantValue = null

  this.detailDebugLog('buildNewVariant datatype: ' + datatype + ' value:' + value)

  switch (datatype) {
    case 'Float':
    case opcua.DataType.Float:
      variantValue = {
        dataType: opcua.DataType.Float,
        value: parseFloat(value)
      }
      break
    case 'Double':
    case opcua.DataType.Double:
      variantValue = {
        dataType: opcua.DataType.Double,
        value: parseFloat(value)
      }
      break
    case 'UInt16':
    case opcua.DataType.UInt16:
      let uint16 = new Uint16Array([value])
      variantValue = {
        dataType: opcua.DataType.UInt16,
        value: uint16[0]
      }
      break
    case 'UInt32':
    case opcua.DataType.UInt32:
      let uint32 = new Uint32Array([value])
      variantValue = {
        dataType: opcua.DataType.UInt32,
        value: uint32[0]
      }
      break
    case 'Integer':
    case opcua.DataType.Integer:
      variantValue = {
        dataType: opcua.DataType.Integer,
        value: parseInt(value)
      }
      break
    case 'Int32':
    case opcua.DataType.Int32:
      variantValue = {
        dataType: opcua.DataType.Int32,
        value: parseInt(value)
      }
      break
    case 'Int16':
    case opcua.DataType.Int16:
      variantValue = {
        dataType: opcua.DataType.Int16,
        value: parseInt(value)
      }
      break
    case 'Boolean':
    case opcua.DataType.Boolean:
      if (value && value !== 'false') {
        variantValue = {
          dataType: opcua.DataType.Boolean,
          value: true
        }
      } else {
        variantValue = {
          dataType: opcua.DataType.Boolean,
          value: false
        }
      }
      break
    default:
      variantValue = {
        dataType: opcua.DataType.String,
        value: value
      }
      break
  }

  this.detailDebugLog('buildNewVariant variantValue: ' + JSON.stringify(variantValue))

  return variantValue
}

de.biancoroyal.opcua.iiot.core.buildMsgPayloadByDataValue = function (dataValue) {
  let convertedValue = null

  this.internalDebugLog('buildMsgPayloadByDataValue: ' + JSON.stringify(dataValue))

  if (dataValue.value) {
    convertedValue = this.convertDataValue(dataValue.value)
  }

  if (dataValue.hasOwnProperty('value')) {
    try {
      let json = JSON.parse(JSON.stringify(dataValue.toJSON(dataValue)))
      json.convertedValue = convertedValue
      json.hasOverflowBit = false // TODO: fixes the error on send message - may not correct - to refactor
      this.specialDebugLog('JSON WITH VALUE: ' + JSON.stringify(json))
      return json
    } catch (err) {
      this.specialDebugLog(err)

      if (dataValue.statusCode) {
        return {
          value: {
            value: convertedValue | null,
            dataType: dataValue.value.dataType | null,
            arrayType: dataValue.value.arrayType | null,
            attributeId: dataValue.attributeId | null
          },
          statusCode: {
            value: dataValue.statusCode.value,
            description: dataValue.statusCode.description,
            name: dataValue.statusCode.name
          },
          sourcePicoseconds: dataValue.sourcePicoseconds,
          serverPicoseconds: dataValue.serverPicoseconds
        }
      } else {
        return {
          value: {
            value: convertedValue,
            dataType: dataValue.value.dataType,
            arrayType: dataValue.value.arrayType,
            attributeId: dataValue.attributeId | null
          },
          dataValueStringified: JSON.stringify(dataValue)
        }
      }
    }
  } else {
    try {
      let json = JSON.parse(JSON.stringify(dataValue.toJSON(dataValue)))
      json.convertedValue = convertedValue
      json.hasOverflowBit = false // TODO: fixes the error on send message - may not correct - to refactor
      this.specialDebugLog('JSON WITHOUT VALUE: ' + JSON.stringify(json))
      return json
    } catch (err) {
      this.specialDebugLog(err)

      if (dataValue.statusCode) {
        return {
          value: {
            value: null,
            attributeId: dataValue.attributeId | null
          },
          statusCode: {
            value: dataValue.statusCode.value,
            description: dataValue.statusCode.description,
            name: dataValue.statusCode.name
          },
          sourcePicoseconds: dataValue.sourcePicoseconds,
          serverPicoseconds: dataValue.serverPicoseconds
        }
      } else {
        return {
          value: {
            value: null,
            attributeId: dataValue.attributeId | null
          },
          dataValueStringified: JSON.stringify(dataValue)
        }
      }
    }
  }
}

de.biancoroyal.opcua.iiot.core.convertDataValue = function (value) {
  return de.biancoroyal.opcua.iiot.core.convertDataValueByDataType(value, value.dataType)
}

de.biancoroyal.opcua.iiot.core.convertDataValueByDataType = function (value, dataType) {
  let opcua = de.biancoroyal.opcua.iiot.core.nodeOPCUA
  let convertedValue = null

  if (!value.hasOwnProperty('value')) {
    this.specialDebugLog('value has no value and that is not allowd' + JSON.stringify(value))
    return convertedValue
  }

  let valueType = typeof value.value

  this.detailDebugLog('convertDataValue: ' + JSON.stringify(value) +
    ' value origin type ' + valueType + ' convert to' + ' ' + dataType)

  try {
    switch (dataType) {
      case 'NodeId':
      case opcua.DataType.NodeId:
        convertedValue = value.value.toString()
        break
      case 'NodeIdType':
      case opcua.DataType.NodeIdType:
        if (value.value instanceof Buffer) {
          convertedValue = value.value.toString()
        } else {
          convertedValue = value.value
        }
        break
      case 'ByteString':
      case opcua.DataType.ByteString:
        convertedValue = value.value
        break
      case 'Byte':
      case opcua.DataType.Byte:
        if (valueType === 'Boolean') {
          convertedValue = value.value ? 1 : 0
        } else {
          convertedValue = parseInt(value.value)
        }
        break
      case opcua.DataType.QualifiedName:
        convertedValue = value.value.toString()
        break
      case 'LocalizedText':
      case opcua.DataType.LocalizedText:
        convertedValue = value.value.text
        break
      case 'Float':
      case opcua.DataType.Float:
        if (isNaN(value.value)) {
          convertedValue = value.value
        } else {
          convertedValue = parseFloat(value.value)
        }
        break
      case 'Double':
      case opcua.DataType.Double:
        if (isNaN(value.value)) {
          convertedValue = value.value
        } else {
          convertedValue = parseFloat(value.value)
        }
        break
      case 'UInt16':
      case opcua.DataType.UInt16:
        let uint16 = new Uint16Array([value.value])
        convertedValue = uint16[0]
        break
      case 'UInt32':
      case opcua.DataType.UInt32:
        let uint32 = new Uint32Array([value.value])
        convertedValue = uint32[0]
        break
      case 'Integer':
      case opcua.DataType.Integer:
      case 'Int16':
      case opcua.DataType.Int16:
      case 'Int32':
      case opcua.DataType.Int32:
      case 'Int64':
      case opcua.DataType.Int64:
        if (valueType === 'Boolean') {
          convertedValue = value.value ? 1 : 0
        } else {
          if (isNaN(value.value)) {
            convertedValue = value.value
          } else {
            convertedValue = parseInt(value.value)
          }
        }
        break
      case 'Boolean':
      case opcua.DataType.Boolean:
        if (valueType === 'Boolean') {
          convertedValue = value.value
        } else {
          if (isNaN(value.value)) {
            convertedValue = (value.value && value.value.toString().toLowerCase() !== 'false')
          } else {
            if (value.value) {
              convertedValue = true
            } else {
              convertedValue = false
            }
          }
        }
        break
      case 'String':
      case opcua.DataType.String:
        if (value.hasOwnProperty('value')) {
          convertedValue = value.value.toString()
        } else {
          convertedValue = JSON.stringify(value.value)
        }
        break
      case 'Null':
      case opcua.DataType.Null:
        convertedValue = value.value
        break
      default:
        this.internalDebugLog('convertDataValue unused DataType: ' + dataType)
        if (value.hasOwnProperty('value')) {
          if (value.value.toString) {
            convertedValue = value.value.toString()
          } else {
            convertedValue = value.value
          }
        } else {
          convertedValue = null
        }
        break
    }
  } catch (err) {
    this.detailDebugLog('convertDataValue ' + err)
  }

  this.detailDebugLog('convertDataValue is: ' + convertedValue)

  return convertedValue
}

de.biancoroyal.opcua.iiot.core.buildMsgPayloadByStatusCode = function (statusCode) {
  this.detailDebugLog('buildMsgPayloadByStatusCode: ' + JSON.stringify(statusCode))

  try {
    return statusCode.toJSON()
  } catch (err) {
    return {
      value: statusCode.value,
      description: statusCode.description,
      name: statusCode.name,
      statusCodeStringified: JSON.stringify(statusCode)
    }
  }
}

de.biancoroyal.opcua.iiot.core.regex_ns_i = /ns=([0-9]+);i=([0-9]+)/
de.biancoroyal.opcua.iiot.core.regex_ns_s = /ns=([0-9]+);s=(.*)/
de.biancoroyal.opcua.iiot.core.regex_ns_b = /ns=([0-9]+);b=(.*)/
de.biancoroyal.opcua.iiot.core.regex_ns_g = /ns=([0-9]+);g=(.*)/

de.biancoroyal.opcua.iiot.core.parseNamspaceFromMsgTopic = function (msg) {
  let nodeNamespace = null

  if (msg && msg.topic) {
    // TODO: real parsing instead of string operations
    // TODO: which type are relevant here? (String, Integer ...)
    nodeNamespace = msg.topic.substring(3, msg.topic.indexOf(';'))
  }

  return nodeNamespace
}

de.biancoroyal.opcua.iiot.core.parseNamspaceFromItemNodeId = function (item) {
  let nodeNamespace = null

  if (item && item.nodeId) {
    // TODO: real parsing instead of string operations
    // TODO: which type are relevant here? (String, Integer ...)
    nodeNamespace = item.nodeId.substring(3, item.nodeId.indexOf(';'))
  }

  return nodeNamespace
}

de.biancoroyal.opcua.iiot.core.parseIdentifierFromMsgTopic = function (msg) {
  let nodeIdentifier = null

  if (msg && msg.topic) {
    // TODO: real parsing instead of string operations
    if (msg.topic.toString().includes(';i=')) {
      nodeIdentifier = {
        identifier: parseInt(msg.topic.substring(msg.topic.indexOf(';i=') + 3)),
        type: de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeIdType.NUMERIC
      }
    } else {
      if (msg.topic.toString().includes(';b=')) {
        nodeIdentifier = {
          identifier: msg.topic.substring(msg.topic.indexOf(';b=') + 3),
          type: de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeIdType.NUMERIC
        }
      } else {
        nodeIdentifier = {
          identifier: msg.topic.substring(msg.topic.indexOf(';s=') + 3),
          type: de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeIdType.STRING
        }
      }
    }
  }

  return nodeIdentifier
}

de.biancoroyal.opcua.iiot.core.parseIdentifierFromItemNodeId = function (item) {
  let nodeIdentifier = null

  if (item && item.nodeId) {
    // TODO: real parsing instead of string operations
    if (item.nodeId.toString().includes(';i=')) {
      nodeIdentifier = {
        identifier: parseInt(item.nodeId.substring(item.nodeId.indexOf(';i=') + 3)),
        type: de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeIdType.NUMERIC
      }
    } else {
      if (item.nodeId.toString().includes(';b=')) {
        nodeIdentifier = {
          identifier: item.nodeId.substring(item.nodeId.indexOf(';b=') + 3),
          type: de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeIdType.STRING
        }
      } else {
        nodeIdentifier = {
          identifier: item.nodeId.substring(item.nodeId.indexOf(';s=') + 3),
          type: de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeIdType.STRING
        }
      }
    }
  }

  return nodeIdentifier
}

de.biancoroyal.opcua.iiot.core.newOPCUANodeIdListFromMsgItems = function (msg) {
  let item = null
  let itemsToRead = []

  if (msg.payload.items) {
    for (item of msg.payload.items) {
      itemsToRead.push(this.newOPCUANodeIdFromItemNodeId(item))
    }
  }

  return itemsToRead
}

de.biancoroyal.opcua.iiot.core.newOPCUANodeIdFromItemNodeId = function (item) {
  let namespace = de.biancoroyal.opcua.iiot.core.parseNamspaceFromItemNodeId(item)
  let nodeIdentifier = de.biancoroyal.opcua.iiot.core.parseIdentifierFromItemNodeId(item)

  this.internalDebugLog('newOPCUANodeIdFromItemNodeId: ' + JSON.stringify(nodeIdentifier))
  return new de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeId(nodeIdentifier.type, nodeIdentifier.identifier, namespace)
}

de.biancoroyal.opcua.iiot.core.newOPCUANodeIdFromMsgTopic = function (msg) {
  let namespace = de.biancoroyal.opcua.iiot.core.parseNamspaceFromMsgTopic(msg)
  let nodeIdentifier = de.biancoroyal.opcua.iiot.core.parseIdentifierFromMsgTopic(msg)

  this.internalDebugLog('newOPCUANodeIdFromMsgTopic: ' + JSON.stringify(nodeIdentifier))
  return new de.biancoroyal.opcua.iiot.core.nodeOPCUAId.NodeId(nodeIdentifier.type, nodeIdentifier.identifier, namespace)
}

de.biancoroyal.opcua.iiot.core.buildNodesToWrite = function (msg) {
  let opcua = de.biancoroyal.opcua.iiot.core.nodeOPCUA
  let nodesToWrite = []

  this.detailDebugLog('buildNodesToWrite input: ' + JSON.stringify(msg))

  if (msg.payload.items) {
    let item = null

    for (item of msg.payload.items) {
      nodesToWrite.push({
        nodeId: this.newOPCUANodeIdFromItemNodeId(item),
        attributeId: opcua.AttributeIds.Value,
        indexRange: null,
        value: {value: this.buildNewVariant(item.datatype, item.value)}
      })
    }
  } else {
    nodesToWrite.push({
      nodeId: this.newOPCUANodeIdFromMsgTopic(msg),
      attributeId: opcua.AttributeIds.Value,
      indexRange: null,
      value: {value: this.buildNewVariant(msg.datatype, msg.payload)}
    })
  }

  this.internalDebugLog('buildNodesToWrite output: ' + JSON.stringify(nodesToWrite))

  return nodesToWrite
}

de.biancoroyal.opcua.iiot.core.buildNodesToRead = function (msg, multipleRequest) {
  let nodesToRead = []
  let item = null

  this.detailDebugLog('buildNodesToRead input: ' + JSON.stringify(msg))

  if (multipleRequest) {
    if (msg.nodesToRead) {
      for (item of msg.nodesToRead) {
        nodesToRead.push(item.toString())
      }
    } else {
      nodesToRead.push(msg.topic)
    }
  } else {
    if (msg.payload.items) {
      for (item of msg.payload.items) {
        nodesToRead.push(item.nodeId)
      }
    } else {
      nodesToRead.push(msg.topic)
    }
  }

  this.internalDebugLog('buildNodesToRead output: ' + JSON.stringify(nodesToRead))

  return nodesToRead
}

de.biancoroyal.opcua.iiot.core.availableMemory = function () {
  let os = require('os')
  return os.freemem() / os.totalmem() * 100.0
}

module.exports = de.biancoroyal.opcua.iiot.core
