
export const README_CONTENT_3M_CASH = `
# 3M Cash — About this report

**Purpose**  
This report analyzes all **managed** client accounts and isolates **advisor-directed** accounts to determine how much **cash** should be reserved to cover **advisory fees** for the next **3** and **6 months**.

**What it looks at**
- **Universe:** All managed accounts; explicitly isolates **advisor-directed** accounts.
- **Periodics:** Ingests all **periodic instructions** (e.g., standing ACH, checks, wires) including **amount**, **frequency**, and **next due date**.
- **Cash & Money Markets:** Locates current **cash** and **money market** balances within each account.
- **Advisory Fees:** Uses each account’s **fee rate** and **billing frequency** to compute the monthly advisory fee.

---

_Next: we will add the **How to run** instructions (file inputs, validation, and expected run order) in the Instructions section below._
`;
