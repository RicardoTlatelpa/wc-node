"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOtel = startOtel;
var sdk_node_1 = require("@opentelemetry/sdk-node");
var auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
function startOtel() {
    var sdk = new sdk_node_1.NodeSDK({
        instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()],
    });
    sdk.start();
    return function () { return sdk.shutdown(); };
}
