# Open Society Social Media

This repository hosts a small prototype of a Twitter‑style application built with
FastAPI and React.  Beyond code, it serves as a place to practise an **Open
Society** approach to development inspired by Karl Popper and David Deutsch.

Our goal is not only to improve the software, but also to refine our
*explanations* for why each piece exists.  Everything starts as a **conjecture**
and is open to **criticism**.  We keep our philosophy close to the code so that
contributions remain transparent and improvable.

## Development Culture

1. **Conjecture First** – New ideas or features begin as conjectures.  Create a
   markdown file under [`conjectures/`](conjectures/) describing the problem it
   tries to solve and any early reasoning.
2. **Criticism is Collaboration** – Use the
   [`templates/critique_template.md`](templates/critique_template.md) when
   reviewing or questioning a conjecture.  Good criticism proposes alternatives
   or highlights flaws so we can improve the explanation.
3. **Evolving Explanations** – Significant insights are summarised in
   [`explanations.md`](explanations.md).  This living document records how our
   understanding grows over time.

## Getting Started

The backend runs with FastAPI and the frontend with React.  Basic commands:

```bash
# Backend
pip install -r requirements.txt
uvicorn app:app --reload

# Frontend
cd src
npm install
npm start
```

The React app expects `REACT_APP_API_URL` in your `.env` file to point at the
running FastAPI server (default `http://localhost:8000`).

Environment variables such as database URLs or secrets should be placed in a
local `.env` file.  An example configuration is provided in `.env.example`.
Copy this file to `.env` and adjust the values:

```bash
cp .env.example .env
# then edit JWT_SECRET, MONGO_URL and REACT_APP_API_URL as needed
```

## License

This project is released under the MIT License.  See [`LICENSE`](LICENSE) for
details.
