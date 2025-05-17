document.addEventListener("DOMContentLoaded", function () {
    const sliders = {
        Food: document.getElementById("food-slider"),
        Rent: document.getElementById("rent-slider"),
        Entertainment: document.getElementById("entertainment-slider")
    };

    const labels = {
        Food: document.getElementById("food-label"),
        Rent: document.getElementById("rent-label"),
        Entertainment: document.getElementById("entertainment-label")
    };

    const bars = {
        Food: document.getElementById("food-bar"),
        Rent: document.getElementById("rent-bar"),
        Entertainment: document.getElementById("entertainment-bar")
    };

    const summaryBar = document.getElementById("summary-bar");
    const summaryText = document.getElementById("summary-text");

    const expenses = [];

    // --- عناصر الفاتورة ---
    const receiptBody = document.getElementById("receipt-body");
    const totalFood = document.getElementById("total-food");
    const totalRent = document.getElementById("total-rent");
    const totalEntertainment = document.getElementById("total-entertainment");

    // --- Modal ---
    const modal = document.getElementById("expenseModal");
    const saveBtn = document.getElementById("saveExpenseBtn");
    const closeBtn = document.getElementById("closeModalBtn");
    const expenseNoteInput = document.getElementById("expenseNote");
    const errorMessage = document.getElementById("error-message");

    let currentCategory = null;

    // --- تحديث السلايدرز ---
    Object.keys(sliders).forEach(category => {
        const slider = sliders[category];
        const label = labels[category];

        slider.addEventListener("input", () => {
            const value = Number(slider.value);
            label.textContent = `Value: $${value}`;
            const budget = category === "Rent" ? 1500 : category === "Entertainment" ? 500 : 1000;
            const percentage = Math.min((value / budget) * 100, 100);

            bars[category].style.width = `${percentage}%`;
            bars[category].textContent = `${percentage.toFixed(0)}%`;

            if (percentage >= 100) {
                bars[category].style.backgroundColor = "#d9534f";
            } else {
                bars[category].style.backgroundColor = "";
            }

            // تحديث ARIA لشريط التقدم
            bars[category].parentElement.setAttribute('aria-valuenow', percentage);
        });
    });

    // --- أزرار الإضافة ---
    document.querySelectorAll(".add-expense-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            currentCategory = btn.getAttribute("data-category");
            expenseNoteInput.focus();
            modal.style.display = "block";
        });
    });

    // --- حفظ المصروف ومعالجة Validation ---
    saveBtn.addEventListener("click", () => {
        const amount = Number(sliders[currentCategory].value);
        const note = expenseNoteInput.value.trim();

        if (amount <= 0) {
            errorMessage.textContent = "Please select a valid amount greater than $0.";
            expenseNoteInput.setAttribute("aria-invalid", "true");
            return;
        }

        if (!note) {
            errorMessage.textContent = "Please enter a note for this expense.";
            expenseNoteInput.focus();
            expenseNoteInput.setAttribute("aria-invalid", true);
            return;
        } else {
            errorMessage.textContent = "";
            expenseNoteInput.setAttribute("aria-invalid", false);
        }

        const now = new Date().toLocaleString();

        expenses.push({
            category: currentCategory,
            amount,
            note,
            time: now
        });

        const budget = currentCategory === "Rent" ? 1500 : currentCategory === "Entertainment" ? 500 : 1000;
        const percentage = Math.min((amount / budget) * 100, 100);
        bars[currentCategory].style.width = `${percentage}%`;
        bars[currentCategory].textContent = `${percentage.toFixed(0)}%`;
        bars[currentCategory].style.backgroundColor = percentage >= 100 ? "#d9534f" : "";

        bars[currentCategory].parentElement.setAttribute("aria-valuenow", percentage);

        alert(`Added $${amount} (${note}) to ${currentCategory}`);
        updateSummary();
        updateReceipt();
        modal.style.display = "none";
        expenseNoteInput.value = "";
    });

    // --- إغلاق النافذة + تنظيف التركيز ---
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
        expenseNoteInput.value = "";
        expenseNoteInput.removeAttribute("aria-invalid");
        errorMessage.textContent = "";
    });

    // --- تحديث الملخص ---
    function updateSummary() {
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalBudget = 3000;
        const percentage = Math.min((totalSpent / totalBudget) * 100, 100);

        summaryBar.style.width = `${percentage}%`;
        summaryBar.textContent = `${percentage.toFixed(0)}%`;
        summaryBar.style.backgroundColor = percentage >= 100 ? "#d9534f" : "";
        summaryBar.parentElement.setAttribute("aria-valuenow", percentage);

        summaryText.textContent = `Total Spent: $${totalSpent} / $${totalBudget}`;
    }

    // --- تحديث الفاتورة ---
    function updateReceipt() {
        receiptBody.innerHTML = ""; // مسح القديم

        const foodTotal = expenses.filter(e => e.category === 'Food').reduce((sum, e) => sum + e.amount, 0);
        const rentTotal = expenses.filter(e => e.category === 'Rent').reduce((sum, e) => sum + e.amount, 0);
        const entTotal = expenses.filter(e => e.category === 'Entertainment').reduce((sum, e) => sum + e.amount, 0);

        totalFood.textContent = `$${foodTotal}`;
        totalRent.textContent = `$${rentTotal}`;
        totalEntertainment.textContent = `$${entTotal}`;

        expenses.forEach((e, i) => {
            const tr = document.createElement("tr");
            const budget = e.category === "Rent" ? 1500 : e.category === "Entertainment" ? 500 : 1000;
            const percentage = Math.min((e.amount / budget) * 100, 100);
            const status = percentage >= 100 ? '🔴 Over Budget' : percentage >= 70 ? '🟡 Warning' : '🟢 Safe';
            tr.className = percentage >= 100 ? "over-budget" : "";

            tr.innerHTML = `
                <td>${i + 1}</td>
                <td>${e.category}</td>
                <td>$${e.amount}</td>
                <td>${e.note}</td>
                <td>${e.time}</td>
                <td>${status}</td>
            `;
            receiptBody.appendChild(tr);
        });
    }

    // --- عرض الفاتورة ---
    document.getElementById("receipt-button").addEventListener("click", () => {
        if (expenses.length === 0) {
            alert("No expenses yet.");
            return;
        }
        document.getElementById("receipt-list").style.display = "block";
        updateReceipt(); // تحديث الفاتورة عند الضغط
    });

    // --- طباعة ---
    document.getElementById("printReceiptBtn").addEventListener("click", () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Print Receipt</title>');
        printWindow.document.write('<link rel="stylesheet" href="style.css">');
        printWindow.document.write('</head><body>');
        printWindow.document.write(document.querySelector(".receipt-table").outerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    });

    // --- تنزيل CSV ---
    document.getElementById("downloadCSVBtn").addEventListener("click", () => {
        let csv = "Category,Amount,Note,Date\n";
        expenses.forEach(e => {
            csv += `"${e.category}","$${e.amount}","${e.note}","${e.time}"\n`;
        });
        downloadFile(csv, "invoice.csv", "text/csv");
    });

    // --- تنزيل PDF ---
    document.getElementById("downloadPDFBtn").addEventListener("click", () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let rows = [];
        expenses.forEach(e => {
            rows.push([e.category, `$${e.amount}`, e.note, e.time]);
        });

        doc.setFontSize(16);
        doc.text("🧾 Receipt", 14, 20);

        doc.autoTable({
            head: [['Category', 'Amount', 'Note', 'Date']],
            body: rows,
            startY: 30,
            theme: 'striped',
            styles: { fontSize: 10 },
            headStyles: { fillColor: [41, 79, 117] }
        });

        doc.save("invoice.pdf");
    });

    function downloadFile(content, filename, mimeType) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([content], { type: mimeType }));
        a.download = filename;
        a.click();
    }
});