"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavMeta = void 0;
/**
 * Metadata for sav file. Includes variable names, labels, valuelabels, encoding, etc.
 */
class SavMeta {
    constructor() {
        this.header = null;
        this.sysvars = [];
        this.valueLabels = [];
    }
    getValueLabels(varname) {
        var vl = this.valueLabels.find(vl => vl.appliesToNames.includes(varname));
        return (vl != null) ? vl.entries : null;
    }
}
exports.SavMeta = SavMeta;
//# sourceMappingURL=SavMeta.js.map