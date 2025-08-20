
export const README_CONTENT_3M_CASH = `
# 3M Cash — About this report

**Purpose**  
This report analyzes all **managed** client accounts and isolates **advisor-directed** accounts to determine how much **cash** should be reserved to cover **advisory fees** for the next **3** and **6 months**.

**What it looks at**
- **Universe:** All managed accounts; explicitly isolates **advisor-directed** accounts.
- **Periodics:** Ingests all **periodic instructions** (e.g., standing ACH, checks, wires) including **amount**, **frequency**, and **next due date**.
- **Cash & Money Markets:** Locates current **cash** and **money market** balances within each account.
- **Advisory Fees:** Uses each account’s **fee rate** and **billing frequency** to compute the monthly advisory fee.

**What it calculates**
- **Monthly Advisory Fee** per account
- **3‑Month Cash Need** (3 × monthly advisory fee)
- **6‑Month Cash Need** (6 × monthly advisory fee)
- **Surplus / Shortfall** vs. current cash & money market balances
- **Next Periodic Date** to highlight upcoming draws
- **Notes** for exceptions or missing data

**Expected output columns**
\`Account\` · \`Owner\` · \`Current Cash/MM\` · \`Monthly Advisory Fee\` · \`3‑Mo Need\` · \`6‑Mo Need\` · \`Surplus/Shortfall\` · \`Next Periodic Date\` · \`Notes\`

**Key assumptions**
- Billing is based on the **current billed market value** and the account’s **fee schedule** (bps) prorated to a **monthly** amount.
- Periodic instructions are considered **cash outflows** and displayed for awareness; they do **not** reduce the fee need unless explicitly modeled in a subsequent step.
- Money market positions are treated as part of **available cash**.
- If required data is missing (fee rate, owner, periodic details), the row is flagged in **Notes**.

**Data needed**
- Managed & advisor‑directed account flags
- Fee rates (bps) and billing frequency
- Current market values and cash/MM balances
- Periodic instruction amounts, frequency, and next date

---

_Next: we will add the **How to run** instructions (file inputs, validation, and expected run order) in the Instructions section below._
`;
