import os
os.environ["GHOSTSCRIPT_PATH"] = r"C:\Program Files\gs\gs10.06.0\bin\gswin64c.exe"

import camelot

tables = camelot.read_pdf(
    "input/groundwater.pdf",
    pages="1",
    flavor="stream",
    edge_tol=500
)

tables[0].to_csv("debug_raw_page1.csv")
print("Saved raw extraction to debug_raw_page1.csv")
