document.getElementById('convertForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const bookingCode = document.getElementById('bookingCode').value.trim();
  const platformFrom = document.getElementById('platformFrom').value;
  const platformTo = document.getElementById('platformTo').value;
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = 'Converting...';

  try {
    const res = await fetch('/convert-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode, platformFrom, platformTo })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Conversion failed');
    resultDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  } catch (err) {
    resultDiv.textContent = err.message;
  }
});
