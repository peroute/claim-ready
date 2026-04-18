"""Policy ingestion module.

Parses a claimant's insurance policy PDF and produces a list of
`PolicySection` chunks with embeddings, ready to be indexed for
retrieval against detected inventory items.

Strategy:
1. Pull text per-page via pypdf and join with double newlines.
2. Try a sequence of heading regexes (SECTION X, ARTICLE/PART X,
   N.M Title). Use the first pattern that fires at least 3 times
   to slice the document into titled sections.
3. If none of the patterns hit, fall back to fixed ~400-word
   chunks with a 50-word overlap.
4. Embed each section's body with the shared text encoder.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

from pypdf import PdfReader

from embeddings import embed_text
from schemas import PolicySection

HEADING_PATTERNS: list[str] = [
    # SECTION I  /  SECTION 4. - Property Coverage
    r"(?im)^\s*SECTION\s+([IVX\d]+[\.\:]?)\s*[-\u2013\u2014]?\s*(.*?)$",
    # ARTICLE 5  /  PART II — Definitions
    r"(?im)^\s*(?:ARTICLE|PART)\s+([IVX\d]+[\.\:]?)\s*[-\u2013\u2014]?\s*(.*?)$",
    # 4.2 Additional Living Expenses
    r"(?m)^\s*(\d+\.\d+)\s+(.+?)$",
]

CHUNK_WORDS: int = 400
CHUNK_OVERLAP: int = 50
MIN_HEADING_MATCHES: int = 3


def _extract_text(pdf_path: str) -> str:
    try:
        reader = PdfReader(pdf_path)
    except Exception as e:
        print(f"[ingest_policy] failed to open PDF: {e}")
        raise

    pages: list[str] = []
    for i, page in enumerate(reader.pages):
        try:
            pages.append(page.extract_text() or "")
        except Exception as e:
            print(f"[ingest_policy] page {i} extract failed: {e}")
            pages.append("")
    return "\n\n".join(pages)


def _slugify(s: str, max_len: int = 40) -> str:
    s = re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_").lower()
    return s[:max_len] if s else "untitled"


def _clean_number(num: str) -> str:
    """Normalize a captured heading number for use in an id (e.g. '4.2.', 'I:' -> '4.2', 'i')."""
    return num.strip().rstrip(".:").lower()


def _split_by_heading(text: str, pattern: str) -> list[PolicySection] | None:
    matches = list(re.finditer(pattern, text))
    if len(matches) < MIN_HEADING_MATCHES:
        return None

    sections: list[PolicySection] = []
    seen_ids: set[str] = set()

    for i, m in enumerate(matches):
        groups = [g for g in m.groups() if g is not None]
        if len(groups) >= 2:
            number_raw = groups[0].strip().rstrip(".:")
            title = groups[1].strip()
        elif len(groups) == 1:
            number_raw = ""
            title = groups[0].strip()
        else:
            number_raw = ""
            title = m.group(0).strip()

        body_start = m.end()
        body_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[body_start:body_end].strip()

        heading_text = (f"{number_raw} {title}".strip() if number_raw else title) or "Untitled"

        base_id = (
            f"section_{_clean_number(number_raw)}"
            if number_raw
            else f"section_{_slugify(heading_text)}"
        )
        sec_id = base_id
        suffix = 2
        while sec_id in seen_ids:
            sec_id = f"{base_id}_{suffix}"
            suffix += 1
        seen_ids.add(sec_id)

        sections.append(
            PolicySection(
                section_id=sec_id,
                title=heading_text,
                text=body,
                embedding=embed_text(body) if body else None,
            )
        )

    return sections


def _chunk_fallback(text: str) -> list[PolicySection]:
    words = text.split()
    if not words:
        return []

    sections: list[PolicySection] = []
    stride = CHUNK_WORDS - CHUNK_OVERLAP
    i = 0
    idx = 0
    while i < len(words):
        chunk_words = words[i : i + CHUNK_WORDS]
        chunk_text = " ".join(chunk_words).strip()
        sections.append(
            PolicySection(
                section_id=f"chunk_{idx:04d}",
                title="Policy Excerpt",
                text=chunk_text,
                embedding=embed_text(chunk_text) if chunk_text else None,
            )
        )
        idx += 1
        if i + CHUNK_WORDS >= len(words):
            break
        i += stride
    return sections


def ingest_policy(pdf_path: str) -> list[PolicySection]:
    """Parse a policy PDF into embedded `PolicySection`s.

    Args:
        pdf_path: Path to the policy PDF on disk.

    Returns:
        List of `PolicySection` objects, each with a populated embedding.
    """
    if not Path(pdf_path).is_file():
        raise FileNotFoundError(f"Policy PDF not found: {pdf_path}")

    text = _extract_text(pdf_path)
    if not text.strip():
        print("[ingest_policy] WARNING: no text extracted from PDF")
        return []

    for pattern in HEADING_PATTERNS:
        result = _split_by_heading(text, pattern)
        if result is not None:
            return result

    return _chunk_fallback(text)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ingest_policy.py <pdf_path>")
        sys.exit(1)

    pdf_arg = sys.argv[1]
    sections = ingest_policy(pdf_arg)

    print(f"Sections: {len(sections)}")
    for s in sections[:3]:
        preview = re.sub(r"\s+", " ", s.text)[:100]
        print(f"  - {s.section_id} | {s.title!r}")
        print(f"      {preview!r}")
