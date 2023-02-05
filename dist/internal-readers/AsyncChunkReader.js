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
exports.AsyncChunkReader = void 0;
const IPeekableAsyncReader_js_1 = require("./IPeekableAsyncReader.js");
/**
 * Layer on AsyncReader that reads in chunks to improve performance (especially if the Readable is a file stream)
 */
class AsyncChunkReader extends IPeekableAsyncReader_js_1.IPeekableAsyncReader {
    constructor(reader, chunkSize) {
        super();
        this.readChunk = () => __awaiter(this, void 0, void 0, function* () {
            // read another chunk
            const buf = yield this.reader.read(this.chunkSize);
            // exclude the consumed portion of existing buffer
            const unused_buf = this.buffer ? this.buffer.slice(this.bufferPos) : null; // question: does this slice prevent dispose??
            // append the new buffer
            this.buffer = unused_buf ? Buffer.concat([unused_buf, buf]) : buf;
            this.bufferPos = 0; // reset back to the start since we excluded consumed portion above wait
        });
        /** Closes the stream, after which no further reading is allowed */
        this.close = () => __awaiter(this, void 0, void 0, function* () { return this.reader.close(); });
        this.reader = reader;
        this.chunkSize = chunkSize;
        this.position = 0;
    }
    isAtEnd() {
        if (this.buffer && (this.bufferPos < this.buffer.length))
            return false;
        return this.reader.isAtEnd();
    }
    getPosition() {
        return this.position;
    }
    checkBuffer(len) {
        return __awaiter(this, void 0, void 0, function* () {
            while (!this.buffer || (!this.isAtEnd() && len > (this.buffer.length - this.bufferPos))) {
                yield this.readChunk();
            }
        });
    }
    /** Returns a string containing len bytes but doesn't advance the read position pointer
     * @param len Number of bytes to peeked
     */
    peek(len) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkBuffer(len);
            return this.buffer.slice(this.bufferPos, this.bufferPos + len);
        });
    }
    /** Returns a string containing len bytes
     * @param len Number of bytes to read
     */
    read(len) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkBuffer(len);
            const retVal = this.buffer.slice(this.bufferPos, this.bufferPos + len);
            this.bufferPos += len;
            this.position += len;
            return retVal;
        });
    }
}
exports.AsyncChunkReader = AsyncChunkReader;
//# sourceMappingURL=AsyncChunkReader.js.map