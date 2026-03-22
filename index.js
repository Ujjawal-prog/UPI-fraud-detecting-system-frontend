let generatedOTP, fraudReports = JSON.parse(localStorage.getItem('fraudReports')) || [],
    users = JSON.parse(localStorage.getItem('users')) || {'demoUser': {score: 125, badge: 'silver', reports: 3}, 'user2': {score: 250, badge: 'gold', reports: 8}},
    currentUser = 'demoUser', networkGraph = [
    {id: 'scam1@fake', connected: ['phish2@ybl'], risk: 95},
    {id: 'phish2@ybl', connected: ['scam1@fake', 'fake3@paytm'], risk: 85},
    {id: 'fake3@paytm', connected: ['phish2@ybl'], risk: 75}
];

function saveData() {
    localStorage.setItem('fraudReports', JSON.stringify(fraudReports));
    localStorage.setItem('users', JSON.stringify(users));
}

function checkFraud() {
    let upi = document.getElementById("upi").value.toLowerCase();
    let amount = parseFloat(document.getElementById("amount").value) || 0;
    let result = document.getElementById("result");
    
    let riskScore = 25;
    if(amount > 50000) riskScore += 40;
    else if(amount > 10000) riskScore += 25;
    
    let matching = fraudReports.find(r => r.upi.toLowerCase() === upi);
    if(matching) riskScore += 35;
    
    let graphNode = networkGraph.find(n => n.id === upi);
    if(graphNode) riskScore += 25;
    
    let className = riskScore > 70 ? 'result-high' : riskScore > 40 ? 'result-medium' : 'result-safe';
    result.className = className;
    result.innerHTML = `Risk: ${riskScore.toFixed(0)}/100 ${getEmoji(riskScore)}`;
}

function getEmoji(score) {
    return score > 70 ? '🚨 HIGH RISK' : score > 40 ? '⚠️ MEDIUM' : '✅ SAFE';
}

function sendOTP() { 
    generatedOTP = Math.floor(1000 + Math.random()*9000); 
    alert(`OTP sent: ${generatedOTP}`); 
}

function verifyOTP() { 
    let otp = document.getElementById("otp").value;
    document.getElementById("result").innerHTML = 
        parseInt(otp) === generatedOTP ? "✅ OTP Verified!" : "❌ Wrong OTP";
    document.getElementById("result").className = parseInt(otp) === generatedOTP ? 'result-safe' : 'result-high';
}

function scanScreenshot(event) {
    const file = event.target.files[0];
    if(file) {
        setTimeout(() => {
            document.getElementById("scanResult").innerHTML = 
                '<div class="result-high">📸 Found scam1@fake → 95% RISK</div>';
            document.getElementById("upi").value = 'scam1@fake';
            checkFraud();
        }, 1500);
    }
}

function showReportForm() { 
    let form = document.getElementById('reportForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none'; 
}

function submitFraudReport() {
    const upi = document.getElementById('fraudUpi').value;
    const desc = document.getElementById('fraudDesc').value;
    if(!upi || !desc) return alert('Complete all fields');
    
    let report = fraudReports.find(r => r.upi.toLowerCase() === upi.toLowerCase());
    if(report) {
        report.count++;
    } else {
        fraudReports.push({upi, desc, count: 1});
        users[currentUser].score += 50;
        users[currentUser].reports++;
    }
    saveData();
    loadFraudList();
    loadLeaderboard();
    alert('✅ Report Added! +50 points');
    document.getElementById('fraudUpi').value = '';
    document.getElementById('fraudDesc').value = '';
}

function loadFraudList() {
    document.getElementById('fraudList').innerHTML = fraudReports.slice(-3).map(r => 
        `<div class="network-node node-${r.count > 2 ? 'high-risk' : 'risky'}">${r.upi} (${r.count})</div>`
    ).join('') || '<div style="color:#64748b;">No reports yet</div>';
}

function loadNetworkGraph() {
    document.getElementById('networkGraph').innerHTML = networkGraph.map(n => 
        `<div class="network-node ${n.risk > 80 ? 'node-high-risk' : 'node-risky'}" 
             onclick="document.getElementById('upi').value='${n.id}'; checkFraud();">
            ${n.id}
        </div>`
    ).join('');
}

function loadLeaderboard() {
    const sorted = Object.entries(users).sort((a,b) => b[1].score - a[1].score);
    const scrollContent = sorted.map(([user, data], i) => 
        `<div class="leader-item">
            <div class="rank-badge rank-${i+1}">${i+1}</div>
            <span>${user}</span>
            <span>${data.score}pts <span class="badge ${data.badge}">${data.badge.toUpperCase()}</span></span>
        </div>`
    ).join('');
    document.getElementById('leaderScroll').innerHTML = scrollContent + scrollContent;
    document.getElementById('userScore').textContent = users[currentUser].score;
}

function loadPredictions() {
    const alerts = [
        '⚠️ Friday evenings: +45% phishing detected',
        '🚨 Delhi: 23 new scams today',
        '📍 Unknown locations: High risk now',
        '🔥 scam1@fake active in your area'
    ];
    document.getElementById('predictions').innerHTML = 
        `<div style="padding:12px; background:rgba(245,158,11,0.1); border-radius:10px; border-left:4px solid #f59e0b;">
            ${alerts[Math.floor(Math.random()*alerts.length)]}
        </div>`;
}

function startVoiceControl() {
    if('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.onresult = (e) => {
            const cmd = e.results[0][0].transcript.toLowerCase();
            if(cmd.includes('check') || cmd.includes('scan')) {
                document.getElementById('screenshot').click();
            }
        };
        recognition.start();
    } else {
        alert('Voice works best in Chrome');
    }
}

// Initialize everything
loadFraudList();
loadNetworkGraph();
loadLeaderboard();
loadPredictions();
setInterval(loadPredictions, 25000);