
(() => {
  // AI Assist: redact PII (simulated) + risk scoring
  const aiBtn = document.getElementById('aiAssistBtn');
  aiBtn.addEventListener('click', runAIAssist);

  document.getElementById('aiQuick').addEventListener('click', () => {
    // Quick assist: redact details if present
    runAIAssist(true);
  });

  function redactPII(text){
    // Very basic client-side redaction: phone, emails, roll numbers (digits), names (capital words heuristic)
    let redacted = text || '';
    // phone
    redacted = redacted.replace(/(\+?\d{3,4}[-\s.]?)?(\d{3,4}[-\s.]?\d{3,4}[-\s.]?\d{0,4})/g, '[redacted-phone]');
    // email
    redacted = redacted.replace(/[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, '[redacted-email]');
    // roll / id-ish: groups of 5+ digits
    redacted = redacted.replace(/\b\d{5,}\b/g, '[redacted-id]');
    // simple name heuristic (single capitalized words 2+ letters) — keep conservative
    redacted = redacted.replace(/\b([A-Z][a-z]{1,20})\b/g, (m) => {
      // don't redact common words (very basic)
      const commons = ['College','Hostel','Block','Gate','North','South','East','West'];
      return commons.includes(m) ? m : '[redacted-name]';
    });
    return redacted;
  }

  function computeRisk(details, offender){
    // Keyword-based heuristic (client-side). Later replace with real model.
    const text = `${details} ${offender}`.toLowerCase();
    let score = 0;
    const high = ['assault','hit','beat','threat','weapon','sexual','abuse','force','physically'];
    const medium = ['tease','humiliate','pressur','intimid','shout','bully','forced'];
    high.forEach(k => { if(text.includes(k)) score += 3;});
    medium.forEach(k => { if(text.includes(k)) score += 1;});
    // urgency words
    if(/now|immediately|help me|i am scared|danger/.test(text)) score += 4;
    // normalize to 0-100
    const raw = Math.min(100, Math.round((score / 12) * 100));
    let label = 'Low';
    if(raw > 65) label = 'High';
    else if(raw > 30) label = 'Medium';
    return {score: raw, label};
  }

  // display AI assist outcome
  function runAIAssist(quiet=false){
    const details = document.getElementById('details').value || '';
    const offender = document.getElementById('offender').value || '';
    if(!details && !offender && !quiet){
      flashResult('Please add incident details to run AI Assist.', true);
      return;
    }
    const redacted = redactPII(details);
    const risk = computeRisk(details, offender);
    // Show a compact summary and copy-to-clipboard option
    const out = `
AI Assist completed
• Risk: ${risk.label} (${risk.score}%)
• Redacted excerpt: ${redacted.slice(0,240) || '[no details]'}
`;
    flashResult(out, false, 8000);
    // place summary into result element for admin-ready copy
    const resultEl = document.getElementById('result');
    resultEl.textContent = `AI Summary — Risk: ${risk.label} (${risk.score}%) — Redacted summary ready.`;
    // store on element dataset for submission
    resultEl.dataset.redacted = redacted;
    resultEl.dataset.risk = JSON.stringify(risk);
  }

  // Submit handler (placeholder)
  document.getElementById('submitBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    const payload = {
      location: document.getElementById('location').value || '',
      locType: document.getElementById('locType').value || 'at',
      offender: document.getElementById('offender').value || '',
      details: document.getElementById('details').value || '',
      name: document.getElementById('name').value || '',
      contact: document.getElementById('contact').value || '',
      meta: {}
    };

    // use AI output if available
    const resultEl = document.getElementById('result');
    if(resultEl.dataset.redacted){
      payload.meta.redacted = resultEl.dataset.redacted;
      payload.meta.risk = JSON.parse(resultEl.dataset.risk);
    } else {
      // run quick assist if not already run
      const r = computeRisk(payload.details, payload.offender);
      payload.meta.risk = r;
      payload.meta.redacted = redactPII(payload.details);
    }

    // show immediate confirmation (simulate network)
    flashResult('Report queued securely. Reference ID: ZR-' + (Math.random()*90000|0), false, 6000);

    // TODO: Replace with real backend endpoint
    // fetch('/api/report', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    //   .then(()=>flashResult('Report submitted',false))
    //   .catch(()=>flashResult('Unable to submit: offline',true));
    console.log('REPORT PAYLOAD (placeholder):', payload);
  });

  // Emergency buttons
  document.getElementById('emergBtn').addEventListener('click', () => {
    // campus emergency — direct call
    const number = '+911234567890'; // TODO: replace
    const proceed = confirm('Call campus emergency now?');
    if(proceed) window.location.href = `tel:${number}`;
  });
  document.getElementById('helplineBtn').addEventListener('click', () => {
    const number = '+919876543210'; // TODO: replace with helpline
    window.location.href = `tel:${number}`;
  });

  // small helper: toast/result
  let toastTimer = null;
  function flashResult(msg, isError=false, timeout=4000){
    const el = document.getElementById('result');
    el.textContent = msg;
    el.style.borderColor = isError ? 'rgba(255,45,85,0.28)' : 'rgba(0,212,255,0.06)';
    if(isError) el.style.color = '#ffb6c1';
    else el.style.color = '#dfeffe';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>{ el.textContent=''; el.style.color=''; el.style.borderColor=''; }, timeout);
  }

  // accessible focus flow: ensure first input is focused
  window.addEventListener('load', () => {
    const first = steps[0].querySelector('input, textarea, select');
    if(first) first.focus();
  });

})();

