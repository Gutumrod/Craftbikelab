# Shop Phase 1 Dry-Run Package

This folder contains review-only artifacts for CraftBikeLab Shop Phase 1.

Run from repo root:

```powershell
python tools/shop-phase1-dry-run/build_dry_run.py
```

The script reads local model files, the public CSV export of the capture sheet,
and live `model_aliases` through the anon Supabase key. It does not write to
Supabase or Google Sheets.
