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
exports.SavReader = void 0;
const AsyncChunkReader_js_1 = require("./internal-readers/AsyncChunkReader.js");
const AsyncReader_js_1 = require("./internal-readers/AsyncReader.js");
const CommandReader_js_1 = require("./internal-readers/CommandReader.js");
const SavMetaLoader_js_1 = require("./SavMetaLoader.js");
const isValid = (x) => x !== null && x !== undefined;
/**
 * Reads schema and records from .sav file
 */
class SavReader {
    constructor(readable) {
        this.rowIndex = 0;
        const r1 = new AsyncReader_js_1.AsyncReader(readable);
        const r2 = new AsyncChunkReader_js_1.AsyncChunkReader(r1, 1024); // 1 kb
        this.reader = new CommandReader_js_1.CommandReader(r2);
    }
    /**
     * Opens the file and loads all metadata (var names, labels, valuelabels, etc). Doesn't load any records.
     */
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            // check file rec_type
            // Record type code, either ‘$FL2’ for system files with uncompressed data or data
            // compressed with simple bytecode compression, or ‘$FL3’ for system files with
            // ZLIB compressed data.
            // This is truly a character field that uses the character encoding as other strings.
            // Thus, in a file with an ASCII-based character encoding this field contains 24 46
            // 4c 32 or 24 46 4c 33, and in a file with an EBCDIC-based encoding this field
            // contains 5b c6 d3 f2. (No EBCDIC-based ZLIB-compressed files have been
            // observed.)
            const rec_type = yield this.reader.readString(4);
            if (rec_type != "$FL2" && rec_type != '$FL3') {
                throw new Error("Not a valid .sav file:" + rec_type);
            }
            if (rec_type == '$FL3') {
                throw new Error("ZLIB compressed data not supported");
            }
            // load metadata (variable names, # of cases (if specified), variable labels, value labels, etc.)
            this.meta = yield SavMetaLoader_js_1.SavMetaLoader.readMeta(this.reader);
            this.rowIndex = 0;
        });
    }
    resetRows() {
        return __awaiter(this, void 0, void 0, function* () {
            throw Error('not implemented');
        });
    }
    readAllRows(includeNulls = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.rowIndex !== 0)
                throw Error("Row pointer already advanced. Cannot read all rows.");
            let rows = [];
            let row = null;
            do {
                row = yield this.readNextRow(includeNulls);
                if (row) {
                    rows.push(row);
                }
            } while (row !== null);
            return rows;
        });
    }
    /** Read the next row of data */
    readNextRow(includeNulls = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let row = {};
            // check for eof
            try {
                let b = yield this.reader.peekByte(); // may throw Error upon EOF
                if (b === null || b === undefined) {
                    return null;
                }
            }
            catch (err) {
                if (!this.reader.isAtEnd()) {
                    throw Error(err);
                }
                return null;
            }
            for (let v of this.meta.sysvars) {
                if (v.type === 0 /* numeric */) {
                    const d = yield this.reader.readDouble2(this.meta.header.compression);
                    if (includeNulls || isValid(d))
                        row[v.name] = d;
                }
                else if (v.type === 1 /* string */) {
                    let all_sysvars = [v, ...(v.__child_string_sysvars || [])];
                    let str = "";
                    for (let sv of all_sysvars) {
                        let varStr = "";
                        // read root
                        varStr += yield this.reader.read8CharString(this.meta.header.compression);
                        // read string continuations if any
                        for (var j = 0; j < sv.__nb_string_contin_recs; j++) {
                            varStr += yield this.reader.read8CharString(this.meta.header.compression);
                        }
                        if (varStr.length > 255) {
                            varStr = varStr.substring(0, 255);
                        }
                        str += varStr;
                        // for testing
                        // if( all_sysvars.length > 1 ){
                        //     str += "|";
                        // }
                    }
                    const strVal = str != null ? str.trimEnd() : null;
                    if (includeNulls || isValid(strVal)) {
                        row[v.name] = strVal;
                    }
                }
            }
            this.rowIndex++;
            return row;
        });
    }
}
exports.SavReader = SavReader;
//# sourceMappingURL=SavReader.js.map