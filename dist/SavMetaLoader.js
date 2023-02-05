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
exports.SavMetaLoader = void 0;
const DictionaryTerminationRecord_js_1 = require("./records/DictionaryTerminationRecord.js");
const DocumentRecord_js_1 = require("./records/DocumentRecord.js");
const HeaderRecord_js_1 = require("./records/HeaderRecord.js");
const InfoRecord_js_1 = require("./records/InfoRecord.js");
const RecordType_js_1 = require("./records/RecordType.js");
const ValueLabelRecord_js_1 = require("./records/ValueLabelRecord.js");
const VariableRecord_js_1 = require("./records/VariableRecord.js");
const SavMeta_js_1 = require("./SavMeta.js");
class SavMetaLoader {
    /**
     * Reads and returns sav meta from the chunkreader.
     * @param reader A ChunkReader please (todo: type strictify this)
     */
    static readMeta(reader) {
        return __awaiter(this, void 0, void 0, function* () {
            let meta = new SavMeta_js_1.SavMeta();
            // read the header record
            meta.header = yield HeaderRecord_js_1.HeaderRecord.read(reader);
            // keep most recent string for easy linking of string continuation vars
            let vrecs = [];
            let recent_string_vrec = null;
            let documentRecord;
            let longVariableNamesMap;
            let longStringVarsMap = null;
            let valueLabelsExt = null;
            let done = false;
            do {
                const rec_type = yield reader.peekInt();
                if (rec_type === RecordType_js_1.RecordType.VariableRecord) {
                    yield reader.readInt32(); // consume peeked record type
                    const vrec = yield VariableRecord_js_1.VariableRecord.read(reader);
                    if (vrec.type > 0) {
                        // (root string var) a vrec type of > 0 means string variable with length(type)
                        vrec.stringExt = 0;
                        recent_string_vrec = vrec;
                    }
                    else if (vrec.type === -1) {
                        // a vrec type of -1 means string continuation variable
                        recent_string_vrec.stringExt++;
                    }
                    else if (vrec.type === 0) {
                        // a vrec type of 0 means numeric variable
                    }
                    vrecs.push(vrec);
                }
                else if (rec_type === RecordType_js_1.RecordType.ValueLabelRecord) {
                    yield reader.readInt32(); // consume peeked record type
                    // a value label record contains one set of value/label pairs and is attached to one or more variables
                    const set = yield ValueLabelRecord_js_1.ValueLabelRecord.read(reader, vrecs); // TODO: make sure these guys are matched app (see appliesTo aka appliesToShortName)
                    if (set != null) {
                        meta.valueLabels.push(set);
                    }
                }
                else if (rec_type === RecordType_js_1.RecordType.DocumentRecord) {
                    yield reader.readInt32(); // consume peeked record type
                    // there should be only one document record per file
                    if (documentRecord != null) {
                        throw new Error("Multiple document records encountered");
                    }
                    documentRecord = yield DocumentRecord_js_1.DocumentRecord.read(reader);
                }
                else if (rec_type === RecordType_js_1.RecordType.InfoRecord) {
                    yield reader.readInt32(); // consume peeked record type
                    // info record has many different subtypes
                    const rec = yield InfoRecord_js_1.InfoRecord.read(reader);
                    if (rec.subType === RecordType_js_1.InfoRecordSubType.EncodingRecord) {
                        // grab encoding from it
                        meta.header.encoding = rec.encoding;
                    }
                    else if (rec.subType === RecordType_js_1.InfoRecordSubType.LongVariableNamesRecord) {
                        // grab long names from it
                        longVariableNamesMap = rec.longNameMap;
                    }
                    else if (rec.subType === RecordType_js_1.InfoRecordSubType.SuperLongStringVariablesRecord) {
                        longStringVarsMap = rec.map;
                    }
                    else if (rec.subType === RecordType_js_1.InfoRecordSubType.StringVariableValueLabelsRecord) {
                        valueLabelsExt = rec;
                    }
                }
                else if (rec_type === RecordType_js_1.RecordType.DictionaryTerminationRecord) {
                    yield reader.readInt32(); // consume peeked record type
                    yield DictionaryTerminationRecord_js_1.DictionaryTerminationRecord.read(reader); // rec is discarded
                    done = true;
                }
                else {
                    // assume implicit dictionary termination
                    done = true;
                }
            } while (!done);
            // save the pointer
            meta.firstRecordPosition = reader.getPosition();
            // post-process the vrecs into sysvars
            meta.sysvars =
                vrecs
                    .map(vrec => vrec.toSysVar())
                    .filter(vrec => vrec); // filter out nulls because some vrecs (string continuation vrecs) can't be converted to sysvars
            // link extra long string vars
            if (longStringVarsMap) {
                for (let entry of longStringVarsMap) {
                    let sysvar = meta.sysvars.find(sv => sv.name === entry.name);
                    const varIndex = meta.sysvars.indexOf(sysvar);
                    // SPSS doesn't break apart string vars until the length > 255
                    // The pattern is that once length > 255, it breaks into nbsegments = floor((len + 251) / 252)
                    // In other words, in breaks every multiple of 252 starting at 253, with exception that it doesn't break strings < 256
                    // So it breaks at 256 (instead of 253), 505, 757, 1009, 1261, ...
                    const nbSegments = Math.floor((entry.length + 251) / 252);
                    // attach child string vars
                    for (let i = 1; i < nbSegments; i++) {
                        let childvar = meta.sysvars[varIndex + i];
                        sysvar.__child_string_sysvars.push(childvar);
                        sysvar.printFormat.width = entry.length; // probably not needed, but may be helpful to reader
                        childvar.__is_child_string_var = true;
                    }
                }
                meta.sysvars = meta.sysvars.filter(v => !v.__is_child_string_var);
            }
            // lookup weight (important to do this before assigning long var names)
            if (meta.header.weightIndex) {
                const weight_vrec = vrecs[meta.header.weightIndex - 1];
                const weight_shortName = weight_vrec.shortName;
                meta.header.weight = meta.sysvars.find(sysvar => sysvar.name === weight_shortName);
            }
            delete (meta.header.weightIndex); // (don't want weightIndex to confuse anyone since it's an index into vrecs, not sysvars)
            // assign long variable names
            if (longVariableNamesMap) {
                for (let entry of longVariableNamesMap) {
                    const findvar = meta.sysvars.find(sysvar => sysvar.name === entry.shortName);
                    if (findvar) {
                        findvar.name = entry.longName;
                    }
                }
            }
            meta.header.n_vars = meta.sysvars.length;
            delete (meta.header.case_size); // deleting because the number of vrecs is less helpful that n_vars
            // append valuelabel sets from longer string vars if exists
            if (valueLabelsExt === null || valueLabelsExt === void 0 ? void 0 : valueLabelsExt.sets) {
                meta.valueLabels = [
                    ...(meta.valueLabels || []),
                    ...(valueLabelsExt.sets)
                ];
            }
            // adjust valuelabels map to refer to new names; also set proper entry values based on var type
            meta.valueLabels = meta.valueLabels.map(set => {
                var set2 = Object.assign({}, set);
                set2.appliesToNames = set2.appliesToNames // would already exist if set came from valueLabelsExt
                    || set2._appliesToShortNames.map(shortname => meta.sysvars.find(sysvar => sysvar.__shortName == shortname).name);
                // find first var that this applies to, to determine whether type is string or number
                const var1 = meta.sysvars.find(sysvar => sysvar.name === set2.appliesToNames[0]);
                if (var1.type === 1 /* string */) {
                    // type is string, so vl entries should use string vals
                    set2.entries = set2.entries.map(entry => {
                        var _a;
                        return {
                            val: entry._valBytes ?
                                (_a = (0, InfoRecord_js_1.bytesToString)(entry._valBytes)) === null || _a === void 0 ? void 0 : _a.trimEnd()
                                : entry.val,
                            label: entry.label
                        };
                    });
                }
                else if (var1.type === 0 /* numeric */) {
                    // type is numeric, so we can delete _valBytes
                    set2.entries.forEach(entry => {
                        delete entry._valBytes;
                    });
                }
                delete set2._appliesToShortNames;
                return set2;
            });
            return meta;
        });
    }
}
exports.SavMetaLoader = SavMetaLoader;
//# sourceMappingURL=SavMetaLoader.js.map