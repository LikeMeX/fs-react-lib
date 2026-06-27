import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RadarChart } from "../charts";

const THREE_SERIES = [
  { label: "Communication", value: 75, target: 90 },
  { label: "Leadership", value: 60, target: 80 },
  { label: "Teamwork", value: 85 },
];

describe("RadarChart — accessible data table fallback", () => {
  it("renders a visually-hidden table with all labels, values, and targets", () => {
    render(<RadarChart series={THREE_SERIES} />);

    // Table must exist (screen readers reach it even when visually hidden)
    expect(screen.getByRole("table")).toBeInTheDocument();

    // Column headers
    expect(
      screen.getByRole("columnheader", { name: /label/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /value/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /target/i })
    ).toBeInTheDocument();

    // All labels present in the table cells
    const cells = screen.getAllByRole("cell");
    const cellTexts = cells.map((c) => c.textContent);
    expect(cellTexts).toContain("Communication");
    expect(cellTexts).toContain("Leadership");
    expect(cellTexts).toContain("Teamwork");

    // Values present
    expect(screen.getByRole("cell", { name: "75" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "60" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "85" })).toBeInTheDocument();

    // Targets present (or "—" when absent)
    expect(screen.getByRole("cell", { name: "90" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "80" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "—" })).toBeInTheDocument();
  });
});

describe("RadarChart — radar variant (default)", () => {
  it("renders an SVG element", () => {
    const { container } = render(
      <RadarChart series={THREE_SERIES} variant="radar" />
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("SVG carries an accessible label", () => {
    const { container } = render(
      <RadarChart series={THREE_SERIES} title="Competency Radar" />
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    // Either role="img" + aria-label, or a <title> child
    const hasRoleImg = svg!.getAttribute("role") === "img";
    const hasTitle = svg!.querySelector("title") !== null;
    expect(hasRoleImg || hasTitle).toBe(true);
  });

  it("renders axis labels for each series item inside the SVG", () => {
    const { container } = render(<RadarChart series={THREE_SERIES} />);
    const svg = container.querySelector("svg");
    const textContent = svg!.textContent ?? "";
    expect(textContent).toContain("Communication");
    expect(textContent).toContain("Leadership");
    expect(textContent).toContain("Teamwork");
  });
});

describe("RadarChart — bar variant", () => {
  it("renders an SVG for the bar variant", () => {
    const { container } = render(
      <RadarChart series={THREE_SERIES} variant="bar" />
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("bar aria-labels expose label, value, and target", () => {
    const { container } = render(
      <RadarChart series={THREE_SERIES} variant="bar" />
    );
    // Bars with aria-label containing the label name and value
    const bars = container.querySelectorAll("[aria-label]");
    const labels = Array.from(bars).map((el) => el.getAttribute("aria-label"));
    expect(labels.some((l) => l?.includes("Communication"))).toBe(true);
    expect(labels.some((l) => l?.includes("Leadership"))).toBe(true);
  });

  it("still renders the accessible data table in bar variant", () => {
    render(<RadarChart series={THREE_SERIES} variant="bar" />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    const cells = screen.getAllByRole("cell");
    const cellTexts = cells.map((c) => c.textContent);
    expect(cellTexts).toContain("Communication");
  });
});
