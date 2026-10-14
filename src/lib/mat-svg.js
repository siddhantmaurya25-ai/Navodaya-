// ==================== 12 AUTHENTIC, VISUALLY SOLVABLE JNVST MENTAL ABILITY SVG ENGINES (m1 - m12) ====================
const MAT_SYMS_POOL = ["★", "●", "○", "▲", "△", "■", "□", "◆", "◇", "⊕", "⊗", "✶", "Ω", "∆", "∞", "Ψ", "Σ", "+"];

/**
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {string} c1
 * @param {string} c2
 * @param {string} c3
 * @param {string} c4
 * @param {string} midSym
 * @param {number} rotDeg
 * @param {string} label
 * @param {boolean} isDashed
 * @param {boolean} mirrorFlip
 * @param {boolean} verticalFlip
 */
function drawSingleMatCell(x, y, size, c1, c2, c3, c4, midSym, rotDeg, label, isDashed, mirrorFlip, verticalFlip) {
  var half = size / 2;
  var q1 = Math.round(size * 0.22);
  var q2 = Math.round(size * 0.78);
  var tl = c1, tr = c2, br = c3, bl = c4;
  if (mirrorFlip) {
    tl = c2; tr = c1; br = c4; bl = c3;
  }
  if (verticalFlip) {
    var tmpT = tl, tmpR = tr;
    tl = bl; tr = br; bl = tmpT; br = tmpR;
  }

  return (
    '<g transform="translate(' + x + ',' + y + ')">' +
    '<rect x="0" y="0" width="' + size + '" height="' + size + '" rx="6" fill="#ffffff" stroke="#0f172a" stroke-width="2"' + (isDashed ? ' stroke-dasharray="4,3"' : '') + '/>' +
    '<line x1="0" y1="0" x2="' + size + '" y2="' + size + '" stroke="#e2e8f0" stroke-width="1"/>' +
    '<line x1="' + size + '" y1="0" x2="0" y2="' + size + '" stroke="#e2e8f0" stroke-width="1"/>' +
    '<circle cx="' + half + '" cy="' + half + '" r="' + Math.round(size * 0.24) + '" fill="#ffffff" stroke="#0f172a" stroke-width="1.6"/>' +
    '<text x="' + q1 + '" y="' + (q1 + 4) + '" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="bold">' + tl + '</text>' +
    '<text x="' + q2 + '" y="' + (q1 + 4) + '" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="bold">' + tr + '</text>' +
    '<text x="' + q2 + '" y="' + (q2 + 4) + '" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="bold">' + br + '</text>' +
    '<text x="' + q1 + '" y="' + (q2 + 4) + '" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="bold">' + bl + '</text>' +
    '<g transform="translate(' + half + ',' + half + ') rotate(' + rotDeg + ')">' +
    '<polygon points="0,-10 7,7 -7,7" fill="none" stroke="#0f172a" stroke-width="1.8"/>' +
    '<circle cx="0" cy="-12" r="2.5" fill="#0f172a"/>' +
    '</g>' +
    (label ? '<text x="' + half + '" y="' + (size + 15) + '" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="bold">' + label + '</text>' : '') +
    '</g>'
  );
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} size
 * @param {number} sides
 * @param {number} dotsCount
 * @param {string} label
 */
function drawPolygonWithDots(x, y, size, sides, dotsCount, label) {
  var half = size / 2;
  var r = size * 0.34;
  var pts = [];
  for (var i = 0; i < sides; i++) {
    var ang = (-Math.PI / 2) + (i * 2 * Math.PI / sides);
    var px = half + r * Math.cos(ang);
    var py = half + r * Math.sin(ang);
    pts.push(px.toFixed(1) + "," + py.toFixed(1));
  }
  var dotPositions = [
    [half, half],
    [half - 8, half - 6], [half + 8, half - 6],
    [half - 8, half + 7], [half + 8, half + 7],
    [half, half - 11], [half, half + 11]
  ];
  var dotsSvg = "";
  for (var d = 0; d < dotsCount && d < dotPositions.length; d++) {
    var dp = dotPositions[d];
    dotsSvg += '<circle cx="' + dp[0] + '" cy="' + dp[1] + '" r="2.8" fill="#0f172a"/>';
  }
  return (
    '<g transform="translate(' + x + ',' + y + ')">' +
    '<rect x="0" y="0" width="' + size + '" height="' + size + '" rx="6" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>' +
    '<polygon points="' + pts.join(" ") + '" fill="#f8fafc" stroke="#0f172a" stroke-width="2"/>' +
    dotsSvg +
    '<text x="' + half + '" y="' + (size - 4) + '" text-anchor="middle" fill="#475569" font-size="8.5" font-weight="bold">' + sides + ' भुजा • ' + dotsCount + ' बिंदु</text>' +
    '<text x="' + half + '" y="' + (size + 15) + '" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="bold">' + label + '</text>' +
    '</g>'
  );
}

/** @param {import("./exam-types").Question} qObj */
function generateDynamicMatSvg(qObj) {
  if (qObj && qObj.graphic && qObj.graphic.indexOf("<svg") !== -1) {
    return qObj.graphic;
  }
  if (!qObj || (qObj.subject !== "मानसिक योग्यता" && !qObj.svgSpec)) {
    return "";
  }
  var idStr = String((qObj && qObj.id) || "M1");
  var spec = String((qObj && qObj.svgSpec) || "");
  var chap = String((qObj && qObj.chapterId) || "m1");
  var seed = 0;
  for (var i = 0; i < idStr.length; i++) {
    seed = (seed * 37 + idStr.charCodeAt(i)) % 10000;
  }
  var s1 = MAT_SYMS_POOL[seed % 18];
  var s2 = MAT_SYMS_POOL[(seed + 3) % 18];
  var s3 = MAT_SYMS_POOL[(seed + 7) % 18];
  var s4 = MAT_SYMS_POOL[(seed + 11) % 18];
  var s5 = MAT_SYMS_POOL[(seed + 15) % 18];
  var ansIdx = typeof (qObj && qObj.ans) === "number" ? qObj.ans : 0;
  var labels = ["(क)", "(ख)", "(ग)", "(घ)"];

  // m1: ODD-MAN-OUT (असंगत आकृति छाँटना — All 4 figures distinct!)
  if (chap === "m1" || spec.indexOf("ODD") === 0) {
    var oddRow = '<text x="200" y="14" text-anchor="middle" fill="#0f172a" font-size="10.5" font-weight="bold">चारों आकृतियों (क), (ख), (ग), (घ) को ध्यान से देखकर सबसे अलग (असंगत) आकृति चुनें:</text>';
    if (seed % 2 === 0) {
      // Polygon sides == dots count rule (3 boxes have sides == dots: 3=3, 4=4, 5=5; ansIdx has 6 sides but 2 dots!)
      var sideChoices = [3, 4, 5, 6];
      for (var b0 = 0; b0 < 4; b0++) {
        var bx0 = 18 + b0 * 94;
        var sCount = sideChoices[b0];
        var dCount = (b0 === ansIdx) ? 2 : sCount;
        oddRow += drawPolygonWithDots(bx0, 22, 74, sCount, dCount, labels[b0]);
      }
    } else {
      // 4 distinct rotations (0°, 90°, 180°, 270°) where 3 boxes have pointer pointing AT ★, and ansIdx points AWAY from ★
      for (var b = 0; b < 4; b++) {
        var bx = 18 + b * 94;
        var isOdd = b === ansIdx;
        var corners = ["○", "○", "○", "○"];
        corners[b] = "★";
        var targetAngles = [315, 45, 135, 225];
        var rot = isOdd ? ((targetAngles[b] + 180) % 360) : targetAngles[b];
        oddRow += drawSingleMatCell(bx, 22, 74, corners[0], corners[1], corners[2], corners[3], s5, rot, labels[b], false, false, false);
      }
    }
    return '<svg viewBox="0 0 400 116" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">' + oddRow + '</svg>';
  }

  // m2: EXACT FIGURE MATCHING (समरूप आकृति की पहचान)
  if (chap === "m2" || spec.indexOf("SIM") === 0) {
    var baseRot = (seed % 4) * 90;
    var simSvg =
      '<text x="46" y="13" text-anchor="middle" fill="#4338ca" font-size="10" font-weight="bold">समस्या आकृति</text>' +
      drawSingleMatCell(12, 20, 68, s1, s2, s3, s4, s5, baseRot, "मूल चित्र", false, false, false) +
      '<line x1="90" y1="16" x2="90" y2="96" stroke="#cbd5e1" stroke-width="2"/>' +
      '<text x="248" y="13" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">उत्तर आकृतियाँ (मूल चित्र के 100% समान आकृति चुनें):</text>';
    for (var sm = 0; sm < 4; sm++) {
      var smx = 102 + sm * 74;
      var isSame = sm === ansIdx;
      var smRot = isSame ? baseRot : ((baseRot + (sm + 1) * 90) % 360);
      var sc1 = isSame ? s1 : (sm === 0 ? s2 : s3);
      var sc2 = isSame ? s2 : (sm === 1 ? s4 : s1);
      simSvg += drawSingleMatCell(smx, 20, 66, sc1, sc2, s3, s4, s5, smRot, labels[sm], false, false, false);
    }
    return '<svg viewBox="0 0 404 114" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">' + simSvg + '</svg>';
  }

  // m3: PATTERN COMPLETION (पैटर्न पूरक — 2x2 Grid with missing bottom-right quarter)
  if (chap === "m3" || spec.indexOf("PAT") === 0) {
    var patSvg =
      '<text x="48" y="13" text-anchor="middle" fill="#4338ca" font-size="10" font-weight="bold">अधूरा पैटर्न (?)</text>' +
      '<g transform="translate(14, 20)">' +
      '<rect x="0" y="0" width="68" height="68" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>' +
      '<line x1="34" y1="0" x2="34" y2="68" stroke="#0f172a" stroke-width="1.5"/>' +
      '<line x1="0" y1="34" x2="68" y2="34" stroke="#0f172a" stroke-width="1.5"/>' +
      '<rect x="34" y="34" width="34" height="34" fill="#fef3c7" stroke="#0f172a" stroke-width="1.5" stroke-dasharray="3,2"/>' +
      '<line x1="0" y1="0" x2="34" y2="34" stroke="#0f172a" stroke-width="1.8"/>' +
      '<line x1="68" y1="0" x2="34" y2="34" stroke="#0f172a" stroke-width="1.8"/>' +
      '<line x1="0" y1="68" x2="34" y2="34" stroke="#0f172a" stroke-width="1.8"/>' +
      '<circle cx="34" cy="34" r="14" fill="none" stroke="#0f172a" stroke-width="1.8"/>' +
      '<text x="12" y="16" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">' + s1 + '</text>' +
      '<text x="56" y="16" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">' + s1 + '</text>' +
      '<text x="12" y="60" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">' + s1 + '</text>' +
      '<text x="51" y="56" text-anchor="middle" fill="#b45309" font-size="16" font-weight="bold">?</text>' +
      '<text x="34" y="83" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">समस्या पैटर्न</text>' +
      '</g>' +
      '<text x="248" y="13" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">उत्तर टुकड़े (? के स्थान पर कौन-सा टुकड़ा बैठेगा):</text>';
    for (var pt = 0; pt < 4; pt++) {
      var ptx = 102 + pt * 74;
      var isRightTile = pt === ansIdx;
      var diagLine = isRightTile
        ? '<line x1="0" y1="0" x2="64" y2="64" stroke="#0f172a" stroke-width="2"/><path d="M 0 24 A 24 24 0 0 0 24 0" fill="none" stroke="#0f172a" stroke-width="2"/>'
        : (pt % 2 === 0
          ? '<line x1="64" y1="0" x2="0" y2="64" stroke="#0f172a" stroke-width="2"/><path d="M 40 0 A 24 24 0 0 0 64 24" fill="none" stroke="#0f172a" stroke-width="2"/>'
          : '<line x1="0" y1="32" x2="64" y2="32" stroke="#0f172a" stroke-width="2"/><circle cx="32" cy="32" r="12" fill="none" stroke="#0f172a" stroke-width="2"/>');
      var cornerSym = isRightTile ? s1 : s2;
      patSvg +=
        '<g transform="translate(' + ptx + ', 20)">' +
        '<rect x="0" y="0" width="64" height="64" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>' +
        diagLine +
        '<text x="48" y="52" text-anchor="middle" fill="#0f172a" font-size="12" font-weight="bold">' + cornerSym + '</text>' +
        '<text x="32" y="79" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="bold">' + labels[pt] + '</text>' +
        '</g>';
    }
    return '<svg viewBox="0 0 404 114" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">' + patSvg + '</svg>';
  }

  // m5: ANALOGY (सादृश्यता 1 : 2 :: 3 : ?)
  if (chap === "m5" || spec.indexOf("ANA") === 0) {
    var anaTop =
      '<text x="195" y="13" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">संबंध पहचानें — आकृति 1 : आकृति 2 :: आकृति 3 : आकृति 4 (?)</text>' +
      drawSingleMatCell(16, 20, 62, s1, s2, s3, s4, s5, 0, "आकृति 1", false, false, false) +
      '<text x="90" y="54" text-anchor="middle" fill="#4338ca" font-size="16" font-weight="bold">:</text>' +
      drawSingleMatCell(102, 20, 62, s1, s2, s3, s4, s5, 180, "आकृति 2 (180°)", false, false, false) +
      '<text x="182" y="54" text-anchor="middle" fill="#4338ca" font-size="16" font-weight="bold">::</text>' +
      drawSingleMatCell(200, 20, 62, s3, s4, s1, s2, s5, 90, "आकृति 3", false, false, false) +
      '<text x="274" y="54" text-anchor="middle" fill="#4338ca" font-size="16" font-weight="bold">:</text>' +
      '<g transform="translate(288, 20)">' +
      '<rect x="0" y="0" width="62" height="62" rx="6" fill="#fef3c7" stroke="#0f172a" stroke-width="2" stroke-dasharray="4,3"/>' +
      '<text x="31" y="38" text-anchor="middle" fill="#b45309" font-size="22" font-weight="bold">?</text>' +
      '<text x="31" y="77" text-anchor="middle" fill="#0f172a" font-size="10.5" font-weight="bold">आकृति 4 (?)</text>' +
      '</g>';
    var anaBot = '<text x="195" y="110" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">उत्तर आकृतियाँ (आकृति 3 को 180° घुमाने पर बनने वाली आकृति चुनें):</text>';
    for (var an = 0; an < 4; an++) {
      var anx = 22 + an * 92;
      var isAnaWin = an === ansIdx;
      var anRot = isAnaWin ? 270 : ((an * 90) === 270 ? 0 : an * 90);
      anaBot += drawSingleMatCell(anx, 116, 62, isAnaWin ? s3 : s1, isAnaWin ? s4 : s2, isAnaWin ? s1 : s3, isAnaWin ? s2 : s4, s5, anRot, labels[an], false, false, false);
    }
    return '<svg viewBox="0 0 390 196" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">' + anaTop + anaBot + '</svg>';
  }

  // m6: GEOMETRICAL FIGURE COMPLETION (ज्यामितीय आकृति पूर्ति)
  if (chap === "m6" || spec.indexOf("GEO") === 0) {
    var notchY = 26 + (seed % 3) * 6;
    var geoSvg =
      '<text x="48" y="13" text-anchor="middle" fill="#4338ca" font-size="10" font-weight="bold">अधूरा वर्ग</text>' +
      '<g transform="translate(14, 20)">' +
      '<rect x="0" y="0" width="68" height="68" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3"/>' +
      '<polygon points="0,0 44,0 28,' + notchY + ' 48,46 34,68 0,68" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/>' +
      '<text x="34" y="83" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">समस्या आकृति</text>' +
      '</g>' +
      '<text x="248" y="13" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">पूरक टुकड़े (कौन-सा टुकड़ा जोड़ने पर पूर्ण वर्ग बनेगा):</text>';
    for (var ge = 0; ge < 4; ge++) {
      var gex = 102 + ge * 74;
      var isGeoWin = ge === ansIdx;
      var polyPts = isGeoWin
        ? ('24,0 48,0 48,68 14,68 28,46 8,' + notchY)
        : (ge % 2 === 0 ? '10,0 48,0 48,68 10,68 32,34' : '24,0 48,0 36,68 8,68 8,24');
      geoSvg +=
        '<g transform="translate(' + gex + ', 20)">' +
        '<rect x="0" y="0" width="64" height="68" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>' +
        '<polygon points="' + polyPts + '" fill="#cbd5e1" stroke="#0f172a" stroke-width="2"/>' +
        '<text x="32" y="83" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="bold">' + labels[ge] + '</text>' +
        '</g>';
    }
    return '<svg viewBox="0 0 404 114" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">' + geoSvg + '</svg>';
  }

  // m7: VERTICAL MIRROR IMAGE (दर्पण प्रतिबिंब M | N)
  if (chap === "m7" || spec.indexOf("MIR") === 0) {
    var mirSvg =
      '<text x="46" y="13" text-anchor="middle" fill="#4338ca" font-size="10" font-weight="bold">समस्या आकृति</text>' +
      drawSingleMatCell(12, 20, 68, s1, s2, s3, s4, s5, 45, "मूल चित्र", false, false, false) +
      '<line x1="88" y1="16" x2="88" y2="92" stroke="#0f172a" stroke-width="2.2" stroke-dasharray="4,2"/>' +
      '<text x="88" y="12" text-anchor="middle" fill="#dc2626" font-size="9.5" font-weight="bold">M</text>' +
      '<text x="88" y="103" text-anchor="middle" fill="#dc2626" font-size="9.5" font-weight="bold">N</text>' +
      '<text x="248" y="13" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">दर्पण प्रतिबिंब विकल्प (बायाँ ↔ दायाँ पलटने पर):</text>';

    for (var m = 0; m < 4; m++) {
      var mx = 102 + m * 74;
      var isCorrectMir = m === ansIdx;
      var mRot = isCorrectMir ? 315 : (m * 90);
      mirSvg += drawSingleMatCell(mx, 20, 66, s1, s2, s3, s4, s5, mRot, labels[m], false, isCorrectMir, !isCorrectMir && m % 2 === 1);
    }
    return '<svg viewBox="0 0 404 114" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">' + mirSvg + '</svg>';
  }

  // m8: WATER IMAGE (जल प्रतिबिंब — Top ↕ Bottom Flip)
  if (chap === "m8" || spec.indexOf("WAT") === 0) {
    var watSvg =
      '<text x="46" y="13" text-anchor="middle" fill="#0284c7" font-size="10" font-weight="bold">समस्या आकृति</text>' +
      drawSingleMatCell(12, 18, 66, s1, s2, s3, s4, s5, 0, "", false, false, false) +
      '<line x1="10" y1="90" x2="80" y2="90" stroke="#0284c7" stroke-width="2.2" stroke-dasharray="4,2"/>' +
      '<text x="46" y="102" text-anchor="middle" fill="#0284c7" font-size="9.5" font-weight="bold">जल तल (W—X)</text>' +
      '<text x="248" y="13" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">जल प्रतिबिंब विकल्प (ऊपर ↕ नीचे पलटने पर):</text>';
    for (var wt = 0; wt < 4; wt++) {
      var wtx = 102 + wt * 74;
      var isWatWin = wt === ansIdx;
      var wRot = isWatWin ? 180 : (wt === 0 ? 0 : wt * 90);
      watSvg += drawSingleMatCell(wtx, 20, 66, s1, s2, s3, s4, s5, wRot, labels[wt], false, !isWatWin && wt === 2, isWatWin);
    }
    return '<svg viewBox="0 0 404 114" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">' + watSvg + '</svg>';
  }

  // m9: PAPER FOLDING & PUNCHING (कागज़ मोड़ना एवं पंच करना)
  if (chap === "m9" || spec.indexOf("FLD") === 0) {
    var fldSvg =
      '<text x="46" y="13" text-anchor="middle" fill="#4338ca" font-size="10" font-weight="bold">मोड़ व पंच (●)</text>' +
      '<g transform="translate(12, 20)">' +
      '<rect x="0" y="0" width="68" height="68" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>' +
      '<line x1="34" y1="0" x2="34" y2="68" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,2"/>' +
      '<line x1="0" y1="34" x2="68" y2="34" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,2"/>' +
      '<rect x="34" y="0" width="34" height="34" fill="#e0e7ff" stroke="#0f172a" stroke-width="1.8"/>' +
      '<circle cx="48" cy="18" r="4.5" fill="#0f172a"/>' +
      '<text x="34" y="83" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">4 परत + 1 पंच</text>' +
      '</g>' +
      '<text x="248" y="13" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">कागज़ खोलने पर बनने वाला सही पैटर्न चुनें:</text>';
    for (var fl = 0; fl < 4; fl++) {
      var flx = 102 + fl * 74;
      var isFldWin = fl === ansIdx;
      var holes = "";
      if (isFldWin) {
        holes =
          '<circle cx="20" cy="20" r="4" fill="#0f172a"/>' +
          '<circle cx="44" cy="20" r="4" fill="#0f172a"/>' +
          '<circle cx="20" cy="44" r="4" fill="#0f172a"/>' +
          '<circle cx="44" cy="44" r="4" fill="#0f172a"/>';
      } else if (fl % 3 === 0) {
        holes = '<circle cx="44" cy="20" r="4" fill="#0f172a"/><circle cx="20" cy="44" r="4" fill="#0f172a"/>';
      } else if (fl % 3 === 1) {
        holes = '<circle cx="44" cy="20" r="4" fill="#0f172a"/><circle cx="44" cy="44" r="4" fill="#0f172a"/>';
      } else {
        holes = '<circle cx="32" cy="32" r="4" fill="#0f172a"/>';
      }
      fldSvg +=
        '<g transform="translate(' + flx + ', 20)">' +
        '<rect x="0" y="0" width="64" height="64" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>' +
        '<line x1="32" y1="0" x2="32" y2="64" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="2,2"/>' +
        '<line x1="0" y1="32" x2="64" y2="32" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="2,2"/>' +
        holes +
        '<text x="32" y="79" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="bold">' + labels[fl] + '</text>' +
        '</g>';
    }
    return '<svg viewBox="0 0 404 114" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">' + fldSvg + '</svg>';
  }

  // m10: CUT PIECES ASSEMBLY (कटे टुकड़ों से आकृति निर्माण)
  if (chap === "m10" || spec.indexOf("CUT") === 0) {
    var cutSvg =
      '<text x="46" y="13" text-anchor="middle" fill="#4338ca" font-size="10" font-weight="bold">कटे टुकड़े (3)</text>' +
      '<g transform="translate(12, 20)">' +
      '<rect x="0" y="0" width="68" height="68" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>' +
      '<polygon points="10,24 34,6 58,24" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8"/>' +
      '<rect x="12" y="30" width="20" height="28" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8"/>' +
      '<rect x="36" y="30" width="20" height="28" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8"/>' +
      '<text x="34" y="83" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">1△ + 2▭ टुकड़े</text>' +
      '</g>' +
      '<text x="248" y="13" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">तीनों टुकड़ों को जोड़ने पर बनने वाली आकृति चुनें:</text>';
    for (var ct = 0; ct < 4; ct++) {
      var ctx = 102 + ct * 74;
      var isCutWin = ct === ansIdx;
      var innerShape = isCutWin
        ? '<polygon points="12,26 32,8 52,26" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8"/><rect x="12" y="26" width="20" height="28" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8"/><rect x="32" y="26" width="20" height="28" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8"/>'
        : (ct % 2 === 0
          ? '<circle cx="32" cy="32" r="20" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8"/><line x1="12" y1="32" x2="52" y2="32" stroke="#0f172a" stroke-width="1.8"/>'
          : '<polygon points="32,8 54,52 10,52" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8"/><line x1="32" y1="8" x2="32" y2="52" stroke="#0f172a" stroke-width="1.8"/>');
      cutSvg +=
        '<g transform="translate(' + ctx + ', 20)">' +
        '<rect x="0" y="0" width="64" height="64" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>' +
        innerShape +
        '<text x="32" y="79" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="bold">' + labels[ct] + '</text>' +
        '</g>';
    }
    return '<svg viewBox="0 0 404 114" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">' + cutSvg + '</svg>';
  }

  // m11: EMBEDDED FIGURE (सन्निहित / छिपी हुई आकृति)
  if (chap === "m11" || spec.indexOf("EMB") === 0) {
    var embSvg =
      '<text x="46" y="13" text-anchor="middle" fill="#4338ca" font-size="10" font-weight="bold">लक्ष्य आकृति</text>' +
      '<g transform="translate(12, 20)">' +
      '<rect x="0" y="0" width="68" height="68" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>' +
      '<polyline points="16,18 52,18 16,50 52,50" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<text x="34" y="83" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">इसे ढूँढें (Z-पथ)</text>' +
      '</g>' +
      '<text x="248" y="13" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">किस विकल्प के अंदर यह आकृति छिपी हुई है:</text>';
    for (var em = 0; em < 4; em++) {
      var emx = 102 + em * 74;
      var isEmbWin = em === ansIdx;
      var webLines = isEmbWin
        ? '<rect x="14" y="16" width="36" height="32" fill="none" stroke="#94a3b8" stroke-width="1.4"/><polyline points="14,16 50,16 14,48 50,48" fill="none" stroke="#0f172a" stroke-width="2.6"/>'
        : '<rect x="14" y="16" width="36" height="32" fill="none" stroke="#0f172a" stroke-width="1.8"/><line x1="32" y1="16" x2="32" y2="48" stroke="#0f172a" stroke-width="1.8"/><line x1="14" y1="32" x2="50" y2="32" stroke="#0f172a" stroke-width="1.8"/>';
      embSvg +=
        '<g transform="translate(' + emx + ', 20)">' +
        '<rect x="0" y="0" width="64" height="64" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>' +
        webLines +
        '<text x="32" y="79" text-anchor="middle" fill="#0f172a" font-size="11" font-weight="bold">' + labels[em] + '</text>' +
        '</g>';
    }
    return '<svg viewBox="0 0 404 114" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">' + embSvg + '</svg>';
  }

  // m12: COUNTING FIGURES & BLOCKS (आकृतियों एवं ब्लॉकों की गिनती)
  if (chap === "m12" || spec.indexOf("CNT") === 0) {
    var cntSvg =
      '<g transform="translate(14, 10)">' +
      '<rect x="0" y="0" width="110" height="84" rx="6" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>' +
      '<polygon points="55,8 12,74 98,74" fill="none" stroke="#0f172a" stroke-width="2"/>' +
      '<line x1="55" y1="8" x2="34" y2="74" stroke="#0f172a" stroke-width="1.4"/>' +
      '<line x1="55" y1="8" x2="55" y2="74" stroke="#0f172a" stroke-width="1.4"/>' +
      '<line x1="55" y1="8" x2="76" y2="74" stroke="#0f172a" stroke-width="1.4"/>' +
      '<line x1="26" y1="44" x2="84" y2="44" stroke="#0f172a" stroke-width="1.4"/>' +
      '<text x="55" y="98" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">त्रिभुज गिनती: n(n+1)/2</text>' +
      '</g>' +
      '<g transform="translate(140, 10)">' +
      '<rect x="0" y="0" width="84" height="84" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>' +
      '<line x1="21" y1="0" x2="21" y2="84" stroke="#0f172a" stroke-width="1.3"/>' +
      '<line x1="42" y1="0" x2="42" y2="84" stroke="#0f172a" stroke-width="1.3"/>' +
      '<line x1="63" y1="0" x2="63" y2="84" stroke="#0f172a" stroke-width="1.3"/>' +
      '<line x1="0" y1="21" x2="84" y2="21" stroke="#0f172a" stroke-width="1.3"/>' +
      '<line x1="0" y1="42" x2="84" y2="42" stroke="#0f172a" stroke-width="1.3"/>' +
      '<line x1="0" y1="63" x2="84" y2="63" stroke="#0f172a" stroke-width="1.3"/>' +
      '<text x="42" y="98" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">वर्ग ग्रिड: Σn²</text>' +
      '</g>' +
      '<g transform="translate(242, 10)">' +
      '<rect x="10" y="24" width="58" height="58" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>' +
      '<polygon points="10,24 32,6 90,6 68,24" fill="#f8fafc" stroke="#0f172a" stroke-width="1.8"/>' +
      '<polygon points="68,24 90,6 90,64 68,82" fill="#f1f5f9" stroke="#0f172a" stroke-width="1.8"/>' +
      '<line x1="29" y1="24" x2="29" y2="82" stroke="#0f172a" stroke-width="1.2"/>' +
      '<line x1="48" y1="24" x2="48" y2="82" stroke="#0f172a" stroke-width="1.2"/>' +
      '<line x1="10" y1="43" x2="68" y2="43" stroke="#0f172a" stroke-width="1.2"/>' +
      '<line x1="10" y1="62" x2="68" y2="62" stroke="#0f172a" stroke-width="1.2"/>' +
      '<text x="50" y="98" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">3D घन ब्लॉक: n³</text>' +
      '</g>';
    return '<svg viewBox="0 0 360 114" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">' + cntSvg + '</svg>';
  }

  // m4: FIGURE SERIES COMPLETION (आकृति श्रेणी क्रम 1 ➔ 2 ➔ 3 ➔ ?)
  var topSvg = '<text x="200" y="13" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">समस्या आकृतियाँ (90° घूर्णन एवं कोनों का नियम पहचानकर ? भरें):</text>';
  var symsArr = [s1, s2, s3, s4];
  for (var p = 0; p < 3; p++) {
    var px = 22 + p * 92;
    topSvg += drawSingleMatCell(
      px, 18, 62,
      symsArr[(p + 0) % 4],
      symsArr[(p + 1) % 4],
      symsArr[(p + 2) % 4],
      symsArr[(p + 3) % 4],
      s5,
      p * 90,
      "चरण " + (p + 1) + " (" + (p * 90) + "°)",
      false,
      false,
      false
    );
  }
  topSvg +=
    '<g transform="translate(298, 18)">' +
    '<rect x="0" y="0" width="62" height="62" rx="6" fill="#fef3c7" stroke="#0f172a" stroke-width="2" stroke-dasharray="4,3"/>' +
    '<text x="31" y="38" text-anchor="middle" fill="#b45309" font-size="22" font-weight="bold">?</text>' +
    '<text x="31" y="76" text-anchor="middle" fill="#0f172a" font-size="10.5" font-weight="bold">चरण 4 (270°)</text>' +
    '</g>';

  var botSvg = '<text x="200" y="108" text-anchor="middle" fill="#0f172a" font-size="10" font-weight="bold">उत्तर आकृतियाँ (सही विकल्प चुनें):</text>';
  for (var kIdx = 0; kIdx < 4; kIdx++) {
    var kx = 22 + kIdx * 92;
    var isTarget = kIdx === ansIdx;
    var sh = isTarget ? 3 : ((kIdx + 1) % 3);
    var rotVal = isTarget ? 270 : (kIdx * 60);
    botSvg += drawSingleMatCell(
      kx, 114, 62,
      symsArr[(sh + 0) % 4],
      symsArr[(sh + 1) % 4],
      symsArr[(sh + 2) % 4],
      symsArr[(sh + 3) % 4],
      s5,
      rotVal,
      labels[kIdx],
      false,
      false,
      false
    );
  }
  return '<svg viewBox="0 0 390 196" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">' + topSvg + botSvg + '</svg>';
}

export { generateDynamicMatSvg, MAT_SYMS_POOL };
