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

  it("requires a source label and note before adding anonymous evidence", async () => {
    const { user } = renderApp();

    const detail = screen.getByRole("region", {
      name: "Open three 24-hour maternal health clinics",
    });
    const submitButton = within(detail).getByRole("button", { name: "Add anonymous evidence" });
    const sourceSelect = within(detail).getByRole("combobox", { name: "Source label" });

    expect(submitButton).toBeDisabled();
    expect(within(sourceSelect).getByRole("option", { name: "Clinic watch group" })).toBeInTheDocument();
    expect(
      within(sourceSelect).getByRole("option", { name: "County health notice board" }),
    ).toBeInTheDocument();

    await user.type(within(detail).getByLabelText("Evidence note"), "Clinic is open on weekends only.");

    expect(submitButton).toBeDisabled();

    await user.selectOptions(sourceSelect, "Clinic watch group");

    expect(submitButton).toBeEnabled();
  });

  it("shows seeded context notes and requires note text before adding anonymous context", async () => {
    const { user } = renderApp();

    const detail = screen.getByRole("region", {
      name: "Open three 24-hour maternal health clinics",
    });
    const submitButton = within(detail).getByRole("button", { name: "Add anonymous context note" });

    expect(
      within(detail).getByText(/Clinic construction alone will not meet the pledge/),
    ).toBeInTheDocument();
    expect(within(detail).getByText("No identity collected")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await user.selectOptions(within(detail).getByLabelText("Context language"), "sheng");
    await user.selectOptions(within(detail).getByLabelText("Confidence label"), "needs verification");

    expect(submitButton).toBeDisabled();

    await user.type(
      within(detail).getByLabelText("Context note"),
      "Residents say night staffing depends on the next county budget hearing.",
    );

    expect(submitButton).toBeEnabled();
  });

  it("adds anonymous evidence to the selected promise and queues it for sync", async () => {
    const { user } = renderApp();

    const detail = screen.getByRole("region", {
      name: "Open three 24-hour maternal health clinics",
    });
    const sourceSelect = within(detail).getByLabelText("Source label");
    const noteInput = within(detail).getByLabelText("Evidence note");

    await user.selectOptions(within(detail).getByLabelText("Evidence type"), "public_record");
    await user.selectOptions(sourceSelect, "Clinic watch group");
    await user.type(noteInput, "Night-shift nurse roster was posted at the county clinic gate.");
    await user.click(within(detail).getByRole("button", { name: "Add anonymous evidence" }));

    expect(
      within(detail).getByText("Night-shift nurse roster was posted at the county clinic gate."),
    ).toBeInTheDocument();
    expect(within(detail).getAllByText("Clinic watch group").length).toBeGreaterThan(1);
    expect(within(detail).getAllByText("Anonymous").length).toBeGreaterThan(0);
    expect(within(detail).getByText("Created offline")).toBeInTheDocument();
    expect(screen.getByText("2 queued")).toBeInTheDocument();
    expect(sourceSelect).toHaveValue("");
    expect(noteInput).toHaveValue("");
    expect(within(detail).getByRole("button", { name: "Add anonymous evidence" })).toBeDisabled();
  });

  it("adds anonymous context to the selected promise and queues it for sync", async () => {
    const { user } = renderApp();

    const detail = screen.getByRole("region", {
      name: "Open three 24-hour maternal health clinics",
    });
    const languageSelect = within(detail).getByLabelText("Context language");
    const confidenceSelect = within(detail).getByLabelText("Confidence label");
    const noteInput = within(detail).getByLabelText("Context note");
    const contextNote = "Residents say night staffing depends on the next county budget hearing.";

    await user.selectOptions(languageSelect, "sheng");
    await user.selectOptions(confidenceSelect, "needs verification");
    await user.type(noteInput, contextNote);
    await user.click(within(detail).getByRole("button", { name: "Add anonymous context note" }));

    expect(within(detail).getByText(contextNote)).toBeInTheDocument();
    expect(within(detail).getAllByText("needs verification").length).toBeGreaterThan(0);
    expect(within(detail).getAllByText("Sheng").length).toBeGreaterThan(1);
    expect(within(detail).getAllByText("Anonymous").length).toBeGreaterThan(0);
    expect(within(detail).getByText("Queued for sync")).toBeInTheDocument();
    expect(screen.getByText("2 queued")).toBeInTheDocument();
    expect(languageSelect).toHaveValue("en");
    expect(confidenceSelect).toHaveValue("community report");
    expect(noteInput).toHaveValue("");
    expect(within(detail).getByRole("button", { name: "Add anonymous context note" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /manifesto browser/i }));

    const browser = screen.getByRole("region", { name: "Manifesto browser" });
    expect(within(browser).getAllByText(contextNote).length).toBeGreaterThan(1);
  });
});
