
#!/usr/bin/env python
import sys
import pandas as pd

def main():
    if len(sys.argv) != 5:
        print("Usage: merge_test_report.py TEST_1.xlsx TEST_2.xlsx TEST_3.xlsx OUTPUT.xlsx")
        sys.exit(1)

    in_test1, in_test2, in_test3, out_path = sys.argv[1:5]

    def read_any(path):
        try:
            if path.lower().endswith(".csv"):
                return pd.read_csv(path)
            return pd.read_excel(path)
        except Exception as e:
            print(f"Error reading file {path}: {e}")
            return pd.DataFrame()

    df1 = read_any(in_test1)
    df2 = read_any(in_test2)
    df3 = read_any(in_test3)

    # Merge on the shared keys "IP" and "Account Number"
    merged = pd.merge(df1, df2, on=["IP", "Account Number"], how="outer")
    merged = pd.merge(merged, df3, on=["IP", "Account Number"], how="outer")

    # Reorder to the required final layout
    final_columns = ["IP", "Account Number", "Value", "Advisory Fees", "Cash"]
    # Ensure all required columns exist, adding them with empty values if not
    for col in final_columns:
        if col not in merged.columns:
            merged[col] = None
    
    merged = merged[final_columns]

    with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
        merged.to_excel(writer, index=False, sheet_name="Merged_Test_Report")
    
    print(f"Successfully merged files into {out_path}")

if __name__ == "__main__":
    main()
