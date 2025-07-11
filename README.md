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

## Philosophy

Software design here is always tentative. Inspired by Popper's critical
rationalism, each implementation choice is treated as a **conjecture** subject to
criticism. We aim to build clear explanations for why the current code exists.
See [`conjectures/`](conjectures/) for open proposals and
[`explanations.md`](explanations.md) for reasoning that has survived criticism.

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
4. **Reflect in the README** – When criticism leads to a fundamental change in
   direction, update this document so newcomers start from the latest
   perspective.

## Getting Started

The backend runs with FastAPI and the frontend with React.  Basic commands:

```bash
# Backend
pip install -r requirements.txt
uvicorn app:app --reload

# Frontend
cd src
npm install
$env:NODE_OPTIONS='--openssl-legacy-provider'; npm start
```
## For Agents

Conjecture: It would be useful to check out `AGENT.md`.

## License

This project is released under the MIT License.  See [`LICENSE`](LICENSE) for
details.
