let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let limit = localStorage.getItem("limit") || 0;
let chart;

function save() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

document.getElementById("limit").addEventListener("change", function () {
    limit = Number(this.value);
    localStorage.setItem("limit", limit);
});

function addExpense() {
    let amount = document.getElementById("amount").value;
    let category = document.getElementById("category").value;

    if (amount === "") {
        alert("Enter amount!");
        return;
    }

    let today = new Date().toISOString().split("T")[0];

    expenses.push({
        amount: Number(amount),
        category: category,
        date: today
    });

    save();
    display();

    document.getElementById("amount").value = "";
}

function deleteExpense(i) {
    expenses.splice(i, 1);
    save();
    display();
}

function display(data = expenses) {
    let list = document.getElementById("list");
    let total = document.getElementById("total");
    let summary = document.getElementById("summary");

    list.innerHTML = "";
    summary.innerHTML = "";

    let sum = 0;
    let categoryData = {};
    let dailyData = {};
    let today = new Date().toISOString().split("T")[0];
    let todayTotal = 0;

    data.forEach((e, i) => {
        sum += e.amount;

        if (e.date === today) {
            todayTotal += e.amount;
        }

        categoryData[e.category] =
            (categoryData[e.category] || 0) + e.amount;

        dailyData[e.date] =
            (dailyData[e.date] || 0) + e.amount;

        let div = document.createElement("div");
        div.className = "expense";

        div.innerHTML = `
        ₹${e.amount} - ${e.category}
        <button onclick="deleteExpense(${i})">❌</button>
        `;

        list.appendChild(div);
    });

    total.innerText = sum;

    for (let cat in categoryData) {
        let percent = Math.round((categoryData[cat] / sum) * 100);
        let bar = "🟩".repeat(Math.max(1, Math.floor(percent / 10)));

        summary.innerHTML += `${cat}: ₹${categoryData[cat]} (${percent}%) ${bar}<br>`;
    }

    summary.innerHTML += `<br><b>📅 Today: ₹${todayTotal}</b>`;

    if (limit > 0 && todayTotal > limit) {
        summary.innerHTML += `<br><span style="color:red;">⚠ Limit Exceeded!</span>`;
    }

    drawChart(dailyData);
}

function filterByDate() {
    let selected = document.getElementById("filterDate").value;

    if (!selected) {
        alert("Select a date!");
        return;
    }

    let filtered = expenses.filter(e => e.date === selected);
    display(filtered);
}

function downloadCSV() {
    let csv = "Amount,Category,Date\n";

    expenses.forEach(e => {
        csv += `${e.amount},${e.category},${e.date}\n`;
    });

    let blob = new Blob([csv], { type: "text/csv" });
    let link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "expenses.csv";
    link.click();
}

function drawChart(dailyData) {
    let ctx = document.getElementById("chart").getContext("2d");

    let labels = Object.keys(dailyData);
    let values = Object.values(dailyData);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "📈 Daily Expenses",
                data: values,
                fill: false,
                tension: 0.3
            }]
        }
    });
}

display();