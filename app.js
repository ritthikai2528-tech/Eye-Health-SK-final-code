// ==============================================================
// ⬇️ โค้ดเดิมของคุณทั้งหมด (var G_extraClickIdx = ... ลงไป) ปล่อยไว้เหมือนเดิม ⬇️
// ==============================================================
// === ประกาศตัวแปร global ครั้งเดียว ===
var G_extraClickIdx = { diag: null, treat: null, behRisk: null, fupWear: null, nat: null };

// === Helper สำหรับ toggle ===
function makeChartToggle(stateKey) {
  return function(evt, elements) {
    var chart = this;
    var ds = chart.data.datasets[0];
    if (!chart._origColors) chart._origColors = ds.backgroundColor.slice();
    var orig = chart._origColors;
    
    if (!elements.length) {
      ds.backgroundColor = orig.slice();
      G_extraClickIdx[stateKey] = null;
      chart.update();
      return;
    }
    var idx = elements[0].index;
    if (G_extraClickIdx[stateKey] === idx) {
      ds.backgroundColor = orig.slice();
      G_extraClickIdx[stateKey] = null;
    } else {
      G_extraClickIdx[stateKey] = idx;
      ds.backgroundColor = orig.map(function(c, i) {
        return i === idx ? c : c + '33';
      });
    }
    chart.update();
  };
}

// 🔧 Helper สำหรับ toggle highlight บนกราฟ doughnut/pie ทุกตัว
function makeChartToggle(stateKey) {
  return function(evt, elements) {
    var chart = this;
    var ds = chart.data.datasets[0];
    
    if (!chart._origColors) chart._origColors = ds.backgroundColor.slice();
    var orig = chart._origColors;
    
    if (!elements.length) {
      ds.backgroundColor = orig.slice();
      G_extraClickIdx[stateKey] = null;
      chart.update();
      return;
    }
    
    var idx = elements[0].index;
    if (G_extraClickIdx[stateKey] === idx) {
      ds.backgroundColor = orig.slice();
      G_extraClickIdx[stateKey] = null;
    } else {
      G_extraClickIdx[stateKey] = idx;
      ds.backgroundColor = orig.map(function(c, i) {
        return i === idx ? c : c + '33';
      });
    }
    chart.update();
  };
}

function renderExtraDashCharts(extraStats) {
  if(!extraStats) return;
  
  // รีเซ็ตสถานะคลิกทุกครั้งที่ render ใหม่
  G_extraClickIdx = { diag: null, treat: null, behRisk: null, fupWear: null, nat: null };
  
  // ─── 1. ระดับความรุนแรง (Severity) ──────────────
  if(extraStats.diagSeverityTally) {
    var dKeys = Object.keys(extraStats.diagSeverityTally);
    var dVals = dKeys.map(function(k){ return extraStats.diagSeverityTally[k]; });
    if(window.G_diagInst) window.G_diagInst.destroy();
    window.G_diagInst = new Chart(document.getElementById('diagSeverityDashChart').getContext('2d'), {
      type: 'doughnut',
      data: { labels: dKeys, datasets:[{ data: dVals, backgroundColor: ['#16A34A','#ca8a04','#f97316','#dc2626'] }] },
      options: { 
        maintainAspectRatio: false, 
        onClick: makeChartToggle('diag'),
        plugins: { 
          legend: { position:'bottom', labels: {font: {family:'Sarabun', size: 9}} },
          datalabels: { color: '#fff', font: { weight: 'bold', size: 11 }, formatter: function(v){ return v>0?v:''; } }
        } 
      }, plugins: [ChartDataLabels]
    });
  }
  
  // ─── 2. สัดส่วนสิทธิการรักษา ─────────────────────
  if(extraStats.treatTally) {
      var tKeys = Object.keys(extraStats.treatTally).sort(function(a,b){ return extraStats.treatTally[b]-extraStats.treatTally[a]; });
      var tVals = tKeys.map(function(k){ return extraStats.treatTally[k]; });
      if(window.G_treatInst) window.G_treatInst.destroy(); 
      window.G_treatInst = new Chart(document.getElementById('treatDashChart').getContext('2d'), {
        type: 'doughnut',
        data: { labels: tKeys, datasets:[{ data: tVals, backgroundColor: ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#64748b','#f43f5e'] }] },
        options: { 
          maintainAspectRatio: false, 
          onClick: makeChartToggle('treat'),
          plugins: { 
            legend: { display: false },
            datalabels: { color: '#fff', font: { weight: 'bold', size: 10 }, formatter: function(v) { return v; } },
            tooltip: { callbacks: { label: function(ctx) { var t = ctx.chart.data.datasets[0].data.reduce(function(a,b){return a+b;},0); return ctx.label+': '+ctx.raw+' ('+Math.round(ctx.raw/t*100)+'%)'; } } }
          } 
        }, plugins: [ChartDataLabels]
      });
  }

  // ─── 3. ความเสี่ยงพฤติกรรมหน้าจอ ──────────────────
  if(extraStats.behRiskTally) {
      if(window.G_behDashInst) window.G_behDashInst.destroy(); 
      window.G_behDashInst = new Chart(document.getElementById('behRiskDashChart').getContext('2d'), {
        type: 'pie',
        data: { labels: ['เสี่ยงน้อย (0-3)', 'ปานกลาง (4-7)', 'เสี่ยงสูง (≥8)'], 
                datasets:[{ data: [extraStats.behRiskTally.low, extraStats.behRiskTally.medium, extraStats.behRiskTally.high], 
                            backgroundColor: ['#16A34A', '#f59e0b', '#dc2626'] }] },
        options: { 
          maintainAspectRatio: false, 
          onClick: makeChartToggle('behRisk'),
          plugins: { 
            legend: { position:'bottom', labels: {font: {family:'Sarabun', size: 10}} },
            datalabels: { color: '#fff', font: { weight: 'bold', size: 12 }, formatter: function(v){ return v>0?v:''; } }
          } 
        }, plugins: [ChartDataLabels]
      });
  }

  // ─── 4. การติดตามแว่นตา ────────────────────────
  if(extraStats.fupWearTally) {
      var fKeys = Object.keys(extraStats.fupWearTally);
      var fVals = fKeys.map(function(k){ return extraStats.fupWearTally[k]; });
      if(window.G_fupDashInst) window.G_fupDashInst.destroy(); 
      window.G_fupDashInst = new Chart(document.getElementById('fupStatusDashChart').getContext('2d'), {
        type: 'doughnut',
        data: { labels: fKeys.length ? fKeys : ['ยังไม่มีข้อมูล'], 
                datasets:[{ data: fKeys.length ? fVals : [1], 
                            backgroundColor: fKeys.length ? ['#16A34A', '#84cc16', '#f59e0b', '#dc2626'] : ['#e2e8f0'] }] },
        options: { 
          maintainAspectRatio: false, 
          onClick: fKeys.length ? makeChartToggle('fupWear') : undefined,
          plugins: { 
            legend: { position:'bottom', labels: {font: {family:'Sarabun', size: 10}} },
            datalabels: { color: '#fff', font: { weight: 'bold', size: 12 }, formatter: function(v){ return fKeys.length&&v>0?v:''; } }
          } 
        }, plugins: [ChartDataLabels]
      });
  }

  // ─── 5. สัดส่วนสัญชาติ (Nationality) ─────────────────────
  if(extraStats.natTally) {
      var nKeys = Object.keys(extraStats.natTally).sort(function(a,b){ 
        return extraStats.natTally[b]-extraStats.natTally[a]; 
      });
      var nVals = nKeys.map(function(k){ return extraStats.natTally[k]; });
      var nTotal = nVals.reduce(function(a,b){return a+b;}, 0) || 1;
      var nColors = ['#3b82f6','#10b981','#f59e0b','#ec4899','#8b5cf6','#64748b','#ef4444'];
      
      if(window.G_natInst) window.G_natInst.destroy();
      var can = document.getElementById('natDashChart');
      if(!can) return;
      
      // เก็บสีเดิมไว้ใช้สลับ
      var origNatColors = nKeys.map(function(_,i){ return nColors[i%nColors.length]; });
      
      window.G_natInst = new Chart(can.getContext('2d'), {
        type: 'bar',
        data: { 
          labels: nKeys, 
          datasets:[{ 
            data: nVals, 
            backgroundColor: origNatColors.slice(),
            borderRadius: 6,
            barThickness: nKeys.length === 1 ? 36 : 'flex',
            maxBarThickness: 32,
            categoryPercentage: 0.7,
            barPercentage: 0.85
          }] 
        },
        options: { 
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      // 1. เพิ่ม padding ขวาให้กว้างขึ้นเป็น 70 ตัวเลขจะได้ไม่โดนบัง
      layout: { padding: { right: 70, left: 4, top: 4, bottom: 4 } }, 
      onClick: function(evt, elements) {
            var chart = this;
            var ds = chart.data.datasets[0];
            if (!chart._origColors) chart._origColors = origNatColors.slice();
            
            // กดที่ว่าง → คืนค่า
            if (!elements.length) {
              ds.backgroundColor = chart._origColors.slice();
              G_extraClickIdx.nat = null;
              var sb = document.getElementById('srchBox');
              if(sb) { sb.value = ''; applyFilters(); }
              chart.update();
              return;
            }
            
            var idx = elements[0].index;
            var nat = nKeys[idx];
            var sb = document.getElementById('srchBox');
            
            // กดซ้ำแท่งเดิม → คืนค่า
            if (G_extraClickIdx.nat === idx) {
              ds.backgroundColor = chart._origColors.slice();
              G_extraClickIdx.nat = null;
              if(sb) { sb.value = ''; applyFilters(); }
            } else {
              // กดแท่งใหม่ → กรอง + highlight
              G_extraClickIdx.nat = idx;
              ds.backgroundColor = chart._origColors.map(function(c, i) {
                return i === idx ? c : c + '33';
              });
              if(sb) { sb.value = nat; applyFilters(); }
            }
            chart.update();
          },
          plugins: { 
            legend: { display: false },
            datalabels: { 
              color: '#1e293b', 
              anchor: 'end', 
              align: 'right',
              offset: 6,
              font: { weight: 'bold', size: 12, family: 'Sarabun' }, 
              formatter: function(v) { 
                if (v === 0) return '';
                var pct = Math.round(v/nTotal*100);
                return v + ' คน (' + pct + '%)'; 
              }
            },
            tooltip: {
              callbacks: {
                label: function(ctx) {
                  var pct = Math.round(ctx.raw/nTotal*100);
                  return ctx.raw + ' คน (' + pct + '%)';
                }
              }
            }
          },
      scales: {
        x: { 
          beginAtZero: true, 
          // 2. ปรับ grace เป็น 40% เพื่อเผื่อที่ว่างด้านขวาของปลายแท่งกราฟ
          grace: '40%', 
          ticks: { font:{family:'Sarabun', size:10}, color:'#64748b' },
          grid: { color: '#f1f5f9' }
        },
        y: { 
          ticks: { font:{family:'Sarabun', size:11, weight:'bold'}, color:'#334155' },
          grid: { display: false }
        }
      }
    }, 
        plugins: [ChartDataLabels]
      });
  }
} // <- ปิดฟังก์ชัน renderExtraDashCharts ตรงนี้ที่เดียวครับ

var G = {
  session:{loggedIn:false,user:'',role:'',hospcode:''}, settings:{}, hospList:[], schoolList:[], vaList:[], vaMap: {}, natList:[], links:[], videos: [], allRows:[], dispRows:[], chartData: { amphoe: [], hosp: [], school: [] }, satCharts: {}, kpi: {}, hospSummaryData: [],
  barInst:null, pieInst:null, lineInst:null, hospInst:null, schoolInst:null, satBreakdownInst:null, satTypePieInst:null, delTarget:{cid:'',sheet:''}
};
var myMap = null; var hospLayer = null; var schoolLayer = null; var _satClickIdx = null; var _editMode = false;

function e_(str) { 
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function toThaiDate(dateStr) { if (!dateStr) return '......../........../............'; var parts = dateStr.split('/'); if (parts.length === 3) { var y = parseInt(parts[2], 10); if (y < 2500) y += 543; return parts[0] + '/' + parts[1] + '/' + y; } return dateStr; }
function smartParseCSVLine(line, delimiter) { var row = []; var inQuotes = false; var currentVal = ''; for(var j=0; j<line.length; j++) { var c = line[j]; if(c === '"') { inQuotes = !inQuotes; } else if(c === delimiter && !inQuotes) { row.push(currentVal.trim()); currentVal = ''; } else { currentVal += c; } } row.push(currentVal.trim()); return row; }
function smartProcessRow(cols) {
    var cleanedCols = cols.map(function(c) { return String(c).replace(/^"|"$/g, '').trim(); }); 
    var out = new Array(47).fill('');  // ⬅️ เปลี่ยนจาก 46 เป็น 47
    
    // ฟังก์ชันย่อยสำหรับแปลงตัวเลข ID เป็นค่าสายตา
    function mapVa(val) {
        var v = String(val || '').trim();
        return (v && G.vaMap && G.vaMap[v]) ? G.vaMap[v] : v;
    }

    if (cleanedCols.length >= 15 && cleanedCols.length <= 25 && cleanedCols[0].toLowerCase().indexOf('ระดับ') === -1) {
        out[0] = cleanedCols[0]; out[1] = cleanedCols[1]; out[2] = (cleanedCols[2]||'').replace(/\D/g, ''); out[3] = cleanedCols[3]; out[4] = cleanedCols[4]; out[5] = cleanedCols[5]; out[6] = (cleanedCols[3]||'') + (cleanedCols[4]||'') + ' ' + (cleanedCols[5]||'');
        var bd = cleanedCols[6] || ''; var byear = 0, bmonth = 0, bday = 0;
        if (bd.indexOf('-') > -1) { var p = bd.split('-'); byear = parseInt(p[0]); bmonth = parseInt(p[1]); bday = parseInt(p[2]); } else if (bd.indexOf('/') > -1) { var p = bd.split('/'); bday = parseInt(p[0]); bmonth = parseInt(p[1]); byear = parseInt(p[2]); } else if (bd.length === 8) { byear = parseInt(bd.substring(0,4)); bmonth = parseInt(bd.substring(4,6)); bday = parseInt(bd.substring(6,8)); }
        if (byear > 0) { if (byear < 2500) byear += 543; out[7] = String(bday).padStart(2,'0') + '/' + String(bmonth).padStart(2,'0') + '/' + byear; var dobG = new Date(byear - 543, bmonth - 1, bday); var today = new Date(); var age = today.getFullYear() - dobG.getFullYear(); var m = today.getMonth() - dobG.getMonth(); if (m < 0 || (m === 0 && today.getDate() < dobG.getDate())) { age--; } out[8] = age > 0 ? String(age) : ''; }
        out[9] = (cleanedCols[7] === '1' || cleanedCols[7] === 'ชาย') ? '1' : '2'; out[10] = (cleanedCols[0]||'') + (cleanedCols[1] ? '/' + cleanedCols[1] : ''); 
        var isTxtFormat = (cleanedCols[11] === 'F' || cleanedCols[11] === 'M' || cleanedCols.length <= 19);
        if (isTxtFormat) { 
            out[11] = ''; 
            out[12] = cleanedCols[11] || 'F'; 
            out[15] = cleanedCols[8] || ''; 
            out[16] = cleanedCols[9] || ''; 
            out[17] = cleanedCols[10] || ''; 
            out[24] = mapVa(cleanedCols[12]); // VAขวา_ตาเปล่า
            out[28] = mapVa(cleanedCols[13]); // PHขวา
            out[25] = mapVa(cleanedCols[14]); // VAซ้าย_ตาเปล่า
            out[29] = mapVa(cleanedCols[15]); // PHซ้าย
            var hcRaw = String(cleanedCols[16] || '').trim().replace(/^[="']+|["']+$/g, ''); 
            var sd = cleanedCols[17] || ''; 
        } else { 
            out[11] = cleanedCols[11] || ''; 
            out[12] = 'F'; 
            out[15] = cleanedCols[8] || ''; 
            out[16] = cleanedCols[9] || ''; 
            out[17] = cleanedCols[10] || ''; 
            out[24] = mapVa(cleanedCols[12]); // VAขวา_ตาเปล่า
            out[25] = mapVa(cleanedCols[13]); // VAซ้าย_ตาเปล่า
            out[28] = mapVa(cleanedCols[14]); // PHขวา
            out[29] = mapVa(cleanedCols[15]); // PHซ้าย
            // ไม่มี out[30], out[31] (VA OU)
            out[32] = 'ปกติ'; // Cover_Test
            var hcRaw = String(cleanedCols[16] || '').trim().replace(/^[="']+|["']+$/g, ''); 
            var sd = cleanedCols[17] || ''; 
        }
        if (sd.indexOf('-') > -1) { var p = sd.split('-'); var sy = parseInt(p[0]); if(sy < 2500) sy += 543; out[13] = String(p[2]).padStart(2,'0') + '/' + String(p[1]).padStart(2,'0') + '/' + sy; } else if (sd.indexOf('/') > -1) { var p = sd.split('/'); var sy = parseInt(p[2]); if(sy < 2500) sy += 543; out[13] = String(p[0]).padStart(2,'0') + '/' + String(p[1]).padStart(2,'0') + '/' + sy; } else if (sd.length === 8) { var sy = parseInt(sd.substring(0,4)); if(sy < 2500) sy += 543; out[13] = sd.substring(6,8) + '/' + sd.substring(4,6) + '/' + sy; } else { var d = new Date(); out[13] = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + (d.getFullYear() + 543); }
        var hc = hcRaw; if (!hc && G.session && G.session.hospcode !== 'all') hc = G.session.hospcode; if (hc && hc.length > 0 && hc.length < 5) hc = ("00000" + hc).slice(-5); out[14] = hc;
        out[18] = '0'; out[19] = '0'; out[20] = '0'; out[21] = '0'; out[22] = '0'; out[23] = '0'; 
        out[32] = 'ปกติ'; out[33] = 'ปกติ'; out[34] = 'ปกติ'; out[35] = 'ปกติ'; out[36] = 'สายตาปกติ'; out[37] = 'ไม่จำเป็นต้องส่งต่อ';
        if (hc) { var hInfo = G.hospList.find(function(h) { return h.hospcode === hc; }); if (hInfo) { out[41] = hInfo.tambon || ''; out[42] = hInfo.amphoe || ''; out[43] = hInfo.province || 'สมุทรสาคร'; } else { out[43] = 'สมุทรสาคร'; } } else { out[43] = 'สมุทรสาคร'; }
    } else { 
        for(var i=0; i<46; i++) { 
            var val = cleanedCols[i] || ''; 
            val = val.replace(/^[="']+|["']+$/g, '').trim(); 
            if (i === 2) val = val.replace(/\D/g, ''); 
            if (i === 14 && val.length > 0 && val.length < 5) val = ("00000" + val).slice(-5); 
            
            // กรณีเป็นไฟล์ CSV 47 คอลัมน์ แปลงรหัสในคอลัมน์ VA ทั้ง 8 ช่อง
            if ([24, 25, 26, 27, 28, 29, 30, 31].indexOf(i) > -1) {
                val = mapVa(val);
            }
            out[i] = val; 
        } 
    }
    if (!out[46]) out[46] = 'ไทย';  // ⬅️ เพิ่มก่อน return 
    return out;
}
function toast(msg, type) { var wrap = document.getElementById('toastWrap'); if (!wrap) return; var t = document.createElement('div'); var icon = type === 'ok' ? '✅ ' : type === 'err' ? '❌ ' : 'ℹ️ '; t.className = 'toast t-' + (type || 'inf'); t.innerHTML = icon + msg; wrap.appendChild(t); setTimeout(function() { t.style.opacity = '0'; t.style.transform = 'translateX(100%)'; t.style.transition = 'all 0.3s ease'; setTimeout(function() { t.remove(); }, 300); }, 3000); }
function applyFilters() {
  var amp = document.getElementById('fAmp').value; var hc = document.getElementById('fHosp').value; var sch = document.getElementById('fSch').value; var stat = document.getElementById('fStat').value; var sex = document.getElementById('fSex').value; var q = document.getElementById('srchBox').value.toLowerCase().trim();
  G.dispRows = G.allRows.filter(function(r) { 
    if(amp && r.amphoe !== amp) return false; 
    if(hc && r.hospcode !== hc) return false; 
    if(sch && r.school_name !== sch) return false; 
    
    // กรองสถานะแบบรวบยอด: abnormal = ทุกคนที่ไม่ normal / referred = รวมแว่นด้วย
    if(stat === 'abnormal') { if(r.status === 'normal') return false; }
    else if(stat === 'referred') { if(r.status !== 'referred' && r.status !== 'glasses') return false; }
    else if(stat && r.status !== stat) return false; 
    
    if(sex && r.sex !== sex) return false; 
    if(q && !( (r.student_name||'').toLowerCase().includes(q) || (r.cid||'').includes(q) || (r.hospcode||'').includes(q) || (r.school_name||'').toLowerCase().includes(q) )) return false; 
    return true; 
  });
  var k = {total:0, normal:0, abnormal:0, referred:0, glasses:0, preSum:0, postSum:0, gainSum:0, testCount:0};
  G.dispRows.forEach(function(r) { k.total++; if(r.status==='normal') k.normal++; else if(r.status==='abnormal') k.abnormal++; else if(r.status==='referred') k.referred++; else if(r.status==='glasses') k.glasses++; if(r.pre !== null && r.post !== null) { k.preSum += Number(r.pre); k.postSum += Number(r.post); k.gainSum += Number(r.gain); k.testCount++; } });
  
  var t = k.total || 1; 
  var kpiOut = { 
    total: k.total, normal: k.normal, normalPct: Math.round(k.normal/t*100), 
    abnormal: k.abnormal, abnormalTotal: k.total - k.normal, abnormalPct: Math.round((k.total - k.normal)/t*100), 
    referred: k.referred + k.glasses, referredPct: Math.round((k.referred + k.glasses)/t*100), 
    referredRaw: k.referred, glasses: k.glasses, glassesPct: Math.round(k.glasses/t*100), 
    preAvg: k.testCount>0 ? Math.round(k.preSum/k.testCount*10)/10 : null, postAvg: k.testCount>0 ? Math.round(k.postSum/k.testCount*10)/10 : null, gainAvg: k.testCount>0 ? Math.round(k.gainSum/k.testCount) : null, satAvg: G.kpi.satAvg, preTestCount: G.kpi.preTestCount 
  };
  updateKPIs(kpiOut); renderTable(G.dispRows); renderPieChart(kpiOut); renderBarChart(); renderHeatmap();
  if(typeof updateMapMarkers === 'function') updateMapMarkers();
}
function clearFilters() { ['fAmp','fHosp','fSch','fStat','fSex'].forEach(function(id){ document.getElementById(id).value = ''; }); document.getElementById('srchBox').value = ''; onAmpChange(); applyFilters(); }
function forceRefresh() { clearFilters(); loadDashboard({}); toast('กำลังรีเฟรชข้อมูลล่าสุด...', 'inf'); }
function mapCsvToRowDynamic(headers, cols) {
    // อัปเดต Dictionary ให้รู้จักทั้งหัวคอลัมน์ "ภาษาไทย" และ "ภาษาอังกฤษ (ตาม Database จริง)"
    var HEADER_MAP = {
        "level_edu": 0, "ระดับชั้น": 0,
        "room": 1, "ห้อง": 1,
        "cid": 2, "เลขบัตรประชาชน": 2, "เลขบัตรประชาชน_13หลัก": 2,
        "pname": 3, "คำนำหน้า": 3,
        "fname": 4, "ชื่อ": 4,
        "lname": 5, "นามสกุล": 5,
        "student_name": 6, "ชื่อ-สกุลเต็ม": 6,
        "birthday": 7, "วันเกิด": 7, "วันเกิด_dd/mm/yyyy": 7,
        "age_years": 8, "อายุ": 8, "อายุ_ปี": 8,
        "sex": 9, "เพศ": 9, "เพศ_1ชาย_2หญิง": 9,
        "school_class": 10, "ชั้นเรียน": 10,
        "school_name": 11, "โรงเรียน": 11, "ชื่อโรงเรียน": 11,
        "unit": 12, "หน่วยวัด": 12, "หน่วยวัด_f_m": 12,
        "screen_date": 13, "วันที่ตรวจ": 13, "วันที่ตรวจ_dd/mm/yyyy": 13,
        "hospcode": 14, "รหัสรพสต": 14,
        "address": 15, "บ้านเลขที่": 15,
        "moo": 16, "หมู่": 16,
        "aid": 17, "รหัสพื้นที่": 17, "รหัสพื้นที่_aid": 17,
        "hx_glasses": 18, "ประวัติสวมแว่น": 18,
        "hx_injury": 19, "ประวัติบาดเจ็บตา": 19,
        "hx_red_eye": 20, "ตาแดงเรื้อรัง": 20,
        "hx_headache": 21, "ปวดศีรษะบ่อย": 21,
        "hx_amblyopia": 22, "ตาเหล่": 22, "ตาเหล่_ตาขี้เกียจ": 22,
        "hx_family": 23, "ครอบครัวสวมแว่น": 23,
        "va_r_naked": 24, "vaขวา_ตาเปล่า": 24,
        "va_l_naked": 25, "vaซ้าย_ตาเปล่า": 25,
        "va_r_glasses": 26, "vaขวา_ใส่แว่น": 26,
        "va_l_glasses": 27, "vaซ้าย_ใส่แว่น": 27,
        "ph_r": 28, "phขวา": 28,
        "ph_l": 29, "phซ้าย": 29,
        "va_naked_ou": 30, "va_ou_ตาเปล่า": 30,
        "va_glasses_ou": 31, "va_ou_ใส่แว่น": 31,
        "cover_test": 32,
        "hirschberg": 33,
        "color_vision": 34,
        "stereopsis": 35,
        "diagnosis": 36, "วินิจฉัย": 36,
        "referral": 37, "การส่งต่อ": 37,
        "examiner": 38, "ผู้ตรวจ": 38,
        "position": 39, "ตำแหน่ง": 39,
        "school_code": 40, "รหัสโรงเรียน": 40,
        "tambon": 41, "ตำบล": 41,
        "amphoe": 42, "อำเภอ": 42,
        "province": 43, "จังหวัด": 43,
        "remark": 44, "remarks": 44, "หมายเหตุ": 44,
        "treatment": 45, "สิทธิการรักษา": 45,
        "nationality": 46, "สัญชาติ": 46
    };
    
    var out = new Array(47).fill(''); // สร้างแถวว่าง 47 ช่อง
    for(var j=0; j<headers.length; j++) {
        // ทำความสะอาดชื่อคอลัมน์เพื่อนำไปเทียบ
        var hName = String(headers[j]).toLowerCase().replace(/[\n\r"']/g, '').trim();
        var val = String(cols[j] || '').replace(/^[="']+|["']+$/g, '').trim();
        
        // ค้นหาใน Dictionary ว่าตรงกับ Index ไหน
        var matchedIndex = -1;
        for (var key in HEADER_MAP) {
            if (hName === key || hName.indexOf(key) > -1) { matchedIndex = HEADER_MAP[key]; break; }
        }
        
        // หากเจอตรงกัน ให้นำไปใส่ใน index นั้น
        if (matchedIndex > -1) {
            // Mapping พิเศษสำหรับค่าสายตา (ให้แปลงรหัสเป็นค่าจริง)
            if ([24, 25, 26, 27, 28, 29, 30, 31].indexOf(matchedIndex) > -1) {
               val = (val && G.vaMap && G.vaMap[val]) ? G.vaMap[val] : val;
            }
            // บังคับทำความสะอาดรูปแบบตัวเลข
            if (matchedIndex === 2) val = val.replace(/\D/g, ''); // เลขบัตรให้เหลือแต่ตัวเลข
            if (matchedIndex === 14 && val.length > 0 && val.length < 5) val = ("00000" + val).slice(-5); // รหัสรพ.สต. 5 หลัก
            
            out[matchedIndex] = val;
        }
    }
    
    // Fallback: หากระบบหาคอลัมน์ "เลขบัตรประชาชน" ไม่เจอ แสดงว่าไฟล์อาจไม่มี Header ที่รู้จัก ให้ใช้ระบบเดิมสำรอง
    if(out[2] === '') { return smartProcessRow(cols); }
    return out;
}

function importCSV() {
    var fileInput = document.getElementById('convFile'); if (!fileInput.files.length) { toast('กรุณาเลือกไฟล์ก่อนครับ', 'err'); return; }
    var file = fileInput.files[0]; var reader = new FileReader(); var encoding = document.getElementById('fileEncoding') ? document.getElementById('fileEncoding').value : 'UTF-8';
    reader.onload = function(e) {
        var text = e.target.result; var lines = text.split(/\r\n|\n|\r/); var processedRows = [];
        var headers = [];
        
        for (var i = 0; i < lines.length; i++) { 
            var line = lines[i].trim(); if (!line) continue; 
            var delimiter = ','; if (line.indexOf('\t') !== -1) delimiter = '\t'; else if (line.indexOf('|') !== -1) delimiter = '|'; else if (line.indexOf(';') !== -1) delimiter = ';'; 
            var cols = smartParseCSVLine(line, delimiter); 
            
            // อ่านหัวคอลัมน์ในบรรทัดแรก
            if(i === 0 || line.indexOf('ระดับชั้น') > -1 || line.indexOf('cid') > -1 || line.indexOf('เลขบัตร') > -1) {
                headers = cols; continue; 
            }
            
            var mapped = (headers.length > 0) ? mapCsvToRowDynamic(headers, cols) : smartProcessRow(cols); 
            if (mapped) processedRows.push(mapped); 
        }
        
        if(processedRows.length === 0) { toast('ไม่พบข้อมูลในไฟล์ หรือข้อมูลไม่ถูกต้อง', 'err'); return; } 
        var btn = document.getElementById('btnImport'); btn.disabled = true; btn.innerHTML = '⏳ กำลังนำเข้า...';
        google.script.run.withSuccessHandler(function(res) { 
           btn.disabled = false; btn.innerHTML = '⬇️ นำเข้าข้อมูล (Import)'; var r = JSON.parse(res); 
           if(r.ok) { toast(r.msg, 'ok'); closePanel('conv'); fileInput.value = ''; forceRefresh(); } else { toast(r.msg, 'err'); } 
        }).withFailureHandler(function(err){ 
           btn.disabled = false; btn.innerHTML = '⬇️ นำเข้าข้อมูล (Import)'; toast('Error: ' + err.message, 'err'); 
        }).importScreeningData(processedRows);
    }; 
    reader.readAsText(file, encoding);
}
function dlTemplate() {
  var headers = [ 
    "ระดับชั้น", "ห้อง", "เลขบัตรประชาชน_13หลัก", "คำนำหน้า", "ชื่อ", "นามสกุล", 
    "ชื่อ-สกุลเต็ม", "วันเกิด_dd/mm/yyyy", "อายุ_ปี", "เพศ_1ชาย_2หญิง", "ชั้นเรียน", 
    "ชื่อโรงเรียน", "หน่วยวัด_F_M", "วันที่ตรวจ_dd/mm/yyyy", "รหัสรพสต", "บ้านเลขที่", 
    "หมู่", "รหัสพื้นที่_aid", "ประวัติสวมแว่น", "ประวัติบาดเจ็บตา", "ตาแดงเรื้อรัง", 
    "ปวดศีรษะบ่อย", "ตาเหล่_ตาขี้เกียจ", "ครอบครัวสวมแว่น", "VAขวา_ตาเปล่า", 
    "VAซ้าย_ตาเปล่า", "VAขวา_ใส่แว่น", "VAซ้าย_ใส่แว่น", "PHขวา", "PHซ้าย", 
    "VA_OU_ตาเปล่า", "VA_OU_ใส่แว่น", "Cover_Test", "Hirschberg", "Color_Vision", 
    "Stereopsis", "วินิจฉัย", "การส่งต่อ", "ผู้ตรวจ", "ตำแหน่ง", "รหัสโรงเรียน", 
    "ตำบล", "อำเภอ", "จังหวัด", "หมายเหตุ", "สิทธิการรักษา", "สัญชาติ"  // ⬅️ เพิ่ม
  ];
  var csv = "\uFEFF" + headers.join(',') + "\n";
  var dummyData = [ 
    "ป.3", "/1", "1749900000000", "เด็กชาย", "รักดี", "มีสุข", "เด็กชายรักดี มีสุข", 
    "15/08/2560", "8", "1", "ป.3/1", "โรงเรียนทดสอบ", "F", "11/05/2565", "08498", 
    "123/4", "1", "740201", "0", "0", "0", "0", "0", "0", "20/20", "20/20", "", "", 
    "", "", "", "", "ปกติ", "ปกติ", "ปกติ", "ปกติ", "สายตาปกติ", "ไม่จำเป็นต้องส่งต่อ", 
    "ผู้ตรวจทดสอบ", "นักวิชาการสาธารณสุข", "1074000001", "หนองสองห้อง", "บ้านแพ้ว", 
    "สมุทรสาคร", "", "สิทธิบัตรทอง (30 บาท)", "ไทย"  // ⬅️ เพิ่ม
  ];
  var formattedDummy = dummyData.map(function(c, i){ if (i===2) return '="'+c+'"'; if (i===14) return '="'+c+'"'; return '"'+c+'"'; }).join(','); csv += formattedDummy + "\n";
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = 'Template_Screening_Import_v6.3.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a); toast('ดาวน์โหลด Template เรียบร้อยครับ', 'ok');
}

// อัปเดตข้อสอบตามบทวิเคราะห์ให้วัดความเข้าใจมากขึ้น
var QS = [ 
  {q:'กฎ 20-20-20 สำหรับดูแลสายตา คืออะไร?', c:['ก. เล่นเกม 20 นาที พัก 20 นาที', 'ข. พักมองไกล 20 ฟุต นาน 20 วินาที ทุก 20 นาที', 'ค. อ่านหนังสือห่าง 20 เซนติเมตร', 'ง. ใช้สายตาต่อเนื่อง 20 นาที']},
  {q:'หากต้องใช้มือถือหรือคอมพิวเตอร์เป็นเวลานาน ควรทำอย่างไร?', c:['ก. พักสายตาเป็นระยะ', 'ข. ปิดไฟเล่นเพื่อให้จอชัดขึ้น', 'ค. จ้องหน้าจอต่อเนื่องไม่กระพริบตา', 'ง. หลับตาข้างเดียวเวลาใช้งาน']},
  {q:'ระยะห่างที่เหมาะสมระหว่างตากับหน้าจอมือถือ/แท็บเล็ต คือเท่าใด?', c:['ก. 10-20 เซนติเมตร', 'ข. 20-30 เซนติเมตร', 'ค. 30-40 เซนติเมตร', 'ง. มากกว่า 2 เมตร']},
  {q:'การนอนเล่นหน้าจออิเล็กทรอนิกส์ในที่มืด ส่งผลอย่างไร?', c:['ก. ทำให้สายตาดีขึ้น', 'ข. ทำให้ตาล้าและแห้ง', 'ค. มองเห็นตอนกลางคืนชัดขึ้น', 'ง. ป้องกันแสงสีฟ้าเข้าตา']},
  {q:'อาหารชนิดใดมีส่วนช่วยบำรุงสายตามากที่สุด?', c:['ก. ลูกอมและขนมหวาน', 'ข. ผักใบเขียวและแครอท', 'ค. น้ำอัดลม', 'ง. ขนมขบเคี้ยว']},
  {q:'วิตามินเอ (Vitamin A) มีประโยชน์อย่างไรต่อร่างกาย?', c:['ก. ทำให้หลับสบาย', 'ข. ทำให้ร่างกายสูงเร็วขึ้น', 'ค. ช่วยบำรุงสายตาและการมองเห็น', 'ง. ทำให้ฟันแข็งแรง']},
  {q:'อาหารในข้อใดต่อไปนี้ อุดมไปด้วย โอเมก้า 3 ที่ดีต่อดวงตา?', c:['ก. มันฝรั่งทอด', 'ข. ปลาทะเลและถั่ว', 'ค. ขนมปังปิ้ง', 'ง. ไส้กรอกหมู']},
  {q:'หากพบว่าตัวเองมองกระดานหน้าห้องเรียนไม่ชัด ควรทำอย่างไร?', c:['ก. เงียบไว้และเดาตัวหนังสือ', 'ข. ย้ายไปนั่งหลังห้อง', 'ค. แจ้งครูหรือผู้ปกครองให้ทราบ', 'ง. ยืมแว่นของเพื่อนมาใส่']},
  {q:'พฤติกรรมใดเสี่ยงต่อการเกิดปัญหาสายตามากที่สุด?', c:['ก. อ่านหนังสือในที่ที่มีแสงสว่างเพียงพอ', 'ข. เล่นเกมบนมือถือกลางแดดจ้า', 'ค. พักสายตามองต้นไม้สีเขียว', 'ง. ทานผลไม้เป็นประจำ']},
  {q:'หากต้องใช้แท็บเล็ตเรียนออนไลน์ต่อเนื่องเป็นเวลา 1 ชั่วโมง ควรปฏิบัติตามข้อใด?', c:['ก. จ้องหน้าจอให้ใกล้ที่สุดเพื่อความชัดเจน', 'ข. เปิดแสงหน้าจอให้สว่างระดับสูงสุด', 'ค. พักสายตาโดยมองไปที่ไกลๆ ทุก 20 นาที', 'ง. ใส่แว่นตากันแดดสีดำขณะเรียน']}
];
var SAT_QS = ['ความเหมาะสมของสถานที่จัดกิจกรรม','ความเพียงพอของอุปกรณ์และสื่อที่ใช้','ความเหมาะสมของระยะเวลาดำเนินกิจกรรม','ความชัดเจนในการถ่ายทอดความรู้ของวิทยากร','ความเหมาะสมของเนื้อหาการบรรยาย','ความเป็นประโยชน์ของความรู้ที่ได้รับ','สามารถนำความรู้ไปประยุกต์ใช้ได้จริง','การให้บริการตรวจสายตาของเจ้าหน้าที่','ความสุภาพและเป็นมิตรของทีมงาน','ความพึงพอใจโดยรวมต่อโครงการ'];

// 💡 ตัวแปรเก็บสถานะ Flow ล่าสุด
var activeFlow = { active: false, cid: '', status: '' };

function triggerFlow(nextStep, msg, nextAction) {
    document.getElementById('flowTitle').textContent = 'แจ้งเตือนลำดับถัดไป';
    document.getElementById('flowMsg').innerHTML = msg;
    var btn = document.getElementById('btnFlowNext');
    btn.textContent = 'เริ่มทำลำดับถัดไป';
    btn.onclick = function() {
        closeFlow();
        if(nextAction) nextAction();
    };
    document.getElementById('flowMov').classList.add('open');
}

function closeFlow() { document.getElementById('flowMov').classList.remove('open'); }

window.onload = function () {
  setDate(); buildSatQ(); buildTestQ('pre'); buildTestQ('post');
  // [v6.3] กด ESC ปิด image modal
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && document.getElementById('imgModal').classList.contains('open')) { closeImg(); }
  });
  flatpickr(".datepicker", { dateFormat: "d/m/Y", locale: "th", formatDate: function(date, format, locale) { var d = String(date.getDate()).padStart(2, '0'); var m = String(date.getMonth() + 1).padStart(2, '0'); var y = date.getFullYear(); if(y < 2400) y += 543; return d + '/' + m + '/' + y; }, parseDate: function(datestr, format) { var parts = datestr.split('/'); if(parts.length === 3) { var y = parseInt(parts[2], 10); if (y > 2400) y -= 543; return new Date(y, parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)); } return new Date(); } });
  ChartDataLabels && Chart.register(ChartDataLabels); bindAutoDiagnose();
  
  google.script.run
    .withSuccessHandler(function (r) {
      var d = JSON.parse(r); 
      if (!d.ok) { toast('โหลดข้อมูลไม่สำเร็จ: ' + d.msg, 'err'); return; }
      
      G.settings = d.data.settings || {}; 
      G.hospList = d.data.hospList || []; 
      G.schoolList = d.data.schoolList || []; 
      G.vaList = d.data.vaList || [];
      G.vaMap = d.data.vaMap || {};
      G.session = d.data.session || {loggedIn:false};
      G.videos = d.data.videos || [];
      G.natList = d.data.natList || ['ไทย', 'พม่า', 'กัมพูชา', 'ลาว', 'อื่นๆ'];
      
      applySettings(); 
      buildDropdowns(); 
      updateAuthUI(); 
      loadDashboard({}); 
      initMap(); 
      renderLinks(d.data.links || []); 
      
      renderVideoPlaylist(G.videos);
      if(G.videos.length > 0) renderVideo(G.videos[0].url);
      else renderVideo('');
      
    })
    .withFailureHandler(function(e) {
      toast('การเชื่อมต่อระบบล้มเหลว: ' + e.message, 'err');
    })
    .getInitData();
};

function renderVideo(url) {
    var wrap = document.getElementById('videoWrap');
    if(!url) { wrap.innerHTML = '<span style="color:var(--muted2)">ไม่มีวิดีโอแสดงผล</span>'; return; }
    if(url.includes('youtube.com') || url.includes('youtu.be')) {
        var embedUrl = url;
        if(url.includes('watch?v=')) embedUrl = url.replace('watch?v=', 'embed/').split('&')[0];
        else if(url.includes('youtu.be/')) embedUrl = url.replace('youtu.be/', 'youtube.com/embed/').split('?')[0];
        wrap.innerHTML = '<iframe width="100%" height="100%" src="'+embedUrl+'" frameborder="0" allowfullscreen></iframe>';
    } else if(url.toLowerCase().endsWith('.mp4')) {
        wrap.innerHTML = '<video width="100%" height="100%" controls><source src="'+url+'" type="video/mp4"></video>';
    } else {
        wrap.innerHTML = '<iframe width="100%" height="100%" src="'+url+'" frameborder="0" allowfullscreen></iframe>';
    }
}

function renderVideoPlaylist(videos) {
  var area = document.getElementById('videoPlaylist');
  if(!videos || videos.length === 0) { area.style.display = 'none'; return; }
  area.style.display = 'flex';
  var html = '';
  videos.forEach(function(v) {
     html += '<button class="btn-sec" style="text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; border-radius:8px; background:#fff; border:1px solid #dc2626; color:#dc2626; font-weight:600; padding:10px 14px; font-size:13px; flex-shrink:0; transition:0.2s;" onmouseover="this.style.background=\'#fee2e2\'" onmouseout="this.style.background=\'#fff\'" onclick="renderVideo(\''+v.url+'\')">▶️ ' + e_(v.label) + '</button>';
  });
  area.innerHTML = html;
}

function openVideoMgrPanel() {
  document.getElementById('vidmgr-id').value = ''; 
  document.getElementById('vidmgr-label').value = ''; 
  document.getElementById('vidmgr-url').value = ''; 
  refreshVidMgrList(); 
  openPanel('vidmgr');
}

function refreshVidMgrList() {
  google.script.run.withSuccessHandler(function(r){
    var d = JSON.parse(r); 
    var list = document.getElementById('vidmgrList'); 
    var html = '';
    G.videos = d.data.videos || [];
    G.videos.forEach(function(v){
      html += '<div class="link-mgr-item" style="grid-template-columns:1fr 100px; padding:12px 10px; background:#f8faff; border-radius:8px; border:1px solid var(--border); margin-bottom:6px;"><div><b>'+e_(v.label)+'</b><br><span style="font-size:10px;color:gray; word-break:break-all;">'+v.url+'</span></div><div style="display:flex;gap:4px;align-items:center;justify-content:flex-end;"><button onclick="editVidMgr(\''+v.id+'\',\''+e_(v.label)+'\',\''+v.url+'\')" style="color:var(--blue); border:1px solid var(--blue); background:#fff; border-radius:4px; padding:3px 8px; font-size:12px;">✏️ แก้ไข</button><button onclick="delVidMgr(\''+v.id+'\')" style="color:var(--red); border:1px solid var(--red); background:#fff; border-radius:4px; padding:3px 8px; font-size:12px;">🗑 ลบ</button></div></div>';
    });
    list.innerHTML = html;
    renderVideoPlaylist(G.videos);
    if(G.videos.length > 0) { renderVideo(G.videos[0].url); } else { renderVideo(''); }
  }).getInitData();
}

function saveVideoFromMgr() {
  var btn = document.getElementById('btnSaveVidMgr');
  var d = { id: document.getElementById('vidmgr-id').value, label: document.getElementById('vidmgr-label').value, url: document.getElementById('vidmgr-url').value };
  if(!d.label || !d.url) { toast('กรุณากรอกชื่อและ URL ให้ครบถ้วน', 'err'); return; }
  btn.disabled = true; btn.innerHTML = '⏳ กำลังบันทึก...';
  google.script.run.withSuccessHandler(function(res){
    btn.disabled = false; btn.innerHTML = '💾 บันทึกวิดีโอ'; var r = JSON.parse(res);
    if(r.ok) { 
        toast(r.msg, 'ok'); 
        document.getElementById('vidmgr-id').value = ''; 
        document.getElementById('vidmgr-label').value = ''; 
        document.getElementById('vidmgr-url').value = ''; 
        refreshVidMgrList(); 
    } else { toast(r.msg, 'err'); }
  }).saveVideoItem(d);
}

function delVidMgr(id) { 
    if(!confirm('ยืนยันการลบวิดีโอนี้ออกจากเพลย์ลิสต์?')) return; 
    google.script.run.withSuccessHandler(function(res){ 
        var r = JSON.parse(res); 
        if(r.ok) { toast(r.msg, 'ok'); refreshVidMgrList(); } 
    }).deleteVideoItem(id); 
}

function editVidMgr(id, label, url) { 
    document.getElementById('vidmgr-id').value = id; 
    document.getElementById('vidmgr-label').value = label; 
    document.getElementById('vidmgr-url').value = url; 
}


function openPwdMgr() {
    document.getElementById('pwdOld').value = '';
    document.getElementById('pwdNew').value = '';
    document.getElementById('pwdConfirm').value = '';
    document.getElementById('pwdErr').textContent = '';
    document.getElementById('pwdMov').classList.add('open');
}
function closePwdMgr() { document.getElementById('pwdMov').classList.remove('open'); }
function doChangePwd() {
    var o = document.getElementById('pwdOld').value.trim();
    var n = document.getElementById('pwdNew').value.trim();
    var c = document.getElementById('pwdConfirm').value.trim();
    if(!o || !n || !c) { document.getElementById('pwdErr').textContent = 'กรุณากรอกข้อมูลให้ครบ'; return; }
    if(n !== c) { document.getElementById('pwdErr').textContent = 'รหัสผ่านใหม่และยืนยันไม่ตรงกัน'; return; }
    if(n.length < 4) { document.getElementById('pwdErr').textContent = 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร/ตัวเลข'; return; }
    var btn = document.getElementById('btnChangePwd');
    btn.disabled = true; btn.innerHTML = 'กำลังตรวจสอบ...';
    google.script.run.withSuccessHandler(function(r) {
        btn.disabled = false; btn.innerHTML = '💾 เปลี่ยนรหัสผ่าน';
        var res = JSON.parse(r);
        if(res.ok) {
            toast(res.msg, 'ok');
            closePwdMgr();
        } else {
            document.getElementById('pwdErr').textContent = res.msg;
        }
    }).changePassword(o, n);
}

function renderSatBreakdownChart() {
  var ctx = document.getElementById('satBreakdownChart').getContext('2d');
  if (G.satBreakdownInst) G.satBreakdownInst.destroy();
  var type = document.getElementById('satBreakdownType').value; var dataArray = G.satCharts[type] || [];
  var labels = dataArray.map(function(d){ return d.label + ' (' + d.avg.toFixed(2) + ')'; });

  G.satBreakdownInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'มากที่สุด (4.50-5.00)', data: dataArray.map(function(d){ return d.lvl5; }), backgroundColor: '#10b981' }, 
        { label: 'มาก (3.50-4.49)', data: dataArray.map(function(d){ return d.lvl4; }), backgroundColor: '#3b82f6' }, 
        { label: 'ปานกลาง (2.50-3.49)', data: dataArray.map(function(d){ return d.lvl3; }), backgroundColor: '#f59e0b' },
        { label: 'น้อย (1.50-2.49)', data: dataArray.map(function(d){ return d.lvl2; }), backgroundColor: '#f97316' }, 
        { label: 'น้อยที่สุด (1.00-1.49)', data: dataArray.map(function(d){ return d.lvl1; }), backgroundColor: '#ef4444' }  
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, position: 'bottom', labels: { font: { family: 'Sarabun', size: 10 } } },
        datalabels: { color: '#ffffff', font: { weight: 'bold', size: 12, family: 'Sarabun' }, textStrokeColor: 'rgba(0,0,0,0.5)', textStrokeWidth: 2, formatter: function(val, context) { if (val === 0) return ''; var total = 0; context.chart.data.datasets.forEach(function(ds) { total += ds.data[context.dataIndex] || 0; }); var pct = Math.round((val / total) * 100); return val + ' (' + pct + '%)'; } },
        tooltip: { callbacks: { label: function(context) { var label = context.dataset.label || ''; var val = context.raw || 0; var total = 0; context.chart.data.datasets.forEach(function(ds) { total += ds.data[context.dataIndex] || 0; }); var pct = Math.round((val / total) * 100); return label + ': ' + val + ' คน (' + pct + '%)'; } } }
      },
      scales: { x: { stacked: true, ticks: { font: { family: 'Sarabun', size: 11 } } }, y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1, font: { family: 'Sarabun' } } } }
    }, plugins: [ChartDataLabels]
  });
}

function renderSatTypePieChart() {
  var ctx = document.getElementById('satTypePieChart').getContext('2d');
  if (G.satTypePieInst) G.satTypePieInst.destroy();
  var dataArray = G.satCharts['type'] || []; dataArray = dataArray.filter(function(d) { return d.count > 0; });
  var labels = dataArray.map(function(d){ return d.label; }); var values = dataArray.map(function(d){ return d.count; });
  var bgColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  G.satTypePieInst = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: labels, datasets: [{ data: values, backgroundColor: bgColors }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 9.5, family: 'Sarabun' } } },
        datalabels: { color: '#ffffff', font: { weight: 'bold', size: 14, family: 'Sarabun' }, textStrokeColor: 'rgba(0,0,0,0.5)', textStrokeWidth: 2, formatter: function(val, context) { var total = context.chart.data.datasets[0].data.reduce(function(a,b){return a+b}, 0); var pct = Math.round((val / total) * 100); return val + ' คน\n(' + pct + '%)'; } }
      }
    }, plugins: [ChartDataLabels]
  });
}

function renderLinks(links) {
  var area = document.getElementById('linkArea'); 
  if(!links || links.length === 0) { area.style.display = 'none'; return; }
  
  var html = '';
  links.forEach(function(l) { 
    if (!l.label || String(l.label).trim() === '') return;
    
    var iconHtml = l.icon ? '<img src="'+l.icon+'" onerror="this.src=\'https://cdn-icons-png.flaticon.com/128/1041/1041916.png\'">' : '🔗'; 
    html += '<a href="'+l.url+'" target="_blank" class="custom-btn">' + iconHtml + ' ' + e_(l.label) + '</a>'; 
  });
  
  area.innerHTML = html;
  area.style.display = (html === '') ? 'none' : 'flex';
}

function openLinkMgr() { document.getElementById('link-id').value = ''; document.getElementById('link-label').value = ''; document.getElementById('link-url').value = ''; document.getElementById('link-icon').value = ''; refreshLinkList(); openPanel('link'); }
function refreshLinkList() {
  google.script.run.withSuccessHandler(function(r){
    var d = JSON.parse(r); var list = document.getElementById('linkList'); var html = '';
    d.data.links.forEach(function(l){ html += '<div class="link-mgr-item"><img src="'+(l.icon||'')+'" onerror="this.style.display=\'none\'"><div><b>'+e_(l.label)+'</b></div><div style="font-size:10px; color:gray; overflow:hidden;">'+l.url+'</div><div style="display:flex;gap:4px;"><button onclick="editLinkData(\''+l.id+'\',\''+e_(l.label)+'\',\''+l.url+'\',\''+l.icon+'\')" style="color:blue">✏️</button><button onclick="delLinkData(\''+l.id+'\')" style="color:red">🗑</button></div></div>'; });
    list.innerHTML = html; renderLinks(d.data.links); 
  }).getInitData();
}

function saveLink() {
  var btn = document.getElementById('btnSaveLink');
  var d = { id: document.getElementById('link-id').value, label: document.getElementById('link-label').value, url: document.getElementById('link-url').value, icon: document.getElementById('link-icon').value };
  if(!d.label || !d.url) { toast('กรุณากรอกชื่อและ URL', 'err'); return; }
  btn.disabled = true; btn.innerHTML = '⏳ กำลังบันทึก...';
  google.script.run.withSuccessHandler(function(res){ 
    btn.disabled = false; btn.innerHTML = '💾 บันทึกปุ่ม'; var r = JSON.parse(res); 
    if(r.ok) { toast(r.msg, 'ok'); document.getElementById('link-id').value = ''; document.getElementById('link-label').value = ''; document.getElementById('link-url').value = ''; document.getElementById('link-icon').value = ''; refreshLinkList(); } else { toast(r.msg, 'err'); }
  }).withFailureHandler(function(e){ btn.disabled = false; btn.innerHTML = '💾 บันทึกปุ่ม'; toast('Error: ' + e.message, 'err'); }).saveLinkData(d);
}

function delLinkData(id) { if(!confirm('ยืนยันการลบปุ่มนี้?')) return; google.script.run.withSuccessHandler(function(res){ var r = JSON.parse(res); if(r.ok) { toast(r.msg, 'ok'); refreshLinkList(); } }).deleteLinkData(id); }
function editLinkData(id, label, url, icon) { document.getElementById('link-id').value = id; document.getElementById('link-label').value = label; document.getElementById('link-url').value = url; document.getElementById('link-icon').value = icon; }

function bindAutoDiagnose() {
    var ids = ['vr-n','vl-n','vr-g','vl-g','vr-p','vl-p','hx-r','hx-i','hx-a','hx-h'];
    ids.forEach(function(id) { var el = document.getElementById(id); if(el) el.addEventListener('change', autoDiagnose); });
    var rads = document.querySelectorAll('input[type="radio"][name^="ex-"]');
    for(var i=0; i<rads.length; i++) { rads[i].addEventListener('change', autoDiagnose); }
}

function autoDiagnose() {
    var cov = getRad('ex-cov'), hir = getRad('ex-hir'), col = getRad('ex-col'), ste = getRad('ex-ste');
    var vr = document.getElementById('vr-n').value; var vl = document.getElementById('vl-n').value;
    var hx_r = document.getElementById('hx-r').checked; var hx_i = document.getElementById('hx-i').checked; 
    var hx_a = document.getElementById('hx-a').checked; var hx_h = document.getElementById('hx-h').checked;
    var hx_f = document.getElementById('hx-f').checked; var hx_g = document.getElementById('hx-g').checked;

    function getVaRank(v) {
        var map = {'20/20':1, '6/6':1, '20/30':2, '6/9':2, '20/40':3, '6/12':3, '20/50':4, '6/18':4, '20/70':5, '6/24':5, '20/100':6, '6/36':6, '20/200':7, '6/60':7, 'HM':8, 'PL':9, 'no PL':10};
        return map[v] || 0; 
    }

    var rankR = getVaRank(vr); var rankL = getVaRank(vl);
    var worstRank = Math.max(rankR, rankL);
    var diff = Math.abs(rankR - rankL);
    
    var isStrabismus = (cov === 'ผิดปกติ' || hir === 'ผิดปกติ' || ste === 'ผิดปกติ' || hx_a);
    var isEmergency = (worstRank >= 7 || hx_i || hx_r); 
    
    var diag = ''; var ref = '';

    // Logic จัดกลุ่มตาม Guideline ใหม่
    if (isEmergency) {
        diag = 'ความผิดปกติรุนแรงของการมองเห็น';
        ref = 'ส่งต่อด่วน (ภายใน 1 สัปดาห์)';
        toast('🚨 พบความผิดปกติรุนแรง: แนะนำให้ส่งต่อด่วน!', 'err');
    } else if (worstRank === 6 || diff >= 2 || isStrabismus) {
        diag = 'สงสัยตาขี้เกียจ/สายตาผิดปกติรุนแรง';
        ref = 'ควรพบจักษุแพทย์ภายใน 1 เดือน';
    } else if (worstRank >= 3 && worstRank <= 5) {
        diag = 'สงสัยสายตาผิดปกติ';
        ref = 'ควรพบจักษุแพทย์ภายใน 3 เดือน';
    } else if (worstRank === 2 || hx_h || hx_f) {
        diag = 'เริ่มเฝ้าระวังสายตาผิดปกติ';
        ref = 'ไม่จำเป็นต้องส่งต่อ';
    } else if (col === 'ผิดปกติ') {
        diag = 'อื่นๆ';
        ref = 'ไม่จำเป็นต้องส่งต่อ';
        document.getElementById('s-remark').value = 'ความผิดปกติการมองสี (ตาบอดสี)';
    } else {
        diag = 'สายตาปกติ';
        ref = 'ไม่จำเป็นต้องส่งต่อ';
    }

    // Auto Alert: กรณีเด็กใส่แว่นอยู่แล้วแต่ VA ยังตก
    if (hx_g && worstRank >= 3) {
        document.getElementById('s-remark').value = '⚠️ ใส่แว่นแล้ว VA ยังตกอยู่ ควรประเมินสายตาเต็มระบบใหม่';
    } else if (!document.getElementById('s-remark').value.includes('ตาบอดสี')) {
        document.getElementById('s-remark').value = '';
    }

    document.getElementById('s-diag').value = diag;
    document.getElementById('s-ref').value = ref;
}

function initMap() {
  if(myMap) return; 
  myMap = L.map('mainMap').setView([13.5475, 100.2743], 10);
  L.tileLayer('https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', { attribution: '© Google Maps', maxZoom: 20 }).addTo(myMap);
  hospLayer = L.layerGroup().addTo(myMap);
  schoolLayer = L.layerGroup().addTo(myMap);
  updateMapMarkers();
}

function updateMapMarkers() {
  if(!myMap || !hospLayer || !schoolLayer) return;
  hospLayer.clearLayers();
  schoolLayer.clearLayers();
  
  var fAmp = document.getElementById('fAmp').value;
  var fHosp = document.getElementById('fHosp').value;
  var fSch = document.getElementById('fSch').value;
  var isFiltering = (fAmp || fHosp || fSch || document.getElementById('fStat').value || document.getElementById('fSex').value || document.getElementById('srchBox').value.trim());
  
  var validHosps = {}; var validSchools = {};
  if(isFiltering) {
      G.dispRows.forEach(function(r) {
          if(r.hospcode) validHosps[r.hospcode] = true;
          if(r.school_name) validSchools[r.school_name] = true;
      });
  }

  var bounds = [];
  var hospIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
  var schIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
  
  G.hospList.forEach(function(h) { 
    if (fHosp && h.hospcode !== fHosp) return;
    if (fAmp && h.amphoe !== fAmp) return;
    if (isFiltering && !fHosp && !fAmp && !validHosps[h.hospcode]) return;

    var lat = parseFloat(h.lat); var lon = parseFloat(h.lon);
    if(!isNaN(lat) && !isNaN(lon)) { 
        var m = L.marker([lat, lon], {icon: hospIcon}).bindPopup('<div style="text-align:center;"><b>🏥 ' + h.name + '</b><br>อ.' + h.amphoe + '<br><button style="margin-top:8px; padding:5px 10px; font-size:11.5px; background:var(--green); color:#fff; border:none; border-radius:5px; cursor:pointer;" onclick="toggleHospFilter(\''+h.hospcode+'\'); myMap.closePopup();">🔍 กรอง รพ.สต. นี้</button></div>');
        hospLayer.addLayer(m);
        bounds.push([lat, lon]); 
    } 
  });
  
  G.schoolList.forEach(function(s) { 
    if (fSch && s.name !== fSch) return;
    if (isFiltering && !fSch && !validSchools[s.name]) return;

    var lat = parseFloat(s.lat); var lon = parseFloat(s.lon);
    if(!isNaN(lat) && !isNaN(lon)) { 
        var m = L.marker([lat, lon], {icon: schIcon}).bindPopup('<div style="text-align:center;"><b>🏫 ' + s.name + '</b><br><button style="margin-top:8px; padding:5px 10px; font-size:11.5px; background:var(--accent); color:#fff; border:none; border-radius:5px; cursor:pointer;" onclick="toggleSchoolFilter(\''+s.name+'\'); myMap.closePopup();">🔍 กรองโรงเรียนนี้</button></div>');
        schoolLayer.addLayer(m);
        bounds.push([lat, lon]); 
    } 
  });
  
  if(bounds.length > 0) {
      try { myMap.fitBounds(bounds, {padding: [30, 30], maxZoom: 16}); } catch(e){}
  }
}

function toggleSchoolFilter(schName) {
  var el = document.getElementById('fSch');
  if (el.value === schName) { el.value = ''; } else { el.value = schName; }
  applyFilters();
}

function setDate() {
  var d = new Date(); var days = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์']; var months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  document.getElementById('dateTxt').textContent = 'วัน' + days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + (d.getFullYear() + 543);
}

function applySettings() {
  var s = G.settings;
  if (s.sys_name) document.getElementById('sysName').textContent = s.sys_name;
  if (s.org_name) document.getElementById('orgName').textContent = s.org_name;
  if (s.sys_name) document.getElementById('loginSub').textContent = s.sys_name;
  if (s.logo_id) {
    var img = document.createElement('img'); img.src = 'https://drive.google.com/thumbnail?id=' + s.logo_id + '&sz=w80';
    img.onerror = function() { if (this.src.indexOf('thumbnail') > -1) { this.src = 'https://lh3.googleusercontent.com/d/' + s.logo_id; } else { this.parentElement.textContent = '👁'; } };
    var lw = document.getElementById('logoWrap'); lw.innerHTML = ''; lw.appendChild(img);
  }
}

function buildDropdowns() {
  var vaOpts = '<option value="">— ไม่ระบุ —</option>'; G.vaList.forEach(function(v) { vaOpts += '<option>' + v + '</option>'; });
  ['vr-n','vl-n','vr-g','vl-g','vr-p','vl-p', 'vou-naked', 'vou-glasses'].forEach(function(id) { document.getElementById(id).innerHTML = vaOpts; });
  document.getElementById('vr-n').value = '20/20'; document.getElementById('vl-n').value = '20/20';
  var amps = []; G.hospList.forEach(function(h){ if(h.amphoe && amps.indexOf(h.amphoe)===-1) amps.push(h.amphoe); }); amps.sort();
  var ampSel = document.getElementById('fAmp'); amps.forEach(function(a) { ampSel.innerHTML += '<option>' + a + '</option>'; });
  var hcHtml = '<option value="">ทั้งหมด</option>'; var formHcHtml = '<option value="">— เลือก รพ.สต. —</option>';
  G.hospList.forEach(function(h) { var txt = h.hospcode + ' ' + h.name; hcHtml += '<option value="' + h.hospcode + '">' + txt + '</option>'; formHcHtml += '<option value="' + h.hospcode + '">' + txt + '</option>'; });
  document.getElementById('fHosp').innerHTML = hcHtml; document.getElementById('s-hc').innerHTML = formHcHtml; document.getElementById('sat-hc').innerHTML = formHcHtml; document.getElementById('loc-hc').innerHTML = formHcHtml;
  var schHtml = ''; G.schoolList.forEach(function(s) { document.getElementById('fSch').innerHTML += '<option value="' + s.name + '">' + s.name + '</option>'; schHtml += '<option value="' + e_(s.name) + '">'; });
  document.getElementById('dl-school').innerHTML = schHtml; document.getElementById('s-dt').value = (new Date()).toLocaleDateString('en-GB');
  var natOpts = '';
  if(G.natList && G.natList.length > 0) {
      G.natList.forEach(function(n) { natOpts += '<option value="'+n+'">'+n+'</option>'; });
  } else {
      natOpts = '<option value="ไทย">ไทย</option><option value="พม่า">พม่า</option><option value="กัมพูชา">กัมพูชา</option>';
  }
  if(document.getElementById('s-nat')) document.getElementById('s-nat').innerHTML = natOpts;
}

function onHcChange() {
  var hc = document.getElementById('s-hc').value; var h = G.hospList.find(function(x) { return x.hospcode === hc; });
  if (h) { document.getElementById('s-tambon').value = h.tambon || ''; document.getElementById('s-amphoe').value = h.amphoe || ''; document.getElementById('s-prov').value = h.province || 'สมุทรสาคร'; }
  else { document.getElementById('s-tambon').value = ''; document.getElementById('s-amphoe').value = ''; document.getElementById('s-prov').value = 'สมุทรสาคร'; }
}

function fillSchoolCoords() {
  var name = document.getElementById('s-sch').value; var found = G.schoolList.find(function(s) { return s.name === name; });
  if(found) { document.getElementById('s-schl-lat').value = found.lat; document.getElementById('s-schl-lon').value = found.lon; }
}

function getGeo(latId, lonId) { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(function(position) { document.getElementById(latId).value = position.coords.latitude; document.getElementById(lonId).value = position.coords.longitude; }); } else { toast("บราว์เซอร์ของคุณไม่รองรับการระบุพิกัด", "err"); } }
function onAmpChange() { var amp = document.getElementById('fAmp').value; var hSel = document.getElementById('fHosp'); hSel.innerHTML = '<option value="">ทั้งหมด</option>'; G.hospList.filter(function(h) { return !amp || h.amphoe === amp; }).forEach(function(h) { hSel.innerHTML += '<option value="' + h.hospcode + '">' + h.hospcode + ' ' + h.name + '</option>'; }); applyFilters(); }

function updateAuthUI() {
  // [v6.3] Reset admin-only buttons ก่อนเสมอ ป้องกัน state ค้างจาก session เดิม
  ['btnLineMgr', 'btnLinkMgr', 'btnVidMgr', 'btnLoc', 'btnConv'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  var s = G.session; var aa = document.getElementById('authArea'); var as = document.getElementById('addSec'); var asGuest = document.getElementById('addSecGuest');
  if (s.loggedIn) {
    var label = (s.role === 'admin') ? '⚙ Admin' : s.hospcode; 
    
    aa.innerHTML = '<span class="chip-user">' + label + '</span>' + 
                   '<button class="btn-hdr btn-hdr-manual" onclick="openPwdMgr()">🔑 เปลี่ยนรหัส</button>' +
                   '<button class="btn-hdr btn-hdr-out" onclick="doLogout()">ออกจากระบบ</button>';
                   
    as.style.display = 'block'; asGuest.style.display = 'none'; document.getElementById('indvTableSec').style.display = 'flex'; document.getElementById('guestMsg').style.display = 'none'; document.getElementById('thManageHosp').style.display = 'table-cell'; document.getElementById('th-cid').style.display = 'table-cell';
    if(s.role === 'user' || s.role === 'admin') { document.getElementById('btnLoc').style.display = 'flex'; document.getElementById('btnConv').style.display = 'flex'; }
    if(s.role === 'admin') { 
        document.getElementById('btnLinkMgr').style.display = 'flex'; 
        document.getElementById('btnVidMgr').style.display = 'flex';
        document.getElementById('btnLineMgr').style.display = 'flex'; 
    }
    if (s.role !== 'admin' && s.hospcode !== 'all') { 
        document.getElementById('sat-hc').value = s.hospcode; 
        document.getElementById('s-hc').value = s.hospcode; 
        document.getElementById('sat-hc').disabled = true; 
        document.getElementById('s-hc').disabled = true; 
        onHcChange(); 
    } else { 
        document.getElementById('sat-hc').disabled = false; 
        document.getElementById('s-hc').disabled = false; 
    }
  } else {
    aa.innerHTML = '<button class="btn-hdr btn-hdr-login" onclick="openLogin()">🔐 เข้าสู่ระบบ</button>'; as.style.display = 'none'; asGuest.style.display = 'block'; document.getElementById('indvTableSec').style.display = 'none'; document.getElementById('guestMsg').style.display = 'block'; document.getElementById('thManageHosp').style.display = 'none'; document.getElementById('th-cid').style.display = 'none';
    document.getElementById('sat-hc').disabled = false;
    document.getElementById('s-hc').disabled = false;
  }
  if (G.dispRows.length > 0) renderTable(G.dispRows); if (G.hospSummaryData.length > 0) renderSummaryTable(G.hospSummaryData);
}

function renderHeatmap() {
  var wrap = document.getElementById('heatmapWrap');
  if (!wrap) return;

  var filterAmp = document.getElementById('fAmp').value;
  var filterHc  = document.getElementById('fHosp').value;
  var data = (G.hospSummaryData || []).filter(function(h) {
    if (filterAmp && h.amphoe !== filterAmp) return false;
    if (filterHc  && h.hospcode !== filterHc)  return false;
    return h.total > 0;
  });

  if (!data.length) {
    wrap.innerHTML = '<p style="color:var(--muted);padding:14px;text-align:center;">ไม่มีข้อมูล</p>';
    return;
  }

  var cats = [
    { key:'normal',   label:'🟢 ปกติ',   base:[22,163,74]  },
    { key:'abnormal', label:'🟡 ผิดปกติ', base:[202,138,4]  },
    { key:'referred', label:'🟠 ส่งต่อ',  base:[234,88,12]  },
    { key:'glasses',  label:'🔴 ตัดแว่น', base:[220,38,38]  }
  ];

  var colMax = {};
  cats.forEach(function(c) {
    colMax[c.key] = Math.max.apply(null, data.map(function(h){ return h[c.key]||0; })) || 1;
  });

  var thStyle = 'padding:6px 8px;background:#eef2ff;border:1px solid #c7d4f0;white-space:nowrap;text-align:center;position:sticky;top:0;z-index:3;';
  var html = '<table style="border-collapse:collapse;font-size:11px;width:100%;min-width:520px;">';
  html += '<thead><tr>';
  html += '<th style="'+thStyle+' text-align:left;left:0;z-index:4;min-width:160px;">รพ.สต.</th>';
  html += '<th style="'+thStyle+' min-width:55px;">รวม</th>';
  cats.forEach(function(c){
    html += '<th style="'+thStyle+' min-width:130px;">'+c.label+'</th>';
  });
  html += '</tr></thead><tbody>';

  data.forEach(function(h, ri) {
    var total = h.total || 1;
    var rowBg = ri % 2 === 0 ? '#ffffff' : '#f8faff';
    html += '<tr>';
    html += '<td style="padding:4px 10px;border:1px solid #e2e8f0;background:'+rowBg+';position:sticky;left:0;font-weight:600;font-size:10.5px;white-space:nowrap;z-index:1;">'
          + e_(h.hospcode) + '<br><span style="font-weight:400;color:var(--muted);">' + e_(h.name) + '</span></td>';
    html += '<td style="padding:4px 8px;border:1px solid #e2e8f0;text-align:center;font-weight:700;background:'+rowBg+';">'+total+'</td>';
    cats.forEach(function(c){
      var count  = h[c.key] || 0;
      var pctTotal = Math.round(count / total * 100); 
      var alpha  = count / colMax[c.key];               
      var R = Math.round(255 + (c.base[0]-255)*alpha);
      var G2= Math.round(255 + (c.base[1]-255)*alpha);
      var B = Math.round(255 + (c.base[2]-255)*alpha);
      var txtColor = alpha > 0.45 ? '#fff' : '#1e293b';
      html += '<td style="padding:4px 8px;border:1px solid #e2e8f0;text-align:center;'
            + 'background:rgb('+R+','+G2+','+B+');color:'+txtColor+';'
            + 'font-weight:'+(count>0?'600':'400')+';">'
            + (count > 0
               ? count + '<br><span style="font-size:9.5px;opacity:0.9;">' + pctTotal + '%</span>'
               : '<span style="opacity:0.35;">—</span>')
            + '</td>';
    });
    html += '</tr>';
  });

  var sumRow = { normal:0, abnormal:0, referred:0, glasses:0, total:0 };
  data.forEach(function(h){ cats.forEach(function(c){ sumRow[c.key]+=(h[c.key]||0); }); sumRow.total+=h.total||0; });
  var sumT = sumRow.total || 1;
  html += '<tr style="font-weight:700;">';
  html += '<td style="padding:5px 10px;border:1px solid #c7d4f0;background:#eef2ff;position:sticky;left:0;z-index:1;">รวมทั้งหมด</td>';
  html += '<td style="padding:5px 8px;border:1px solid #c7d4f0;text-align:center;background:#eef2ff;">'+sumRow.total+'</td>';
  cats.forEach(function(c){
    var count = sumRow[c.key];
    var pct   = Math.round(count/sumT*100);
    html += '<td style="padding:5px 8px;border:1px solid #c7d4f0;text-align:center;background:#eef2ff;">'+count+'<br><span style="font-size:9.5px;font-weight:400;">'+pct+'%</span></td>';
  });
  html += '</tr>';

  html += '</tbody></table>';
  wrap.innerHTML = html;
}

function loadDashboard(params) {
  if (G.session.loggedIn && G.session.hospcode !== 'all') params.userHosp = G.session.hospcode;
  document.getElementById('tBody').innerHTML = '<tr><td colspan="26" style="text-align:center;padding:24px;color:var(--muted2)">⏳ กำลังโหลด...</td></tr>';
  document.getElementById('hospSumBody').innerHTML = '<tr><td colspan="12" style="text-align:center;padding:12px;">⏳ กำลังโหลด...</td></tr>';

  google.script.run.withSuccessHandler(function(r) {
    var d = JSON.parse(r); if (!d.ok) { toast('โหลดข้อมูลไม่สำเร็จ', 'err'); return; }
    G.chartData = { amphoe: d.data.barChartAmphoe, hosp: d.data.barChartHosp, school: d.data.barChartSchool }; G.kpi = d.data.kpi; G.hospSummaryData = d.data.hospSummary; G.satCharts = d.data.satCharts;
    updateKPIs(G.kpi); renderPieChart(G.kpi); renderSatTestChart(G.kpi); 
    try { renderSummaryTable(G.hospSummaryData); } catch(err) { console.error('Summary Error:', err); }
    G.allRows = d.data.rows; G.dispRows = d.data.rows; renderBarChart(); renderSatBreakdownChart(); renderSatTypePieChart(); renderHeatmap();
    
    // เรียกวาดกราฟชุดใหม่ที่นี่
    if(d.data.extraStats) renderExtraDashCharts(d.data.extraStats);

    if (G.session.loggedIn) renderTable(G.dispRows);
    if (myMap) setTimeout(function(){ myMap.invalidateSize(); }, 300);
  }).getDashboardData(params);
}

function showImg(url) { var imgSrc = url; var match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/); if (match && match[1]) { imgSrc = 'https://drive.google.com/thumbnail?id=' + match[1] + '&sz=w1000'; } document.getElementById('imgFull').src = imgSrc; document.getElementById('imgModal').classList.add('open'); }
function closeImg() { document.getElementById('imgModal').classList.remove('open'); setTimeout(function(){ document.getElementById('imgFull').src = ''; }, 250); }

function renderSummaryTable(data) {
  var tb = document.getElementById('hospSumBody'); if (!data || data.length === 0) { tb.innerHTML = '<tr><td colspan="12" style="text-align:center;">ไม่มีข้อมูล</td></tr>'; return; }
  var html = ''; var currentFilter = document.getElementById('fHosp').value;
  data.forEach(function(r) {
    try {
        var picHtml = '<span style="color:var(--muted2); font-size:10px;">—</span>';
        if (r.pics) { var urls = String(r.pics).split('\n'); var links = urls.map(function(url, idx) { url = url.trim(); if (!url) return ''; return '<a href="javascript:void(0)" onclick="event.stopPropagation(); showImg(\''+url+'\');" style="color:var(--blue);text-decoration:underline;font-weight:600;">[ดูภาพที่ '+(idx+1)+']</a>'; }).filter(Boolean); if (links.length > 0) picHtml = links.join('<br>'); }
        var rowClass = (currentFilter === r.hospcode) ? 'tr-active' : ''; var sat = (r.satAvg != null && r.satAvg !== '') ? Number(r.satAvg).toFixed(2) : '—'; var pre = (r.preAvg != null && r.preAvg !== '') ? Number(r.preAvg).toFixed(1) : '—'; var post = (r.postAvg != null && r.postAvg !== '') ? Number(r.postAvg).toFixed(1) : '—'; var gain = (r.gainAvg != null && r.gainAvg !== '') ? (Number(r.gainAvg) > 0 ? '+'+r.gainAvg : r.gainAvg)+'%' : '—'; var gc = (r.gainAvg != null && r.gainAvg !== '') ? (Number(r.gainAvg) > 0 ? 'color:var(--green)' : (Number(r.gainAvg) < 0 ? 'color:var(--red)' : '')) : '';
        var actHtml = '—'; var tdAct = '';
        if (G.session.loggedIn) { if (G.session.role === 'admin' || G.session.hospcode === r.hospcode) { actHtml = '<button class="btn-act" style="color:#ea580c;border-color:#fed7aa;" onclick="openEditHosp(\''+r.hospcode+'\'); event.stopPropagation();" title="จัดการพิกัด/ภาพ">📍 จัดการพิกัด</button>'; } tdAct = '<td style="text-align:center;">'+actHtml+'</td>'; }
        html += '<tr class="'+rowClass+'" onclick="toggleHospFilter(\''+r.hospcode+'\')" style="cursor:pointer;" title="คลิกเพื่อกรองข้อมูล / คลิกซ้ำเพื่อยกเลิก">' + '<td style="text-align:left;">'+(r.hospcode||'')+' '+(r.name||'')+'</td><td>'+(r.normal||0)+'</td><td>'+(r.abnormal||0)+'</td><td>'+(r.referred||0)+'</td><td>'+(r.glasses||0)+'</td><td><b>'+(r.total||0)+'</b></td>' + '<td>'+sat+'</td><td>'+pre+'</td><td>'+post+'</td><td style="'+gc+'">'+gain+'</td><td style="text-align:center; font-size:10.5px;">'+picHtml+'</td>'+tdAct+'</tr>';
    } catch(err) { console.error('Error on row rendering:', err); }
  }); tb.innerHTML = html;
}

function openEditHosp(hc) { var targetHc = hc; if (!targetHc && G.session.role === 'admin') targetHc = ''; if (!targetHc && G.session.role !== 'admin') targetHc = G.session.hospcode; var sel = document.getElementById('loc-hc'); sel.value = targetHc; if (G.session.role !== 'admin') sel.disabled = true; else sel.disabled = false; loadHospLocData(); openPanel('loc'); }
function loadHospLocData() {
  var hc = document.getElementById('loc-hc').value; if (!hc) { document.getElementById('loc-lat').value = ''; document.getElementById('loc-lon').value = ''; document.getElementById('loc-current-pics').innerHTML = '<div style="font-size:11px;color:var(--muted)">เลือกรพ.สต. เพื่อดูภาพปัจจุบัน</div>'; return; }
  var hObj = G.hospList.find(function(x){ return x.hospcode === hc; }); var sumObj = G.hospSummaryData ? G.hospSummaryData.find(function(x){ return x.hospcode === hc; }) : null;
  document.getElementById('loc-lat').value = hObj ? (hObj.lat || '') : ''; document.getElementById('loc-lon').value = hObj ? (hObj.lon || '') : '';
  var picsHtml = '';
  if (sumObj && sumObj.pics) { var urls = String(sumObj.pics).split('\n').map(function(u){return u.trim();}).filter(Boolean); urls.forEach(function(url, idx) { picsHtml += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;background:#f8faff;padding:6px 10px;border:1px solid #e2e8f0;border-radius:6px;"><a href="javascript:void(0)" onclick="showImg(\''+url+'\')" style="font-size:11px;font-weight:600;color:var(--blue);text-decoration:underline;">ดูภาพที่ '+(idx+1)+'</a><button class="btn-del2" style="margin-left:auto;" onclick="delPic(\''+hc+'\', \''+url+'\')">🗑 ลบภาพนี้</button></div>'; });
  } else { picsHtml = '<div style="font-size:11px;color:var(--muted)">ยังไม่มีภาพผลงาน</div>'; } document.getElementById('loc-current-pics').innerHTML = picsHtml;
}
function delPic(hc, url) { if(!confirm('ยืนยันการลบภาพนี้? (การลบจะลบภาพออกจากระบบอย่างถาวร)')) return; toast('กำลังลบภาพ...', 'inf'); google.script.run.withSuccessHandler(function(r){ var res = JSON.parse(r); if(res.ok) { toast('ลบภาพสำเร็จ','ok'); closePanel('loc'); forceRefresh(); } else { toast(res.msg,'err'); } }).deleteHospFileLink(hc, url); }
function saveLoc() {
  var btn = document.getElementById('btnSLoc'); var hc = document.getElementById('loc-hc').value; if(!hc) { toast('กรุณาเลือกรพ.สต. ที่ต้องการจัดการ', 'err'); return; }
  var fileInput = document.getElementById('loc-pics'); var files = fileInput.files; if (files.length > 2) { toast('แนบภาพได้สูงสุด 2 ภาพเท่านั้น', 'err'); return; } var valid = true; for (var i = 0; i < files.length; i++) { if (files[i].size > 2 * 1024 * 1024) { toast('ไฟล์ ' + files[i].name + ' มีขนาดเกิน 2MB', 'err'); valid = false; } } if (!valid) return;
  btn.disabled=true; btn.innerHTML='<span class="sp"></span> กำลังเตรียมข้อมูล...'; var promises = [];
  for (var i = 0; i < files.length; i++) { promises.push(new Promise(function(resolve, reject) { var f = files[i]; var reader = new FileReader(); reader.onload = function(e) { resolve({ name: f.name, mimeType: f.type, data: e.target.result.split(',')[1] }); }; reader.readAsDataURL(f); })); }
  Promise.all(promises).then(function(picData) { btn.innerHTML='<span class="sp"></span> กำลังอัปโหลด...'; var d = { hospcode: hc, lat_h: document.getElementById('loc-lat').value, lon_h: document.getElementById('loc-lon').value, pics: picData }; google.script.run.withSuccessHandler(function(r){ btn.disabled=false; btn.innerHTML='💾 บันทึกข้อมูล'; var res=JSON.parse(r); if(res.ok){ toast(res.msg,'ok'); document.getElementById('loc-pics').value=''; closePanel('loc'); forceRefresh(); } else toast(res.msg,'err'); }).withFailureHandler(function(e){ btn.disabled=false; btn.innerHTML='💾 บันทึกข้อมูล'; toast(e.message,'err'); }).updateHospLocation(d); });
}

function toggleHospFilter(hospcode) { var el = document.getElementById('fHosp'); if (el.value === hospcode) { el.value = ''; } else { el.value = hospcode; } applyFilters(); }
function toggleStatFilter(stat) { var el = document.getElementById('fStat'); if (el.value === stat) { el.value = ''; } else { el.value = stat; } applyFilters(); }
function updateKPIs(k) { 
  function sv(id, v) { var e = document.getElementById(id); if (e) e.textContent = (v !== null && v !== undefined) ? v : '—'; } 
  sv('k-total', k.total); 
  sv('k-normal', k.normal); sv('k-npct', k.normal !== null ? k.normalPct + '%' : '—'); sv('k-abnormal', k.abnormalTotal !== undefined ? k.abnormalTotal : k.abnormal); 
  sv('k-abpct', k.abnormalPct !== null ? k.abnormalPct + '%' : '—'); 
  
  sv('k-referred', k.referred); sv('k-rfpct', k.referred !== null ? k.referredPct + '%' : '—'); 
  sv('k-glasses', k.glasses); sv('k-glpct', k.glasses !== null ? k.glassesPct + '%' : '—'); 
  sv('k-sat', k.satAvg !== null ? k.satAvg.toFixed(2) : '—'); 
  sv('k-pre', k.preAvg !== null ? k.preAvg.toFixed(1) : '—'); 
  sv('k-post', k.postAvg !== null ? k.postAvg.toFixed(1) : '—'); 
  sv('k-gain', k.gainAvg !== null ? k.gainAvg + '%' : '—'); 
  sv('k-trainee', k.preTestCount !== null ? k.preTestCount : '—'); 
}

function renderBarChart() {
  var ctx = document.getElementById('barChart').getContext('2d'); 
  var ctxHosp = document.getElementById('hospChart').getContext('2d'); 
  var ctxSchool = document.getElementById('schoolChart').getContext('2d');
  
  if (G.barInst) G.barInst.destroy(); 
  if (G.hospInst) G.hospInst.destroy(); 
  if (G.schoolInst) G.schoolInst.destroy();
  
  var type = document.getElementById('chartType').value; 
  var labels = [], datasets = [];
  
  if (type === 'amphoe') { 
      var data = G.chartData.amphoe; labels = data.map(function(d){ return d.label; }); 
      datasets = [ 
        { label: 'ปกติ', data: data.map(function(d){ return d.normal; }), backgroundColor: '#16A34A' }, 
        { label: 'ผิดปกติ(ทั้งหมด)', data: data.map(function(d){ return d.abnormal; }), backgroundColor: '#ca8a04' }, 
        { label: 'ส่งต่อ', data: data.map(function(d){ return d.referred; }), backgroundColor: '#ea580c' }, 
        { label: 'ตัดแว่น', data: data.map(function(d){ return d.glasses; }), backgroundColor: '#dc2626' } 
      ]; 
  } else { 
      labels = ['ปกติ', 'ผิดปกติ(ทั้งหมด)', 'ส่งต่อ', 'ตัดแว่น']; 
      datasets = [{ label: 'จำนวน (คน)', data: [G.kpi.normal, G.kpi.abnormalTotal !== undefined ? G.kpi.abnormalTotal : G.kpi.abnormal, (G.kpi.referredRaw!==undefined?G.kpi.referredRaw:G.kpi.referred), G.kpi.glasses], backgroundColor: ['#16A34A', '#ca8a04', '#ea580c', '#dc2626'] }]; 
  }
  
  G.barInst = new Chart(ctx, { 
    type: 'bar', data: { labels: labels, datasets: datasets }, 
    options: { 
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, 
      onClick: function(evt, elements) { 
        if (!elements.length) return; var idx = elements[0].index; 
        if (type === 'amphoe') { var amp = labels[idx]; var el = document.getElementById('fAmp'); el.value = (el.value === amp) ? '' : amp; applyFilters(); } 
        else { var stats = ['normal','abnormal','referred','glasses']; var stat = stats[idx]; var el = document.getElementById('fStat'); el.value = (el.value === stat) ? '' : stat; applyFilters(); } 
      }, 
      plugins: { 
        legend: { display: (type !== 'total'), position: 'bottom', labels: { font: { size: 11, family: 'Sarabun' } } }, 
        datalabels: { display: function(ctx) { return ctx.dataset.data[ctx.dataIndex] > 0; }, color: '#ffffff', font: { weight: 'bold', size: 14, family: 'Sarabun' }, textStrokeColor: 'rgba(0,0,0,0.6)', textStrokeWidth: 3 } 
      }, 
      scales: { x: { stacked: false, ticks: { font: { family: 'Sarabun', size: 12 } } }, y: { stacked: false, beginAtZero: true } } 
    }, plugins: [ChartDataLabels] 
  });

  // --- กราฟ รพ.สต. ---
  var hData = G.chartData.hosp; var filterAmp = document.getElementById('fAmp').value; if (filterAmp) hData = hData.filter(function(d){ return d.amphoe === filterAmp; });
  var hLabels = hData.map(function(d){ return d.label; }); 
  var hDatasets = [ 
    { label: 'ปกติ', data: hData.map(function(d){ return d.normal; }), backgroundColor: '#16A34A' }, 
    { label: 'ผิดปกติ(ทั้งหมด)', data: hData.map(function(d){ return d.abnormal; }), backgroundColor: '#ca8a04' }, 
    { label: 'ส่งต่อ', data: hData.map(function(d){ return d.referred; }), backgroundColor: '#ea580c' }, 
    { label: 'ตัดแว่น', data: hData.map(function(d){ return d.glasses; }), backgroundColor: '#dc2626' } 
  ];

  // ขยายความกว้างกล่อง เพื่อไม่ให้กราฟ 4 แท่งเบียดกัน (แท่งละ 50px รวม 200px ต่อ 1 รพ.สต.)
  var hospContainer = document.getElementById('hospChartContainer');
  if(hospContainer) {
      var calcWidthHosp = hLabels.length * 200; 
      if (calcWidthHosp < hospContainer.parentElement.clientWidth) calcWidthHosp = hospContainer.parentElement.clientWidth;
      hospContainer.style.width = calcWidthHosp + 'px';
  }

  G.hospInst = new Chart(ctxHosp, { 
    type: 'bar', data: { labels: hLabels, datasets: hDatasets }, 
    options: { 
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, 
      onClick: function(evt, elements) { 
        if (!elements.length) return; var hcLabel = hLabels[elements[0].index]; var hcObj = G.chartData.hosp.find(function(h){ return h.label === hcLabel; }); 
        if(hcObj) { var el = document.getElementById('fHosp'); el.value = (el.value === hcObj.hospcode) ? '' : hcObj.hospcode; applyFilters(); } 
      }, 
      plugins: { 
        legend: { position: 'bottom', labels: { font: { size: 11, family: 'Sarabun' } } }, 
        datalabels: { display: function(ctx) { return ctx.dataset.data[ctx.dataIndex] > 0; }, color: '#ffffff', font: { weight: 'bold', size: 12, family: 'Sarabun' }, textStrokeColor: 'rgba(0,0,0,0.6)', textStrokeWidth: 2 } 
      }, 
      scales: { 
        x: { 
          stacked: false, 
          ticks: { 
            font: { family: 'Sarabun', size: 9 }, // แก้ไขตรงนี้: ลดขนาดจาก 11 เป็น 9 เพื่อให้ชื่อแสดงครบ
            maxRotation: 45, 
            minRotation: 45 
          } 
        }, 
        y: { stacked: false, beginAtZero: true } 
      } 
    }, plugins: [ChartDataLabels] 
  });

  // --- กราฟ โรงเรียน ---
  var sTally = {}; G.dispRows.forEach(function(r) { var s = r.school_name || 'ไม่ระบุโรงเรียน'; if (!sTally[s]) sTally[s] = { label: s, normal:0, abnormal:0, referred:0, glasses:0, total:0 }; sTally[s][r.status]++; sTally[s].total++; });
  var sDataArr = Object.keys(sTally).sort().map(function(s) { 
      var d = sTally[s]; return { label: d.label, normal: d.normal, abnormal: (d.total - d.normal), referred: d.referred, glasses: d.glasses, total: d.total }; 
  }); 
  var sLabels = sDataArr.map(function(d){ return d.label; }); 
  var sDatasets = [ 
    { label: 'ปกติ', data: sDataArr.map(function(d){ return d.normal; }), backgroundColor: '#16A34A' }, 
    { label: 'ผิดปกติ(ทั้งหมด)', data: sDataArr.map(function(d){ return d.abnormal; }), backgroundColor: '#ca8a04' }, 
    { label: 'ส่งต่อ', data: sDataArr.map(function(d){ return d.referred; }), backgroundColor: '#ea580c' }, 
    { label: 'ตัดแว่น', data: sDataArr.map(function(d){ return d.glasses; }), backgroundColor: '#dc2626' } 
  ];

  // ขยายความกว้างกล่อง เพื่อไม่ให้กราฟเบียด (200px ต่อ 1 โรงเรียน)
  var schoolContainer = document.getElementById('schoolChartContainer');
  if(schoolContainer) {
      var calcWidthSchool = sLabels.length * 200; 
      if (calcWidthSchool < schoolContainer.parentElement.clientWidth) calcWidthSchool = schoolContainer.parentElement.clientWidth;
      schoolContainer.style.width = calcWidthSchool + 'px';
  }

  G.schoolInst = new Chart(ctxSchool, { 
    type: 'bar', data: { labels: sLabels, datasets: sDatasets }, 
    options: { 
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, 
      onClick: function(evt, elements) { 
        if (!elements.length) return; var schLabel = sLabels[elements[0].index]; var el = document.getElementById('fSch'); el.value = (el.value === schLabel) ? '' : schLabel; applyFilters(); 
      }, 
      plugins: { 
        legend: { position: 'bottom', labels: { font: { size: 11, family: 'Sarabun' } } }, 
        datalabels: { display: function(ctx) { return ctx.dataset.data[ctx.dataIndex] > 0; }, color: '#ffffff', font: { weight: 'bold', size: 12, family: 'Sarabun' }, textStrokeColor: 'rgba(0,0,0,0.6)', textStrokeWidth: 2 } 
      }, 
      scales: { 
        x: { 
          stacked: false, 
          ticks: { 
            font: { family: 'Sarabun', size: 9 }, // แก้ไขตรงนี้: ลดขนาดจาก 11 เป็น 9 เพื่อให้ชื่อแสดงครบ
            maxRotation: 45, 
            minRotation: 45 
          } 
        }, 
        y: { stacked: false, beginAtZero: true } 
      } 
    }, plugins: [ChartDataLabels] 
  });
}

function renderPieChart(kpi) {
  var ctx = document.getElementById('pieChart').getContext('2d'); if (G.pieInst) G.pieInst.destroy();
  G.pieInst = new Chart(ctx, { 
    type: 'doughnut', 
    data: { labels: ['ปกติ','ผิดปกติ(เฝ้าระวัง)','ส่งต่อ','ตัดแว่น'], datasets: [{ data: [kpi.normal||0, kpi.abnormal||0, (kpi.referredRaw!==undefined?kpi.referredRaw:kpi.referred)||0, kpi.glasses||0], backgroundColor: ['#16A34A','#ca8a04','#ea580c','#dc2626'] }] }, 
    options: { 
      responsive: true, maintainAspectRatio: false, 
      onClick: function(evt, elements) { if (!elements.length) return; var stats = ['normal','abnormal','referred','glasses']; var stat = stats[elements[0].index]; var el = document.getElementById('fStat'); el.value = (el.value === stat) ? '' : stat; applyFilters(); }, 
      plugins: { 
        legend: { position: 'bottom', labels: { font: { size: 9.5, family: 'Sarabun' } } },
        datalabels: { color: '#ffffff', font: { weight: 'bold', size: 16, family: 'Sarabun' }, textStrokeColor: 'rgba(0,0,0,0.5)', textStrokeWidth: 3 }
      } 
    }, plugins: [ChartDataLabels] 
  });
}

function renderSatTestChart(kpi) {
  var ctx = document.getElementById('lineChart').getContext('2d'); if (G.lineInst) G.lineInst.destroy(); _satClickIdx = null;
  var satVal = kpi.satAvg !== null ? kpi.satAvg : 0; var preVal = kpi.preAvg !== null ? kpi.preAvg : 0; var postVal = kpi.postAvg !== null ? kpi.postAvg : 0;
  var origColors = ['#7c3aed', '#0d9488', '#0891b2']; var labels = ['ความพึงพอใจ', 'Pre-test', 'Post-test']; var displayVals = [satVal * 2, preVal, postVal];
  G.lineInst = new Chart(ctx, { type: 'bar', data: { labels: labels, datasets: [{ data: displayVals, backgroundColor: origColors.slice(), borderRadius: 6, borderSkipped: false }] }, options: { responsive: true, maintainAspectRatio: false, layout: { padding: { top: 25 } }, onClick: function(evt, elements) { var ds = this.data.datasets[0]; if (!elements.length) { ds.backgroundColor = origColors.slice(); _satClickIdx = null; this.update(); return; } var idx = elements[0].index; if (_satClickIdx === idx) { ds.backgroundColor = origColors.slice(); _satClickIdx = null; } else { _satClickIdx = idx; ds.backgroundColor = origColors.map(function(c, i) { return i === idx ? c : c + '44'; }); } this.update(); }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(ctx) { if (ctx.dataIndex === 0) return 'ความพึงพอใจ: ' + satVal.toFixed(2) + '/5'; if (ctx.dataIndex === 1) return 'Pre-test: ' + preVal.toFixed(1) + '/10'; return 'Post-test: ' + postVal.toFixed(1) + '/10'; } } }, datalabels: { display: true, color: '#1E3A5F', anchor: 'end', align: 'top', offset: 4, font: { weight: 'bold', size: 14, family: 'Sarabun' }, textStrokeColor: '#ffffff', textStrokeWidth: 4, formatter: function(value, ctx) { if (ctx.dataIndex === 0) return satVal > 0 ? satVal.toFixed(2) + ' /5' : '—'; if (ctx.dataIndex === 1) return preVal > 0 ? preVal.toFixed(1) + ' /10' : '—'; return postVal > 0 ? postVal.toFixed(1) + ' /10' : '—'; } } }, scales: { x: { ticks: { font: { family: 'Sarabun', size: 10 } } }, y: { beginAtZero: true, max: 10, ticks: { stepSize: 2 } } } }, plugins: [ChartDataLabels] });
}

var SL = { normal:'ปกติ', abnormal:'ผิดปกติ', referred:'ส่งต่อ', glasses:'ตัดแว่น' }; 
var SC_CLS = { normal:'bn', abnormal:'bab', referred:'brf', glasses:'bgl' };

function renderTable(rows) {
  var tb = document.getElementById('tBody'); 
  if (!rows.length) { 
      tb.innerHTML = '<tr><td colspan="26" style="text-align:center;padding:20px;color:var(--muted2)">ไม่พบข้อมูล</td></tr>'; 
      return; 
  } 
  var h = '';
  var loggedIn = G.session.loggedIn; 

  rows.forEach(function(r, i) {
    var gain = r.gain !== null ? (r.gain > 0 ? '+'+r.gain : r.gain)+'%' : '—'; 
    var gc = r.gain > 0 ? 'color:var(--green)' : r.gain < 0 ? 'color:var(--red)' : ''; 
    var actBtns = '—';
    
    if (G.session.role === 'admin' || (loggedIn && G.session.hospcode === r.hospcode)) { 
        actBtns = '<div style="display:flex;gap:4px;justify-content:center;">' +
                  '<button class="btn-act" style="color:#3B82F6;border-color:#bfdbfe;" onclick="editRow(\'' + e_(r.cid) + '\'); event.stopPropagation();" title="แก้ไขข้อมูล">✏️</button>' +
                  '<button class="btn-act" style="color:var(--red);border-color:#fecaca;" onclick="openDel(\'' + e_(r.cid) + '\'); event.stopPropagation();" title="ลบข้อมูล">🗑</button></div>'; 
    }
    
    var tdCid = loggedIn ? ('<td class="col-cid" style="color:var(--accent);font-weight:600;">'+e_(r.cid)+'</td>') : '<td class="col-cid" style="display:none;"></td>';
    
    var bRisk = r.beh_risk === 'high' ? '<span class="badge bgl" title="เสี่ยงสูง">สูง</span>' : (r.beh_risk === 'medium' ? '<span class="badge brf" title="เสี่ยงปานกลาง">กลาง</span>' : (r.beh_risk === 'low' ? '<span class="badge bn" title="เสี่ยงน้อย">น้อย</span>' : '<span style="color:#cbd5e1">-</span>'));
    var fStat = r.fup_status ? '<span class="badge bn" title="'+e_(r.fup_status)+'">☑ แล้ว</span>' : '<span style="color:#cbd5e1">-</span>';
    var txtTreat = r.treatment && r.treatment.length > 12 ? r.treatment.substring(0,12) + '...' : (r.treatment || '—');

    // เรียกฟังก์ชันด้วย window. เพื่อรับประกันว่าจะไม่หลุด scope
    var trAttrs = '';
    if (loggedIn) {
      trAttrs = ' onclick="window.viewScreeningFullDetails(\'' + String(r.cid).trim() + '\')" style="cursor:pointer;" title="คลิกแถวนี้เพื่อดูข้อมูล Screening_Data ทั้งหมด"';
    }

    h += '<tr' + trAttrs + '>' +
         '<td style="text-align:center;"><input type="checkbox" class="row-chk" value="'+r.cid+'" onclick="event.stopPropagation();"></td>' +
         '<td>'+(i+1)+'</td>' + tdCid + 
         '<td style="font-weight:600;">'+e_(r.student_name)+'</td>' +
         '<td>'+e_(r.school_class)+'</td>' +
         '<td>'+(r.school_name||'—')+'</td>' +
         '<td onclick="toggleHospFilter(\''+r.hospcode+'\'); event.stopPropagation();" style="cursor:pointer;color:var(--blue); font-weight:600;" title="คลิกเพื่อกรอง">'+e_(r.hospcode)+'</td>' +
         '<td title="'+e_(r.treatment)+'">'+e_(txtTreat)+'</td>' +
         '<td style="background:#f0f9ff; text-align:center;">'+e_(r.va_r_naked||'—')+'</td>' +
         '<td style="background:#f0f9ff; text-align:center;">'+e_(r.va_l_naked||'—')+'</td>' +
         '<td style="background:#f0f9ff; text-align:center;">'+e_(r.va_naked_OU||'—')+'</td>' +
         '<td style="background:#f0f9ff; text-align:center;">'+e_(r.va_r_glasses||'—')+'</td>' +
         '<td style="background:#f0f9ff; text-align:center;">'+e_(r.va_l_glasses||'—')+'</td>' +
         '<td style="background:#f0f9ff; text-align:center;">'+e_(r.va_glasses_OU||'—')+'</td>' +
         '<td style="background:#fff7ed; text-align:center;">'+e_(r.ph_r||'—')+'</td>' +
         '<td style="background:#fff7ed; text-align:center;">'+e_(r.ph_l||'—')+'</td>' +
         '<td>'+e_(r.diagnosis)+'</td>' +
         '<td><span class="badge '+SC_CLS[r.status]+'" onclick="toggleStatFilter(\''+r.status+'\'); event.stopPropagation();" title="คลิกเพื่อกรองสถานะ">'+(SL[r.status]||r.status)+'</span></td>' +
         '<td style="text-align:center;">'+bRisk+'</td><td style="text-align:center;">'+fStat+'</td>' +
         '<td>'+e_(r.screen_date)+'</td><td>'+(r.sat!==null?r.sat.toFixed(2):'—')+'</td>' +
         '<td>'+(r.pre!==null?r.pre:'—')+'</td><td>'+(r.post!==null?r.post:'—')+'</td>' +
         '<td style="'+gc+'">'+gain+'</td><td style="text-align:center;">'+actBtns+'</td></tr>';
  }); 
  tb.innerHTML = h; 
  document.getElementById('tInfo').textContent = 'แสดง ' + rows.length + ' รายการ';
}

window.viewScreeningFullDetails = function(cid) {
  try {
    var data = G.allRows.find(function(r) { return String(r.cid) === String(cid); });
    if (!data) { toast("ไม่พบข้อมูล", "err"); return; }
    
    var content = document.getElementById('fullviewContent');
    var sexText = data.sex === '1' ? 'ชาย' : (data.sex === '2' ? 'หญิง' : 'ไม่ระบุ');
    
    var html = '';
    html += '<div class="fs"><div class="fs-t" style="color:var(--primary); font-weight:bold; border-color:var(--accent);">👤 ข้อมูลทั่วไปของผู้รับการตรวจ</div>' +
            '<table style="width:100%; font-size:12px; margin-bottom:5px;">' +
            '<tr><td style="width:120px; font-weight:600; color:var(--muted);">เลขบัตรประชาชน:</td><td><b>' + e_(data.cid) + '</b></td></tr>' +
            '<tr><td style="font-weight:600; color:var(--muted);">ชื่อ-นามสกุล:</td><td>' + e_(data.pname) + e_(data.fname) + ' ' + e_(data.lname) + '</td></tr>' +
            '<tr><td style="font-weight:600; color:var(--muted);">วันเกิด:</td><td>' + e_(data.birthday) + ' (' + e_(data.age_years) + ' ปี) | <b>เพศ:</b> ' + sexText + '</td></tr>' +
            '<tr><td style="font-weight:600; color:var(--muted);">ระดับชั้น:</td><td>' + e_(data.level_edu) + (data.room ? ' ห้อง ' + e_(data.room) : '') + ' (ชั้นเรียน: ' + e_(data.school_class) + ')</td></tr>' +
            '<tr><td style="font-weight:600; color:var(--muted);">โรงเรียน:</td><td>' + e_(data.school_name) + ' (รหัส: ' + e_(data.school_code) + ')</td></tr>' +
            '<tr><td style="font-weight:600; color:var(--muted);">ที่อยู่:</td><td>บ้านเลขที่ ' + e_(data.address) + ' หมู่ที่ ' + e_(data.moo) + ' ต.' + e_(data.tambon) + ' อ.' + e_(data.amphoe) + ' จ.' + e_(data.province) + ' (รหัสปกครอง aid: ' + e_(data.aid) + ')</td></tr>' +
            '<tr><td style="font-weight:600; color:var(--muted);">สิทธิการรักษา:</td><td><span style="background:#f1f5f9; padding:2px 6px; border-radius:4px;">' + e_(data.treatment || '—') + '</span></td></tr>' +
            '</table></div>';
            
    html += '<div class="fs"><div class="fs-t" style="color:var(--primary); font-weight:bold; border-color:var(--accent);">📋 ประวัติสุขภาพตา</div>' +
            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:11.5px;">' +
            '<div>• เคยสวมแว่น/เลนส์: <b>' + data.hx_glasses + '</b></div>' +
            '<div>• เคยผ่าตัด/บาดเจ็บตา: <b>' + data.hx_injury + '</b></div>' +
            '<div>• มีอาการตาแดงเรื้อรัง: <b>' + data.hx_red_eye + '</b></div>' +
            '<div>• ปวดหัวบ่อยครั้ง: <b>' + data.hx_headache + '</b></div>' +
            '<div>• ตาเหล่/ตาขี้เกียจ: <b>' + data.hx_amblyopia + '</b></div>' +
            '<div>• ครอบครัวสวมแว่น: <b>' + data.hx_family + '</b></div>' +
            '</div></div>';

    html += '<div class="fs"><div class="fs-t" style="color:var(--primary); font-weight:bold; border-color:var(--accent);">👁️ ผลการตรวจสายตา (หน่วยวัด: ' + e_(data.unit) + ')</div>' +
            '<table class="va-tbl" style="margin-top:4px; font-size:11.5px;">' +
            '<thead><tr><th>การทดสอบ</th><th>ขวา (OD)</th><th>ซ้าย (OS)</th><th>สองตา (OU)</th></tr></thead>' +
            '<tbody>' +
            '<tr><td style="font-weight:600;">ไม่ใส่แว่น</td><td style="text-align:center;">' + e_(data.va_r_naked || '—') + '</td><td style="text-align:center;">' + e_(data.va_l_naked || '—') + '</td><td style="text-align:center;">' + e_(data.va_naked_OU || '—') + '</td></tr>' +
            '<tr><td style="font-weight:600;">ใส่แว่น / เลนส์</td><td style="text-align:center;">' + e_(data.va_r_glasses || '—') + '</td><td style="text-align:center;">' + e_(data.va_l_glasses || '—') + '</td><td style="text-align:center;">' + e_(data.va_glasses_OU || '—') + '</td></tr>' +
            '<tr><td style="font-weight:600;">Pin Hole Test</td><td style="text-align:center;">' + e_(data.ph_r || '—') + '</td><td style="text-align:center;">' + e_(data.ph_l || '—') + '</td><td style="text-align:center; background:#f1f5f9; color:gray;">N/A</td></tr>' +
            '</tbody></table></div>';

    html += '<div class="fs"><div class="fs-t" style="color:var(--primary); font-weight:bold; border-color:var(--accent);">🩺 ผลการตรวจทางคลินิก & วินิจฉัยสรุป</div>' +
            '<table style="width:100%; font-size:12px; margin-bottom:5px;">' +
            '<tr><td style="width:110px; font-weight:600; color:var(--muted);">Cover Test:</td><td>' + e_(data.cover_test) + '</td>' +
            '<td style="width:110px; font-weight:600; color:var(--muted);">Hirschberg:</td><td>' + e_(data.hirschberg) + '</td></tr>' +
            '<tr><td style="font-weight:600; color:var(--muted);">Color Vision:</td><td>' + e_(data.color_vision) + '</td>' +
            '<td style="font-weight:600; color:var(--muted);">Stereopsis:</td><td>' + e_(data.stereopsis) + '</td></tr>' +
            '<tr><td colspan="4" style="padding-top:6px; border-top:1px dashed #e2e8f0;">' +
            '<div style="margin-bottom:3px;"><b>ผลวินิจฉัย (Diagnosis):</b> <span style="color:var(--red); font-weight:bold;">' + e_(data.diagnosis) + '</span></div>' +
            '<div><b>การส่งต่อ (Referral):</b> <span style="color:#ea580c; font-weight:bold;">' + e_(data.referral) + '</span></div>' +
            '</td></tr>' +
            '</table></div>';

    html += '<div class="fs"><div class="fs-t" style="color:var(--primary); font-weight:bold; border-color:var(--accent);">📝 ข้อมูลการบันทึกเอกสาร</div>' +
            '<div style="font-size:12px;">' +
            '<div><b>วันที่ทำการตรวจ:</b> ' + e_(data.screen_date) + '</div>' +
            '<div><b>ผู้ตรวจ/ผู้บันทึก:</b> ' + e_(data.examiner) + ' (' + e_(data.position || '—') + ') <b>รหัส รพ.สต.:</b> ' + e_(data.hospcode) + '</div>' +
            '<div style="margin-top:4px; padding:4px 8px; background:#fff7ed; border:1px solid #ffedd5; border-radius:4px; color:#c2410c;"><b>หมายเหตุเพิ่มเติม:</b> ' + (data.remarks || 'ไม่มีข้อมูลบันทึกเพิ่มเติม') + '</div>' +
            '</div></div>';

    content.innerHTML = html;
    openPanel('fullview'); 
  } catch (e) {
    console.error(e);
    toast("Error: " + e.message, "err");
  }
};

function openPanel(id) { 
  if(id === 'scr') { 
      _editMode = false; 
      document.getElementById('scrPanelTitle').innerHTML = '📋 แบบตรวจ/ประเมินสายตา — Vision Screening'; 
      document.getElementById('btnSScr').innerHTML = '💾 บันทึก'; 
      document.getElementById('s-cid').removeAttribute('readonly'); 
  } 
  if(id === 'sat') { 
      document.getElementById('sat-type').value = 'นักเรียน'; 
      if (!G.session.loggedIn || G.session.role === 'admin') {
          document.getElementById('sat-hc').value = '';
      }
      onSatTypeChange(); 
  } 
  document.getElementById('ov-'+id).classList.add('open'); 
  document.getElementById('panel-'+id).classList.add('open'); 
}
function closePanel(id) { document.getElementById('ov-'+id).classList.remove('open'); document.getElementById('panel-'+id).classList.remove('open'); }
function openLogin() { document.getElementById('lgErr').textContent = ''; document.getElementById('loginMov').classList.add('open'); document.getElementById('lgUser').focus(); }
function closeLogin() { document.getElementById('loginMov').classList.remove('open'); }
function doLogin() { var u = document.getElementById('lgUser').value.trim(); var p = document.getElementById('lgPass').value.trim(); if (!u || !p) { document.getElementById('lgErr').textContent = 'กรุณากรอกข้อมูล'; return; } var btn = document.getElementById('btnLgn'); btn.disabled = true; btn.innerHTML = '<span class="sp"></span> กำลังตรวจสอบ...'; google.script.run.withSuccessHandler(function(r) { btn.disabled = false; btn.innerHTML = '🔐 เข้าสู่ระบบ'; var d = JSON.parse(r); if (d.ok) { G.session = { loggedIn:true, user:d.data.user, role:d.data.role, hospcode:d.data.hospcode }; closeLogin(); updateAuthUI(); toast('เข้าสู่ระบบสำเร็จ', 'ok'); forceRefresh(); } else { document.getElementById('lgErr').textContent = d.msg; } }).login(u, p); }
function doLogout() { google.script.run.withSuccessHandler(function() { G.session = {loggedIn:false,user:'',role:'',hospcode:''}; updateAuthUI(); loadDashboard({}); toast('ออกจากระบบแล้ว', 'ok'); }).logout(); }
function calcAge() { var bdStr = document.getElementById('s-bd').value; if (!bdStr) return; var parts = bdStr.split('/'); if(parts.length===3) { var y = parseInt(parts[2], 10); if(y > 2400) y -= 543; var dt = new Date(y, parseInt(parts[1])-1, parseInt(parts[0])); document.getElementById('s-age').value = Math.floor((new Date()-dt)/(365.25*24*3600*1000)); } }
function onCidInput(cid) { if (!_editMode && cid.length === 13 && G.allRows.find(function(r){ return r.cid===cid; })) toast('⚠ CID นี้มีในระบบแล้ว (โปรดใช้เมนู ✏️ แก้ไขข้อมูล)','inf'); }
function getRad(name) { var els = document.querySelectorAll('input[name="'+name+'"]'); for (var i=0;i<els.length;i++){ if(els[i].checked) return els[i].value; } return ''; }
function setRad(name, val) { var els = document.querySelectorAll('input[name="'+name+'"]'); for(var i=0;i<els.length;i++){ if(els[i].value===val) els[i].checked=true; } }

function saveScr() {
  var btn = document.getElementById('btnSScr'); var cid = document.getElementById('s-cid').value.trim(); if (!/^\d{13}$/.test(cid)) { toast('เลขบัตรประชาชน 13 หลักไม่ถูกต้อง', 'err'); return; } var hcVal = document.getElementById('s-hc').value; if (!hcVal) { toast('กรุณาเลือก รพ.สต.', 'err'); return; }
  // เพิ่มการบันทึก treatment
  var d = { cid: cid, pname: document.getElementById('s-pname').value, fname: document.getElementById('s-fname').value.trim(), lname: document.getElementById('s-lname').value.trim(), birthday: document.getElementById('s-bd').value, age_years: document.getElementById('s-age').value, sex: document.getElementById('s-sex').value, level_edu: document.getElementById('s-lev').value, room: document.getElementById('s-cls').value, school_name: document.getElementById('s-sch').value, hospcode: hcVal, screen_date: document.getElementById('s-dt').value, examiner: document.getElementById('s-exam').value, position: document.getElementById('s-pos').value, address: document.getElementById('s-addr').value, moo: document.getElementById('s-moo').value, aid: document.getElementById('s-aid').value, unit: document.getElementById('s-unit').value, lat_s: document.getElementById('s-schl-lat').value, lon_s: document.getElementById('s-schl-lon').value, tambon: document.getElementById('s-tambon').value, amphoe: document.getElementById('s-amphoe').value, province: document.getElementById('s-prov').value, remarks: document.getElementById('s-remark').value, hx_glasses: document.getElementById('hx-g').checked, hx_injury: document.getElementById('hx-i').checked, hx_red_eye: document.getElementById('hx-r').checked, hx_headache: document.getElementById('hx-h').checked, hx_amblyopia: document.getElementById('hx-a').checked, hx_family: document.getElementById('hx-f').checked, va_r_naked: document.getElementById('vr-n').value, va_l_naked: document.getElementById('vl-n').value, va_r_glasses: document.getElementById('vr-g').value, va_l_glasses: document.getElementById('vl-g').value, ph_r: document.getElementById('vr-p').value, ph_l: document.getElementById('vl-p').value, va_naked_OU: document.getElementById('vou-naked').value, va_glasses_OU: document.getElementById('vou-glasses').value, cover_test: getRad('ex-cov'), hirschberg: getRad('ex-hir'), color_vision: getRad('ex-col'), stereopsis: getRad('ex-ste'), diagnosis: document.getElementById('s-diag').value, referral: document.getElementById('s-ref').value, treatment: document.getElementById('s-treat').value,
  nationality: document.getElementById('s-nat') ? document.getElementById('s-nat').value : 'ไทย'};
  btn.disabled = true; btn.innerHTML = '<span class="sp"></span> กำลังประมวลผล...';
  
  if (_editMode) { 
      google.script.run.withSuccessHandler(function(r) { 
          btn.disabled = false; btn.innerHTML = '💾 อัปเดตข้อมูล'; 
          var res = JSON.parse(r); 
          if (res.ok) { 
              toast(res.msg, 'ok'); closePanel('scr'); forceRefresh(); 
              
              // --- ส่วนที่เพิ่มเข้ามาเพื่อให้แจ้งเตือน Flow ตอนแก้ไข ---
              activeFlow = { active: true, cid: d.cid, status: res.data.status };
              setTimeout(function() {
                  triggerFlow('beh', 'อัปเดตข้อมูลสำเร็จ! ลำดับต่อไปกรุณาทำ <b>แบบสอบถามพฤติกรรมการใช้หน้าจออิเล็กทรอนิกส์</b>', function() {
                      openPanel('beh');
                      document.getElementById('beh-cid').value = activeFlow.cid;
                      checkBehEligible(activeFlow.cid);
                  });
              }, 600); // ตั้งดีเลย์ 0.6 วินาที เพื่อให้จอกรองสายตาปิดลงให้เรียบร้อยก่อน
              // ---------------------------------------------
              
          } else toast(res.msg, 'err'); 
      }).updateScreeningData(d); 
  } else { 
      google.script.run.withSuccessHandler(function(r) { 
          btn.disabled = false; btn.innerHTML = '💾 บันทึก'; 
          var res = JSON.parse(r); 
          if (res.ok) { 
              toast(res.msg, 'ok'); closePanel('scr'); forceRefresh();
              activeFlow = { active: true, cid: d.cid, status: res.data.status };
              triggerFlow('beh', 'บันทึกสำเร็จ! ลำดับต่อไปกรุณาทำ <b>แบบสอบถามพฤติกรรมการใช้หน้าจออิเล็กทรอนิกส์</b>', function() {
                  openPanel('beh');
                  document.getElementById('beh-cid').value = activeFlow.cid;
                  checkBehEligible(activeFlow.cid);
              });
          } else toast(res.msg, 'err'); 
      }).saveScreeningData(d); 
  }
}

function editRow(cid) {
    toast('กำลังดึงข้อมูล...', 'inf');
    google.script.run.withSuccessHandler(function(r) {
        var res = JSON.parse(r);
        if (res.ok) {
            _editMode = true; var d = res.data; document.getElementById('scrPanelTitle').innerHTML = '✏️ แก้ไขข้อมูลคัดกรองสายตา'; document.getElementById('btnSScr').innerHTML = '💾 อัปเดตข้อมูล';
            document.getElementById('s-cid').value = d.cid; document.getElementById('s-cid').setAttribute('readonly', 'true'); document.getElementById('s-pname').value = d.pname; document.getElementById('s-fname').value = d.fname; document.getElementById('s-lname').value = d.lname; document.getElementById('s-bd').value = d.birthday; document.getElementById('s-age').value = d.age_years; document.getElementById('s-sex').value = d.sex; document.getElementById('s-lev').value = d.level_edu; document.getElementById('s-cls').value = d.room; document.getElementById('s-sch').value = d.school_name; document.getElementById('s-hc').value = d.hospcode; document.getElementById('s-dt').value = d.screen_date; document.getElementById('s-addr').value = d.address; document.getElementById('s-moo').value = d.moo; document.getElementById('s-aid').value = d.aid; document.getElementById('s-tambon').value = d.tambon; document.getElementById('s-amphoe').value = d.amphoe; document.getElementById('s-prov').value = d.province; document.getElementById('s-exam').value = d.examiner; document.getElementById('s-pos').value = d.position || ''; document.getElementById('s-remark').value = d.remarks; document.getElementById('s-unit').value = d.unit || 'F';
            
            // เพิ่มการดึงค่าสิทธิการรักษา
            document.getElementById('s-treat').value = d.treatment || '';
            if(document.getElementById('s-nat')) document.getElementById('s-nat').value = d.nationality || 'ไทย';

            document.getElementById('hx-g').checked = (d.hx_glasses == '1' || d.hx_glasses === 1); document.getElementById('hx-i').checked = (d.hx_injury == '1' || d.hx_injury === 1); document.getElementById('hx-r').checked = (d.hx_red_eye == '1' || d.hx_red_eye === 1); document.getElementById('hx-h').checked = (d.hx_headache == '1' || d.hx_headache === 1); document.getElementById('hx-a').checked = (d.hx_amblyopia == '1' || d.hx_amblyopia === 1); document.getElementById('hx-f').checked = (d.hx_family == '1' || d.hx_family === 1);
            document.getElementById('vr-n').value = d.va_r_naked; document.getElementById('vl-n').value = d.va_l_naked; document.getElementById('vr-g').value = d.va_r_glasses; document.getElementById('vl-g').value = d.va_l_glasses; document.getElementById('vr-p').value = d.ph_r; document.getElementById('vl-p').value = d.ph_l; document.getElementById('vou-naked').value = d.va_naked_OU || ''; document.getElementById('vou-glasses').value = d.va_glasses_OU || '';
            setRad('ex-cov', d.cover_test || 'ปกติ'); setRad('ex-hir', d.hirschberg || 'ปกติ'); setRad('ex-col', d.color_vision || 'ปกติ'); setRad('ex-ste', d.stereopsis || 'ปกติ'); document.getElementById('s-diag').value = d.diagnosis; document.getElementById('s-ref').value = d.referral; fillSchoolCoords(); document.getElementById('ov-scr').classList.add('open'); document.getElementById('panel-scr').classList.add('open');
        } else { toast(res.msg, 'err'); }
    }).getScreeningRecord(cid);
}

function buildSatQ() { var h = ''; SAT_QS.forEach(function(q, i) { var n = i+1; h += '<tr><td>'+n+'. '+q+'</td>'; [5,4,3,2,1].forEach(function(s){ h += '<td><input type="radio" name="sq'+n+'" value="'+s+'"'+(s===5?' checked':'')+'></td>'; }); h += '</tr>'; }); document.getElementById('satQBody').innerHTML = h; }

function onSatTypeChange() {
   var type = document.getElementById('sat-type').value;
   if (type === 'นักเรียน') { 
       document.getElementById('sat-search-sec').style.display = 'block'; 
       document.getElementById('sat-form-sec').style.opacity = '0.5'; 
       document.getElementById('sat-form-sec').style.pointerEvents = 'none'; 
       document.getElementById('sat-q-sec').style.opacity = '0.5'; 
       document.getElementById('sat-q-sec').style.pointerEvents = 'none'; 
       document.getElementById('sat-c-sec').style.opacity = '0.5'; 
       document.getElementById('sat-c-sec').style.pointerEvents = 'none'; 
       document.getElementById('btnSSat').disabled = true; 
       document.getElementById('sat-search-cid').value = ''; 
       document.getElementById('sat-search-name').value = ''; 
       document.getElementById('sat-search-err').textContent = ''; 
   } 
   else { 
       document.getElementById('sat-search-sec').style.display = 'none'; 
       document.getElementById('sat-form-sec').style.opacity = '1'; 
       document.getElementById('sat-form-sec').style.pointerEvents = 'all'; 
       document.getElementById('sat-q-sec').style.opacity = '1'; 
       document.getElementById('sat-q-sec').style.pointerEvents = 'all'; 
       document.getElementById('sat-c-sec').style.opacity = '1'; 
       document.getElementById('sat-c-sec').style.pointerEvents = 'all'; 
       document.getElementById('btnSSat').disabled = false; 
       document.getElementById('sat-search-cid').value = ''; 
       document.getElementById('sat-sch').value = ''; 
       document.getElementById('sat-age').value = ''; 
       document.getElementById('sat-cls').value = ''; 
       if(G.session.loggedIn && G.session.hospcode !== 'all') { 
           document.getElementById('sat-hc').value = G.session.hospcode; 
       }
   }
}

function searchSatUser(val) {
   if(val.length !== 13) { document.getElementById('sat-search-err').textContent = ''; document.getElementById('sat-search-name').value = ''; document.getElementById('sat-age').value = ''; document.getElementById('btnSSat').disabled = true; document.getElementById('sat-form-sec').style.opacity = '0.5'; document.getElementById('sat-form-sec').style.pointerEvents = 'none'; document.getElementById('sat-q-sec').style.opacity = '0.5'; document.getElementById('sat-q-sec').style.pointerEvents = 'none'; document.getElementById('sat-c-sec').style.opacity = '0.5'; document.getElementById('sat-c-sec').style.pointerEvents = 'none'; return; }
   var found = G.allRows.find(function(r) { return r.cid === val; });
   if(found) { 
       document.getElementById('sat-search-name').value = found.student_name; 
       document.getElementById('sat-search-err').innerHTML = '<span style="color:var(--green)">✅ พบข้อมูล สามารถทำแบบประเมินได้</span>'; 
       document.getElementById('sat-sch').value = found.school_name; 
       document.getElementById('sat-hc').value = found.hospcode; 
       document.getElementById('sat-sex').value = found.sex; 
       document.getElementById('sat-cls').value = found.school_class; 
       document.getElementById('sat-age').value = found.age_years || ''; 
       document.getElementById('btnSSat').disabled = false; 
       document.getElementById('sat-form-sec').style.opacity = '1'; 
       document.getElementById('sat-form-sec').style.pointerEvents = 'all'; 
       document.getElementById('sat-q-sec').style.opacity = '1'; 
       document.getElementById('sat-q-sec').style.pointerEvents = 'all'; 
       document.getElementById('sat-c-sec').style.opacity = '1'; 
       document.getElementById('sat-c-sec').style.pointerEvents = 'all'; 
   } 
   else { 
       document.getElementById('sat-search-name').value = ''; 
       document.getElementById('sat-age').value = ''; 
       document.getElementById('sat-search-err').textContent = '❌ ไม่พบข้อมูล กรุณาตรวจสอบเลขบัตร'; 
       document.getElementById('btnSSat').disabled = true; 
       document.getElementById('sat-form-sec').style.opacity = '0.5'; 
       document.getElementById('sat-form-sec').style.pointerEvents = 'none'; 
       document.getElementById('sat-q-sec').style.opacity = '0.5'; 
       document.getElementById('sat-q-sec').style.pointerEvents = 'none'; 
       document.getElementById('sat-c-sec').style.opacity = '0.5'; 
       document.getElementById('sat-c-sec').style.pointerEvents = 'none'; 
   }
}

function saveSat() {
  var btn = document.getElementById('btnSSat'); var hc = document.getElementById('sat-hc').value; if (!hc) { toast('กรุณาระบุรหัส รพ.สต.','err'); return; }
  var d = { eval_type: document.getElementById('sat-type').value, cid: document.getElementById('sat-search-cid').value, hospcode:hc, eval_sex:document.getElementById('sat-sex').value, eval_age:document.getElementById('sat-age').value, eval_class:document.getElementById('sat-cls').value, school_name: document.getElementById('sat-sch').value, comment_s:document.getElementById('sat-str').value, comment_i:document.getElementById('sat-imp').value, recommend:(document.querySelector('input[name="satrec"]:checked')||{}).value||'' };
  for (var i=1;i<=10;i++){ var el=document.querySelector('input[name="sq'+i+'"]:checked'); d['q'+i] = el?el.value:5; }
  btn.disabled=true; btn.innerHTML='<span class="sp"></span> บันทึก...';
  google.script.run.withSuccessHandler(function(r){ btn.disabled=false; btn.innerHTML='💾 บันทึกแบบประเมิน'; var res=JSON.parse(r); if(res.ok){toast(res.msg,'ok');closePanel('sat');forceRefresh();}else toast(res.msg,'err'); }).saveSatisfactionData(d);
}

function buildTestQ(type) { var h = ''; var choices = ['ก','ข','ค','ง']; QS.forEach(function(q, i) { var n = i+1; h += '<div class="q-block"><div class="q-num">ข้อ '+n+'. '+q.q+'</div><div class="q-choices">'; q.c.forEach(function(c, ci) { h += '<label><input type="radio" name="'+type+'q'+n+'" value="'+choices[ci]+'"> '+c+'</label>'; }); h += '</div></div>'; }); document.getElementById(type+'QBody').innerHTML = h; }

function checkEligible(type, cid) {
  if (cid.length !== 13) { document.getElementById(type+'-err').textContent = ''; document.getElementById(type+'-q-sec').style.opacity='0.5'; document.getElementById(type+'-q-sec').style.pointerEvents='none'; document.getElementById('btnS'+type.charAt(0).toUpperCase()+type.slice(1)).disabled=true; return; }
  document.getElementById(type+'-err').textContent = '⏳ กำลังตรวจสอบสิทธิ์...';
  google.script.run.withSuccessHandler(function(r){
    var res = JSON.parse(r);
    if(res.ok && res.data.eligible) { document.getElementById(type+'-name').value=res.data.student_name; document.getElementById(type+'-err').style.color='var(--green)'; document.getElementById(type+'-err').textContent='✅ มีสิทธิ์ทำแบบทดสอบ'; document.getElementById(type+'-q-sec').style.opacity='1'; document.getElementById(type+'-q-sec').style.pointerEvents='all'; document.getElementById('btnS'+type.charAt(0).toUpperCase()+type.slice(1)).disabled=false; } 
    else { document.getElementById(type+'-name').value=''; document.getElementById(type+'-err').style.color='var(--red)'; document.getElementById(type+'-err').textContent='❌ ไม่มีสิทธิ์: ต้องเป็นผู้มีผลตรวจสายตาผิดปกติ/ส่งต่อ/ตัดแว่น'; document.getElementById(type+'-q-sec').style.opacity='0.5'; document.getElementById(type+'-q-sec').style.pointerEvents='none'; document.getElementById('btnS'+type.charAt(0).toUpperCase()+type.slice(1)).disabled=true; }
  }).checkTestEligibility(cid);
}

function getTestAns(type) { var ans={}; for(var i=1;i<=10;i++){ var el=document.querySelector('input[name="'+type+'q'+i+'"]:checked'); ans['q'+i]=el?el.value:''; } return ans; }

function savePre() { var btn=document.getElementById('btnSPre'); var cid=document.getElementById('pre-cid').value.trim(); if(!/^\d{13}$/.test(cid)){toast('เลขบัตรประชาชน 13 หลักไม่ถูกต้อง','err');return;} var d=Object.assign({cid:cid},getTestAns('pre')); btn.disabled=true; btn.innerHTML='<span class="sp"></span> บันทึก...'; google.script.run.withSuccessHandler(function(r){ btn.disabled=false; btn.innerHTML='💾 บันทึก Pre-test'; var res=JSON.parse(r); if(res.ok){ document.getElementById('preSN').textContent=res.data.total; document.getElementById('preSC').style.display='block'; toast(res.msg,'ok'); 
setTimeout(function(){ 
    closePanel('pre'); forceRefresh(); 
    // 💡 แจ้งเตือน Flow ให้ไป Post-Test
    if(activeFlow.active && activeFlow.cid === cid) {
        triggerFlow('post', 'บันทึกสำเร็จ! ลำดับต่อไปกรุณาทำ <b>แบบทดสอบหลังอบรม (Post-Test)</b>', function() { openPanel('post'); document.getElementById('post-cid').value=activeFlow.cid; checkEligible('post', activeFlow.cid); });
    }
}, 2200); }else toast(res.msg,'err'); }).savePreTest(d); }

// นำไปแทนที่ savePost เดิม
function savePost() { var btn=document.getElementById('btnSPost'); var cid=document.getElementById('post-cid').value.trim(); if(!/^\d{13}$/.test(cid)){toast('เลขบัตรประชาชน 13 หลักไม่ถูกต้อง','err');return;} var d=Object.assign({cid:cid},getTestAns('post')); btn.disabled=true; btn.innerHTML='<span class="sp"></span> บันทึก...'; google.script.run.withSuccessHandler(function(r){ btn.disabled=false; btn.innerHTML='💾 บันทึก Post-test'; var res=JSON.parse(r); if(res.ok){ document.getElementById('postSN').textContent=res.data.total; document.getElementById('postSC').style.display='block'; toast(res.msg,'ok'); 
setTimeout(function(){ 
    closePanel('post'); forceRefresh(); 
    // 💡 แจ้งเตือนข้ามติดตามผล ไปยังแบบประเมินความพึงพอใจ
    if(activeFlow.active && activeFlow.cid === cid) {
        triggerFlow('sat', 'บันทึกสำเร็จ! หลังจากอบรมและรับแว่นไปแล้ว จะมีเจ้าหน้าที่แจ้งให้ทำแบบประเมินผลของการติดตามการใช้แว่นตา (ซึ่งเมนูติดตามผลยังไม่ต้องทำตอนนี้)<br><br>ลำดับต่อไปให้ไปทำ <b>แบบประเมินความพึงพอใจ</b> เพื่อจบขั้นตอนในวันนี้', function() { openPanel('sat'); searchSatUser(activeFlow.cid); document.getElementById('sat-search-cid').value = activeFlow.cid; });
    }
}, 2200); }else toast(res.msg,'err'); }).savePostTest(d); }

function openDel(cid) { G.delTarget={cid:cid,sheet:'Screening_Data'}; document.getElementById('delCidShow').textContent=cid; document.getElementById('delErr').textContent=''; document.getElementById('delMov').classList.add('open'); }
function closeDel(){ document.getElementById('delMov').classList.remove('open'); }
function confirmDel(){ google.script.run.withSuccessHandler(function(r){ var res=JSON.parse(r); if(res.ok){toast(res.msg,'ok');closeDel();forceRefresh();}else document.getElementById('delErr').textContent=res.msg; }).deleteRecord(G.delTarget.sheet,G.delTarget.cid); }
function doExportCSV() {
  if (!G.dispRows.length) { toast('ไม่มีข้อมูลให้ส่งออก','err'); return; }
  var hdr = '#,เลขบัตร,ชื่อ-สกุล,ชั้น,โรงเรียน,รหัสโรงเรียน,รพ.สต.,ชื่อ รพ.สต.,อำเภอ,สิทธิรักษา,VA ขวา,VA ซ้าย,วินิจฉัย,การส่งต่อ,สถานะ,ระดับเสี่ยงหน้าจอ,การใส่แว่นตา,วันตรวจ,Pre,Post,Gain%';
  var rows = G.dispRows.map(function(r,i){ 
      return [i+1,'"=""'+r.cid+'"""','"'+r.student_name+'"',r.school_class,'"'+r.school_name+'"',r.school_code,r.hospcode,'"'+r.hosp_name+'"',r.amphoe,'"'+r.treatment+'"',r.va_r,r.va_l,'"'+r.diagnosis+'"','"'+r.referral+'"',SL[r.status]||r.status,r.beh_risk||'-',r.fup_status||'-',r.screen_date,r.pre||'',r.post||'',r.gain||''].join(','); 
  });
  var csv = '\uFEFF' + hdr + '\n' + rows.join('\n'); var blob = new Blob([csv],{type:'text/csv;charset=utf-8'}); var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'eyehealth_'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); toast('Export CSV สำเร็จ','ok');
}

function openPrintModal() { var chks = document.querySelectorAll('.row-chk:checked'); if(chks.length === 0) { toast('กรุณาติ๊กเลือกข้อมูลในตารางอย่างน้อย 1 รายการ', 'err'); return; } document.getElementById('printMov').classList.add('open'); }
function closePrintModal() { document.getElementById('printMov').classList.remove('open'); }

function doPrintDocs(format) {
  var chks = document.querySelectorAll('.row-chk:checked'); 
  if(chks.length === 0) { toast('กรุณาเลือกข้อมูลอย่างน้อย 1 รายการ', 'err'); return; }
  var cids = []; for(var i=0; i<chks.length; i++) cids.push(chks[i].value); 
  var docType = document.getElementById('printDocType').value; 
  toast('กำลังดึงข้อมูลเอกสาร...', 'inf');
  
  google.script.run.withSuccessHandler(function(r) {
    var res = JSON.parse(r);
    if(res.ok) {
      var fullHtml = '';
      cids.forEach(function(cid, idx) {
        var d = res.data.rows[cid]; 
        if(!d) return; 
        var pageHtml = '';
        if(docType === 'scr' && d.scr) pageHtml = buildScreeningTemplate(d); 
        else if(docType === 'sat' && d.sat) pageHtml = buildSatTemplate(d); 
        else if(docType === 'pre' && d.pre) pageHtml = buildTestTemplate('แบบทดสอบความรู้ก่อนการอบรม (Pre-Test)', d, 'pre'); 
        else if(docType === 'post' && d.post) pageHtml = buildTestTemplate('แบบทดสอบความรู้หลังการอบรม (Post-Test)', d, 'post');
        else if(docType === 'beh' && d.beh) pageHtml = buildBehaviorTemplate(d);
        else if(docType === 'fup' && d.fup) pageHtml = buildFollowupTemplate(d);

        if(pageHtml && idx < cids.length - 1) pageHtml += '<div class="pb-always"></div>'; 
        fullHtml += pageHtml;
      });
      if (fullHtml === '') { toast('ไม่พบข้อมูลที่สามารถพิมพ์ได้ในประเภทนี้', 'err'); closePrintModal(); return; }
      
      if(format === 'word') { 
        exportWord(fullHtml, 'Form_'+docType+'_'+Date.now()+'.doc'); 
        closePrintModal(); 
      } else { 
        var printArea = document.getElementById('printArea'); 
        printArea.innerHTML = fullHtml; 
        setTimeout(function(){ window.print(); printArea.innerHTML = ''; }, 500);
        closePrintModal(); 
      }
    } else { toast(res.msg, 'err'); }
  }).getPrintData(cids);
}

function buildFollowupTemplate(d) {
  var sInfo = d.scr || {}; var f = d.fup || {};
  function chk(val, target) { return val === target ? '☑' : '☐'; }
  
  var html = '<div style="font-family:\'Sarabun\',\'TH Sarabun PSK\',sans-serif; font-size:16pt; color:#000; line-height:1.3; ">';
  html += getPrintLogo();
  html += '<div style="text-align:center; font-weight:bold; font-size:20pt;">โครงการเด็กไทยสายตาดี องค์การบริหารส่วนจังหวัดสมุทรสาคร</div>';
  html += '<div style="text-align:center; font-weight:bold; font-size:18pt; margin-bottom:15px;">แบบติดตามผลการใช้แว่นตา (สำหรับนักเรียน / ผู้ปกครองตอบ)</div>';
  
  html += '<div style="font-weight:bold; background:#f0f0f0; padding:4px;">ส่วนที่ 1 : ข้อมูลทั่วไป</div>';
  // --- เปลี่ยนเป็นเส้นประ ---
  html += '<div style="line-height:1.9; padding:6px 10px;">';
  html += 'ชื่อ-สกุล <span style="border-bottom:1px dotted #000; display:inline-block; min-width:300px; padding:0 4px;">'+(sInfo.student_name||'')+'</span> ';
  html += 'อายุ <span style="border-bottom:1px dotted #000; display:inline-block; min-width:50px; padding:0 4px; text-align:center;">'+(sInfo.age_years||'')+'</span> ปี<br>';
  html += 'โรงเรียน <span style="border-bottom:1px dotted #000; display:inline-block; min-width:300px; padding:0 4px;">'+(sInfo.school_name||'')+'</span> ';
  html += 'ชั้น <span style="border-bottom:1px dotted #000; display:inline-block; min-width:80px; padding:0 4px; text-align:center;">'+(sInfo.school_class||'')+'</span> ';
  html += 'โทรศัพท์ <span style="border-bottom:1px dotted #000; display:inline-block; min-width:120px; padding:0 4px; text-align:center;">'+(f.tel||'')+'</span><br>';
  html += 'ระยะเวลาที่ได้รับแว่น : <span style="margin-left:10px;">'+chk(f.duration,'น้อยกว่า 1 เดือน')+' น้อยกว่า 1 เดือน</span><span style="margin-left:20px;">'+chk(f.duration,'2 เดือน')+' 2 เดือน</span><span style="margin-left:20px;">'+chk(f.duration,'มากกว่า 3 เดือน')+' มากกว่า 3 เดือน</span>';
  html += '</div>';
  
  html += '<div style="font-weight:bold; background:#f0f0f0; padding:4px; margin-top:5px;">ส่วนที่ 2 : ความถี่และพฤติกรรมการใช้แว่นตา</div>';
  html += '<table style="width:100%; border-collapse:collapse; margin-top:5px; text-align:center;">';
  html += '<tr><th style="border:1px solid #000; padding:5px; background:#ddd; text-align:left;">ข้อคำถาม</th><th style="border:1px solid #000; width:70px; background:#ddd;">ทุกครั้ง</th><th style="border:1px solid #000; width:70px; background:#ddd;">บ่อยครั้ง</th><th style="border:1px solid #000; width:70px; background:#ddd;">บางครั้ง</th><th style="border:1px solid #000; width:70px; background:#ddd;">ไม่เคย</th></tr>';
  var fqRows = [['1. ขณะดูกระดานในห้องเรียน', f.f_board],['2. ขณะอ่านหนังสือหรือทำการบ้าน', f.f_book],['3. ขณะดูโทรทัศน์ หรือหน้าจอ', f.f_screen],['4. ขณะเล่นกีฬาหรือทำกิจกรรม', f.f_sport]];
  fqRows.forEach(function(row) {
    html += '<tr><td style="border:1px solid #000; padding:4px 8px; text-align:left;">'+row[0]+'</td>';
    ['ทุกครั้ง','บ่อยครั้ง','บางครั้ง','ไม่เคยเลย'].forEach(function(opt){ html += '<td style="border:1px solid #000; font-size:18pt;">'+chk(row[1], opt)+'</td>'; });
    html += '</tr>';
  });
  html += '</table>';
  html += '<div style="margin-top:5px; padding-left:5px;"><b>5. โดยรวมแล้ว ใน 1 สัปดาห์ คุณใส่แว่นกี่วัน?</b> '+chk(f.f_days,'6-7 วัน')+' 6-7 วัน  '+chk(f.f_days,'3-5 วัน')+' 3-5 วัน  '+chk(f.f_days,'1-2 วัน')+' 1-2 วัน  '+chk(f.f_days,'ไม่ได้ใส่เลย')+' ไม่ได้ใส่เลย</div>';
  
  html += '<div style="font-weight:bold; background:#f0f0f0; padding:4px; margin-top:10px;">ส่วนที่ 3 : คุณภาพและสภาพของแว่นตา</div>';
  html += '<div style="padding-left:10px;"><b>1. สภาพแว่นตาในปัจจุบัน</b><br>'+chk(f.c_status,'ดีมาก เหมือนใหม่')+' ดีมาก เหมือนใหม่   '+chk(f.c_status,'ดี แต่มีรอยขีดข่วนเล็กน้อยที่เลนส์')+' ดี แต่มีรอยขีดข่วนเล็กน้อยที่เลนส์<br>'+chk(f.c_status,'พอใช้ แว่นบิด/หย่อน/สกรูหลวม')+' พอใช้ แว่นบิด/หย่อน/สกรูหลวม   '+chk(f.c_status,'เสียหาย (ขาหัก/เลนส์แตก) รอการซ่อมแซม')+' เสียหาย (รอการซ่อมแซม)<br><b>2. ความชัดเจนของเลนส์</b><br>'+chk(f.c_clarity,'ชัดเจนดีเหมือนเดิม')+' ชัดเจนดีเหมือนเดิม   '+chk(f.c_clarity,'ชัดเจนน้อยลง มีรอยขีดข่วนรบกวนการมอง')+' ชัดเจนน้อยลง มีรอยขีดข่วน   '+chk(f.c_clarity,'มองไม่ชัดเหมือนช่วงแรกที่ได้แว่น')+' มองไม่ชัดเหมือนช่วงแรกที่ได้แว่น</div>';
  
  html += '<div style="font-weight:bold; background:#f0f0f0; padding:4px; margin-top:10px;">ส่วนที่ 4 : คุณภาพชีวิตและประสิทธิภาพด้านสายตา</div>';
  html += '<table style="width:100%; border-collapse:collapse; margin-top:5px; text-align:center;"><tr><th style="border:1px solid #000; padding:5px; background:#ddd; text-align:left;">ข้อคำถาม</th><th style="border:1px solid #000; width:70px; background:#ddd;">ดีขึ้นมาก</th><th style="border:1px solid #000; width:70px; background:#ddd;">ดีขึ้น</th><th style="border:1px solid #000; width:70px; background:#ddd;">เหมือนเดิม</th><th style="border:1px solid #000; width:70px; background:#ddd;">แย่ลง</th></tr>';
  var qolRows = [['1. ความสามารถมองเห็นตัวอักษรบนกระดาน', f.q_board],['2. สมาธิในการเรียนในห้องเรียน', f.q_focus],['3. ความมั่นใจในการทำกิจกรรมกับเพื่อนๆ', f.q_confidence]];
  qolRows.forEach(function(row) {
    html += '<tr><td style="border:1px solid #000; padding:4px 8px; text-align:left;">'+row[0]+'</td>';
    ['ดีขึ้นมาก','ดีขึ้น','เหมือนเดิม','แย่ลง'].forEach(function(opt){ html += '<td style="border:1px solid #000; font-size:18pt;">'+chk(row[1],opt)+'</td>'; });
    html += '</tr>';
  });
  html += '<tr><td style="border:1px solid #000; padding:4px 8px; text-align:left; background:#eee;"><b>4. ความถี่ของการปวดหัว หรือปวดเมื่อยตา</b></td><td style="border:1px solid #000; font-size:18pt; background:#eee;">'+chk(f.q_headache,'ลดลงมาก')+'<br><span style="font-size:10pt;">ลดลงมาก</span></td><td style="border:1px solid #000; font-size:18pt; background:#eee;">'+chk(f.q_headache,'ลดลง')+'<br><span style="font-size:10pt;">ลดลง</span></td><td style="border:1px solid #000; font-size:18pt; background:#eee;">'+chk(f.q_headache,'เท่าเดิม')+'<br><span style="font-size:10pt;">เท่าเดิม</span></td><td style="border:1px solid #000; font-size:18pt; background:#eee;">'+chk(f.q_headache,'เพิ่มขึ้น')+'<br><span style="font-size:10pt;">เพิ่มขึ้น</span></td></tr></table>';
  
  html += '<div style="font-weight:bold; background:#f0f0f0; padding:4px; margin-top:10px;">ส่วนที่ 5 : ปัจจัยเสริมและความพึงพอใจ</div>';
  var reasons = String(f.reasons||'').split(',').map(function(s){return s.trim();});
  function rChk(t) { return reasons.indexOf(t) > -1 ? '☑' : '☐'; }
  html += '<div style="padding-left:10px;"><b>1. สาเหตุที่เด็กไม่ใส่แว่นเป็นประจำ:</b><br>'+rChk('ใส่แล้วไม่ชัดเจน/ปวดหัว')+' ใส่แล้วไม่ชัด/ปวดหัว   '+rChk('ลืมใส่')+' ลืมใส่   '+rChk('อายเพื่อน / กลัวถูกแซว')+' อายเพื่อน / กลัวถูกแซว<br>'+rChk('แว่นไม่พอดีกับใบหน้า (คับ/หลวม/กดหู)')+' แว่นไม่พอดีกับใบหน้า   '+rChk('ประกอบกิจกรรม (เล่น/นอน) ไม่สะดวก')+' ประกอบกิจกรรมไม่สะดวก   '+rChk('อื่นๆ')+' อื่นๆ<br><b>2. ความพึงพอใจโดยรวม:</b><br>'+chk(f.overall_sat,'มากที่สุด')+' มากที่สุด   '+chk(f.overall_sat,'มาก')+' มาก   '+chk(f.overall_sat,'ปานกลาง')+' ปานกลาง   '+chk(f.overall_sat,'น้อย')+' น้อย   '+chk(f.overall_sat,'น้อยที่สุด')+' น้อยที่สุด</div>';
  html += '</div>';
  return html;
}

// ===== Update Print Modal options =====
// แทนที่ <select id="printDocType"> ใน HTML ด้วยตัวเลือกใหม่ที่มี "ติดตามผล"

function buildBehaviorTemplate(d) {
    var sInfo = d.scr || {}; var beh = d.beh || {};
    function chk(val, target) { 
        if (!val) return '☐';
        var arr = String(val).split(',').map(function(s){return s.trim();});
        return arr.indexOf(target) > -1 ? '☑' : '☐'; 
    }
    function chkS(val, target) { return val === target ? '☑' : '☐'; }
    function chkTime(val, target, altTarget) { 
        return (val === target || val === altTarget) ? '☑' : '☐'; 
    }
    function chkCls(cls, target) {
        if (!cls) return '☐';
        return String(cls).indexOf(target) > -1 ? '☑' : '☐';
    }
    
    var html = '<div style="font-family:\'Sarabun\',\'TH Sarabun PSK\',sans-serif; font-size:14pt; color:#000; line-height:1.4;">';
    html += getPrintLogo();
    html += '<div class="print-title">โครงการเด็กไทยสายตาดีองค์การบริหารส่วนจังหวัดสมุทรสาคร</div>';
    html += '<div class="print-subtitle">แบบสอบถามพฤติกรรมการใช้หน้าจออิเล็กทรอนิกส์และอาการทางสายตา</div>';
    html += '<div class="print-desc">(โทรศัพท์มือถือ, แท็บเล็ต, คอมพิวเตอร์) สำหรับนักเรียนชั้นประถมศึกษาปีที่ 1 - 6</div>';
    
    // ส่วนที่ 1
    html += '<div class="print-section-h">ส่วนที่ 1 : ข้อมูลทั่วไป</div>';
    html += '<div style="line-height:1.9; padding:4px 0;">';
    html += 'ชื่อ-สกุล (ด.ช./ด.ญ.) <span style="border-bottom:1px dotted #000; display:inline-block; min-width:270px; padding:0 4px;">'+(sInfo.student_name||'')+'</span> ';
    html += 'อายุ <span style="border-bottom:1px dotted #000; display:inline-block; min-width:35px; padding:0 4px; text-align:center;">'+(sInfo.age_years||'')+'</span> ปี ';
    html += 'ชั้น/ห้อง <span style="border-bottom:1px dotted #000; display:inline-block; min-width:55px; padding:0 4px;">'+(sInfo.school_class||'')+'</span><br>';
    html += 'โรงเรียน <span style="border-bottom:1px dotted #000; display:inline-block; min-width:280px; padding:0 4px;">'+(sInfo.school_name||'')+'</span> ';
    html += 'ตำบล <span style="border-bottom:1px dotted #000; display:inline-block; min-width:110px; padding:0 4px;">'+(sInfo.tambon||'')+'</span> ';
    html += 'อำเภอ <span style="border-bottom:1px dotted #000; display:inline-block; min-width:110px; padding:0 4px;">'+(sInfo.amphoe||'')+'</span> จังหวัดสมุทรสาคร<br>';
    html += 'ชั้นเรียน : ';
    ['ป.1','ป.2','ป.3','ป.4','ป.5','ป.6'].forEach(function(c){
        html += '<span style="margin-right:13px;"><span class="p-chk">'+chkCls(sInfo.school_class||sInfo.level_edu, c)+'</span> '+c+'</span>';
    });
    html += '</div>';
    
    // ส่วนที่ 2
    html += '<div class="print-section-h">ส่วนที่ 2 พฤติกรรมการใช้หน้าจออิเล็กทรอนิกส์</div>';
    
    // 2.1
    html += '<div style="margin-top:4px; padding:0 5px;"><b>2.1 ประเภทของอุปกรณ์ที่ใช้</b> (เลือกได้มากกว่า 1 ข้อ)<br>';
    html += '<div style="padding-left:15px; line-height:1.8;">';
    ['โทรศัพท์มือถือ','แท็บเล็ต','คอมพิวเตอร์','โทรทัศน์','เครื่องเล่นเกม'].forEach(function(opt){
        html += '<span style="margin-right:15px;"><span class="p-chk">'+chk(beh.q_device, opt)+'</span> '+opt+'</span>';
    });
    html += '</div></div>';
    
    // 2.2
    html += '<div style="margin-top:5px; padding:0 5px;"><b>2.2 ใช้หน้าจออิเล็กทรอนิกส์เพื่อทำอะไร</b> (เลือกได้มากกว่า 1 ข้อ)';
    html += '<table style="width:100%; margin-top:2px; border:none; padding-left:15px;">';
    html += '<tr><td style="border:none; padding:2px 25px;"><span class="p-chk">'+chk(beh.q_purpose,'เรียนออนไลน์ / ทำการบ้าน')+'</span> เรียนออนไลน์ / ทำการบ้าน</td>';
    html += '<td style="border:none; padding:2px;"><span class="p-chk">'+chk(beh.q_purpose,'ดูการ์ตูน / คลิปวิดีโอ')+'</span> ดูการ์ตูน / คลิปวิดีโอ</td></tr>';
    html += '<tr><td style="border:none; padding:2px 25px;"><span class="p-chk">'+chk(beh.q_purpose,'เล่นเกมส์')+'</span> เล่นเกมส์</td>';
    html += '<td style="border:none; padding:2px;"><span class="p-chk">'+chk(beh.q_purpose,'ฟังเพลง')+'</span> ฟังเพลง</td></tr>';
    html += '<tr><td style="border:none; padding:2px 25px;"><span class="p-chk">'+chk(beh.q_purpose,'คุยกับเพื่อน /ใช้โซเชียล')+'</span> คุยกับเพื่อน /ใช้โซเชียล (LINE, Facebook, TikTok ฯลฯ)</td>';
    html += '<td style="border:none; padding:2px;"><span class="p-chk">'+chk(beh.q_purpose,'อื่นๆ')+'</span> อื่นๆ ........................</td></tr>';
    html += '</table></div>';
    
    // 2.3 ตาราง — แต่ละช่องมี 6 ตัวเลือก
    html += '<div style="margin-top:8px; padding:0 5px;"><b>2.3 ระยะเวลาการใช้หน้าจออิเล็กทรอนิกส์ในแต่ละช่วงเวลา</b> (เลือกช่วงเวลาที่ใกล้เคียงกับการใช้งานจริง)</div>';
    
    function timeCell(val) {
        var opts = [
            ['ไม่ถึง 1 ชม.','ไม่ถึง 1 ชม.'],
            ['1-2 ชม.','1-2 ชม.'],
            ['2-3 ชม.','2-3 ชม.'],
            ['3 – 4 ชม.','3-4 ชม.'],
            ['มากกว่า 4 ชม.','มากกว่า 4 ชม.'],
            ['ไม่ใช้','ไม่ใช้']
        ];
        var out = '<div style="font-size:11.5pt; line-height:1.6;">';
        for (var i = 0; i < opts.length; i++) {
            out += '<span class="p-chk" style="font-size:11pt;">'+chkTime(val, opts[i][0], opts[i][1])+'</span> '+opts[i][0];
            out += (i % 3 === 2) ? '<br>' : ' &nbsp; ';
        }
        out += '</div>';
        return out;
    }
    
    html += '<table style="width:100%; border-collapse:collapse; margin-top:3px;">';
    html += '<thead><tr><th style="border:1px solid #000; padding:5px; width:130px; background:#fff; font-size:12pt;">ช่วงเวลา</th>';
    html += '<th style="border:1px solid #000; padding:5px; font-size:12pt;">วันธรรมดา (จ.-ศ.)</th>';
    html += '<th style="border:1px solid #000; padding:5px; font-size:12pt;">วันหยุด/ปิดเทอม</th></tr></thead><tbody>';
    
    html += '<tr><td style="border:1px solid #000; padding:5px; text-align:center; font-size:12pt;">ตอนเช้า<br>(ก่อนไปโรงเรียน)</td>';
    html += '<td style="border:1px solid #000; padding:5px;">'+timeCell(beh.q_time_wk_morn)+'</td>';
    html += '<td style="border:1px solid #000; padding:5px;">'+timeCell(beh.q_time_we_morn)+'</td></tr>';
    
    html += '<tr><td style="border:1px solid #000; padding:5px; text-align:center; font-size:12pt;">ตอนกลางวัน/<br>หลังเลิกเรียน</td>';
    html += '<td style="border:1px solid #000; padding:5px;">'+timeCell(beh.q_time_wk_noon)+'</td>';
    html += '<td style="border:1px solid #000; padding:5px;">'+timeCell(beh.q_time_we_noon)+'</td></tr>';
    
    html += '<tr><td style="border:1px solid #000; padding:5px; text-align:center; font-size:12pt;">ตอนเย็น/<br>ก่อนนอน</td>';
    html += '<td style="border:1px solid #000; padding:5px;">'+timeCell(beh.q_time_wk_eve)+'</td>';
    html += '<td style="border:1px solid #000; padding:5px;">'+timeCell(beh.q_time_we_eve)+'</td></tr>';
    html += '</tbody></table>';
    
    // 2.4
    html += '<div style="margin-top:6px; padding:0 5px;"><b>2.4 ระยะห่างระหว่างตากับหน้าจออิเล็กทรอนิกส์โดยประมาณ</b>';
    html += '<div style="padding-left:15px; margin-top:2px; line-height:1.8;">';
    html += '<span style="margin-right:25px;"><span class="p-chk">'+chkS(beh.q_dist,'ใกล้กว่า 1 ฟุต')+'</span> ใกล้กว่า 1 ฟุต (น้อยกว่า 30 ซม.)</span>';
    html += '<span style="margin-right:25px;"><span class="p-chk">'+chkS(beh.q_dist,'ประมาณ 1 ฟุต')+'</span> ประมาณ 1 ฟุต</span>';
    html += '<span><span class="p-chk">'+chkS(beh.q_dist,'มากกว่า 1 ฟุต')+'</span> มากกว่า 1 ฟุต</span>';
    html += '</div></div>';
    
    // 2.5
    html += '<div style="margin-top:4px; padding:0 5px;"><b>2.5 การพักสายตา</b>';
    html += '<div style="padding-left:15px; margin-top:2px; line-height:1.8;">';
    html += '<span style="margin-right:25px;"><span class="p-chk">'+chkS(beh.q_rest,'พักทุก 20 นาที')+'</span> พักทุก 20 นาที</span>';
    html += '<span style="margin-right:25px;"><span class="p-chk">'+chkS(beh.q_rest,'พักบ้างบางครั้ง')+'</span> พักบ้างบางครั้ง</span>';
    html += '<span><span class="p-chk">'+chkS(beh.q_rest,'ไม่ค่อยพัก')+'</span> ไม่ค่อยพัก</span>';
    html += '</div></div>';
    
    // 2.6
    html += '<div style="margin-top:4px; padding:0 5px;"><b>2.6 มีการใช้แว่นกรองแสงสีฟ้า ขณะใช้หน้าจออิเล็กทรอนิกส์ด้วยหรือไม่</b>';
    html += '<div style="padding-left:15px; margin-top:2px; line-height:1.8;">';
    html += '<span style="margin-right:25px;"><span class="p-chk">'+chkS(beh.q_blue,'มีการใช้')+'</span> มีการใช้แว่นกรองแสงสีฟ้า</span>';
    html += '<span><span class="p-chk">'+chkS(beh.q_blue,'ไม่มีการใช้')+'</span> ไม่มีการใช้แว่นกรองแสงสีฟ้า</span>';
    html += '</div></div>';
    
    // ส่วนที่ 3
    html += '<div class="print-section-h" style="margin-top:8px;">ส่วนที่ 3 อาการทางสายตาที่พบ (เลือกได้มากกว่า 1 ข้อ)</div>';
    html += '<div style="padding:5px 15px; line-height:1.8;">';
    ['แสบตา','ตาพร่ามัว','ปวดหัว','น้ำตาไหล','ตาแดง','มองไกลไม่ชัด','ไม่มีอาการ'].forEach(function(opt){
        html += '<span style="margin-right:15px;"><span class="p-chk">'+chk(beh.q_symptom, opt)+'</span> '+opt+'</span>';
    });
    html += '</div>';
    
    // ส่วนที่ 4
    html += '<div class="print-section-h">ส่วนที่ 4 ความคิดเห็นเพิ่มเติม (ถ้ามี)</div>';
    if (beh.comment && String(beh.comment).trim()) {
        html += '<div style="padding:8px 10px; min-height:50px;">'+e_(beh.comment)+'</div>';
    } else {
        html += '<div style="padding:8px 10px; line-height:2.2;">';
        html += '..........................................................................................................................................................<br>';
        html += '..........................................................................................................................................................';
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

// จุดแก้ไข 4: ฟังก์ชันพิมพ์รายบุคคลจาก Dashboard พฤติกรรม
function printSingleBeh(cid) {
    toast('กำลังเตรียมข้อมูลพิมพ์...', 'inf');
    google.script.run.withSuccessHandler(function(r) {
        var res = JSON.parse(r);
        if(res.ok) {
            var d = res.data.rows[cid];
            if(!d || !d.beh) { toast('ไม่พบข้อมูลพฤติกรรมของบุคคลนี้', 'err'); return; }
            var html = buildBehaviorTemplate(d);
            var printArea = document.getElementById('printArea'); 
            printArea.innerHTML = html; 
            setTimeout(function(){ window.print(); printArea.innerHTML = ''; }, 500);
        }
    }).getPrintData([cid]);
}

function exportWord(htmlContent, filename) { var preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Document</title><style>body { font-family: 'TH Sarabun PSK', 'Sarabun', sans-serif; } .pb-always { page-break-after: always; mso-special-character: line-break; }</style></head><body>"; var postHtml = "</body></html>"; var fixedHtml = htmlContent.replace(/<div class="pb-always"[^>]*><\/div>/g, "<br clear=all style='mso-special-character:line-break;page-break-before:always'>"); var html = preHtml + fixedHtml + postHtml; var blob = new Blob(['\ufeff', html], { type: 'application/msword' }); var url = URL.createObjectURL(blob); var downloadLink = document.createElement("a"); downloadLink.href = url; downloadLink.download = filename; document.body.appendChild(downloadLink); downloadLink.click(); document.body.removeChild(downloadLink); }

function getPrintLogo() {
    return G.settings.logo_id ? 
        '<div class="print-logo-wrap"><img src="https://drive.google.com/thumbnail?id='+G.settings.logo_id+'&sz=w200"></div>' : '';
}

function buildScreeningTemplate(d) {
    var sInfo = d.scr || {}; 
    var html = '<div style="font-family:\'Sarabun\', \'TH Sarabun PSK\', sans-serif; font-size:16pt; color:#000; line-height:1.2;">';
    html += getPrintLogo();
    html += '<div style="text-align:center; font-weight:bold; font-size:20pt; margin-bottom:15px;">โครงการเด็กไทยสายตาดีองค์การบริหารส่วนจังหวัดสมุทรสาคร<br>แบบตรวจ/ประเมินสายตา (Vision Screening Form)</div>';
    
    html += '<div style="font-weight:bold; font-size:16pt; background:#f0f0f0; padding:4px;">ส่วนที่ 1 : ข้อมูลผู้รับการตรวจ</div>';
    // --- เปลี่ยนเป็นเส้นประ ---
    html += '<div style="line-height:1.9; padding:6px 10px;">';
    html += 'ชื่อ-สกุล <span style="border-bottom:1px dotted #000; display:inline-block; min-width:300px; padding:0 4px;">'+(sInfo.student_name||'')+'</span> ';
    html += 'วัน/เดือน/ปีเกิด <span style="border-bottom:1px dotted #000; display:inline-block; min-width:120px; padding:0 4px; text-align:center;">'+toThaiDate(sInfo.birthday)+'</span> ';
    html += 'อายุ <span style="border-bottom:1px dotted #000; display:inline-block; min-width:40px; padding:0 4px; text-align:center;">'+(sInfo.age_years||'')+'</span> ปี<br>';
    html += 'เลขบัตรประชาชน <span style="border-bottom:1px dotted #000; display:inline-block; min-width:180px; padding:0 4px; text-align:center;">'+(sInfo.cid||'')+'</span> ';
    html += 'ชั้น/ห้อง <span style="border-bottom:1px dotted #000; display:inline-block; min-width:80px; padding:0 4px; text-align:center;">'+(sInfo.school_class||'')+'</span> ';
    html += 'โรงเรียน <span style="border-bottom:1px dotted #000; display:inline-block; min-width:250px; padding:0 4px;">'+(sInfo.school_name||'')+'</span><br>';
    html += 'สิทธิการรักษา <span style="border-bottom:1px dotted #000; display:inline-block; min-width:200px; padding:0 4px;">'+(sInfo.treatment||'')+'</span> ';
    html += 'วันที่ตรวจ <span style="border-bottom:1px dotted #000; display:inline-block; min-width:120px; padding:0 4px; text-align:center;">'+toThaiDate(sInfo.screen_date)+'</span> ';
    html += 'ผู้ตรวจ <span style="border-bottom:1px dotted #000; display:inline-block; min-width:200px; padding:0 4px;">'+(sInfo.examiner||'')+'</span>';
    html += '</div>';
    
    html += '<div style="font-weight:bold; font-size:16pt; margin-top:10px; background:#f0f0f0; padding:4px;">ส่วนที่ 2 : ประวัติสุขภาพตา</div><table style="width:100%; border-collapse:collapse; margin-top:5px; margin-bottom:10px;"><tr><th style="border:1px solid #000; text-align:center; padding:5px; background:#ddd;">ประวัติสุขภาพตา</th><th style="border:1px solid #000; width:60px; background:#ddd;">ใช่</th><th style="border:1px solid #000; width:60px; background:#ddd;">ไม่ใช่</th></tr>';
    var hxList = [ {k:'hx_glasses', l:'เคยสวมแว่นตาหรือเลนส์สัมผัส (Contact Lens) หรือไม่'}, {k:'hx_injury', l:'เคยผ่าตัดตา หรือได้รับบาดเจ็บที่ตา'}, {k:'hx_red_eye', l:'มีอาการตาเจ็บ แสบ คัน มีขี้ตามาก หรือตาแดงเรื้อรัง'}, {k:'hx_headache', l:'มีอาการปวดศีรษะบ่อย โดยเฉพาะเวลาใช้สายตา'}, {k:'hx_amblyopia', l:'มีประวัติตาขี้เกียจ (Amblyopia) หรือตาเหล่'}, {k:'hx_family', l:'บิดา มารดา หรือญาติใกล้ชิดสวมแว่นตา'} ];
    hxList.forEach(function(hx) { var isYes = (sInfo[hx.k] == '1') ? '☑' : '☐'; var isNo = (sInfo[hx.k] == '0' || sInfo[hx.k] == '') ? '☑' : '☐'; html += '<tr><td style="border:1px solid #000; padding:4px 10px;">'+hx.l+'</td><td style="border:1px solid #000; text-align:center; font-size:18pt;">'+isYes+'</td><td style="border:1px solid #000; text-align:center; font-size:18pt;">'+isNo+'</td></tr>'; });
    
    html += '</table><div style="font-weight:bold; background:#f0f0f0; padding:4px;">ส่วนที่ 3 : ผลการตรวจสายตา (Visual Acuity) <span style="font-weight:normal; font-size:14pt;">ใช้ Snellen Chart ระยะทดสอบ 6 เมตร (20 ฟุต)</span></div><table style="width:100%; border-collapse:collapse; margin-top:5px; margin-bottom:10px; text-align:center;"><tr><th style="border:1px solid #000; padding:5px; background:#ddd;">การทดสอบ</th><th style="border:1px solid #000; background:#ddd;">ตาขวา (OD)</th><th style="border:1px solid #000; background:#ddd;">ตาซ้าย (OS)</th><th style="border:1px solid #000; background:#ddd;">สองตา (OU)</th></tr><tr><td style="border:1px solid #000; text-align:left; padding:5px 10px;">ไม่ใส่แว่น</td><td style="border:1px solid #000;">'+(sInfo.va_r_naked||'')+'</td><td style="border:1px solid #000;">'+(sInfo.va_l_naked||'')+'</td><td style="border:1px solid #000;">'+(sInfo.va_naked_OU||'')+'</td></tr><tr><td style="border:1px solid #000; text-align:left; padding:5px 10px;">ใส่แว่น / เลนส์</td><td style="border:1px solid #000;">'+(sInfo.va_r_glasses||'')+'</td><td style="border:1px solid #000;">'+(sInfo.va_l_glasses||'')+'</td><td style="border:1px solid #000;">'+(sInfo.va_glasses_OU||'')+'</td></tr></table>';
    
    html += '<div style="font-weight:bold; background:#f0f0f0; padding:4px;">ส่วนที่ 4 : การตรวจภาวะตาเหล่ / ตาขี้เกียจ</div><table style="width:100%; border-collapse:collapse; margin-top:5px; margin-bottom:10px; text-align:center;"><tr><th style="border:1px solid #000; padding:5px; background:#ddd;">รายการตรวจ</th><th style="border:1px solid #000; width:100px; background:#ddd;">ปกติ</th><th style="border:1px solid #000; width:100px; background:#ddd;">ผิดปกติ</th></tr>';
    var strabList = [ {k:'cover_test', l:'Cover / Uncover Test'}, {k:'hirschberg', l:'Hirschberg Test (ทดสอบแสงสะท้อนกระจกตา)'}, {k:'color_vision', l:'Color Vision Test (ทดสอบการมองสี - ถ้ามีอุปกรณ์)'}, {k:'stereopsis', l:'Stereopsis Test (ทดสอบการมองสามมิติ - ถ้ามีอุปกรณ์)'} ];
    strabList.forEach(function(st) { var v = sInfo[st.k] || 'ปกติ'; var n = (v === 'ปกติ') ? '☑' : '☐'; var abn = (v === 'ผิดปกติ') ? '☑' : '☐'; html += '<tr><td style="border:1px solid #000; text-align:left; padding:4px 10px;">'+st.l+'</td><td style="border:1px solid #000; font-size:18pt;">'+n+'</td><td style="border:1px solid #000; font-size:18pt;">'+abn+'</td></tr>'; });
    
    html += '</table><div style="font-weight:bold; background:#f0f0f0; padding:4px;">ส่วนที่ 5 : สรุปผลการตรวจและข้อแนะนำ (โดยนักทัศนมาตร (Optometrist))</div>';
    var diag = sInfo.diagnosis || ''; var ref = sInfo.referral || '';
    var isNormal = (diag==='สายตาปกติ') ? '☑' : '☐'; var isMyop = (diag==='สายตาสั้น (Myopia)') ? '☑' : '☐'; var isHyper = (diag==='สายตายาว (Hyperopia)') ? '☑' : '☐'; var isAstig = (diag==='สายตาเอียง (Astigmatism)') ? '☑' : '☐'; var isStrab = (diag.indexOf('ตาขี้เกียจ')>-1 || diag.indexOf('ตาเหล่')>-1) ? '☑' : '☐'; var isOtherDiag = (!isNormal && !isMyop && !isHyper && !isAstig && !isStrab && diag !== '' && diag !== '☐') ? '☑' : '☐';
    var noRef = (['ไม่จำเป็นต้องส่งต่อ','ไม่ส่ง',''].indexOf(ref)>-1) ? '☑' : '☐'; var ref1m = (ref.indexOf('1 เดือน')>-1) ? '☑' : '☐'; var ref1w = (ref.indexOf('1 สัปดาห์')>-1 || ref.indexOf('ด่วน')>-1) ? '☑' : '☐'; var ref3m = (ref.indexOf('3 เดือน')>-1) ? '☑' : '☐'; var isOtherRef = (noRef==='☐' && ref1m==='☐' && ref1w==='☐' && ref3m==='☐' && ref !== '') ? '☑' : '☐';
    
    html += '<table style="width:100%; border-collapse:collapse; margin-top:5px; margin-bottom:10px;"><tr><th style="border:1px solid #000; text-align:center; padding:5px; width:50%; background:#ddd;">สรุปผลการตรวจ</th><th style="border:1px solid #000; text-align:center; padding:5px; background:#ddd;">ข้อแนะนำ / การส่งต่อ</th></tr><tr><td style="border:1px solid #000; padding:8px 10px; vertical-align:top;">'+isNormal+' สายตาปกติ<br>'+isMyop+' สายตาสั้น (Myopia)<br>'+isHyper+' สายตายาว (Hyperopia)<br>'+isAstig+' สายตาเอียง (Astigmatism)<br>'+isStrab+' ตาเหล่ / ตาขี้เกียจ<br>'+isOtherDiag+' อื่นๆ ....................</td><td style="border:1px solid #000; padding:8px 10px; vertical-align:top;">'+noRef+' ไม่จำเป็นต้องส่งต่อ<br>'+ref1m+' ควรพบจักษุแพทย์ภายใน 1 เดือน<br>'+ref1w+' ส่งต่อด่วน (ภายใน 1 สัปดาห์)<br>'+ref3m+' ควรพบจักษุแพทย์ภายใน 3 เดือน<br>'+isOtherRef+' อื่นๆ ....................</td></tr></table>';
    html += '<div style="margin-top:5px;">หมายเหตุ / บันทึกเพิ่มเติม : <span style="border-bottom:1px dotted #000; display:inline-block; width:80%;">'+(sInfo.remarks||'')+'</span></div><div style="margin-top:30px; display:flex; justify-content:space-between;"><div>ลงชื่อผู้ตรวจ <span style="border-bottom:1px dotted #000; display:inline-block; width:200px;"></span><br>( <span style="border-bottom:1px dotted #000; display:inline-block; min-width:200px; text-align:center;">'+(sInfo.examiner||'')+'</span> )<br>ตำแหน่ง <span style="border-bottom:1px dotted #000; display:inline-block; min-width:200px; text-align:center;">'+(sInfo.position||'')+'</span></div></div></div>';
    return html;
}

function buildSatTemplate(d) {
    var sInfo = d.scr || {}; var satInfo = d.sat || {};
    var html = '<div style="font-family:\'Sarabun\', \'TH Sarabun PSK\', sans-serif; font-size:16pt; color:#000; line-height:1.3;">';
    html += getPrintLogo();
    html += '<div style="text-align:center; font-weight:bold; font-size:20pt; margin-bottom:20px;">โครงการเด็กไทยสายตาดี องค์การบริหารส่วนจังหวัดสมุทรสาคร<br>แบบประเมินความพึงพอใจ (Satisfaction Evaluation Form)<br><span style="font-size:14pt; font-weight:normal;">(สำหรับผู้เข้ารับการอบรม เช่น นักเรียน/ผู้ปกครอง)</span></div><div style="background:#f9f9f9; padding:10px; border:1px solid #ccc; border-radius:8px; margin-bottom:15px;"><b>คำชี้แจง :</b> กรุณาทำเครื่องหมาย ☑ ในช่องที่ตรงกับความเป็นจริงมากที่สุด<br><b>เกณฑ์การให้คะแนน :</b> 5 = มากที่สุด, 4 = มาก, 3 = ปานกลาง, 2 = น้อย, 1 = น้อยที่สุด</div>';
    
    html += '<div style="font-weight:bold; background:#f0f0f0; padding:4px;">ส่วนที่ 1 : ข้อมูลทั่วไป</div>';
    // --- เปลี่ยนเป็นเส้นประ ---
    html += '<div style="line-height:1.9; padding:8px 10px;">';
    html += 'ผู้ปกครองของ (ด.ช./ด.ญ.) <span style="border-bottom:1px dotted #000; display:inline-block; min-width:300px; padding:0 4px;">'+(sInfo.student_name||'')+'</span> ';
    html += 'อายุ <span style="border-bottom:1px dotted #000; display:inline-block; min-width:50px; padding:0 4px; text-align:center;">'+(sInfo.age_years||'')+'</span> ปี<br>';
    html += 'ระดับชั้น <span style="border-bottom:1px dotted #000; display:inline-block; min-width:100px; padding:0 4px; text-align:center;">'+(sInfo.school_class||'')+'</span> ';
    html += 'โรงเรียน <span style="border-bottom:1px dotted #000; display:inline-block; min-width:350px; padding:0 4px;">'+(sInfo.school_name||'')+'</span>';
    html += '</div>';
    
    html += '<div style="font-weight:bold; background:#f0f0f0; padding:4px; margin-top:10px;">ส่วนที่ 2 : ระดับความพึงพอใจ</div>';
    html += '<table style="width:100%; border-collapse:collapse; margin-top:5px; margin-bottom:15px; text-align:center;"><tr><th style="border:1px solid #000; padding:8px; width:40px; background:#ddd;">ที่</th><th style="border:1px solid #000; padding:8px; background:#ddd;">รายการประเมิน</th><th style="border:1px solid #000; width:50px; background:#ddd;">5</th><th style="border:1px solid #000; width:50px; background:#ddd;">4</th><th style="border:1px solid #000; width:50px; background:#ddd;">3</th><th style="border:1px solid #000; width:50px; background:#ddd;">2</th><th style="border:1px solid #000; width:50px; background:#ddd;">1</th></tr>';
    
    var sqs = ['ความเหมาะสมของสถานที่จัดกิจกรรม','ความเพียงพอของอุปกรณ์และสื่อที่ใช้','ความเหมาะสมของระยะเวลาในการดำเนินกิจกรรม','ความชัดเจนในการถ่ายทอดความรู้ของวิทยากร','ความเหมาะสมของเนื้อหาการบรรยาย','ความเป็นประโยชน์ของความรู้ที่ได้รับ','ความสามารถในการนำความรู้ไปใช้ประโยชน์ได้จริง','การให้บริการตรวจสายตาของเจ้าหน้าที่','ความสุภาพและเป็นมิตรของทีมงาน','ความพึงพอใจโดยรวมต่อโครงการ'];
    sqs.forEach(function(q, i) {
        var ans = satInfo['q'+(i+1)] || '';
        html += '<tr><td style="border:1px solid #000; padding:4px;">'+(i+1)+'</td><td style="border:1px solid #000; text-align:left; padding:4px 10px;">'+q+'</td>';
        [5,4,3,2,1].forEach(function(score) {
             var chk = (parseInt(ans) === score) ? '☑' : '';
             html += '<td style="border:1px solid #000; font-size:18pt;">'+chk+'</td>';
        });
        html += '</tr>';
    });
    html += '</table>';
    
    html += '<div style="font-weight:bold; background:#f0f0f0; padding:4px;">ส่วนที่ 3 : ความคิดเห็นและข้อเสนอแนะ</div>';
    html += '<div style="padding:10px;">จุดเด่นของโครงการ / สิ่งที่ชอบ :<br><div style="border-bottom:1px dotted #000; height:30px; margin-bottom:10px; padding-left:10px;">'+(satInfo.comment_s||'')+'</div>ข้อเสนอแนะ / สิ่งที่ควรปรับปรุง :<br><div style="border-bottom:1px dotted #000; height:30px; margin-bottom:15px; padding-left:10px;">'+(satInfo.comment_i||'')+'</div>';
    
    var rec = satInfo.recommend || '';
    html += '<b>ท่านจะแนะนำโครงการนี้ให้ผู้อื่นหรือไม่ ?</b><br><div style="margin-top:5px; margin-left:20px;">'+((rec==='แนะนำอย่างยิ่ง') ? '☑' : '☐')+' แนะนำอย่างยิ่ง     '+((rec==='แนะนำ') ? '☑' : '☐')+' แนะนำ     '+((rec==='ไม่แน่ใจ') ? '☑' : '☐')+' ไม่แน่ใจ     '+((rec==='ไม่แนะนำ') ? '☑' : '☐')+' ไม่แนะนำ</div></div>';
    html += '</div>';
    return html;
}

function buildTestTemplate(title, d, type) {
    var sInfo = d.scr || {}; var ansInfo = d[type] || {};
    var html = '<div style="font-family:\'Sarabun\', \'TH Sarabun PSK\', sans-serif; font-size:16pt; color:#000; line-height:1.4;">';
    html += getPrintLogo();
    html += '<div style="text-align:center; font-weight:bold; font-size:20pt; margin-bottom:15px;">โครงการเด็กไทยสายตาดี องค์การบริหารส่วนจังหวัดสมุทรสาคร<br>'+title+'</div>';
    html += '<div style="background:#f9f9f9; padding:8px; border:1px solid #ccc; border-radius:8px;"><b>คำชี้แจง :</b> เลือกคำตอบที่ถูกต้องที่สุดเพียงข้อเดียว โดยทำเครื่องหมายวงกลม ( O ) ล้อมรอบตัวอักษรหน้าข้อ</div>';
    
    // --- เปลี่ยนเป็นเส้นประ ---
    html += '<div style="line-height:1.9; padding:6px 10px; margin-top:10px;">';
    html += 'ชื่อ - สกุล <span style="border-bottom:1px dotted #000; display:inline-block; min-width:300px; padding:0 4px;">'+(sInfo.student_name||'')+'</span> ';
    html += 'ชั้น / ห้อง <span style="border-bottom:1px dotted #000; display:inline-block; min-width:100px; padding:0 4px; text-align:center;">'+(sInfo.school_class||'')+'</span><br>';
    html += 'โรงเรียน <span style="border-bottom:1px dotted #000; display:inline-block; min-width:300px; padding:0 4px;">'+(sInfo.school_name||'')+'</span> ';
    html += 'วันที่ทดสอบ <span style="border-bottom:1px dotted #000; display:inline-block; min-width:120px; padding:0 4px; text-align:center;">'+toThaiDate(sInfo.screen_date)+'</span>';
    html += '</div>';
    
    html += '<div style="margin-top:15px; border-top:2px solid #000; padding-top:10px;">';
    var questions = [
        {q:'1. กฎ 20-20-20 สำหรับดูแลสายตา คืออะไร?', c:['ก. เล่นเกม 20 นาที พัก 20 นาที', 'ข. พักมองไกล 20 ฟุต นาน 20 วินาที ทุก 20 นาที', 'ค. อ่านหนังสือห่าง 20 เซนติเมตร', 'ง. ใช้สายตาต่อเนื่อง 20 นาที']},
        {q:'2. หากต้องใช้มือถือหรือคอมพิวเตอร์เป็นเวลานาน ควรทำอย่างไร?', c:['ก. พักสายตาเป็นระยะ', 'ข. ปิดไฟเล่นเพื่อให้จอชัดขึ้น', 'ค. จ้องหน้าจอต่อเนื่องไม่กระพริบตา', 'ง. หลับตาข้างเดียวเวลาใช้งาน']},
        {q:'3. ระยะห่างที่เหมาะสมระหว่างตากับหน้าจอมือถือ/แท็บเล็ต คือเท่าใด?', c:['ก. 10-20 เซนติเมตร', 'ข. 20-30 เซนติเมตร', 'ค. 30-40 เซนติเมตร', 'ง. มากกว่า 2 เมตร']},
        {q:'4. การนอนเล่นหน้าจออิเล็กทรอนิกส์ในที่มืด ส่งผลอย่างไร?', c:['ก. ทำให้สายตาดีขึ้น', 'ข. ทำให้ตาล้าและแห้ง', 'ค. มองเห็นตอนกลางคืนชัดขึ้น', 'ง. ป้องกันแสงสีฟ้าเข้าตา']},
        {q:'5. อาหารชนิดใดมีส่วนช่วยบำรุงสายตามากที่สุด?', c:['ก. ลูกอมและขนมหวาน', 'ข. ผักใบเขียวและแครอท', 'ค. น้ำอัดลม', 'ง. ขนมขบเคี้ยว']},
        {q:'6. วิตามินเอ (Vitamin A) มีประโยชน์อย่างไรต่อร่างกาย?', c:['ก. ทำให้หลับสบาย', 'ข. ทำให้ร่างกายสูงเร็วขึ้น', 'ค. ช่วยบำรุงสายตาและการมองเห็น', 'ง. ทำให้ฟันแข็งแรง']},
        {q:'7. อาหารในข้อใดต่อไปนี้ อุดมไปด้วย โอเมก้า 3 ที่ดีต่อดวงตา?', c:['ก. มันฝรั่งทอด', 'ข. ปลาทะเลและถั่ว', 'ค. ขนมปังปิ้ง', 'ง. ไส้กรอกหมู']},
        {q:'8. หากพบว่าตัวเองมองกระดานหน้าห้องเรียนไม่ชัด ควรทำอย่างไร?', c:['ก. เงียบไว้และเดาตัวหนังสือ', 'ข. ย้ายไปนั่งหลังห้อง', 'ค. แจ้งครูหรือผู้ปกครองให้ทราบ', 'ง. ยืมแว่นของเพื่อนมาใส่']},
        {q:'9. พฤติกรรมใดเสี่ยงต่อการเกิดปัญหาสายตามากที่สุด?', c:['ก. อ่านหนังสือในที่สว่างพอ', 'ข. เล่นเกมมือถือกลางแดดจ้า', 'ค. พักสายตามองต้นไม้สีเขียว', 'ง. ทานผลไม้เป็นประจำ']},
        {q:'10. หากใช้แท็บเล็ตเรียนออนไลน์ต่อเนื่อง 1 ชั่วโมง ควรปฏิบัติตามข้อใด?', c:['ก. จ้องหน้าจอให้ใกล้ที่สุด', 'ข. เปิดแสงหน้าจอสว่างสูงสุด', 'ค. มองไปที่ไกลๆ ทุก 20 นาที', 'ง. ใส่แว่นกันแดดสีดำ']}
    ];
    
    var userAns = [ansInfo.q1, ansInfo.q2, ansInfo.q3, ansInfo.q4, ansInfo.q5, ansInfo.q6, ansInfo.q7, ansInfo.q8, ansInfo.q9, ansInfo.q10];
    
    html += '<table style="width:100%; border:none; margin-bottom:10px;">';
    for (var i = 0; i < questions.length; i += 2) {
        html += '<tr><td style="width:50%; vertical-align:top; padding-right:15px; padding-bottom:15px;">';
        html += '<b>'+questions[i].q+'</b><br>';
        questions[i].c.forEach(function(choice) {
            var charAns = choice.charAt(0);
            var isSelect = (userAns[i] === charAns) ? 'font-weight:bold; border:2px solid #000; border-radius:50%; padding:2px 8px; display:inline-block;' : 'padding:2px 8px; display:inline-block;';
            html += '<div style="margin-left:10px;"><span style="'+isSelect+'">'+charAns+'</span>'+choice.substring(1)+'</div>';
        });
        html += '</td>';
        
        if (i+1 < questions.length) {
            html += '<td style="width:50%; vertical-align:top; padding-left:15px; padding-bottom:15px;">';
            html += '<b>'+questions[i+1].q+'</b><br>';
            questions[i+1].c.forEach(function(choice) {
                var charAns = choice.charAt(0);
                var isSelect = (userAns[i+1] === charAns) ? 'font-weight:bold; border:2px solid #000; border-radius:50%; padding:2px 8px; display:inline-block;' : 'padding:2px 8px; display:inline-block;';
                html += '<div style="margin-left:10px;"><span style="'+isSelect+'">'+charAns+'</span>'+choice.substring(1)+'</div>';
            });
            html += '</td>';
        }
        html += '</tr>';
    }
    html += '</table></div>';
    
    html += '<div style="margin-top:20px; display:flex; justify-content:space-between; font-weight:bold; padding-top:10px; border-top:1px solid #ccc;">';
    html += '<div>คะแนนที่ได้ <span style="font-size:24pt; text-decoration:underline;">  '+(ansInfo.total||'  ')+'  </span> / 10</div>';
    html += '</div></div>';
    return html;
}

function checkBehEligible(cid) {
  var errEl  = document.getElementById('beh-err');
  var formSec = document.getElementById('beh-form-sec');
  var btn    = document.getElementById('btnSBeh');

  // ล้างทุกอย่างถ้ายังพิมพ์ไม่ครบ 13 หลัก
  if (cid.length !== 13) {
    errEl.textContent = '';
    document.getElementById('beh-name').value = '';
    document.getElementById('beh-age').value  = '';
    document.getElementById('beh-cls').value  = '';
    document.getElementById('beh-sch').value  = '';
    formSec.style.opacity       = '0.5';
    formSec.style.pointerEvents = 'none';
    btn.disabled = true;
    return;
  }

  // ค้นหาจาก G.allRows (ข้อมูลที่โหลดมาแล้ว) — รับทุกสถานะ
  var found = G.allRows.find(function(r) { return r.cid === cid; });

  if (found) {
    document.getElementById('beh-name').value = found.student_name || '';
    document.getElementById('beh-age').value  = found.age_years    || '';
    document.getElementById('beh-cls').value  = found.school_class || '';
    document.getElementById('beh-sch').value  = found.school_name  || '';
    errEl.style.color   = 'var(--green)';
    errEl.textContent   = '✅ พบข้อมูล สามารถทำแบบสอบถามได้';
    formSec.style.opacity       = '1';
    formSec.style.pointerEvents = 'all';
    btn.disabled = false;
  } else {
    document.getElementById('beh-name').value = '';
    document.getElementById('beh-age').value  = '';
    document.getElementById('beh-cls').value  = '';
    document.getElementById('beh-sch').value  = '';
    errEl.style.color   = 'var(--red)';
    errEl.textContent   = '❌ ไม่พบข้อมูลในระบบ กรุณาตรวจสอบเลขบัตร';
    formSec.style.opacity       = '0.5';
    formSec.style.pointerEvents = 'none';
    btn.disabled = true;
  }
}

function saveBeh() {
  var btn = document.getElementById('btnSBeh'); var cid = document.getElementById('beh-cid').value.trim();
  if (!/^\d{13}$/.test(cid)) { toast('เลขบัตรประชาชน 13 หลักไม่ถูกต้อง', 'err'); return; }
  var devices = [], purposes = [], symptoms = [];
  document.querySelectorAll('#beh-device input:checked').forEach(function(el)  { devices.push(el.value); });
  document.querySelectorAll('#beh-purpose input:checked').forEach(function(el) { purposes.push(el.value); });
  document.querySelectorAll('#beh-symptom input:checked').forEach(function(el) { symptoms.push(el.value); });
  var d = { cid: cid, q_device: devices.join(', '), q_purpose: purposes.join(', '), q_time_wk_morn: document.getElementById('beh-t-wk-m').value, q_time_wk_noon: document.getElementById('beh-t-wk-n').value, q_time_wk_eve: document.getElementById('beh-t-wk-e').value, q_time_we_morn: document.getElementById('beh-t-we-m').value, q_time_we_noon: document.getElementById('beh-t-we-n').value, q_time_we_eve: document.getElementById('beh-t-we-e').value, q_dist: document.getElementById('beh-dist').value, q_rest: document.getElementById('beh-rest').value, q_blue: document.getElementById('beh-blue').value, q_symptom: symptoms.join(', '), comment: document.getElementById('beh-comment').value };

  btn.disabled = true; btn.innerHTML = '<span class="sp"></span> กำลังบันทึก...';
  google.script.run.withSuccessHandler(function(r) {
      btn.disabled = false; btn.innerHTML = '💾 บันทึกแบบสอบถาม'; var res = JSON.parse(r);
      if (res.ok) {
        toast(res.msg, 'ok'); closePanel('beh'); forceRefresh();
        // 💡 แจ้ง Flow ทุกครั้ง — ทั้งบันทึกใหม่และแก้ไข
        var flow = determineFlowAfterStep(cid, 'beh');
        if(flow && flow.next !== 'done') {
          setTimeout(function(){ triggerFlow(flow.next, flow.msg, flow.action); }, 600);
        }
      } else { toast(res.msg, 'err'); }
    }).saveBehaviorData(d);
}

var GB = { data: null, riskFilter: '', chartInsts: {} };

// ==================== คำสั่งควบคุม BEHAVIOR DASHBOARD ====================
function openBehDashboard() {
  // สร้างและโหลดรายชื่ออำเภอ
  var amps = []; G.hospList.forEach(function(h){ if(h.amphoe && amps.indexOf(h.amphoe)===-1) amps.push(h.amphoe); }); amps.sort();
  var ampHtml = '<option value="">อำเภอ ทั้งหมด</option>'; amps.forEach(function(a){ ampHtml += '<option>'+a+'</option>'; });
  document.getElementById('bf-amphoe').innerHTML = ampHtml;

  var hcHtml = '<option value="">รพ.สต. ทั้งหมด</option>';
  G.hospList.forEach(function(h){ hcHtml += '<option value="'+h.hospcode+'">'+h.hospcode+' '+h.name+'</option>'; });
  document.getElementById('bf-hosp').innerHTML = hcHtml;
  
  var schHtml = '<option value="">โรงเรียนทั้งหมด</option>';
  G.schoolList.forEach(function(s){ schHtml += '<option value="'+e_(s.name)+'">'+e_(s.name)+'</option>'; });
  document.getElementById('bf-school').innerHTML = schHtml;
  
  var classes = ['อ.1','อ.2','อ.3','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'];
  var clsHtml = '<option value="">ชั้นทั้งหมด</option>';
  classes.forEach(function(c){ clsHtml += '<option value="' + c + '">' + c + '</option>'; });
  document.getElementById('bf-class').innerHTML = clsHtml;

  // 🔓 ปลดล็อกเงื่อนไข: บังคับล็อกเฉพาะระดับ User ทั่วไป (รพ.สต.) เท่านั้น / ส่วนแอดมิน และ แขกภายนอก (Guest) จะเลือกดูสถิติได้ทุกพื้นที่แบบอิสระ
  if (G.session.loggedIn && G.session.role === 'user' && G.session.hospcode !== 'all') {
    document.getElementById('bf-hosp').value = G.session.hospcode;
    document.getElementById('bf-hosp').disabled = true;
    var userHospObj = G.hospList.find(function(h){ return h.hospcode === G.session.hospcode; });
    if(userHospObj) { document.getElementById('bf-amphoe').value = userHospObj.amphoe; document.getElementById('bf-amphoe').disabled = true; }
  } else {
    document.getElementById('bf-hosp').disabled = false;
    document.getElementById('bf-amphoe').disabled = false;
  }

  openPanel('behdash');
  loadBehDashboard();
}

function onBehAmpChange() {
  var amp = document.getElementById('bf-amphoe').value;
  var hSel = document.getElementById('bf-hosp');
  hSel.innerHTML = '<option value="">รพ.สต. ทั้งหมด</option>';
  G.hospList.filter(function(h) { return !amp || h.amphoe === amp; }).forEach(function(h) {
    hSel.innerHTML += '<option value="' + h.hospcode + '">' + h.hospcode + ' ' + h.name + '</option>';
  });
  loadBehDashboard();
}

function clearBehFilters() {
  document.getElementById('bf-amphoe').value = '';
  document.getElementById('bf-school').value = '';
  document.getElementById('bf-sex').value = '';
  document.getElementById('bf-class').value = '';
  if (!(G.session.loggedIn && G.session.role === 'user')) document.getElementById('bf-hosp').value = '';
  GB.riskFilter = '';
  onBehAmpChange();
}

function toggleBehRisk(level) {
  GB.riskFilter = (GB.riskFilter === level) ? '' : level;
  loadBehDashboard();
}

function loadBehDashboard() {
  var params = {
    amphoe: document.getElementById('bf-amphoe').value,
    hospcode: document.getElementById('bf-hosp').value,
    school: document.getElementById('bf-school').value,
    sex: document.getElementById('bf-sex').value,
    school_class: document.getElementById('bf-class').value,
    risk: GB.riskFilter
  };
  toast('กำลังโหลดข้อมูลพฤกติกรรม...', 'inf');
  google.script.run.withSuccessHandler(function(r){
    var res = JSON.parse(r);
    if (!res.ok) { toast(res.msg, 'err'); return; }
    GB.data = res.data;
    renderBehDashboard();
  }).getBehaviorDashboard(params);
}

function renderBehDashboard() {
  var d = GB.data; if (!d) return;
  
  // KPIs
  var k = d.kpi;
  document.getElementById('bk-total').textContent = k.total;
  document.getElementById('bk-wk').textContent = k.avgHoursWk.toFixed(1);
  document.getElementById('bk-we').textContent = k.avgHoursWe.toFixed(1);
  document.getElementById('bk-sym').textContent = k.symptomPct + '%';
  document.getElementById('bk-dist').textContent = k.properDistPct + '%';
  document.getElementById('bk-risk').textContent = d.riskBuckets.high || 0;

  // Destroy old charts
  Object.keys(GB.chartInsts).forEach(function(k){ try { GB.chartInsts[k].destroy(); } catch(e){} });
  GB.chartInsts = {};

  // 1) Risk Doughnut (interactive)
  GB.chartInsts.risk = new Chart(document.getElementById('behRiskChart').getContext('2d'), {
    type: 'doughnut',
    data: { labels:['น้อย (0-3)','ปานกลาง (4-7)','สูง (≥8)'],
            datasets:[{ data:[d.riskBuckets.low, d.riskBuckets.medium, d.riskBuckets.high],
                        backgroundColor:['#16A34A','#ca8a04','#dc2626'] }] },
    options: { responsive:true, maintainAspectRatio:false,
      onClick:function(evt, els){ if(!els.length) return; var lvls=['low','medium','high']; toggleBehRisk(lvls[els[0].index]); },
      plugins:{ legend:{position:'bottom',labels:{font:{size:10,family:'Sarabun'}}},
                datalabels:{color:'#fff', font:{weight:'bold',size:13,family:'Sarabun'}, textStrokeColor:'rgba(0,0,0,0.5)', textStrokeWidth:2,
                            formatter:function(v,ctx){ var t=ctx.chart.data.datasets[0].data.reduce(function(a,b){return a+b;},0); return v>0?v+'\n('+Math.round(v/t*100)+'%)':''; }}}
    }, plugins:[ChartDataLabels]
  });

  // 2) Devices
  renderBehHorizontalBar('behDevChart', 'dev', d.devices, '#3b82f6');
  // 3) Purposes
  renderBehHorizontalBar('behPurChart', 'pur', d.purposes, '#8b5cf6');
  // 4) Symptoms
  renderBehHorizontalBar('behSymChart', 'sym', d.symptoms, '#ec4899');

  // 5) Time slots stacked bar
  var timeLabels = ['เช้า','กลางวัน','เย็น'];
  var timeOpts = ['ไม่ใช้','ไม่ถึง 1 ชม.','1-2 ชม.','2-3 ชม.','3-4 ชม.','มากกว่า 4 ชม.'];
  var timeColors = ['#e5e7eb','#bfdbfe','#93c5fd','#fbbf24','#fb923c','#dc2626'];
  var slotKeysWk = ['wk_morn','wk_noon','wk_eve'];
  var slotKeysWe = ['we_morn','we_noon','we_eve'];
  
  var datasetsTime = timeOpts.map(function(opt, i){
    var dataWk = slotKeysWk.map(function(sk){ return d.timeSlots[sk].dist[opt] || 0; });
    var dataWe = slotKeysWe.map(function(sk){ return d.timeSlots[sk].dist[opt] || 0; });
    return { label:opt, data:dataWk.concat(dataWe), backgroundColor:timeColors[i] };
  });
  GB.chartInsts.time = new Chart(document.getElementById('behTimeChart').getContext('2d'), {
    type:'bar',
    data:{ labels:['วันธรรมดา-เช้า','วันธรรมดา-กลางวัน','วันธรรมดา-เย็น','วันหยุด-เช้า','วันหยุด-กลางวัน','วันหยุด-เย็น'], datasets:datasetsTime },
    options:{ responsive:true, maintainAspectRatio:false, interaction:{mode:'index',intersect:false},
      plugins:{ legend:{position:'bottom',labels:{font:{size:10,family:'Sarabun'},boxWidth:12}},
                datalabels:{display:false},
                tooltip:{callbacks:{footer:function(items){ var t=0; items.forEach(function(i){t+=i.raw;}); return 'รวม: '+t+' คน'; }}}},
      scales:{ x:{stacked:true,ticks:{font:{size:10,family:'Sarabun'}}}, y:{stacked:true,beginAtZero:true,title:{display:true,text:'จำนวนผู้ตอบ (คน)'}} }
    }
  });

  // 6) Distance / Rest / Blue light - small doughnuts
  GB.chartInsts.dist = makeDoughnut('behDistChart', d.distance, ['#dc2626','#f59e0b','#16A34A']);
  GB.chartInsts.rest = makeDoughnut('behRestChart', d.rest, ['#16A34A','#f59e0b','#dc2626']);
  GB.chartInsts.blue = makeDoughnut('behBlueChart', d.blue, ['#3b82f6','#94a3b8']);

  // 7) Hospcode stacked bar
  var hospKeys = Object.keys(d.hospRisk).sort();
  GB.chartInsts.hosp = new Chart(document.getElementById('behHospChart').getContext('2d'), {
    type:'bar',
    data:{ labels: hospKeys.map(function(k){return d.hospRisk[k].name;}),
           datasets:[
             {label:'น้อย', data:hospKeys.map(function(k){return d.hospRisk[k].low;}), backgroundColor:'#16A34A'},
             {label:'ปานกลาง', data:hospKeys.map(function(k){return d.hospRisk[k].medium;}), backgroundColor:'#ca8a04'},
             {label:'สูง', data:hospKeys.map(function(k){return d.hospRisk[k].high;}), backgroundColor:'#dc2626'}
           ] },
    options:{ responsive:true, maintainAspectRatio:false, interaction:{mode:'index',intersect:false},
      onClick:function(evt, els){ if(!els.length) return; var hc = hospKeys[els[0].index]; var el=document.getElementById('bf-hosp'); el.value = (el.value === hc) ? '' : hc; loadBehDashboard(); },
      plugins:{ legend:{position:'bottom',labels:{font:{size:10,family:'Sarabun'}}},
                datalabels:{display:function(c){return c.dataset.data[c.dataIndex]>0;}, color:'#fff', font:{weight:'bold',size:11,family:'Sarabun'}, textStrokeColor:'rgba(0,0,0,0.5)', textStrokeWidth:2}},
      scales:{ x:{stacked:true, ticks:{font:{size:10,family:'Sarabun'}}}, y:{stacked:true,beginAtZero:true}}
    }, plugins:[ChartDataLabels]
  });

  // 8) Detail table (กำหนดสิทธิ์การมองเห็นเฉพาะตอน Login)
  if (G.session.loggedIn) {
      document.getElementById('behTblWrapper').style.display = 'block';
      if(document.getElementById('behGuestMsg')) document.getElementById('behGuestMsg').style.display = 'none';
      renderBehTable(d.rows);
  } else {
      document.getElementById('behTblWrapper').style.display = 'none';
      if(document.getElementById('behGuestMsg')) document.getElementById('behGuestMsg').style.display = 'block';
  }
}

function renderBehHorizontalBar(canvasId, key, dataObj, color) {
  var labels = Object.keys(dataObj).sort(function(a,b){return dataObj[b]-dataObj[a];});
  var values = labels.map(function(l){return dataObj[l];});
  var total = values.reduce(function(a,b){return a+b;}, 0);
  GB.chartInsts[key] = new Chart(document.getElementById(canvasId).getContext('2d'), {
    type:'bar',
    data:{ labels:labels, datasets:[{ data:values, backgroundColor:color, borderRadius:4 }] },
    options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false},
                datalabels:{color:'#fff', anchor:'center', align:'center', font:{weight:'bold',size:11,family:'Sarabun'}, textStrokeColor:'rgba(0,0,0,0.5)', textStrokeWidth:2,
                            formatter:function(v){ return v>0 ? v+' ('+Math.round(v/total*100)+'%)' : ''; }}},
      scales:{ x:{beginAtZero:true,ticks:{font:{family:'Sarabun'}}}, y:{ticks:{font:{size:10,family:'Sarabun'}}}}
    }, plugins:[ChartDataLabels]
  });
}

function makeDoughnut(canvasId, dataObj, colors) {
  return new Chart(document.getElementById(canvasId).getContext('2d'), {
    type:'doughnut',
    data:{ labels:Object.keys(dataObj), datasets:[{ data:Object.values(dataObj), backgroundColor:colors }] },
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{position:'bottom',labels:{font:{size:10,family:'Sarabun'}}},
                datalabels:{color:'#fff', font:{weight:'bold',size:12,family:'Sarabun'}, textStrokeColor:'rgba(0,0,0,0.5)', textStrokeWidth:2,
                            formatter:function(v,ctx){ var t=ctx.chart.data.datasets[0].data.reduce(function(a,b){return a+b;},0); return v>0?v+'\n('+Math.round(v/t*100)+'%)':''; }}}
    }, plugins:[ChartDataLabels]
  });
}

function renderBehTable(rows) {
  var tb = document.getElementById('behTblBody');
  if (!rows.length) { tb.innerHTML = '<tr><td colspan="12" style="text-align:center;padding:20px;color:var(--muted2)">ไม่มีข้อมูล</td></tr>'; return; }
  var canManage = G.session.loggedIn;
  var h = '';
  rows.forEach(function(r, i) {
    var rcl = r.risk_level === 'high' ? 'beh-risk-h' : (r.risk_level === 'medium' ? 'beh-risk-m' : 'beh-risk-l');
    var rt = r.risk_level === 'high' ? 'สูง' : (r.risk_level === 'medium' ? 'กลาง' : 'น้อย');
    var actBtns = '<button class="btn-act" style="color:var(--teal);border-color:#99f6e4;" onclick="printSingleBeh(\''+r.cid+'\')" title="พิมพ์แบบฟอร์ม">🖨️</button>';
    if(canManage) {
      actBtns += ' <button class="btn-act" style="color:#3B82F6;border-color:#bfdbfe;" onclick="editBehRecord(\''+r.cid+'\')" title="แก้ไข">✏️</button>';
      actBtns += ' <button class="btn-act" style="color:var(--red);border-color:#fecaca;" onclick="delBehRecord(\''+r.cid+'\',\''+e_(r.name)+'\')" title="ลบ">🗑</button>';
    }
    h += '<tr><td>'+(i+1)+'</td><td>'+e_(r.cid)+'</td><td>'+e_(r.name)+'</td><td>'+e_(r.school_class)+'</td><td>'+e_(r.hosp_name)+'</td>' +
         '<td style="text-align:center;">'+r.hours_wk.toFixed(1)+'</td><td style="text-align:center;">'+r.hours_we.toFixed(1)+'</td>' +
         '<td>'+e_(r.distance)+'</td><td>'+e_(r.rest)+'</td><td style="font-size:10px;">'+e_(r.symptoms)+'</td>' +
         '<td style="text-align:center;"><span class="'+rcl+'">'+rt+' ('+r.risk_score+')</span></td>' +
         '<td style="text-align:center; white-space:nowrap;">'+actBtns+'</td></tr>';
  });
  tb.innerHTML = h;
}

function exportBehCSV() {
  if (!GB.data || !GB.data.rows.length) { toast('ไม่มีข้อมูลให้ส่งออก','err'); return; }
  var hdr = '#,เลขบัตร,ชื่อ-สกุล,ชั้น,รพ.สต.,ชม.วันธรรมดา,ชม.วันหยุด,อุปกรณ์,วัตถุประสงค์,ระยะ,พัก,แว่นกรองฟ้า,อาการ,คะแนนเสี่ยง,ระดับเสี่ยง';
  var lines = GB.data.rows.map(function(r,i){
    return [i+1,'"=""'+r.cid+'"""','"'+r.name+'"',r.school_class,'"'+r.hosp_name+'"',r.hours_wk,r.hours_we,'"'+r.devices+'"','"'+r.purposes+'"','"'+r.distance+'"','"'+r.rest+'"','"'+r.blue+'"','"'+r.symptoms+'"',r.risk_score,r.risk_level].join(',');
  });
  var csv = '\uFEFF' + hdr + '\n' + lines.join('\n');
  var blob = new Blob([csv],{type:'text/csv;charset=utf-8'}); var a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'behavior_'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
  toast('Export สำเร็จ','ok');
}
var GF = { data: null, chartInsts: {} };

function openFupDashboard() {
  var amps = []; G.hospList.forEach(function(h){ if(h.amphoe && amps.indexOf(h.amphoe)===-1) amps.push(h.amphoe); }); amps.sort();
  var ampHtml = '<option value="">อำเภอ ทั้งหมด</option>'; amps.forEach(function(a){ ampHtml += '<option>'+a+'</option>'; });
  document.getElementById('fdf-amphoe').innerHTML = ampHtml;

  var hcHtml = '<option value="">รพ.สต. ทั้งหมด</option>';
  G.hospList.forEach(function(h){ hcHtml += '<option value="' + h.hospcode + '">' + h.hospcode + ' ' + h.name + '</option>'; });
  document.getElementById('fdf-hosp').innerHTML = hcHtml;
  
  var schHtml = '<option value="">โรงเรียนทั้งหมด</option>';
  G.schoolList.forEach(function(s){ schHtml += '<option value="' + e_(s.name) + '">' + e_(s.name) + '</option>'; });
  document.getElementById('fdf-school').innerHTML = schHtml;
  
  var classes = ['อ.1','อ.2','อ.3','ป.1','ป.2','ป.3','ป.4','ป.5','ป.6','ม.1','ม.2','ม.3','ม.4','ม.5','ม.6'];
  var clsHtml = '<option value="">ชั้นทั้งหมด</option>';
  classes.forEach(function(c){ clsHtml += '<option value="' + c + '">' + c + '</option>'; });
  document.getElementById('fdf-class').innerHTML = clsHtml;
  
  // 🔓 ปลดล็อกเงื่อนไขสำหรับผู้เข้าชมทั่วไป (Guest) ในแถบติดตามผลแว่นตา
  if (G.session.loggedIn && G.session.role === 'user' && G.session.hospcode !== 'all') {
    document.getElementById('fdf-hosp').value = G.session.hospcode;
    document.getElementById('fdf-hosp').disabled = true;
    var userHospObj = G.hospList.find(function(h){ return h.hospcode === G.session.hospcode; });
    if(userHospObj) { document.getElementById('fdf-amphoe').value = userHospObj.amphoe; document.getElementById('fdf-amphoe').disabled = true; }
  } else {
    document.getElementById('fdf-hosp').disabled = false;
    document.getElementById('fdf-amphoe').disabled = false;
  }
  
  openPanel('fupdash');
  loadFupDashboard();
}

function onFupAmpChange() {
  var amp = document.getElementById('fdf-amphoe').value;
  var hSel = document.getElementById('fdf-hosp');
  hSel.innerHTML = '<option value="">รพ.สต. ทั้งหมด</option>';
  G.hospList.filter(function(h) { return !amp || h.amphoe === amp; }).forEach(function(h) {
    hSel.innerHTML += '<option value="' + h.hospcode + '">' + h.hospcode + ' ' + h.name + '</option>';
  });
  loadFupDashboard();
}

function clearFupFilters() {
  document.getElementById('fdf-amphoe').value = '';
  document.getElementById('fdf-school').value = '';
  document.getElementById('fdf-sex').value = '';
  document.getElementById('fdf-class').value = '';
  if (!(G.session.loggedIn && G.session.role === 'user')) document.getElementById('fdf-hosp').value = '';
  onFupAmpChange();
}

function loadFupDashboard() {
  var params = {
    amphoe: document.getElementById('fdf-amphoe').value,
    hospcode: document.getElementById('fdf-hosp').value,
    school: document.getElementById('fdf-school').value,
    sex: document.getElementById('fdf-sex').value,
    school_class: document.getElementById('fdf-class').value
  };
  toast('กำลังโหลดข้อมูลติดตามผล...', 'inf');
  google.script.run.withSuccessHandler(function(r){
    var res = JSON.parse(r);
    if (!res.ok) { toast(res.msg, 'err'); return; }
    GF.data = res.data;
    renderFupDashboard();
  }).getFollowupDashboard(params);
}

function renderFupDashboard() {
  var d = GF.data; if (!d) return;
  
  // KPIs
  document.getElementById('fk-total').textContent = d.kpi.total;
  document.getElementById('fk-daily').textContent = d.kpi.dailyWearPct + '%';
  document.getElementById('fk-cond').textContent = d.kpi.goodCondPct + '%';
  document.getElementById('fk-sat').textContent = d.kpi.satAvg !== null ? d.kpi.satAvg.toFixed(2) : '—';
  
  // Destroy old charts
  Object.keys(GF.chartInsts).forEach(function(k){ try { GF.chartInsts[k].destroy(); } catch(e){} });
  GF.chartInsts = {};
  
  // 1) Frequency by situation - stacked bar
  var freqLabels = ['ดูกระดาน','อ่านหนังสือ','ดูหน้าจอ','เล่นกีฬา'];
  var freqKeys = ['board','book','screen','sport'];
  var freqOpts = ['ทุกครั้ง','บ่อยครั้ง','บางครั้ง','ไม่เคยเลย'];
  var freqColors = ['#16A34A','#84cc16','#f59e0b','#dc2626'];
  var freqDatasets = freqOpts.map(function(opt, i){
    return { label:opt, data:freqKeys.map(function(k){return d.freqUsage[k][opt]||0;}), backgroundColor:freqColors[i] };
  });
  GF.chartInsts.freq = new Chart(document.getElementById('fupFreqChart').getContext('2d'), {
    type:'bar',
    data:{labels:freqLabels, datasets:freqDatasets},
    options:{responsive:true, maintainAspectRatio:false, interaction:{mode:'index',intersect:false},
      plugins:{legend:{position:'bottom',labels:{font:{size:10,family:'Sarabun'}}},
        datalabels:{display:function(c){return c.dataset.data[c.dataIndex]>0;}, color:'#fff', font:{weight:'bold',size:11,family:'Sarabun'}, textStrokeColor:'rgba(0,0,0,0.5)', textStrokeWidth:2}},
      scales:{x:{stacked:true,ticks:{font:{family:'Sarabun'}}}, y:{stacked:true,beginAtZero:true,title:{display:true,text:'จำนวน (คน)'}}}
    }, plugins:[ChartDataLabels]
  });
  
  // 2) Quality of life improvement - horizontal bar (% improved)
  GF.chartInsts.qol = new Chart(document.getElementById('fupQolChart').getContext('2d'), {
    type:'bar',
    data:{labels:['การมองเห็นกระดาน','สมาธิเรียน','ความมั่นใจ','ปวดหัวลดลง'],
      datasets:[{ data:[d.qolImpPct.board, d.qolImpPct.focus, d.qolImpPct.confidence, d.qolImpPct.headache],
        backgroundColor:['#3b82f6','#0d9488','#8b5cf6','#f59e0b'], borderRadius:6 }]},
    options:{indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false},
        datalabels:{color:'#fff', anchor:'center', align:'center', font:{weight:'bold',size:13,family:'Sarabun'}, textStrokeColor:'rgba(0,0,0,0.5)', textStrokeWidth:2,
          formatter:function(v){return v+'%';}}},
      scales:{x:{beginAtZero:true, max:100, ticks:{callback:function(v){return v+'%';}, font:{family:'Sarabun'}}}, y:{ticks:{font:{family:'Sarabun', size:11}}}}
    }, plugins:[ChartDataLabels]
  });
  
  // 3) Days per week pie
  GF.chartInsts.days = new Chart(document.getElementById('fupDaysChart').getContext('2d'), {
    type:'doughnut',
    data:{labels:Object.keys(d.fDays), datasets:[{data:Object.values(d.fDays), backgroundColor:['#16A34A','#84cc16','#f59e0b','#dc2626']}]},
    options:{responsive:true, maintainAspectRatio:false,
      plugins:{legend:{position:'bottom',labels:{font:{size:10,family:'Sarabun'}}},
        datalabels:{color:'#fff', font:{weight:'bold',size:13,family:'Sarabun'}, textStrokeColor:'rgba(0,0,0,0.5)', textStrokeWidth:2,
          formatter:function(v,ctx){var t=ctx.chart.data.datasets[0].data.reduce(function(a,b){return a+b;},0); return v>0?v+'\n('+Math.round(v/t*100)+'%)':'';}}}
    }, plugins:[ChartDataLabels]
  });
  
  // 4) Top 5 reasons - horizontal bar
  var reasonLabels = d.topReasons.map(function(r){return r.label.length > 30 ? r.label.substring(0,28)+'...' : r.label;});
  var reasonValues = d.topReasons.map(function(r){return r.count;});
  GF.chartInsts.reason = new Chart(document.getElementById('fupReasonChart').getContext('2d'), {
    type:'bar',
    data:{labels:reasonLabels, datasets:[{data:reasonValues, backgroundColor:'#ec4899', borderRadius:6}]},
    options:{indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false},
        datalabels:{color:'#fff', anchor:'center', align:'center', font:{weight:'bold',size:12,family:'Sarabun'}, textStrokeColor:'rgba(0,0,0,0.5)', textStrokeWidth:2}},
      scales:{x:{beginAtZero:true,ticks:{font:{family:'Sarabun'}}}, y:{ticks:{font:{size:10,family:'Sarabun'}}}}
    }, plugins:[ChartDataLabels]
  });
  
  // 5) Heatmap
  renderFupHeatmap(d.hospHeatmap);
  
  // 6) Detail table (กำหนดสิทธิ์การมองเห็นเฉพาะตอน Login)
  if (G.session.loggedIn) {
      document.getElementById('fupTblWrapper').style.display = 'block';
      if(document.getElementById('fupGuestMsg')) document.getElementById('fupGuestMsg').style.display = 'none';
      renderFupTable(d.rows);
  } else {
      document.getElementById('fupTblWrapper').style.display = 'none';
      if(document.getElementById('fupGuestMsg')) document.getElementById('fupGuestMsg').style.display = 'block';
  }
}

function renderFupHeatmap(data) {
  var wrap = document.getElementById('fupHeatmapWrap');
  if (!data || !data.length) { wrap.innerHTML = '<p style="color:var(--muted);padding:14px;text-align:center;">ไม่มีข้อมูล</p>'; return; }
  
  function getColor(pct, base) {
    var alpha = pct / 100;
    var R = Math.round(255 + (base[0]-255)*alpha);
    var G = Math.round(255 + (base[1]-255)*alpha);
    var B = Math.round(255 + (base[2]-255)*alpha);
    return {bg:'rgb('+R+','+G+','+B+')', text: alpha > 0.45 ? '#fff' : '#1e293b'};
  }
  
  var thStyle = 'padding:6px 8px;background:#fdf2f8;border:1px solid #fbcfe8;white-space:nowrap;text-align:center;position:sticky;top:0;z-index:3;color:#9d174d;';
  var html = '<table style="border-collapse:collapse;font-size:11px;width:100%;min-width:700px;">';
  html += '<thead><tr>';
  html += '<th style="'+thStyle+' text-align:left;left:0;z-index:4;min-width:160px;">รพ.สต.</th>';
  html += '<th style="'+thStyle+' min-width:55px;">ผู้ตอบ</th>';
  html += '<th style="'+thStyle+' min-width:90px;">ใส่ทุกวัน</th>';
  html += '<th style="'+thStyle+' min-width:90px;">สภาพแว่นดี</th>';
  html += '<th style="'+thStyle+' min-width:90px;">มองเห็นดีขึ้น</th>';
  html += '<th style="'+thStyle+' min-width:90px;">สมาธิดีขึ้น</th>';
  html += '<th style="'+thStyle+' min-width:90px;">ปวดหัวลด</th>';
  html += '<th style="'+thStyle+' min-width:90px;">พึงพอใจ</th>';
  html += '</tr></thead><tbody>';
  
  data.forEach(function(h, ri) {
    var rowBg = ri%2===0 ? '#fff' : '#fefce8';
    var c1 = getColor(h.dailyWearPct, [22,163,74]);
    var c2 = getColor(h.goodCondPct, [13,148,136]);
    var c3 = getColor(h.visionImpPct, [59,130,246]);
    var c4 = getColor(h.focusImpPct, [139,92,246]);
    var c5 = getColor(h.headacheImpPct, [245,158,11]);
    var satPct = h.satAvg !== null ? Math.round(h.satAvg/5*100) : 0;
    var c6 = getColor(satPct, [124,58,237]);
    
    html += '<tr>';
    html += '<td style="padding:5px 10px;border:1px solid #fbcfe8;background:'+rowBg+';position:sticky;left:0;font-weight:600;font-size:10.5px;white-space:nowrap;z-index:1;">'+e_(h.hospcode)+'<br><span style="font-weight:400;color:var(--muted);">'+e_(h.name)+'</span></td>';
    html += '<td style="padding:5px 8px;border:1px solid #fbcfe8;text-align:center;font-weight:700;background:'+rowBg+';">'+h.total+'</td>';
    html += '<td style="padding:5px 8px;border:1px solid #fbcfe8;text-align:center;background:'+c1.bg+';color:'+c1.text+';font-weight:600;">'+h.dailyWearPct+'%</td>';
    html += '<td style="padding:5px 8px;border:1px solid #fbcfe8;text-align:center;background:'+c2.bg+';color:'+c2.text+';font-weight:600;">'+h.goodCondPct+'%</td>';
    html += '<td style="padding:5px 8px;border:1px solid #fbcfe8;text-align:center;background:'+c3.bg+';color:'+c3.text+';font-weight:600;">'+h.visionImpPct+'%</td>';
    html += '<td style="padding:5px 8px;border:1px solid #fbcfe8;text-align:center;background:'+c4.bg+';color:'+c4.text+';font-weight:600;">'+h.focusImpPct+'%</td>';
    html += '<td style="padding:5px 8px;border:1px solid #fbcfe8;text-align:center;background:'+c5.bg+';color:'+c5.text+';font-weight:600;">'+h.headacheImpPct+'%</td>';
    html += '<td style="padding:5px 8px;border:1px solid #fbcfe8;text-align:center;background:'+c6.bg+';color:'+c6.text+';font-weight:600;">'+(h.satAvg!==null?h.satAvg.toFixed(2):'—')+'</td>';
    html += '</tr>';
  });
  html += '</tbody></table>';
  wrap.innerHTML = html;
}

function renderFupTable(rows) {
  var tb = document.getElementById('fupTblBody');
  if (!rows.length) { tb.innerHTML = '<tr><td colspan="13" style="text-align:center;padding:20px;color:var(--muted2)">ไม่มีข้อมูล</td></tr>'; return; }
  var canManage = G.session.loggedIn;
  var h = '';
  rows.forEach(function(r, i) {
    var actBtns = '';
    if(canManage) {
      actBtns += '<button class="btn-act" style="color:#3B82F6;border-color:#bfdbfe;" onclick="editFupRecord(\''+r.cid+'\')" title="แก้ไข">✏️</button> ';
      actBtns += '<button class="btn-act" style="color:var(--red);border-color:#fecaca;" onclick="delFupRecord(\''+r.cid+'\',\''+e_(r.name)+'\')" title="ลบ">🗑</button>';
    } else { actBtns = '—'; }
    h += '<tr><td>'+(i+1)+'</td><td>'+e_(r.cid)+'</td><td>'+e_(r.name)+'</td><td>'+e_(r.school_class)+'</td><td>'+e_(r.hosp_name)+'</td>'+
         '<td style="font-size:10px;">'+e_(r.duration)+'</td><td style="font-size:10px;">'+e_(r.c_status)+'</td>'+
         '<td style="font-size:10px;">'+e_(r.q_board)+'</td><td style="font-size:10px;">'+e_(r.q_focus)+'</td><td style="font-size:10px;">'+e_(r.q_confidence)+'</td><td style="font-size:10px;">'+e_(r.q_headache)+'</td>'+
         '<td style="text-align:center;font-weight:700;color:#7c3aed;">'+e_(r.overall_sat)+'</td>'+
         '<td style="text-align:center; white-space:nowrap;">'+actBtns+'</td></tr>';
  });
  tb.innerHTML = h;
}

function exportFupCSV() {
  if (!GF.data || !GF.data.rows.length) { toast('ไม่มีข้อมูล','err'); return; }
  var hdr = '#,เลขบัตร,ชื่อ-สกุล,ชั้น,รพ.สต.,โทรศัพท์,ระยะใส่,ใส่/สัปดาห์,สภาพแว่น,ความชัด,มอง,สมาธิ,มั่นใจ,ปวดหัว,พึงพอใจ,สาเหตุไม่ใส่';
  var lines = GF.data.rows.map(function(r,i){
    return [i+1,'"=""'+r.cid+'"""','"'+r.name+'"',r.school_class,'"'+r.hosp_name+'"','"'+r.tel+'"','"'+r.duration+'"','"'+r.f_days+'"','"'+r.c_status+'"','"'+r.c_clarity+'"','"'+r.q_board+'"','"'+r.q_focus+'"','"'+r.q_confidence+'"','"'+r.q_headache+'"','"'+r.overall_sat+'"','"'+r.reasons+'"'].join(',');
  });
  var csv = '\uFEFF' + hdr + '\n' + lines.join('\n');
  var blob = new Blob([csv],{type:'text/csv;charset=utf-8'}); var a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'followup_'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
  toast('Export สำเร็จ','ok');
}

function checkFupEligible(cid) {
  var errEl = document.getElementById('fup-err');
  var formSec = document.getElementById('fup-form-sec');
  var btn = document.getElementById('btnSFup');
  
  if (cid.length !== 13) {
    errEl.textContent = ''; 
    ['fup-name','fup-age','fup-cls','fup-sch','fup-tel'].forEach(function(id){ document.getElementById(id).value = ''; });
    formSec.style.opacity = '0.5'; formSec.style.pointerEvents = 'none'; btn.disabled = true; return;
  }
  
  errEl.style.color = 'var(--muted)';
  errEl.textContent = '⏳ กำลังตรวจสอบสิทธิ์...';
  
  google.script.run.withSuccessHandler(function(r) {
    var res = JSON.parse(r);
    if (!res.ok) { errEl.style.color='var(--red)'; errEl.textContent = '❌ ' + res.msg; btn.disabled=true; return; }
    
    if (res.data.eligible) {
      document.getElementById('fup-name').value = res.data.student_name;
      document.getElementById('fup-age').value = res.data.age_years;
      document.getElementById('fup-cls').value = res.data.school_class;
      document.getElementById('fup-sch').value = res.data.school_name;
      document.getElementById('fup-tel').value = res.data.tel || '';
      errEl.style.color = 'var(--green)';
      errEl.textContent = '✅ ผ่านเงื่อนไข Post-test + วินิจฉัย ' + (res.data.status === 'glasses' ? 'ตัดแว่น' : 'ส่งต่อ') + ' สามารถทำแบบติดตามผลได้(ผ่านการอบรมแล้ว)';
      formSec.style.opacity = '1'; formSec.style.pointerEvents = 'all'; btn.disabled = false;
    } else {
      ['fup-name','fup-age','fup-cls','fup-sch'].forEach(function(id){ document.getElementById(id).value = ''; });
      errEl.style.color = 'var(--red)';
      errEl.textContent = res.data.reason;
      formSec.style.opacity = '0.5'; formSec.style.pointerEvents = 'none'; btn.disabled = true;
    }
  }).checkFollowupEligibility(cid);
}

function saveFup() {
  var btn = document.getElementById('btnSFup');
  var cid = document.getElementById('fup-cid').value.trim();
  if (!/^\d{13}$/.test(cid)) { toast('เลขบัตรประชาชน 13 หลักไม่ถูกต้อง', 'err'); return; }
  
  var reasons = [];
  document.querySelectorAll('#fup-reasons input:checked').forEach(function(el){ reasons.push(el.value); });
  
  var d = {
    cid: cid, tel: document.getElementById('fup-tel').value, duration: document.getElementById('fup-dur').value,
    f_board: getRad('f1'), f_book: getRad('f2'), f_screen: getRad('f3'), f_sport: getRad('f4'),
    f_days: getRad('f_days'),
    c_status: getRad('c_status'), c_clarity: getRad('c_clarity'),
    q_board: getRad('q_board'), q_focus: getRad('q_focus'),
    q_confidence: getRad('q_confidence'), q_headache: getRad('q_headache'),
    reasons: reasons.join(', '), overall_sat: getRad('overall_sat'),
    comment: document.getElementById('fup-comment').value
  };
  
  btn.disabled = true; btn.innerHTML = '<span class="sp"></span> บันทึก...';
  google.script.run.withSuccessHandler(function(r){
    btn.disabled = false; btn.innerHTML = '💾 บันทึกการติดตามผล';
    var res = JSON.parse(r);
    if (res.ok) {
      toast(res.msg, 'ok'); closePanel('fup');
      document.getElementById('fup-cid').value = ''; document.getElementById('fup-err').textContent = '';
      document.getElementById('fup-form-sec').style.opacity = '0.5'; document.getElementById('fup-form-sec').style.pointerEvents = 'none';
      document.getElementById('btnSFup').disabled = true;
      forceRefresh();
      // 💡 แจ้งจบ Flow ทุกครั้ง
      var flow = determineFlowAfterStep(cid, 'fup');
      if(flow) {
        setTimeout(function(){
          document.getElementById('flowTitle').textContent = '✅ บันทึกสำเร็จ';
          document.getElementById('flowMsg').innerHTML = flow.msg;
          document.getElementById('btnFlowNext').textContent = 'ปิด';
          document.getElementById('btnFlowNext').onclick = closeFlow;
          document.getElementById('flowMov').classList.add('open');
        }, 600);
      }
    } else { toast(res.msg, 'err'); }
  }).withFailureHandler(function(e){ btn.disabled=false; btn.innerHTML='💾 บันทึกการติดตามผล'; toast('Error: '+e.message,'err'); }).saveFollowupData(d);
}
// ===== ADD: Edit/Delete สำหรับ Behavior & Followup (v6.2) =====

// ฟังก์ชันคำนวณลำดับถัดไปอัตโนมัติตามสถานะของผู้รับการตรวจ
function determineFlowAfterStep(cid, currentStep) {
  var person = G.allRows.find(function(r){ return r.cid === cid; });
  if(!person) return null;
  var status = person.status;
  
  if(currentStep === 'scr') {
    return { next: 'beh', msg: 'ลำดับต่อไปกรุณาทำ <b>แบบสอบถามพฤติกรรมการใช้หน้าจออิเล็กทรอนิกส์</b>', action: function(){ openPanel('beh'); document.getElementById('beh-cid').value=cid; checkBehEligible(cid); } };
  }
  if(currentStep === 'beh') {
    if(status === 'normal') {
      return { next: 'sat', msg: 'ผู้รับการตรวจ <b>มีผลคัดกรองสายตาปกติ</b><br><br>ลำดับต่อไปข้ามไปทำ <b>แบบประเมินความพึงพอใจ</b>', action: function(){ openPanel('sat'); document.getElementById('sat-search-cid').value=cid; searchSatUser(cid); } };
    } else {
      return { next: 'pre', msg: 'ผู้รับการตรวจ <b>มีผลคัดกรองสายตาผิดปกติ/ส่งต่อ/ตัดแว่น</b><br><br>ลำดับต่อไปกรุณาทำ <b>แบบทดสอบก่อนอบรม (Pre-Test)</b>', action: function(){ openPanel('pre'); document.getElementById('pre-cid').value=cid; checkEligible('pre', cid); } };
    }
  }
  if(currentStep === 'pre') {
    return { next: 'post', msg: 'ลำดับต่อไปกรุณาทำ <b>แบบทดสอบหลังอบรม (Post-Test)</b>', action: function(){ openPanel('post'); document.getElementById('post-cid').value=cid; checkEligible('post', cid); } };
  }
  if(currentStep === 'post') {
    return { next: 'sat', msg: 'หลังจากอบรมและรับแว่นไปแล้ว จะมีเจ้าหน้าที่แจ้งให้ทำแบบประเมินผลของการติดตามการใช้แว่นตา (เมนูติดตามผลยังไม่ต้องทำตอนนี้)<br><br>ลำดับต่อไปให้ไปทำ <b>แบบประเมินความพึงพอใจ</b> เพื่อจบขั้นตอนในวันนี้', action: function(){ openPanel('sat'); document.getElementById('sat-search-cid').value=cid; searchSatUser(cid); } };
  }
  if(currentStep === 'fup') {
    return { next: 'done', msg: '✅ บันทึกข้อมูลการติดตามผลสำเร็จ ขั้นตอนทั้งหมดสมบูรณ์แล้ว', action: function(){} };
  }
  return null;
}

// แก้ไขข้อมูลพฤติกรรม
function editBehRecord(cid) {
  toast('กำลังดึงข้อมูล...', 'inf');
  google.script.run.withSuccessHandler(function(r){
    var res = JSON.parse(r);
    if(!res.ok) { toast(res.msg, 'err'); return; }
    var d = res.data;
    closePanel('behdash');
    setTimeout(function(){
      openPanel('beh');
      document.getElementById('beh-cid').value = d.cid;
      checkBehEligible(d.cid);
      setTimeout(function(){
        // เติมข้อมูลเดิม
        var devices = String(d.q_device||'').split(',').map(function(s){return s.trim();});
        document.querySelectorAll('#beh-device input').forEach(function(el){ el.checked = devices.indexOf(el.value) > -1; });
        var purposes = String(d.q_purpose||'').split(',').map(function(s){return s.trim();});
        document.querySelectorAll('#beh-purpose input').forEach(function(el){ el.checked = purposes.indexOf(el.value) > -1; });
        var syms = String(d.q_symptom||'').split(',').map(function(s){return s.trim();});
        document.querySelectorAll('#beh-symptom input').forEach(function(el){ el.checked = syms.indexOf(el.value) > -1; });
        document.getElementById('beh-t-wk-m').value = d.q_time_wk_morn || 'ไม่ใช้';
        document.getElementById('beh-t-wk-n').value = d.q_time_wk_noon || 'ไม่ใช้';
        document.getElementById('beh-t-wk-e').value = d.q_time_wk_eve || 'ไม่ใช้';
        document.getElementById('beh-t-we-m').value = d.q_time_we_morn || 'ไม่ใช้';
        document.getElementById('beh-t-we-n').value = d.q_time_we_noon || 'ไม่ใช้';
        document.getElementById('beh-t-we-e').value = d.q_time_we_eve || 'ไม่ใช้';
        document.getElementById('beh-dist').value = d.q_dist || 'ใกล้กว่า 1 ฟุต';
        document.getElementById('beh-rest').value = d.q_rest || 'พักทุก 20 นาที';
        document.getElementById('beh-blue').value = d.q_blue || 'ไม่มีการใช้';
        document.getElementById('beh-comment').value = d.comment || '';
        toast('โหลดข้อมูลเดิมเรียบร้อย — แก้ไขแล้วกดบันทึก','ok');
      }, 600);
    }, 350);
  }).getBehaviorRecord(cid);
}

function delBehRecord(cid, name) {
  if(!confirm('ยืนยันการลบข้อมูลพฤติกรรมของ\n' + name + ' (CID: ' + cid + ') ?\n\n⚠ ข้อมูลที่ลบจะกู้คืนไม่ได้')) return;
  google.script.run.withSuccessHandler(function(r){
    var res = JSON.parse(r);
    if(res.ok) { toast(res.msg,'ok'); loadBehDashboard(); forceRefresh(); }
    else toast(res.msg,'err');
  }).deleteBehaviorRecord(cid);
}

// แก้ไขข้อมูลติดตามแว่นตา
function editFupRecord(cid) {
  toast('กำลังดึงข้อมูล...', 'inf');
  google.script.run.withSuccessHandler(function(r){
    var res = JSON.parse(r);
    if(!res.ok) { toast(res.msg, 'err'); return; }
    var d = res.data;
    closePanel('fupdash');
    setTimeout(function(){
      openPanel('fup');
      document.getElementById('fup-cid').value = d.cid;
      checkFupEligible(d.cid);
      setTimeout(function(){
        document.getElementById('fup-tel').value = d.tel || '';
        document.getElementById('fup-dur').value = d.duration || 'น้อยกว่า 1 เดือน';
        setRad('f1', d.f_board); setRad('f2', d.f_book); setRad('f3', d.f_screen); setRad('f4', d.f_sport);
        setRad('f_days', d.f_days); setRad('c_status', d.c_status); setRad('c_clarity', d.c_clarity);
        setRad('q_board', d.q_board); setRad('q_focus', d.q_focus); setRad('q_confidence', d.q_confidence); setRad('q_headache', d.q_headache);
        setRad('overall_sat', d.overall_sat);
        var reasons = String(d.reasons||'').split(',').map(function(s){return s.trim();});
        document.querySelectorAll('#fup-reasons input').forEach(function(el){ el.checked = reasons.indexOf(el.value) > -1; });
        document.getElementById('fup-comment').value = d.comment || '';
        toast('โหลดข้อมูลเดิมเรียบร้อย — แก้ไขแล้วกดบันทึก','ok');
      }, 600);
    }, 350);
  }).getFollowupRecord(cid);
}

function delFupRecord(cid, name) {
  if(!confirm('ยืนยันการลบข้อมูลติดตามแว่นตาของ\n' + name + ' (CID: ' + cid + ') ?\n\n⚠ ข้อมูลที่ลบจะกู้คืนไม่ได้')) return;
  google.script.run.withSuccessHandler(function(r){
    var res = JSON.parse(r);
    if(res.ok) { toast(res.msg,'ok'); loadFupDashboard(); forceRefresh(); }
    else toast(res.msg,'err');
  }).deleteFollowupRecord(cid);
}
// ฟังก์ชันแปลผลเพศอัตโนมัติ
function autoSelectSex(val) {
  var sexSel = document.getElementById('s-sex');
  if (val === 'เด็กชาย' || val === 'นาย') { sexSel.value = '1'; }
  else if (val === 'เด็กหญิง' || val === 'นางสาว' || val === 'นาง') { sexSel.value = '2'; }
}

// ฟังก์ชันจัดการ LINE API
function openLineMgr() {
  document.getElementById('line-token').value = G.settings.LINE_TOKEN || '';
  document.getElementById('line-target').value = G.settings.LINE_TARGET || '';
  openPanel('line');
}

function saveLine() {
  var token = document.getElementById('line-token').value.trim();
  var target = document.getElementById('line-target').value.trim();
  toast('กำลังบันทึก...', 'inf');
  google.script.run.withSuccessHandler(function(r) {
    var res = JSON.parse(r);
    if(res.ok) { toast(res.msg, 'ok'); G.settings.LINE_TOKEN = token; G.settings.LINE_TARGET = target; }
    else { toast(res.msg, 'err'); }
  }).saveLineSettings(token, target);
}

function testLine() {
  toast('กำลังส่งทดสอบ...', 'inf');
  google.script.run.withSuccessHandler(function(r) {
    var res = JSON.parse(r);
    if(res.ok) { toast(res.msg, 'ok'); } else { toast(res.msg, 'err'); }
  }).testLineMsg();
}

// ฟังก์ชันสำหรับรีโหลดหน้าเว็บใหม่ทั้งหมดแบบล้างแคช (เสมือนการกด Ctrl + Shift + R)
function hardReload() {
  toast('🔄 กำลังล้างแคชและโหลดข้อมูลใหม่ทั้งหมด...', 'inf');

  // ล้างตัวกรองทั้งหมดก่อน
  ['fAmp','fHosp','fSch','fStat','fSex'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  var sb = document.getElementById('srchBox');
  if (sb) sb.value = '';

  // ทำลายกราฟเก่าทิ้งทั้งหมด ป้องกัน Canvas ค้าง
  ['barInst','pieInst','lineInst','hospInst','schoolInst','satBreakdownInst','satTypePieInst'].forEach(function(k){
    if (G[k]) { try { G[k].destroy(); } catch(e){} G[k] = null; }
  });
  ['G_treatInst','G_behDashInst','G_fupDashInst','G_diagInst'].forEach(function(k){
    if (window[k]) { try { window[k].destroy(); } catch(e){} window[k] = null; }
  });

  // ดึง InitData ใหม่ทั้งหมด (settings, hospList, videos, links, session)
  google.script.run
    .withSuccessHandler(function(r) {
      try {
        var d = JSON.parse(r);
        if (!d.ok) { toast('❌ โหลดข้อมูลไม่สำเร็จ: ' + d.msg, 'err'); return; }

        G.settings   = d.data.settings   || {};
        G.hospList   = d.data.hospList   || [];
        G.schoolList = d.data.schoolList || [];
        G.vaList     = d.data.vaList     || [];
        G.vaMap      = d.data.vaMap      || {};
        G.session    = d.data.session    || {loggedIn:false};
        G.videos     = d.data.videos     || [];

        applySettings();
        buildDropdowns();
        updateAuthUI();
        renderLinks(d.data.links || []);
        renderVideoPlaylist(G.videos);
        if (G.videos.length > 0) renderVideo(G.videos[0].url);

        // โหลด Dashboard ใหม่ทั้งหมด
        loadDashboard({});

        // รีเฟรชแผนที่
        if (myMap) setTimeout(function(){ myMap.invalidateSize(); }, 400);

        setTimeout(function(){ toast('✅ โหลดข้อมูลใหม่สำเร็จ', 'ok'); }, 800);
      } catch (err) {
        toast('❌ Error: ' + err.message, 'err');
      }
    })
    .withFailureHandler(function(e) {
      toast('❌ การเชื่อมต่อล้มเหลว: ' + e.message, 'err');
    })
    .getInitData();
}

function toggleAllChk(source) {
      var checkboxes = document.querySelectorAll('.row-chk');
      for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = source.checked;
      }
    }
</script>
</body>
</html>
