import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

function renderApp() {
  return {
    user: userEvent.setup(),
    ...render(<App />),
  };
}

describe("Manifesto app", () => {
  it("renders the dashboard with followed promises, status counts, and privacy indicators", () => {
    renderApp();

    expect(screen.getByRole("heading", { level: 1, name: "Manifesto" })).toBeInTheDocument();
    expect(screen.getByText("Anonymous by default")).toBeInTheDocument();
    expect(screen.getByText("1 queued")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Priority promises" })).toBeInTheDocument();

    const dashboard = screen.getByRole("region", { name: "Following dashboard" });
    expect(within(dashboard).getByText("Repair stalled boreholes in dry wards")).toBeInTheDocument();
    expect(within(dashboard).getByText("Grade feeder roads before harvest season")).toBeInTheDocument();
    expect(within(dashboard).getByText("Install solar streetlights near the bus stage")).toBeInTheDocument();
    expect(
      within(dashboard).getAllByText("Open three 24-hour maternal health clinics").length,
    ).toBeGreaterThan(0);

    const counts = screen.getByLabelText("Promise status counts");
    expect(counts).toHaveTextContent(/Kept\s*1/);
    expect(counts).toHaveTextContent(/In progress\s*2/);
    expect(counts).toHaveTextContent(/Missed\s*1/);
    expect(counts).toHaveTextContent(/Not started\s*1/);
    expect(counts).toHaveTextContent(/At risk\s*1/);
  });

  it("opens the manifesto browser with elected and archived candidates available", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: /manifesto browser/i }));

    expect(screen.getByRole("heading", { name: "Candidates" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Amina Njoroge/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Joseph Barasa/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nadia Hassan/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lakeside County Compact" })).toBeInTheDocument();
  });

  it("filters the manifesto browser by office and promise search text", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: /manifesto browser/i }));
    await user.selectOptions(screen.getByLabelText("Office"), "Member of Parliament");

    expect(screen.getByRole("button", { name: /David Ochieng/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nadia Hassan/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Amina Njoroge/ })).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Office"), "All offices");
    await user.type(screen.getByRole("searchbox", { name: /search candidates and promises/i }), "housing");

    expect(screen.getByRole("button", { name: /Nadia Hassan/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /David Ochieng/ })).not.toBeInTheDocument();
  });

  it("updates manifesto and promise details when users select a candidate and promise", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: /manifesto browser/i }));
    await user.click(screen.getByRole("button", { name: /David Ochieng/ }));

    expect(
      screen.getByRole("heading", { name: "Kijani East Jobs and Services Plan" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Publish bursary awards every school term" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /view details for grade feeder roads/i }));

    const roadDetail = screen.getByRole("region", {
      name: "Grade feeder roads before harvest season",
    });
    expect(within(roadDetail).getByText(/Two feeder roads remain impassable/)).toBeInTheDocument();
    expect(within(roadDetail).getAllByText("Anonymous resident report").length).toBeGreaterThan(0);
    expect(within(roadDetail).getByText(/The harvest-season deadline passed/)).toBeInTheDocument();
  });

  it("returns from an archived manifesto to an active dashboard promise detail", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: /manifesto browser/i }));
    await user.click(screen.getByRole("button", { name: /Nadia Hassan/ }));
    await user.click(screen.getByRole("button", { name: /following dashboard/i }));

    const dashboard = screen.getByRole("region", { name: "Following dashboard" });
    expect(within(dashboard).getByText(/The harvest-season deadline passed/)).toBeInTheDocument();
  });
});
