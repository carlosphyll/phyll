// Sample data shared by the report and cloud tests.

export const sampleCatalog = [
  {
    id: "P01",
    name: "The first screen does not say what this is or what to do",
    dimension: "purpose",
    severity: "blocker",
    weight: 3,
    cap: 1,
    detection: "dynamic",
    summary: "A new user cannot tell what the product does.",
  },
  {
    id: "L01",
    name: "Purple-to-blue gradient as the brand",
    dimension: "look",
    kind: "style",
    severity: "minor",
    weight: 2,
    cap: 3,
    detection: "static",
    summary: "A purple gradient carries the brand.",
    detectors: [{ kind: "regex", pattern: "from-purple" }],
  },
  {
    id: "C01",
    name: "Generic value-proposition phrases",
    dimension: "copy",
    severity: "minor",
    weight: 2,
    cap: 3,
    detection: "static",
    summary: "Stock marketing lines.",
    detectors: [{ kind: "phrase", phrases: ["supercharge"] }],
  },
];

export function sampleScan() {
  return {
    tool: { name: "phyll", version: "0.1.0" },
    staticIndex: 22,
    tells: [
      { id: "L01", hits: 2 },
      { id: "C01", hits: 1 },
    ],
  };
}

export function sampleReport(overrides = {}) {
  return {
    schemaVersion: "1.0",
    createdAt: "2026-09-23T18:00:00Z",
    language: "en",
    mode: "full",
    target: { name: "Replyloop", url: "http://localhost:5173", framework: "react-router" },
    context: {
      endUser: "Instagram creators who want to answer comments with a DM automatically",
      coreJobs: [
        { id: "J1", name: "Create an automation that replies to a keyword", momentOfValue: "The first DM goes out" },
        { id: "J2", name: "See who received a DM" },
      ],
      assumptions: ["The user already has an Instagram business account."],
    },
    fiveSecondTest: {
      screen: "S1",
      whatIsThis: "An AI marketing page",
      whoIsItFor: "Unclear",
      whatToDo: "Get Started, without saying what starts",
      passed: false,
    },
    screens: [
      { id: "S1", route: "/", title: "Landing", screenshots: { desktop: "screens/desktop-home.png" } },
      { id: "S2", route: "/flows", title: "Flows" },
    ],
    journeys: [
      {
        job: "J1",
        steps: [
          { screen: "S1", action: "Clicked Get Started" },
          { screen: "S2", action: "Clicked Create Flow", observation: "A modal with nine fields", problem: true },
        ],
        clicks: 7,
        screens: 3,
        deadEnds: 1,
        reachedValue: false,
        neededClicks: 3,
        inputs: {
          asked: 9,
          needed: 2,
          cuts: [
            { input: "Delay (seconds)", action: "default", note: "Start with no delay." },
            { input: "Tags", action: "remove" },
            { input: "Instagram account", action: "defer", note: "Ask when the automation goes live." },
          ],
        },
      },
    ],
    tells: [
      { id: "L01", status: "absent", note: "The gradient is only on the marketing page, which is out of scope." },
      { id: "P01", status: "present", evidence: ["S1"] },
    ],
    findings: [
      {
        id: "UX-01",
        title: "Nine fields before the first automation",
        dimension: "flow",
        severity: "major",
        tells: ["P01"],
        evidence: [
          { screen: "S2", screenshot: "screens/desktop-flows.png", observation: "The create modal asks for nine fields at once." },
        ],
        why: "People only need a keyword and a message to start.",
        principle: "Progressive disclosure",
        fix: "Ask for the keyword and the message, and move the rest under More options.",
        effort: "M",
      },
      {
        id: "UX-02",
        title: "The first screen sells instead of starting",
        dimension: "purpose",
        severity: "blocker",
        evidence: [{ screen: "S1", observation: "The hero has no way into the tool besides Get Started." }],
        why: "A signed-in user has to pass a sales page to reach their work.",
        fix: "Open the app on Automations.",
        effort: "S",
      },
      {
        id: "UX-03",
        title: "Delete has no undo",
        dimension: "actions",
        severity: "minor",
        evidence: [{ file: "src/pages/Flows.jsx", line: 40, observation: "Delete removes the row at once." }],
        why: "A slip loses work.",
        fix: "Show an undo toast for five seconds.",
        effort: "S",
        verify: true,
      },
      {
        id: "UX-04",
        title: "Gray text below the contrast minimum",
        dimension: "look",
        severity: "polish",
        evidence: [{ screen: "S2", observation: "Row metadata has a 2.9:1 contrast ratio." }],
        why: "It is hard to read on a phone in daylight.",
        principle: "WCAG 1.4.3 contrast",
        fix: "Use gray-600 on white.",
        effort: "S",
      },
    ],
    evidence: { scan: "scan.json" },
    ...overrides,
  };
}
