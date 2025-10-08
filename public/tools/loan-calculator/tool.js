function initTool() {
    const calculateBtn = document.getElementById('calculate-btn');
    const loanAmountInput = document.getElementById('loan-amount');
    const interestRateInput = document.getElementById('interest-rate');
    const loanTermInput = document.getElementById('loan-term');
    const monthlyPaymentEl = document.getElementById('monthly-payment');
    const totalPrincipalEl = document.getElementById('total-principal');
    const totalInterestEl = document.getElementById('total-interest');

    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }

    function calculateLoan() {
        const principal = parseFloat(loanAmountInput.value);
        const annualInterestRate = parseFloat(interestRateInput.value);
        const years = parseInt(loanTermInput.value, 10);
        let monthlyPayment;

        if (isNaN(principal) || isNaN(annualInterestRate) || isNaN(years) || principal <= 0 || annualInterestRate <= 0 || years <= 0) {
            alert('Please enter valid, positive numbers for all fields.');
            return;
        }

        const monthlyInterestRate = annualInterestRate / 100 / 12;
        const numberOfPayments = years * 12;

        if (monthlyInterestRate === 0) { // Interest-free loan
             monthlyPayment = principal / numberOfPayments;
        } else {
            monthlyPayment = principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
        }

        const totalPayment = monthlyPayment * numberOfPayments;
        const totalInterest = totalPayment - principal;

        monthlyPaymentEl.textContent = formatCurrency(monthlyPayment);
        totalPrincipalEl.textContent = formatCurrency(principal);
        totalInterestEl.textContent = formatCurrency(totalInterest);
    }

    calculateBtn.addEventListener('click', calculateLoan);

    // Set some default values and calculate on load
    loanAmountInput.value = '250000';
    interestRateInput.value = '6.5';
    loanTermInput.value = '30';
    calculateLoan();
}
