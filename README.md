# Open Society Social Media

This repository hosts a small prototype of a Twitter‑style application built with
FastAPI and React.  Beyond code, it serves as a place to practise an **Open
Society** approach to development inspired by Karl Popper and David Deutsch.

Our goal is not only to improve the software, but also to refine our
*explanations* for why each piece exists.  Everything starts as a **conjecture**
and is open to **criticism**.  We keep our philosophy close to the code so that
contributions remain transparent and improvable.  Newcomers should read this
file first to understand the current outlook before proposing or criticising
changes.

## Philosophy

Software design here is always tentative. Inspired by Popper's critical
rationalism, each implementation choice is treated as a **conjecture** subject to
criticism. We aim to build clear explanations for why the current code exists.
See [`conjectures/`](conjectures/) for open proposals and
[`explanations.md`](explanations.md) for reasoning that has survived criticism.
Ideas that were explored but ultimately rejected are logged in
[`rejected-conjectures.md`](rejected-conjectures.md).

## Development Culture

1. **Conjecture First** – New ideas or features begin as conjectures.  Create a
   markdown file under [`conjectures/`](conjectures/) describing the problem it
   tries to solve and any early reasoning.
2. **Branches Reflect Conjectures** – When implementing a proposal, name the
   branch after the corresponding file in `conjectures/` so it is clear which
   idea the code relates to.
3. **Criticism is Collaboration** – Use the
   [`templates/critique_template.md`](templates/critique_template.md) when
   reviewing or questioning a conjecture.  Good criticism proposes alternatives
   or highlights flaws so we can improve the explanation.
4. **Evolving Explanations** – Significant insights are summarised in
   [`explanations.md`](explanations.md).  This living document records how our
   understanding grows over time.
5. **Reflect in the README** – When criticism leads to a fundamental change in
   direction, update this document so newcomers start from the latest
   perspective.
6. **Critique Before Merge** – Pull requests should include a completed
   `templates/critique_template.md` outlining raised concerns and how they were
   addressed. This keeps the history of criticism transparent.

## Getting Started

The backend runs with FastAPI and the frontend with React. To run the entire project (backend, CLIP models, and frontend) together, use:

```powershell
pip install -r requirements.txt
npm install
$env:NODE_OPTIONS="--openssl-legacy-provider"; npm run dev
```

This command will start:
- FastAPI backend (`app.py`) on port 8000
- CLIP fake news model (`src/clip_fake.py`) on port 8001
- CLIP hate speech model (`src/clip_hate.py`) on port 8002
- React frontend on port 3000

## Environment Setup

Copy `.env.example` to `.env` and adjust the values. At minimum set `JWT_SECRET` for token signing. Optionally set `TOKEN_MINUTES` to control the default expiry for access tokens.

## Running Tests

Use `pytest` to run backend tests. See `TESTING.md` for more information.

## For Agents

Conjecture: It would be useful to check out `AGENTS.md`.

## License

This project is released under the MIT License.  See [`LICENSE`](LICENSE) for details.

## System Requirements for OCR (pytesseract)

This project uses `pytesseract` (Python wrapper for Tesseract OCR) to extract text from images (e.g., memes or screenshots). You must install the Tesseract engine separately on your system.

### 🪟 For Windows Users

1. **Download Tesseract OCR** from:  
   [https://github.com/UB-Mannheim/tesseract/wiki)

2. **Install it** and **note the installation path**, e.g.:
   ```
   C:\Program Files\Tesseract-OCR\tesseract.exe
   ```

3. In your Python script (e.g. `clip_fake.py` or `clip_hate.py`), set the path:

   ```python
   import pytesseract
   pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
   ```

---

## 🚀 Running the Model APIs (Manual)

If you want to run the model APIs individually:

### Run Fake News Classifier (CLIP + pytesseract)
```powershell
uvicorn src.clip_fake:app --reload --port 8001
```

### Run Hate Speech Classifier (CLIP + pytesseract)
```powershell
uvicorn src.clip_hate:app --reload --port 8002
```

These APIs accept an uploaded image and return:
- Extracted text (via pytesseract)
- Label (e.g. "fake" or "hateful")
- Confidence score

Make sure to run the correct FastAPI file based on the model type (fake/hate) before testing through the frontend.
