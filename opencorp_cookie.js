go()
function leastFactor(n) {
    if (isNaN(n) || !isFinite(n)) return NaN
    if (typeof phantom !== "undefined") return "phantom"
    if (typeof module !== "undefined" && module.exports) return "node"
    if (n == 0) return 0
    if (n % 1 || n * n < 2) return 1
    if (n % 2 == 0) return 2
    if (n % 3 == 0) return 3
    if (n % 5 == 0) return 5
    var m = Math.sqrt(n)
    for (var i = 7; i <= m; i += 30) {
        if (n % i == 0) return i
        if (n % (i + 4) == 0) return i + 4
        if (n % (i + 6) == 0) return i + 6
        if (n % (i + 10) == 0) return i + 10
        if (n % (i + 12) == 0) return i + 12
        if (n % (i + 16) == 0) return i + 16
        if (n % (i + 22) == 0) return i + 22
        if (n % (i + 24) == 0) return i + 24
    }
    return n
}
function go() {
    var p = 2811628603489
    var s = 1118898743
    
    var n
    if ((s >> 2) & 1) p += 89070660 * 5
    else p -= 498728531 * 3
    if ((s >> 3) & 1) p += 521582315 * 4
    else p -= 216611954 * 4
    if ((s >> 12) & 1) p += 135193717 * 15
    else p -= 95182663 * 13
    if ((s >> 12) & 1) p += 78926283 * 15
    else p -= 93836190 * 13
    if ((s >> 10) & 1) p += 77130440 * 13
    else p -= 165509247 * 11
    p += 4632958360
    n = leastFactor(p)
    {
        var document={}
        document.cookie = "KEY=" + n + "*" + p / n + ":" + s + ":180761754:1;path=/;"
        
        console.log("KEY=" + n + "*" + p / n + ":" + s + ":180761754:1;path=/;")
    }
}
