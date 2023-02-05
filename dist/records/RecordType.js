"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoRecordSubType = exports.RecordType = void 0;
var RecordType;
(function (RecordType) {
    RecordType[RecordType["VariableRecord"] = 2] = "VariableRecord";
    RecordType[RecordType["ValueLabelRecord"] = 3] = "ValueLabelRecord";
    RecordType[RecordType["DocumentRecord"] = 6] = "DocumentRecord";
    RecordType[RecordType["InfoRecord"] = 7] = "InfoRecord";
    RecordType[RecordType["DictionaryTerminationRecord"] = 999] = "DictionaryTerminationRecord";
})(RecordType = exports.RecordType || (exports.RecordType = {}));
var InfoRecordSubType;
(function (InfoRecordSubType) {
    InfoRecordSubType[InfoRecordSubType["MachineInt32Info"] = 3] = "MachineInt32Info";
    InfoRecordSubType[InfoRecordSubType["MachineFlt64Info"] = 4] = "MachineFlt64Info";
    InfoRecordSubType[InfoRecordSubType["MultipleResponseSets"] = 7] = "MultipleResponseSets";
    InfoRecordSubType[InfoRecordSubType["AuxilliaryVariableParameter"] = 11] = "AuxilliaryVariableParameter";
    InfoRecordSubType[InfoRecordSubType["LongVariableNamesRecord"] = 13] = "LongVariableNamesRecord";
    InfoRecordSubType[InfoRecordSubType["SuperLongStringVariablesRecord"] = 14] = "SuperLongStringVariablesRecord";
    // 16 - ???
    // 18 - variable role?
    InfoRecordSubType[InfoRecordSubType["EncodingRecord"] = 20] = "EncodingRecord";
    InfoRecordSubType[InfoRecordSubType["StringVariableValueLabelsRecord"] = 21] = "StringVariableValueLabelsRecord";
    // 22 - missing values for string vars?
})(InfoRecordSubType = exports.InfoRecordSubType || (exports.InfoRecordSubType = {}));
//# sourceMappingURL=RecordType.js.map