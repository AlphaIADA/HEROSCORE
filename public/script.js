document.getElementById('convertForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const bookingCode = document.getElementById('bookingCode').value.trim();
  const platformFrom = document.getElementById('platformFrom').value;
  const platformTo = document.getElementById('platformTo').value;
  const statusDiv = document.getElementById('result');
  statusDiv.textContent = 'Converting...';

  fetch('/convert-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platformFrom, platformTo, bookingCode })
  })
    .then(res => res.json())
    .then(data => {
      console.log('Response from server:', data);
      if (data.error) {
        statusDiv.textContent = 'Conversion failed: ' + data.error;
      } else {
        statusDiv.textContent = 'Conversion successful ✅';
        statusDiv.innerHTML += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      }
    })
    .catch(err => {
      statusDiv.textContent = err.message;
    });
});

document.getElementById('placeBetBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  const bookingCode = document.getElementById('bookingCode').value.trim();
  const platformFrom = document.getElementById('platformFrom').value;
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = 'Placing bet...';

  try {
    const res = await fetch('/place-bet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode, platformFrom })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Bet placement failed');
    resultDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  } catch (err) {
    resultDiv.textContent = err.message;
  }
});
