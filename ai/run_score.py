"""
Entry point: score new enrollment data using saved models.

Usage:
    cd openJKN
    python run_score.py <path_to_data.dta>
    python run_score.py <path_to_data.csv>

The backend team may also import and call score functions directly:

    from anomaly_detection.score import load_artifacts, score_dataframe, score_single

    # Load models once at startup
    artifacts = load_artifacts()

    # Score a batch
    result_df = score_dataframe(new_enrollment_df, artifacts)

    # Score a single record (for API endpoints)
    result = score_single({"PSTV01": "123", "PSTV04": "ANAK", ...}, artifacts)
"""

import os
import sys

# Silence TF before imports
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

try:
    import pandas as pd
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

    from anomaly_detection.config import OUTPUT_DIR as DEFAULT_OUTPUT_DIR
    from anomaly_detection.score import load_artifacts, score_dataframe
    from anomaly_detection.evaluate import print_summary
except Exception as e:
    sys.stderr.write(f"ERROR during script initialization: {str(e)}\n")
    sys.exit(1)

# Allow override via environment variable (for containerized environments)
OUTPUT_DIR = os.environ.get("OPENJKN_AI_OUTPUT_DIR", DEFAULT_OUTPUT_DIR)


def main():
    try:
        if len(sys.argv) < 2:
            sys.stderr.write("Usage: python run_score.py <data_file.dta|csv>\n")
            sys.exit(1)

        data_path = sys.argv[1]
        print(f"Loading data from: {data_path}")

        if data_path.endswith(".dta"):
            df_raw = pd.read_stata(data_path)
        elif data_path.endswith(".csv"):
            df_raw = pd.read_csv(data_path)
        else:
            sys.stderr.write("Supported formats: .dta, .csv\n")
            sys.exit(1)

        print(f"Loaded {len(df_raw):,} records\n")

        # Load saved models
        artifacts = load_artifacts()

        # Score
        df_scored = score_dataframe(df_raw, artifacts)

        # Save
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        out_path = os.path.join(OUTPUT_DIR, "scored_new_data.csv")
        df_scored.to_csv(out_path, index=False)
        print(f"\nScored data saved to: {out_path}")

        # Anomalies only
        anomalies = df_scored[df_scored["final_anomaly"] == 1]
        anom_path = os.path.join(OUTPUT_DIR, "anomalies_new_data.csv")
        anomalies.to_csv(anom_path, index=False)
        print(f"Anomalies saved to: {anom_path}")

        print_summary(df_scored, artifacts["threshold"])
    except Exception as e:
        sys.stderr.write(f"ERROR during script execution: {str(e)}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
