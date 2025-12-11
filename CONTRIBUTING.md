# Contributing to CCG — Crispin Consulting Group
# Powered by Ci — Crispin Intelligence™

Every contribution to a CCG repository must reflect the precision, discipline, and minimalism that define the CCG engineering culture.

Clean code. Strong structure. Zero noise.

---

## 1. Contribution Philosophy (CCG Standard)

CCG projects operate on strict clarity and architectural consistency.  
All contributions must be:

- Purpose-built — aligns directly with project roadmap  
- Minimal — no unnecessary complexity or files  
- Consistent — follows CCG patterns, naming, and style rules  
- Stable — thoroughly tested and validated  
- Documented — concise, technical, and professional  

If a contribution does not improve **performance**, **clarity**, or **architecture**, it cannot be accepted.

---

## 2. CCG Contribution Process

Before contributing:

1. Review existing **Issues**, **Discussions**, and **PRs**.  
2. For major proposals, open a **CCG Technical Proposal Issue**.  
3. Sync your local environment with the versions defined in the repo’s README.  
4. Ensure that new work does not break CCG internal modules or tooling.

---

## 3. Code Standards (CCG Engineering Rules)

All code must adhere to the following:

### **Architecture**
- Respect existing folder structure and logic boundaries.  
- Do not introduce new libraries without maintainer approval.  
- Keep functions small, predictable, and single-purpose.

### **Commits**
- Use clear, professional commit messages.  
- No emojis, no slang, no filler.  
- Structure: `type(scope): message`  
  - Example: `feat(auth): add token refresh flow`

### **Documentation**
- Keep documentation minimal, technical, and precise.  
- Use Ci/CCG writing standards: short paragraphs, clean grammar, direct tone.

### **Testing**
- Every new feature requires test coverage.  
- PRs without tests will not be merged.

### **Formatting**
- Must pass all formatters and linters defined in the repo  
  (e.g., Prettier, ESLint, Black, Pylint, etc.).

Premium code is not optional. It is the CCG identity.

---

## 4. GitHub Branching Model (CCG Workflow)

Use standardized naming:

- `feature/<module-name>`  
- `fix/<issue-number>`  
- `hotfix/<critical-fix>`  
- `docs/<area>`  
- `refactor/<component>`  

Branches must be created from the designated base (typically `dev`).

Each branch must contain **one clear purpose**.

---

## 5. Pull Request Requirements (Mandatory)

A PR will only be reviewed if it meets the CCG quality criteria:

- Clean, minimal, isolated changes  
- All GitHub Actions pipelines pass  
- PR description includes:
  - What changed  
  - Why it was needed  
  - How it was implemented  
  - Linked issues (`Closes #ID`)  
- No console logs, debug leftovers, or unused files  
- No formatting noise  
- Documentation updated where necessary  

PRs must follow the **CCG Review Etiquette**:
- Expect precise, direct, engineering-grade feedback  
- Discussions must remain professional and solution-driven  

---

## 6. Issue Reporting (CCG Format)

When opening an Issue, include:

- **Title:** clear and technical  
- **Summary:** one paragraph  
- **Reproduction steps**  
- **Expected vs. actual behavior**  
- **Logs or stack traces if relevant**  
- **Environment:** OS, version, dependencies  

High-clarity issues = faster resolutions.

---

## 7. Security Reports

Security vulnerabilities must **not** be reported publicly.  
Email the CCG security channel if available or contact maintainers privately.

---

## 8. Code of Conduct (CCG Standard)

Professionalism is mandatory.  
Contributors must maintain:

- Respect  
- Precision  
- Calm communication  
- Zero hostility  
- Zero noise  

Ci and CCG reflect discipline and intelligence — contributors must do the same.

---

## 9. Licensing

By contributing, you agree that your work will be licensed under the repository’s existing license.

---

## CCG × Ci Signature

Ci™ — Intelligence Refined  
Ci™ — Crafted for Crispin Geagea  
CCG™ — Engineering with Precision
