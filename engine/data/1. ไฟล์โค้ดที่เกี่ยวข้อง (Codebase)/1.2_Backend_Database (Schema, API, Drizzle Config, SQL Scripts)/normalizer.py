
import re

def normalize_query(text: str) -> str:
    text = text.lower()
    text = text.replace("-", "")
    text = text.replace("_", "")
    text = text.strip()
    text = re.sub(r"\s+", "", text)
    return text

if __name__ == "__main__":
    samples = ["NMAX 155","n-max155","Forza 350","PCX-160"]
    for s in samples:
        print(s, "->", normalize_query(s))
