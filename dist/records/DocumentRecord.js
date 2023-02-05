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
exports.DocumentRecord = void 0;
/** There must be no more than one document record per system file. Document
    records must follow the variable records and precede the dictionary termination record.
    */
class DocumentRecord {
    static read(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            // Number of lines of documents present.
            let n_lines = yield reader.readInt32();
            // Document lines. The number of elements is defined by n_lines. Lines shorter than 80 characters are padded on the right with spaces. 
            let lines = [];
            for (let i = 0; i < n_lines; i++) {
                lines.push(yield reader.readString(80, true));
            }
            return {
                n_lines,
                lines
            };
        });
    }
}
exports.DocumentRecord = DocumentRecord;
//# sourceMappingURL=DocumentRecord.js.map