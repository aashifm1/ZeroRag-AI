// Handle Report Submission
document.getElementById("reportForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const report = {
    location: document.getElementById("location").value,
    nearby: document.getElementById("nearby").value,
    details: document.getElementById("details").value,
    name: document.getElementById("name").value || "Anonymous"
  };

  // Simulated AI Risk Score
  const riskLevel = Math.random() > 0.5 ? "High" : "Medium";

  alert(`✅ Report Submitted!\n\nLocation: ${report.location}\nType: ${report.nearby}\nDetails: ${report.details}\nName: ${report.name}\nAI Risk Score: ${riskLevel}`);

  // Placeholder for backend
  fetch("/api/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report)
  }).catch(err => console.error("Backend not connected:", err));
});

// AI Assist Simulation
document.getElementById("aiAssistBtn").addEventListener("click", () => {
  alert("🤖 AI Assist: Sensitive info redacted. Report auto-tagged for Anti-Ragging Cell.");
});

// Quick Contacts with Call
function contact(target) {
  let msg = "";
  let phone = "";

  switch (target) {
    case "authority":
      msg = "Calling College Authority...";
      phone = "+916369592479";
      break;
    case "cell":
      msg = "Contacting Anti-Ragging Cell...";
      phone = "+916369592479";
      break;
    case "boys":
      msg = "Alerting Boys Hostel Warden...";
      phone = "+916369592479";
      break;
    case "girls":
      msg = "Alerting Girls Hostel Warden...";
      phone = "+916369592479";
      break;
  }

  alert(`📞 ${msg}`);
  window.location.href = `tel:${phone}`;
}
