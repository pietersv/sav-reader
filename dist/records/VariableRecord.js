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
exports.VariableRecord = void 0;
const DisplayFormat_js_1 = require("../DisplayFormat.js");
const SysVar_js_1 = require("../SysVar.js");
/**
 * Immediately following the header must come the variable records. There must be one
 * variable record for every variable and every 8 characters in a long string beyond
 * the first 8; i.e., there must be exactly as many variable records as the value
 * specified for case_size in the file header record.
 *
 */
class VariableRecord {
    constructor() {
        this.toSysVar = () => {
            let v = new SysVar_js_1.SysVar();
            // name
            // this may later be re-named by a longvarname entry
            v.name = this.shortName;
            // type
            if (this.type === 0) {
                v.type = 0 /* numeric */;
            }
            else if (this.type > 0) {
                v.type = 1 /* string */;
            }
            else {
                // this is a string continuation var record and cannot be converted to sysvar
                return null;
            }
            // label
            v.label = this.label;
            v.missing = this.missing;
            v.printFormat = this.printFormat;
            v.writeFormat = this.writeFormat;
            v.__shortName = this.shortName;
            // hacky (todo: clean this up)
            v.__nb_string_contin_recs = this.stringExt;
            v.__child_string_sysvars = [];
            v.__is_child_string_var = false;
            return v;
        };
    }
    static read(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            let vrec = new VariableRecord();
            vrec.type = yield reader.readInt32();
            vrec.hasLabel = (yield reader.readInt32()) == 1;
            vrec.n_missing_values = yield reader.readInt32();
            vrec.printFormat = DisplayFormat_js_1.DisplayFormat.parseInt(yield reader.readInt32());
            vrec.writeFormat = DisplayFormat_js_1.DisplayFormat.parseInt(yield reader.readInt32());
            vrec.shortName = yield reader.readString(8, true);
            vrec.label = null;
            if (vrec.hasLabel) {
                // These field are present only if has_var_label is true
                // The length, in characters, of the variable label, which must be a number between 0 and 120.
                let labelLen = yield reader.readInt32();
                // This field has length label_len, rounded up to the nearest multiple of 32 bits.
                // The first label_len characters are the variable's variable label.
                vrec.label = yield reader.readString(labelLen);
                // consume the padding as explained above
                let padding = 4 - (labelLen % 4);
                if (padding < 4) {
                    yield reader.readString(padding);
                }
            }
            // missing values
            // This field is present only if n_missing_values is not 0. It has the same number of
            // elements as the absolute value of n_missing_values. For discrete missing values,
            // each element represents one missing value. When a range is present, the first element
            // denotes the minimum value in the range, and the second element denotes the maximum
            // value in the range. When a range plus a value are present, the third element denotes
            // the additional discrete missing value. HIGHEST and LOWEST are indicated as described
            // in the chapter introduction.
            vrec.missing = null;
            if (vrec.n_missing_values === 1) { // one discrete missing value
                vrec.missing = yield reader.readDouble();
            }
            else if (vrec.n_missing_values === 2 || vrec.n_missing_values === 3) { // two or three discrete missing values
                vrec.missing = [];
                for (var i = 0; i < vrec.n_missing_values; i++) {
                    vrec.missing.push(yield reader.readDouble());
                }
            }
            else if (vrec.n_missing_values === -2) { // a range for missing values
                vrec.missing = {
                    min: yield reader.readDouble(),
                    max: yield reader.readDouble()
                };
            }
            else if (vrec.n_missing_values === -3) { // a range for missing values plus a single discrete missing value
                vrec.missing = {
                    min: yield reader.readDouble(),
                    max: yield reader.readDouble(),
                    value: yield reader.readDouble()
                };
            }
            else if (vrec.n_missing_values === 0) { // no missing values
            }
            else {
                throw Error("unknown missing values specification: " + vrec.n_missing_values);
            }
            return vrec;
        });
    }
}
exports.VariableRecord = VariableRecord;
//# sourceMappingURL=VariableRecord.js.map