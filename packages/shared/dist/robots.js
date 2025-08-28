"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowed = allowed;
const node_fetch_1 = __importDefault(require("node-fetch"));
const robots_parser_1 = __importDefault(require("robots-parser"));
async function allowed(url, userAgent = "crawler-bot") {
    const u = new URL(url);
    const robotsUrl = `${u.protocol}//${u.host}/robots.txt`;
    try {
        const res = await (0, node_fetch_1.default)(robotsUrl);
        const txt = await res.text();
        const robots = (0, robots_parser_1.default)(robotsUrl, txt);
        return robots.isAllowed(url, userAgent) ?? true;
    }
    catch {
        return true;
    }
}
