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
exports.ValueLabelRecord = exports.ValueLabelEntry = void 0;
class ValueLabelEntry {
}
exports.ValueLabelEntry = ValueLabelEntry;
class ValueLabelRecord {
    constructor() {
        this._appliesToShortNames = [];
        this.appliesToNames = null;
        this.entries = [];
    }
    static read(reader, vrecs) {
        return __awaiter(this, void 0, void 0, function* () {
            let set = new ValueLabelRecord();
            // determine the number of value/label pairs
            const count = yield reader.readInt32();
            // read the value/label pairs
            for (let i = 0; i < count; i++) {
                // get value
                //const val = await reader.readDouble();
                const _valBytes = yield reader.readBytes(8);
                const val = bytesToDouble(_valBytes);
                // get label
                const labelLen = yield reader.readByte();
                const label = labelLen > 0 ? yield reader.readString(labelLen) : "";
                if ((labelLen + 1) % 8 !== 0) {
                    const padding = 8 - ((labelLen + 1) % 8);
                    yield reader.readString(padding);
                }
                set.entries.push({
                    val,
                    _valBytes,
                    label
                });
            }
            // check to see if next record is a value label variable record
            const next_rec_type = yield reader.peekByte();
            if (next_rec_type == 4) {
                // value label variable record
                // this records tells us the variables which should use the preceding valuelabelset
                yield reader.readInt32(); // consume record type
                const nbVars = yield reader.readInt32();
                // read in vars
                for (let i = 0; i < nbVars; i++) {
                    // read varindex
                    const varIndex = yield reader.readInt32(); // 1-based var index
                    // find variable
                    const vrec = vrecs[varIndex - 1];
                    set._appliesToShortNames.push(vrec.shortName);
                }
                return set;
            }
            return null; // ignore, because it didn't apply to any vars
        });
    }
}
exports.ValueLabelRecord = ValueLabelRecord;
const bytesToDouble = (buf) => {
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
};
//# sourceMappingURL=ValueLabelRecord.js.map