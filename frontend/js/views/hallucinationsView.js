/**
 * ControlPlane AI — Hallucination & Factuality Verification View (FacTool Integration)
 */

export async function handleVerifyClick(e) {
  if (e) e.preventDefault();

  const promptInput = document.getElementById('hal-prompt-input');
  const responseInput = document.getElementById('hal-response-input');
  const categorySelect = document.getElementById('hal-category-select');
  const modelSelect = document.getElementById('hal-model-select');
  const openaiKeyInput = document.getElementById('hal-openai-key');
  const serperKeyInput = document.getElementById('hal-serper-key');
  const resultsBox = document.getElementById('hal-results-box');
  const btnVerify = document.getElementById('btn-verify-hallucination');

  const prompt = promptInput ? promptInput.value.trim() : '';
  const response = responseInput ? responseInput.value.trim() : '';
  const category = categorySelect ? categorySelect.value : 'kbqa';
  const foundationModel = modelSelect ? modelSelect.value : 'gpt-3.5-turbo';

  if (!prompt || !response) {
    alert('Please enter both the original Prompt and the LLM Response to verify.');
    return;
  }

  btnVerify.disabled = true;
  btnVerify.innerHTML = `<span>⏳</span> Verifying Claims with FacTool...`;
  
  if (resultsBox) {
    resultsBox.style.display = 'block';
    resultsBox.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        <div style="font-size: 2rem; margin-bottom: 0.5rem; animation: spin 1s infinite linear;">🔍</div>
        <p style="font-size: 0.9rem; font-weight: 500;">Extracting claims & searching web evidence via FacTool...</p>
        <span style="font-size: 0.75rem; color: var(--text-dim);">This may take a few seconds...</span>
      </div>
    `;
  }

  try {
    const payload = {
      prompt,
      response,
      category,
      foundation_model: foundationModel,
      openai_api_key: openaiKeyInput ? openaiKeyInput.value.trim() : '',
      serper_api_key: serperKeyInput ? serperKeyInput.value.trim() : ''
    };

    const res = await fetch('/api/v1/hallucination/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Verification request failed');
    }

    const data = await res.json();
    renderVerificationResults(data);
  } catch (err) {
    console.error('Factool error:', err);
    if (resultsBox) {
      resultsBox.innerHTML = `
        <div style="padding: 1rem; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger); border-radius: 8px; color: var(--danger);">
          ⚠️ <strong>Verification Failed:</strong> ${err.message}
        </div>
      `;
    }
  } finally {
    btnVerify.disabled = false;
    btnVerify.innerHTML = `<span>🔬</span> Verify Factuality (FacTool)`;
  }
}

export function populateSampleData(sampleType) {
  const promptInput = document.getElementById('hal-prompt-input');
  const responseInput = document.getElementById('hal-response-input');
  const categorySelect = document.getElementById('hal-category-select');

  if (sampleType === 'neubig') {
    if (promptInput) promptInput.value = 'Introduce Graham Neubig';
    if (responseInput) responseInput.value = 'Graham Neubig is a professor at MIT and conducts research in artificial intelligence.';
    if (categorySelect) categorySelect.value = 'kbqa';
  } else if (sampleType === 'math') {
    if (promptInput) promptInput.value = "Stephen placed an online order for groceries totaling $7,023,116. Vendor added 25% fee ($1,755,779), $3 delivery fee, and $4 tip. What was final price?";
    if (responseInput) responseInput.value = "Initial groceries: $7023116. 25% fee: $1755779. Delivery fee: $3. Tip: $4. Adding all up, the total final price was 7023116 + 1755779 + 3 + 4 = 8779902.";
    if (categorySelect) categorySelect.value = 'math';
  } else if (sampleType === 'code') {
    if (promptInput) promptInput.value = "Implement get_max_triples(n) in Python";
    if (responseInput) responseInput.value = "def get_max_triples(n):\n    a = [i * i - i + 1 for i in range(1, n+1)]\n    return sum(1 for i in range(n-2) for j in range(i+1, n-1) for k in range(j+1, n) if (a[i] + a[j] + a[k]) % 3 == 0)";
    if (categorySelect) categorySelect.value = 'code';
  } else if (sampleType === 'microsoft') {
    if (promptInput) promptInput.value = 'Who is the current CEO of Microsoft and when was the company founded?';
    if (responseInput) responseInput.value = 'The current CEO of Microsoft is Elon Musk, and the company was founded in 1999 in San Francisco.';
    if (categorySelect) categorySelect.value = 'kbqa';
  }
}


function renderVerificationResults(res) {
  const resultsBox = document.getElementById('hal-results-box');
  if (!resultsBox) return;

  const mode = res.mode;
  const data = res.data;
  const info = (data.detailed_information && data.detailed_information[0]) ? data.detailed_information[0] : null;

  if (!info) {
    resultsBox.innerHTML = `<div style="padding: 1rem; color: var(--danger);">No verification detailed results returned.</div>`;
    return;
  }

  const isFactual = info.response_level_factuality;
  const avgClaimFactuality = Math.round((data.average_claim_level_factuality || 0) * 100);
  const claims = info.claim_level_factuality || [];
  const evidences = info.evidences || [];

  let html = `
    <div style="margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 1.5rem;">
      
      <!-- Top Notice Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 10px; background: rgba(15, 23, 42, 0.7); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border);">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 0.75rem; background: ${mode === 'live_factool' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; color: ${mode === 'live_factool' ? 'var(--success)' : 'var(--warning)'}; font-weight: 700; padding: 4px 10px; border-radius: 20px; border: 1px solid currentColor;">
            ${mode === 'live_factool' ? '🟢 LIVE FACTOOL SEARCH' : '⚙️ EVALUATOR ENGINE'}
          </span>
          ${res.notice ? `<span style="font-size: 0.78rem; color: var(--text-muted);">${res.notice}</span>` : ''}
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted);">
          Task Category: <strong style="color: #fff; text-transform: uppercase;">${info.category}</strong>
        </div>
      </div>


      <!-- Verdict Banner -->
      <div style="padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; background: ${isFactual ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border: 1px solid ${isFactual ? 'var(--success)' : 'var(--danger)'}; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 2rem;">${isFactual ? '✅' : '🚨'}</span>
          <div>
            <h4 style="margin: 0; font-size: 1.1rem; color: ${isFactual ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">
              ${isFactual ? 'Response Verified: Factually Accurate' : 'Hallucination Detected'}
            </h4>
            <p style="margin: 4px 0 0 0; font-size: 0.83rem; color: var(--text-muted);">
              ${isFactual ? 'All extracted claims match verified web evidence.' : 'One or more claims in the model answer failed factual verification.'}
            </p>
          </div>
        </div>

        <div style="text-align: right;">
          <div style="font-size: 1.4rem; font-weight: 800; color: ${avgClaimFactuality > 70 ? 'var(--success)' : 'var(--danger)'};">
            ${avgClaimFactuality}%
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">
            Claim Accuracy
          </div>
        </div>
      </div>

      <!-- Claims Breakdown Section -->
      <h4 style="font-size: 0.95rem; color: #fff; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
        <span>📋</span> Extracted Claims Breakdown (${claims.length})
      </h4>

      <div style="display: flex; flex-direction: column; gap: 1rem;">
  `;

  claims.forEach((item, i) => {
    const isClaimTrue = typeof item === 'object' ? item.factuality : item;
    const claimText = typeof item === 'object' ? item.claim : (info.claims[i]?.claim || `Claim #${i+1}`);
    const reasoning = typeof item === 'object' ? item.reasoning : '';
    const error = typeof item === 'object' ? item.error : '';
    const correction = typeof item === 'object' ? item.correction : '';
    const evidenceObj = evidences[i] || {};

    html += `
      <div style="padding: 1rem; border-radius: 10px; background: rgba(15, 23, 42, 0.6); border: 1px solid ${isClaimTrue ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.4)'};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px;">
          <div style="font-weight: 600; font-size: 0.9rem; color: #fff;">
            ${i + 1}. "${claimText}"
          </div>
          <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 4px; font-weight: 700; white-space: nowrap; ${isClaimTrue ? 'background: rgba(34, 197, 94, 0.2); color: var(--success);' : 'background: rgba(239, 68, 68, 0.2); color: var(--danger);'}">
            ${isClaimTrue ? '✓ VERIFIED FACT' : '✗ HALLUCINATION'}
          </span>
        </div>

        ${error ? `
          <div style="font-size: 0.8rem; color: var(--danger); margin-bottom: 6px; font-weight: 600;">
            ⚠️ Error: ${error}
          </div>
        ` : ''}

        ${reasoning ? `
          <div style="font-size: 0.83rem; color: var(--text-muted); margin-bottom: 8px; line-height: 1.4;">
            <strong>Analysis:</strong> ${reasoning}
          </div>
        ` : ''}

        ${correction ? `
          <div style="font-size: 0.83rem; color: var(--warning); background: rgba(245, 158, 11, 0.1); padding: 8px 12px; border-radius: 6px; border-left: 3px solid var(--warning); margin-bottom: 8px;">
            💡 <strong>Suggested Correction:</strong> ${correction}
          </div>
        ` : ''}

        ${evidenceObj.evidence || evidenceObj.source ? `
          <div style="font-size: 0.78rem; color: var(--text-dim); background: rgba(255, 255, 255, 0.03); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border);">
            🌐 <strong>Retrieved Evidence:</strong> "${evidenceObj.evidence || 'Source matched'}"
            ${evidenceObj.source ? ` <br><a href="${evidenceObj.source}" target="_blank" style="color: var(--primary); text-decoration: underline;">Source Link 🔗</a>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  resultsBox.innerHTML = html;
}
