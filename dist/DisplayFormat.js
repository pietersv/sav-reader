"use strict";
/**
 * The print and write members of sysfile_variable are output formats coded into int32
 * types. The LSB (least-significant byte) of the int32 represents the number of decimal
 * places, and the next two bytes in order of increasing significance represent field
 * width and format type, respectively. The MSB (most-significant byte) is not used and
 * should be set to zero.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplayFormat = void 0;
/**
 * sysfile_variable format type
 */
var sys_formattype;
(function (sys_formattype) {
    //Not_used: 0,
    sys_formattype[sys_formattype["A"] = 1] = "A";
    sys_formattype[sys_formattype["AHEX"] = 2] = "AHEX";
    sys_formattype[sys_formattype["COMMA"] = 3] = "COMMA";
    sys_formattype[sys_formattype["DOLLAR"] = 4] = "DOLLAR";
    sys_formattype[sys_formattype["F"] = 5] = "F";
    sys_formattype[sys_formattype["IB"] = 6] = "IB";
    sys_formattype[sys_formattype["PIBHEX"] = 7] = "PIBHEX";
    sys_formattype[sys_formattype["P"] = 8] = "P";
    sys_formattype[sys_formattype["PIB"] = 9] = "PIB";
    sys_formattype[sys_formattype["PK"] = 10] = "PK";
    sys_formattype[sys_formattype["RB"] = 11] = "RB";
    sys_formattype[sys_formattype["RBHEX"] = 12] = "RBHEX";
    //Not used.=13,
    //Not used.=14,
    sys_formattype[sys_formattype["Z"] = 15] = "Z";
    sys_formattype[sys_formattype["N"] = 16] = "N";
    sys_formattype[sys_formattype["E"] = 17] = "E";
    //Not used.=18,
    //Not used.=19,
    sys_formattype[sys_formattype["DATE"] = 20] = "DATE";
    sys_formattype[sys_formattype["TIME"] = 21] = "TIME";
    sys_formattype[sys_formattype["DATETIME"] = 22] = "DATETIME";
    sys_formattype[sys_formattype["ADATE"] = 23] = "ADATE";
    sys_formattype[sys_formattype["JDATE"] = 24] = "JDATE";
    sys_formattype[sys_formattype["DTIME"] = 25] = "DTIME";
    sys_formattype[sys_formattype["WKDAY"] = 26] = "WKDAY";
    sys_formattype[sys_formattype["MONTH"] = 27] = "MONTH";
    sys_formattype[sys_formattype["MOYR"] = 28] = "MOYR";
    sys_formattype[sys_formattype["QYR"] = 29] = "QYR";
    sys_formattype[sys_formattype["WKYR"] = 30] = "WKYR";
    sys_formattype[sys_formattype["PCT"] = 31] = "PCT";
    sys_formattype[sys_formattype["DOT"] = 32] = "DOT";
    sys_formattype[sys_formattype["CCA"] = 33] = "CCA";
    sys_formattype[sys_formattype["CCB"] = 34] = "CCB";
    sys_formattype[sys_formattype["CCC"] = 35] = "CCC";
    sys_formattype[sys_formattype["CCD"] = 36] = "CCD";
    sys_formattype[sys_formattype["CCE"] = 37] = "CCE";
    sys_formattype[sys_formattype["EDATE"] = 38] = "EDATE";
    sys_formattype[sys_formattype["SDATE"] = 39] = "SDATE";
})(sys_formattype || (sys_formattype = {}));
;
/**
 * The print and write members of sysfile_variable are output formats coded into int32
 * types. The LSB (least-significant byte) of the int32 represents the number of decimal
 * places, and the next two bytes in order of increasing significance represent field
 * width and format type, respectively. The MSB (most-significant byte) is not used and
 * should be set to zero.
 */
class DisplayFormat {
    static parseInt(format) {
        const f = new DisplayFormat();
        f.type = (format & 0xFF0000) >> 16;
        f.typestr = sys_formattype[f.type];
        f.width = (format & 0x00FF00) >> 8;
        f.nbdec = (format & 0x0000FF);
        return f;
    }
}
exports.DisplayFormat = DisplayFormat;
//# sourceMappingURL=DisplayFormat.js.map