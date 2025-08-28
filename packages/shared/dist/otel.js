"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOtel = startOtel;
const sdk_node_1 = require("@opentelemetry/sdk-node");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
function startOtel() {
    const sdk = new sdk_node_1.NodeSDK({
        instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()],
    });
    sdk.start();
    return () => sdk.shutdown();
}
