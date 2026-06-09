 ![Logo](./public/stigui-border-150.png)

A simple web application for exploring and editing [DISA Security Technical Implementation Guides (STIGs)](https://public.cyber.mil/stigs/compilations/).

![Demo](./public/stigui.gif)

STIGUI lets you browse the full DISA STIG library, export individual STIGs, and build & edit checklists — all in your browser. Edits are stored locally in IndexedDB; there are **no external network requests** to any third-party tracker or analytics service, and the app ships as a fully static site.

## Features

### Browse & explore STIGs

- **Browse the library:** Search and sort the full collection of DISA STIGs (by id, title, version, and date).
- **View a STIG:** Inspect every rule with severity badges, filter rules by severity, and read the full check and fix text for any rule.
- **Classifications:** Switch a STIG's view between **Public**, **Classified**, and **Sensitive** profiles.
- **Export:** Download a STIG as **XML**, **JSON**, or **CSV**.

### Build & edit checklists

Create a checklist from any STIG (via **Edit** on a STIG page) and refine it in the editor:

- **Editable title** — rename the checklist inline.
- **Target metadata** — edit host name, IP/MAC, FQDN, role, technology area, web-DB details, comments, and classification in a collapsible Metadata panel.
- **Per-STIG tables** — each STIG in the checklist gets its own collapsible (accordion) table showing its rules, version, and release info.
- **Top-level filtering** — filter by severity and status across **all** STIGs in the checklist at once.
- **Edit rules** — set a rule's status (Open / Not a Finding / Not Applicable / Not Reviewed), override its severity (with a reason), and add comments and finding details.
- **Add a STIG** — pull another STIG (by classification) into an existing checklist.
- **Remove rules / STIGs / checklists** — delete individual rules, an entire STIG, or a whole checklist.
- **Import / Export CKLB** — import a `.cklb` checklist file, or export your checklist to CKLB, compatible with [STIG Viewer 3](https://www.cyber.mil/stigs/srg-stig-tools).

### Privacy & storage

- All checklists and edits are stored locally in your browser using **IndexedDB** (normalized into checklists, STIGs, rules, and their relationships).
- No accounts, no servers, no third-party tracking or analytics.

## Routes

| Route | Description |
| --- | --- |
| `/` and `/stigs` | Browse the full STIG library |
| `/stigs/[stig_id]` | View a STIG's rules; filter, switch classification, export, or edit |
| `/stigs/[stig_id]/[classification]` | Classification-specific STIG view |
| `/stigs/[stig_id]/groups/[group_id]` | Detail view for an individual rule/group |
| `/editor` | List saved checklists; import a CKLB or delete a checklist |
| `/editor?id=<id>` | Edit a single checklist |

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router, static export) + [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/) and [Tailwind CSS](https://tailwindcss.com/)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) for client-side persistence
- [Jest](https://jestjs.io/) for tests

## Getting Started

Access the application at [stigui.com](https://stigui.com).

## Local Development

To run STIGUI locally:

```bash
git clone https://github.com/nealfennimore/stig.git
cd stig
npm install
npm run dev
```

Your local instance should now be running at [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the static production site (`out/`) |
| `npm run start` | Serve the built static site |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Jest test suite |

## Contributing

STIGUI is open-source, and contributions are welcome!

## Acknowledgments & Credits

STIGUI is an independent, community-built project and is **not affiliated with, endorsed by, or sponsored by** the U.S. Defense Information Systems Agency (DISA) or the U.S. Department of Defense.

- **[Defense Information Systems Agency (DISA)](https://www.disa.mil/)** authors and publishes the Security Technical Implementation Guides (STIGs). All STIG content browsed and exported through STIGUI originates from DISA's publicly available [STIG library](https://public.cyber.mil/stigs/).
- **[DISA STIG Viewer](https://www.cyber.mil/stigs/srg-stig-tools)** is DISA's official tool for reviewing STIGs and building checklists. STIGUI's editing experience and its `.cklb` checklist format are modeled on STIG Viewer 3 for compatibility; STIG Viewer remains the authoritative reference implementation.

STIGs are a product of the U.S. Government and are in the public domain.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
