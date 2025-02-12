"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateHelper = void 0;
class DateHelper {
    // note:
    // 0 should be 1582-10-14T00:00:00.000Z
    // 13560348821 should be 6/29/2012 11:33:41 AM
    // 13548592882 should be 2/14/2012 10:01:22 AM
    // 12219379200 should be 1970-01-01 00:00:00.00
    // 13797216000 should be 2020-01-01 00:00:00.00
    static dateToNumber(d) {
        var tickspersecond = 1000; // js ticks per second
        var js_ticks = d.getTime(); // number of ticks since unix epoch
        var js_seconds = Math.round(js_ticks / tickspersecond); // number of seconds since unix epoch
        var spss_unix_epoch = 12219379200; // spss value at unix epoch
        var n = spss_unix_epoch + js_seconds;
        return n;
    }
    static dateFromNumber(n) {
        if (n === null || n === undefined)
            return null;
        if (isNaN(n))
            return null;
        var spss_unix_epoch = 12219379200;
        var seconds_since_unix_epoch = (n - spss_unix_epoch);
        var tickspersecond = 1000; // js ticks per second
        var dt = new Date(seconds_since_unix_epoch * tickspersecond);
        return dt;
    }
}
exports.DateHelper = DateHelper;
//# sourceMappingURL=DateHelper.js.map