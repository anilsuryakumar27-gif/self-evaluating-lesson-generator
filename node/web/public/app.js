/**
 * Frontend Application Controller for GenAI Content Evaluation Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
  const topicInput = document.getElementById('topicInput');
  const runBtn = document.getElementById('runBtn');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');
  const pipelineStatusBanner = document.getElementById('pipelineStatusBanner');
  const statusTitle = document.getElementById('statusTitle');
  const statusSubtitle = document.getElementById('statusSubtitle');
  const statusBadge = document.getElementById('statusBadge');
  const roundCardsContainer = document.getElementById('roundCardsContainer');
  const checkpointsGrid = document.getElementById('checkpointsGrid');
  const rubricScore = document.getElementById('rubricScore');
  const shippingBadge = document.getElementById('shippingBadge');
  const lessonContent = document.getElementById('lessonContent');
  const auditJson = document.getElementById('auditJson');
  const diffTimeline = document.getElementById('diffTimeline');
  const downloadLessonBtn = document.getElementById('downloadLessonBtn');

  let currentLessonMarkdown = '';
  let currentAuditData = null;

  // Initialize: load persisted data
  loadInitialData();

  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active', 'bg-indigo-600', 'text-white'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));

      btn.classList.add('active', 'bg-indigo-600', 'text-white');
      const tabId = btn.getAttribute('data-tab');
      if (tabId === 'lesson') document.getElementById('tabLesson').classList.remove('hidden');
      if (tabId === 'diffs') document.getElementById('tabDiffs').classList.remove('hidden');
      if (tabId === 'audit') document.getElementById('tabAudit').classList.remove('hidden');
      if (tabId === 'architecture') document.getElementById('tabArchitecture').classList.remove('hidden');
    });
  });

  // Quick topics
  document.querySelectorAll('.quick-topic').forEach(btn => {
    btn.addEventListener('click', () => {
      topicInput.value = btn.getAttribute('data-topic');
    });
  });

  // Run button
  runBtn.addEventListener('click', async () => {
    const topic = topicInput.value.trim() || 'Introduction to RAG';
    await executeAgenticLoop(topic);
  });

  // Download Markdown
  downloadLessonBtn.addEventListener('click', () => {
    if (!currentLessonMarkdown) return;
    const blob = new Blob([currentLessonMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topicInput.value.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  });

  async function loadInitialData() {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        currentLessonMarkdown = data.lesson;
        currentAuditData = data.audit;

        renderLesson(data.lesson);
        renderAudit(data.audit);
        renderScorecardFromAudit(data.audit);
        renderDiffTimeline(data.audit);
      }
    } catch (e) {
      console.warn('Initial data not loaded yet:', e);
    }
  }

  async function executeAgenticLoop(topic) {
    runBtn.disabled = true;
    runBtn.classList.add('opacity-75', 'cursor-not-allowed');
    btnText.textContent = 'Executing Loop...';
    btnIcon.textContent = '⏳';
    pipelineStatusBanner.classList.remove('hidden');

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      const data = await response.json();
      if (!data.success) {
        alert('Pipeline execution failed: ' + data.error);
        return;
      }

      // Animate the progression through rounds
      await animateEvents(data.events, data.result);

    } catch (err) {
      alert('Network or server error: ' + err.message);
    } finally {
      runBtn.disabled = false;
      runBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      btnText.textContent = 'Run Agentic Loop';
      btnIcon.textContent = '▶';
    }
  }

  async function animateEvents(events, result) {
    const iterationEvents = events.filter(e => e.type === 'ITERATION_COMPLETE');

    for (let i = 0; i < iterationEvents.length; i++) {
      const evt = iterationEvents[i];
      const iter = evt.iteration;

      statusTitle.textContent = `Completed Iteration ${iter}`;
      statusSubtitle.textContent = `Score: ${evt.evaluation.score} Checkpoints Cleared. Verdict: ${evt.evaluation.verdict}`;
      statusBadge.textContent = `ROUND ${iter}/${result.iterationsCount}`;

      renderScorecard(evt.evaluation);
      updateRoundCards(result.auditTrail.iterations, iter);
      await new Promise(r => setTimeout(r, 600));
    }

    // Final state
    currentLessonMarkdown = result.finalLesson;
    currentAuditData = result.auditTrail;

    renderLesson(result.finalLesson);
    renderAudit(result.auditTrail);
    renderDiffTimeline(result.auditTrail);

    statusTitle.textContent = `Pipeline Complete: ${result.status}`;
    statusSubtitle.textContent = `Autonomous loop converged in ${result.iterationsCount} iteration(s). Ready for production!`;
  }

  function renderScorecard(evalReport) {
    rubricScore.textContent = evalReport.score;
    if (evalReport.passed) {
      rubricScore.className = 'text-2xl font-black font-mono text-emerald-400';
      shippingBadge.className = 'px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      shippingBadge.textContent = 'APPROVED TO SHIP';
    } else {
      rubricScore.className = 'text-2xl font-black font-mono text-amber-400';
      shippingBadge.className = 'px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30';
      shippingBadge.textContent = 'NEEDS REVISION';
    }

    checkpointsGrid.innerHTML = evalReport.checkpoints.map(chk => {
      const isPass = chk.passed;
      const borderClass = isPass ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-rose-500/30 bg-rose-950/20';
      const badgeClass = isPass ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      const icon = isPass ? '✓' : '✖';

      return `
        <div class="border ${borderClass} rounded-xl p-4 transition">
          <div class="flex items-start justify-between gap-2 mb-2">
            <div>
              <span class="text-[10px] font-mono text-slate-500 uppercase">${chk.id}</span>
              <h4 class="text-sm font-semibold text-white">${chk.name}</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[11px] font-bold border ${badgeClass}">
              ${icon} ${isPass ? 'PASS' : 'FAIL'}
            </span>
          </div>
          <p class="text-xs text-slate-400 mb-2">${chk.reason}</p>
          ${!isPass && chk.remediation ? `
            <div class="mt-2 text-[11px] text-amber-300 bg-amber-950/40 border border-amber-500/20 rounded-lg p-2 flex items-start gap-1.5">
              <span>↳</span>
              <span><strong>Fix:</strong> ${chk.remediation}</span>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  function renderScorecardFromAudit(audit) {
    if (!audit.iterations || audit.iterations.length === 0) return;
    const lastIter = audit.iterations[audit.iterations.length - 1];
    renderScorecard({
      score: lastIter.score,
      passed: lastIter.passed,
      verdict: lastIter.verdict,
      checkpoints: lastIter.checkpoints
    });
    updateRoundCards(audit.iterations, audit.iterations.length);
  }

  function updateRoundCards(iterations, activeIter) {
    roundCardsContainer.innerHTML = iterations.map((it, idx) => {
      const isPast = idx + 1 <= activeIter;
      const isApproved = it.passed;
      const cardBorder = isApproved ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-slate-800 bg-slate-950';

      return `
        <div class="border ${cardBorder} rounded-xl p-3 text-xs">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-slate-300">Round ${it.iteration}</span>
            <span class="font-mono ${isApproved ? 'text-emerald-400 font-bold' : 'text-slate-400'}">${it.score}</span>
          </div>
          <div class="text-[10px] text-slate-500">
            Flesch-Kincaid: ${it.readabilityMetrics.fleschKincaidGrade} | Avg Words: ${it.readabilityMetrics.avgSentenceLength}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderDiffTimeline(audit) {
    if (!audit.iterations) return;
    diffTimeline.innerHTML = audit.iterations.map((it, idx) => {
      const failing = it.checkpoints.filter(c => !c.passed);
      return `
        <div class="border border-slate-800 bg-slate-950 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-white flex items-center gap-2">
              <span class="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">${it.iteration}</span>
              Iteration ${it.iteration}: ${it.verdict}
            </h4>
            <span class="text-[11px] font-mono text-slate-400">${it.score} Checks Passed</span>
          </div>
          ${failing.length > 0 ? `
            <div class="text-xs text-rose-400">
              <strong>Defects Identified:</strong>
              <ul class="list-disc pl-4 mt-1 space-y-0.5 text-[11px] text-slate-400">
                ${failing.map(f => `<li><strong class="text-rose-300">[${f.id}] ${f.name}:</strong> ${f.reason}</li>`).join('')}
              </ul>
            </div>
          ` : `
            <div class="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <span>✔</span> All 8 quality checkpoints cleared. Zero defects found. Approved to ship.
            </div>
          `}
        </div>
      `;
    }).join('');
  }

  function renderLesson(markdown) {
    if (window.marked) {
      lessonContent.innerHTML = marked.parse(markdown);
    } else {
      lessonContent.textContent = markdown;
    }
  }

  function renderAudit(audit) {
    auditJson.textContent = JSON.stringify(audit, null, 2);
  }
});
