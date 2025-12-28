import os
from collections import defaultdict
from pypdf import PdfReader
from tqdm import tqdm
import camelot
import pandas as pd

# ---------------- CONFIG ----------------
os.environ["GHOSTSCRIPT_PATH"] = r"C:\Program Files\gs\gs10.06.0\bin\gswin64c.exe"

PDF_PATH = "input/groundwater.pdf"
OUTPUT_CSV = "output/groundwater_2015_2024.csv"

BATCH_SIZE = 10
START_PAGE = 1
CUTOFF_YEAR = 2015        # keep data >= 2015
STOP_ON_OLDER = True      # stop as soon as older data is found

# ---------------- INIT ----------------
os.makedirs("output", exist_ok=True)

reader = PdfReader(PDF_PATH)
TOTAL_PAGES = len(reader.pages)

seen_blocks = defaultdict(set)    # district -> set(blocks)
state_counter = defaultdict(int)  # state -> running counter

header_written = False
stop_extraction = False

# ---------------- PROCESS ----------------
for start in tqdm(range(START_PAGE, TOTAL_PAGES + 1, BATCH_SIZE)):
    if stop_extraction:
        break

    end = min(start + BATCH_SIZE - 1, TOTAL_PAGES)
    pages = f"{start}-{end}"

    try:
        tables = camelot.read_pdf(
            PDF_PATH,
            pages=pages,
            flavor="stream",
            strip_text="\n",
            row_tol=12
        )
    except Exception as e:
        print(f"⚠️ Camelot failed on pages {pages}: {e}")
        continue

    rows_out = []

    for table in tables:
        df = table.df
        if df.empty:
            continue

        # Basic cleanup
        df = df[df.iloc[:, 0].str.strip() != ""]
        df = df[~df.iloc[:, 0].str.contains("January", na=False)]

        for _, r in df.iterrows():
            cells = [c for c in r.tolist() if c and c.strip()]
            if len(cells) < 6:
                continue

            state = cells[0].strip()
            district = cells[1].strip()
            block = cells[2].strip()

            # Collect numeric tail (ignore village)
            tail = []
            for c in cells[3:]:
                tail.extend(c.split("\n"))

            if len(tail) < 4:
                continue

            latitude = tail[-4].strip()
            longitude = tail[-3].strip()
            date = tail[-2].strip()
            wl = tail[-1].strip()

            # -------- DATE PARSING (DD-MM-YY) --------
            try:
                yy = int(date.split("-")[-1])
                year = 2000 + yy if yy < 100 else yy
            except Exception:
                continue

            # -------- YEAR FILTER --------
            if year < CUTOFF_YEAR:
                print(f"🛑 Reached year {year} (< {CUTOFF_YEAR}). Stopping extraction.")
                stop_extraction = True
                break

            # -------- 5 BLOCK RULE --------
            if block not in seen_blocks[district]:
                if len(seen_blocks[district]) >= 5:
                    continue
                seen_blocks[district].add(block)

            # -------- station_id --------
            state_key = state.replace(" ", "")
            state_counter[state_key] += 1
            station_id = f"{state_key}{state_counter[state_key]}"

            rows_out.append([
                station_id,
                state,
                district,
                block,
                latitude,
                longitude,
                date,
                wl
            ])

        if stop_extraction:
            break

    # -------- WRITE STREAM --------
    if rows_out:
        out_df = pd.DataFrame(
            rows_out,
            columns=[
                "station_id",
                "STATE_UT",
                "DISTRICT",
                "BLOCK",
                "LATITUDE",
                "LONGITUDE",
                "DATE",
                "WL_MBGL",
            ]
        )

        out_df.to_csv(
            OUTPUT_CSV,
            mode="a",
            index=False,
            header=not header_written
        )

        header_written = True

print("✅ EXTRACTION COMPLETE (2015–2024)")
print(f"📄 Output saved to: {OUTPUT_CSV}")
