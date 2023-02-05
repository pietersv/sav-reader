"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncReader = void 0;
const IAsyncReader_js_1 = require("./IAsyncReader.js");
/**
 * Read binary data from a Readable with simple async methods
 */
class AsyncReader extends IAsyncReader_js_1.IAsyncReader {
    constructor(readable) {
        super();
        this.readable = readable;
        this.readable.on("readable", this._readableCallback.bind(this));
        //this.readable.on("error", (err) => { throw err });
        this.readable.on("end", this._endCallback.bind(this));
        this.listener = null;
        this.position = 0;
        this.atEnd = false;
    }
    isAtEnd() {
        return this.atEnd;
    }
    getPosition() {
        return this.position;
    }
    /**
     * is called when data is ready to be read
     */
    _readableCallback() {
        if (this.listener != null) {
            let cb = this.listener;
            this.listener = null;
            cb();
        }
    }
    /**
     * is called when end of stream is reached
     */
    _endCallback() {
        this.atEnd = true;
    }
    /** Closes the stream, after which no further reading is allowed */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.readable.destroy();
        });
    }
    /** Returns a string containing len bytes
     * @param len Number of bytes to read
     */
    read(len) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.readable.readable) {
                    reject('stream is closed');
                }
                let buf = this.readable.read(len);
                if (!buf) {
                    // wait for more data to become available
                    this.listener = () => {
                        // data is available. try to read again
                        if (!this.readable.readable) {
                            reject('stream is closed');
                        }
                        // read again
                        buf = this.readable.read(len);
                        if (buf === null) {
                            if (this.atEnd) {
                                reject('No data to read due to end of stream reached');
                            }
                            reject('No data read even after wait. This can happen if highWaterMark is smaller than read size.');
                        }
                        else {
                            this.position += buf.length;
                            resolve(buf);
                        }
                    };
                }
                else {
                    this.position += buf.length;
                    resolve(buf);
                }
            });
        });
    }
}
exports.AsyncReader = AsyncReader;
//# sourceMappingURL=AsyncReader.js.map