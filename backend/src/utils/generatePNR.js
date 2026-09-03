// Generates a 10-digit numeric PNR, similar in format to IRCTC's.
function generatePNR() {
  let pnr = '';
  for (let i = 0; i < 10; i++) {
    pnr += Math.floor(Math.random() * 10);
  }
  return pnr;
}

module.exports = generatePNR;
