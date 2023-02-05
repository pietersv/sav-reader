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
exports.HeaderRecord = void 0;
class HeaderRecord {
    static read(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            let record = new HeaderRecord();
            record.product = yield reader.readString(60, true);
            record.layout_code = yield reader.readInt32();
            record.case_size = yield reader.readInt32();
            record.compressed = (yield reader.readInt32()) === 1;
            record.weightIndex = yield reader.readInt32();
            record.n_cases = yield reader.readInt32();
            record.bias = yield reader.readDouble();
            record.creationDate = yield reader.readString(9);
            record.creationTime = yield reader.readString(8);
            record.created = new Date(record.creationDate + ' ' + record.creationTime);
            record.fileLabel = yield reader.readString(64, true);
            // (3 chars)
            // Ignore padding bytes to make the structure a multiple of 32 bits in length. Set to zeros. 
            yield reader.readString(3); // padding
            // weird ??
            if (record.compressed) {
                record.compression = {
                    bias: record.bias
                };
            }
            // delete filelabel if empty since I've rarely seen it populated (do i really need to delete it? - who cares)
            if (!record.fileLabel) {
                delete (record.fileLabel);
            }
            return record;
        });
    }
}
exports.HeaderRecord = HeaderRecord;
//# sourceMappingURL=HeaderRecord.js.map