"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavFileReader = void 0;
const fs = __importStar(require("fs"));
const SavReader_js_1 = require("./SavReader.js");
class SavFileReader extends SavReader_js_1.SavReader {
    constructor(filename) {
        const readable = fs.createReadStream(filename, {
            encoding: null,
            highWaterMark: 1024 * 1024 // 1024 kb
        });
        super(readable);
        this.filename = filename;
    }
}
exports.SavFileReader = SavFileReader;
//# sourceMappingURL=SavFileReader.js.map