import type { CategoryDefinition } from "./types";

/**
 * The locked hierarchy:
 *
 *   CI Business OS
 *     ├─ Home        — command center, one entry point
 *     ├─ Work         — Docs, Sheets, Present, PDF, Notes, Forms, Tasks
 *     ├─ Communicate   — Mail, Calendar, Chat, Meet, Contacts, Comms, Notifications
 *     ├─ Files         — Drive, Search, Scan, Sign, Archive
 *     ├─ Business      — CRM, ERP, Finance, Sales, HR, Inventory, Projects...
 *     ├─ Create        — Design, Image, Video, Audio, Websites
 *     ├─ IT            — Remote, Devices, Security, Backup, Software
 *     ├─ Build         — Database, Builder, Automate, API Hub, Connect
 *     ├─ Intelligence  — Assistant, Agents, Agent Studio, Search, Knowledge
 *     ├─ Control       — Admin, Approvals, Permissions, Audit, Governance
 *     └─ Executive     — Control Room, Analytics, Forecasting
 *
 * Everything lives inside one account, one permission model, one search
 * index, one audit trail. CI CORE (packages/core equivalent: src/lib) is
 * the substrate underneath every category, not a category itself.
 */
export const CATEGORIES: CategoryDefinition[] = [
  { id: "home", label: "Home", description: "Command center and universal entry point." },
  { id: "work", label: "Work", description: "Documents, spreadsheets, presentations, PDFs, notes, forms, tasks." },
  { id: "communicate", label: "Communicate", description: "Mail, calendar, chat, meetings, contacts, notifications." },
  { id: "files", label: "Files", description: "Storage, search, scanning, e-signature, archiving." },
  { id: "business", label: "Business", description: "CRM, ERP, finance, sales, HR, inventory, projects, operations." },
  { id: "create", label: "Create", description: "Design, media, video, audio, translation, web presence." },
  { id: "it", label: "IT", description: "Devices, remote support, security, backup, software distribution." },
  { id: "build", label: "Build", description: "No-code database, app builder, automation, integrations." },
  { id: "intelligence", label: "Intelligence", description: "Assistant, agents, agent studio, knowledge, reasoning." },
  { id: "control", label: "Control", description: "Admin, approvals, permissions, audit, governance." },
  { id: "executive", label: "Executive", description: "Company-wide analytics, forecasting, control room." },
];
