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
exports.CommandReader = void 0;
class CommandReader {
    constructor(reader) {
        this.close = () => this.reader.close();
        this.getPosition = () => this.reader.getPosition();
        this.isAtEnd = () => this.reader.isAtEnd();
        this.peek = (len) => __awaiter(this, void 0, void 0, function* () { return yield this.reader.peek(len); });
        this.reader = reader;
        this.commandPointer = 0;
        this.commandBuffer = null;
    }
    peekByte() {
        return __awaiter(this, void 0, void 0, function* () {
            // first check commandBuffer, but if it returns a zero ... find the first non-zero (temp workaround)
            if (this.commandPointer > 0 && this.commandPointer < 8) {
                let i = this.commandPointer;
                let b = this.commandBuffer[i];
                while (b === 0 && i < 8) {
                    i++;
                    b = this.commandBuffer[i];
                }
                if (b !== 0)
                    return b;
            }
            // otherwise...
            var buf = yield this.reader.peek(1);
            if (buf.length !== 1)
                throw Error("not enough bytes read to peek a Byte");
            return buf[0];
        });
    }
    peekInt() {
        return __awaiter(this, void 0, void 0, function* () {
            var buf = yield this.reader.peek(4);
            if (buf.length !== 4)
                throw Error("not enough bytes read to peek an Int32");
            return ((buf[0]) |
                (buf[1] << 8) |
                (buf[2] << 16) |
                (buf[3] << 24));
        });
    }
    readInt32() {
        return __awaiter(this, void 0, void 0, function* () {
            var buf = yield this.reader.read(4);
            if (buf.length !== 4)
                throw Error("not enough bytes read for Int32");
            return ((buf[0]) |
                (buf[1] << 8) |
                (buf[2] << 16) |
                (buf[3] << 24));
        });
    }
    readByte() {
        return __awaiter(this, void 0, void 0, function* () {
            var buf = yield this.reader.read(1);
            if (buf.length !== 1)
                throw Error("not enough bytes read for Byte");
            return buf[0];
        });
    }
    readDouble() {
        return __awaiter(this, void 0, void 0, function* () {
            var buf = yield this.reader.read(8);
            if (buf.length !== 8)
                throw Error("not enough bytes read for Double");
            var ab = new ArrayBuffer(8);
            var bufView = new Uint8Array(ab);
            bufView[0] = buf[7];
            bufView[1] = buf[6];
            bufView[2] = buf[5];
            bufView[3] = buf[4];
            bufView[4] = buf[3];
            bufView[5] = buf[2];
            bufView[6] = buf[1];
            bufView[7] = buf[0];
            let dv = new DataView(ab);
            let d = dv.getFloat64(0);
            return d;
        });
    }
    getCommandCode() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.commandPointer === 0) {
                // read command bytes into buffer
                this.commandBuffer = yield this.reader.read(8);
                if (this.commandBuffer.length === 0)
                    return null;
                if (this.commandBuffer.length !== 8)
                    throw Error("not enough bytes read for command");
            }
            let code = this.commandBuffer[this.commandPointer];
            this.commandPointer++;
            if (this.commandPointer === 8)
                this.commandPointer = 0;
            return code;
        });
    }
    readDouble2(compression) {
        return __awaiter(this, void 0, void 0, function* () {
            if (compression == null)
                return yield this.readDouble();
            let code = yield this.getCommandCode();
            while (code === 0)
                code = yield this.getCommandCode(); // huh? padding or something?
            let d = null;
            if (code > 0 && code < 252) {
                // compressed data
                d = code - compression.bias;
            }
            else if (code === 252) {
                // end of file
            }
            else if (code === 253) {
                // non-compressible piece, read from stream
                d = yield this.readDouble(); // reads from end (since commands have already been read)
            }
            else if (code === 254) {
                // string value that is all spaces
                //d = 0x2020202020202020;
                // shouldn't get here!
                //d = null;
            }
            else if (code === 255) {
                // system-missing
            }
            else if (code === 0) {
                // ignore
            }
            else if (code === null) {
                // ignore    
            }
            else {
                throw new Error('unknown error reading compressed double. code is ' + code);
            }
            return d;
        });
    }
    read8CharString(compression) {
        return __awaiter(this, void 0, void 0, function* () {
            if (compression == null)
                return yield this.readString(8);
            var code = yield this.getCommandCode();
            while (code === 0)
                code = yield this.getCommandCode();
            let str = null;
            if (code > 0 && code < 252) {
                // compressed data
                //d = code - bias;
                // shouldn't get here!
            }
            else if (code === 252) {
                // end of file
            }
            else if (code === 253) {
                // non-compressible piece, read from stream
                str = yield this.readString(8); // reads from end (since commands have already been read)
            }
            else if (code === 254) {
                // string value that is all spaces
                str = '        '; // todo: figure out if this should be empty (len=0)
            }
            else if (code === 255) {
                // system-missing
            }
            else if (code === 0) {
                // ignore
            }
            else if (code === null) {
                // ignore
            }
            else {
                throw new Error('unknown error reading compressed string');
            }
            return str;
        });
    }
    /**
     * WHAT ENCODING TO USE?
     */
    readString(len, trimEnd = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (len < 1)
                return "";
            var buf = yield this.reader.read(len);
            if (buf.length !== len)
                throw Error("not enough bytes read for string of length " + len);
            const strBuf = buf.toString();
            return trimEnd ? strBuf.trimEnd() : strBuf;
        });
    }
    readBytes(len) {
        return __awaiter(this, void 0, void 0, function* () {
            var buf = yield this.reader.read(len);
            if (buf.length !== len)
                throw Error("not enough bytes read for Byte array of length " + len);
            return buf;
        });
    }
}
exports.CommandReader = CommandReader;
//# sourceMappingURL=CommandReader.js.map