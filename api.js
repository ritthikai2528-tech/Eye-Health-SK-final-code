// ==============================================================
// 🚀 GITHUB PAGES POLYFILL (BRIDGE TO GAS)
// ==============================================================
const CONFIG = {
  GAS_API_URL: "https://script.google.com/macros/s/AKfycbxn0lQO65d_4tGUvOrz-Ae2Oqv291AIFOyUstEk7ZjPKBkvoAVqMjHEB7i0ZAyHmXDzrQ/exec", // ⚠️ เอา Web App URL มาใส่ตรงนี้
  MAX_RETRY: 5,
  RETRY_BASE_MS: 3000
};

const WRITE_ACTIONS = new Set([
  'saveScreeningData', 'updateScreeningData', 'importScreeningData',
  'saveSatisfactionData', 'savePreTest', 'savePostTest',
  'saveFollowupData', 'saveBehaviorData',
  'deleteRecord', 'deleteBehaviorRecord', 'deleteFollowupRecord',
  'deleteLinkData', 'deleteVideoItem', 'deleteHospFileLink',
  'updateHospLocation', 'saveLinkData', 'saveVideoItem',
  'saveLineSettings', 'changePassword'
]);

const _inFlight = new Map();

function _polyfillToast(msg, type) {
  if (typeof toast === 'function') {
    try { toast(msg, type || 'inf'); } catch(e) {}
  }
}

function _sleep(ms) {
  const jitter = Math.random() * 500;
  return new Promise(r => setTimeout(r, ms + jitter));
}

async function _callApiWithRetry(action, payloadData) {
  let lastError = null;
  for (let attempt = 1; attempt <= CONFIG.MAX_RETRY; attempt++) {
    try {
      const response = await fetch(CONFIG.GAS_API_URL, {
        method: 'POST',
        // [ปรับปรุง] เพิ่ม redirect follow สำหรับ GitHub -> GAS
        redirect: "follow", 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: action, data: payloadData })
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const result = await response.json();
      const isBusy = result && result.ok === false && result.msg && 
                     (result.msg.includes('กำลังประมวลผล') || result.msg.includes('กำลังยุ่ง'));
                     
      if (isBusy && WRITE_ACTIONS.has(action) && attempt < CONFIG.MAX_RETRY) {
        await _sleep(CONFIG.RETRY_BASE_MS * attempt);
        continue;
      }
      return result;
    } catch (err) {
      lastError = err;
      if (WRITE_ACTIONS.has(action) && attempt < CONFIG.MAX_RETRY) {
        await _sleep(CONFIG.RETRY_BASE_MS * attempt);
        continue;
      }
      throw err;
    }
  }
  if (lastError) throw lastError;
  return { ok: false, msg: 'ระบบไม่ว่าง กรุณาลองใหม่' };
}

window.google = window.google || {};
window.google.script = window.google.script || {};
window.google.script.run = (function() {
  function createRunner(successHandler, failureHandler) {
    return new Proxy({}, {
      get: function(target, prop) {
        if (prop === 'withSuccessHandler') return function(cb) { return createRunner(cb, failureHandler); };
        if (prop === 'withFailureHandler') return function(cb) { return createRunner(successHandler, cb); };
        
        return async function(...args) {
          let payloadData = args[0] !== undefined ? args[0] : {};
          if (prop === 'login') payloadData = { user: args[0], pass: args[1] };
          if (prop === 'changePassword') payloadData = { oldPwd: args[0], newPwd: args[1] };
          if (prop === 'deleteHospFileLink') payloadData = { hospcode: args[0], urlToRemove: args[1] };
          if (prop === 'deleteRecord') payloadData = { sheetName: args[0], cid: args[1] };
          if (prop === 'saveLineSettings') payloadData = { token: args[0], target: args[1] };
          if (['getScreeningRecord', 'checkTestEligibility', 'checkFollowupEligibility', 
               'getBehaviorRecord', 'getFollowupRecord', 
               'deleteBehaviorRecord', 'deleteFollowupRecord'].includes(prop)) {
            payloadData = { cid: args[0] };
          }
          if (prop === 'deleteLinkData' || prop === 'deleteVideoItem') payloadData = { id: args[0] };
          
          let inFlightKey = null;
          if (WRITE_ACTIONS.has(prop)) {
            try { inFlightKey = prop + ':' + JSON.stringify(payloadData); } 
            catch(e) { inFlightKey = prop + ':' + Date.now(); }
            if (_inFlight.has(inFlightKey)) {
              _polyfillToast('⚠️ กำลังบันทึกข้อมูลอยู่...', 'inf');
              if (failureHandler) failureHandler(new Error('Duplicate request'));
              return;
            }
          }
          
          const apiPromise = _callApiWithRetry(prop, payloadData);
          if (inFlightKey) _inFlight.set(inFlightKey, apiPromise);
          try {
            const result = await apiPromise;
            if (successHandler) successHandler(typeof result === 'object' ? JSON.stringify(result) : result);
          } catch (err) {
            if (failureHandler) failureHandler(err);
            else _polyfillToast('❌ เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว', 'err');
          } finally {
            if (inFlightKey) _inFlight.delete(inFlightKey);
          }
        };
      }
    });
  }
  return createRunner(null, null);
})();
