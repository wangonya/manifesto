import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { db } from "./db";

const originalMatchMedia = window.matchMedia;

function renderApp() {
  return {
    user: userEvent.setup(),
    ...render(<App />),
  };
}

function mockMobileViewport(matches = true) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

async function openDetailTab(
  user: ReturnType<typeof userEvent.setup>,
  detail: HTMLElement,
  tabName: string | RegExp,
) {
  await user.click(within(detail).getByRole("tab", { name: tabName }));
}

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: originalMatchMedia,
  });
});

describe("Manifesto app", () => {
  it("renders the dashboard with followed promises, status counts, and privacy indicators", () => {
    renderApp();

    expect(screen.getByRole("heading", { level: 1, name: "Manifesto" })).toBeInTheDocument();
    expect(screen.getByText("Anonymous by default")).toBeInTheDocument();
    expect(screen.getByText("1 queued")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Following dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Priority promises" })).toBeInTheDocument();
    expect(
      screen.queryByText("Follow the promises that matter, without losing the wider record."),
    ).not.toBeInTheDocument();

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

  it("applies the selected language across navigation, data, filters, and search", async () => {
    const { user } = renderApp();

    await user.selectOptions(screen.getByLabelText("Language"), "sw");

    expect(screen.getByText("Bila jina kwa msingi")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ahadi za kipaumbele" })).toBeInTheDocument();

    const dashboard = screen.getByRole("region", { name: "Dashibodi ya ufuatiliaji" });
    expect(within(dashboard).getByText("Rekebisha visima vilivyokwama katika wadi kame")).toBeInTheDocument();
    expect(within(dashboard).getByText("Tengeneza barabara za mashambani kabla ya msimu wa mavuno")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /kivinjari cha manifesto/i }));
    await user.selectOptions(screen.getByLabelText("Afisi"), "member_of_parliament");
    await user.type(screen.getByRole("searchbox", { name: /tafuta wagombea na ahadi/i }), "makazi");

    expect(screen.getByRole("button", { name: /Nadia Hassan/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /David Ochieng/ })).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Lugha"), "fr");
    await user.click(screen.getByRole("button", { name: "Tableau de bord du suivi" }));

    expect(screen.getByText("Anonyme par défaut")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Promesses prioritaires" })).toBeInTheDocument();
    expect(screen.getByText("Réparer les forages bloqués dans les quartiers arides")).toBeInTheDocument();
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
    await user.selectOptions(screen.getByLabelText("Office"), "member_of_parliament");

    expect(screen.getByRole("button", { name: /David Ochieng/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nadia Hassan/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Amina Njoroge/ })).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Office"), "all");
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
    expect(within(roadDetail).getByText(/Farmers were promised graded feeder roads/)).toBeInTheDocument();

    await openDetailTab(user, roadDetail, "Evidence");
    expect(within(roadDetail).getAllByText("Anonymous resident report").length).toBeGreaterThan(0);

    await openDetailTab(user, roadDetail, "History");
    expect(within(roadDetail).getByText(/The harvest-season deadline passed/)).toBeInTheDocument();
  });

  it("returns from an archived manifesto to an active dashboard promise detail", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: /manifesto browser/i }));
    await user.click(screen.getByRole("button", { name: /Nadia Hassan/ }));
    await user.click(screen.getByRole("button", { name: /following dashboard/i }));

    const dashboard = screen.getByRole("region", { name: "Following dashboard" });
    const detail = within(dashboard).getByRole("region", {
      name: "Grade feeder roads before harvest season",
    });
    await openDetailTab(user, detail, "History");
    expect(within(dashboard).getByText(/The harvest-season deadline passed/)).toBeInTheDocument();
  });

  it("opens selected dashboard promise detail in a mobile sheet", async () => {
    mockMobileViewport();
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: /view details for grade feeder roads/i }));

    const detailSheet = await screen.findByRole("dialog", { name: "Promise detail" });
    expect(
      within(detailSheet).getByRole("region", {
        name: "Grade feeder roads before harvest season",
      }),
    ).toBeInTheDocument();
    expect(within(detailSheet).getByText(/Farmers were promised graded feeder roads/)).toBeInTheDocument();
  });

  it("opens selected manifesto promise detail in a compact sheet", async () => {
    mockMobileViewport();
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: /manifesto browser/i }));
    await user.click(screen.getByRole("button", { name: /David Ochieng/ }));
    await user.click(screen.getByRole("button", { name: /view details for grade feeder roads/i }));

    const detailSheet = await screen.findByRole("dialog", { name: "Promise detail" });
    expect(
      within(detailSheet).getByRole("region", {
        name: "Grade feeder roads before harvest season",
      }),
    ).toBeInTheDocument();
    expect(within(detailSheet).getByText(/Farmers were promised graded feeder roads/)).toBeInTheDocument();
  });

  it("requires a source label and note before adding anonymous evidence", async () => {
    const { user } = renderApp();

    const detail = screen.getByRole("region", {
      name: "Open three 24-hour maternal health clinics",
    });
    await openDetailTab(user, detail, "Evidence");
    const submitButton = within(detail).getByRole("button", { name: "Add anonymous evidence" });
    const sourceSelect = within(detail).getByRole("combobox", { name: "Source label" });

    expect(submitButton).toBeDisabled();
    expect(within(sourceSelect).getByRole("option", { name: "Clinic watch group" })).toBeInTheDocument();
    expect(
      within(sourceSelect).getByRole("option", { name: "County health notice board" }),
    ).toBeInTheDocument();

    await user.type(within(detail).getByLabelText("Evidence note"), "Clinic is open on weekends only.");

    expect(submitButton).toBeDisabled();

    await user.selectOptions(sourceSelect, "clinic-watch-group");

    expect(submitButton).toBeEnabled();
  });

  it("shows seeded context notes and requires note text before adding anonymous context", async () => {
    const { user } = renderApp();

    const detail = screen.getByRole("region", {
      name: "Open three 24-hour maternal health clinics",
    });
    await openDetailTab(user, detail, "Context");
    const submitButton = within(detail).getByRole("button", { name: "Add anonymous context note" });

    expect(
      within(detail).getByText(/Clinic construction alone will not meet the pledge/),
    ).toBeInTheDocument();
    expect(within(detail).getByText("No identity collected")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

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
    await openDetailTab(user, detail, "Evidence");
    const sourceSelect = within(detail).getByLabelText("Source label");
    const noteInput = within(detail).getByLabelText("Evidence note");

    await user.selectOptions(within(detail).getByLabelText("Evidence type"), "public_record");
    await user.selectOptions(sourceSelect, "clinic-watch-group");
    await user.type(noteInput, "Night-shift nurse roster was posted at the county clinic gate.");
    await user.click(within(detail).getByRole("button", { name: "Add anonymous evidence" }));

    expect(
      await within(detail).findByText("Night-shift nurse roster was posted at the county clinic gate."),
    ).toBeInTheDocument();
    expect(within(detail).getAllByText("Clinic watch group").length).toBeGreaterThan(1);
    expect(within(detail).getAllByText("Anonymous").length).toBeGreaterThan(0);
    expect(within(detail).getByText("Created offline")).toBeInTheDocument();
    expect(await screen.findByText("2 queued")).toBeInTheDocument();
    expect(sourceSelect).toHaveValue("");
    expect(noteInput).toHaveValue("");
    expect(within(detail).getByRole("button", { name: "Add anonymous evidence" })).toBeDisabled();
  });

  it("keeps evidence form values when local persistence fails", async () => {
    const { user } = renderApp();
    const note = "Night-shift evidence should remain in the form.";

    const detail = screen.getByRole("region", {
      name: "Open three 24-hour maternal health clinics",
    });
    await openDetailTab(user, detail, "Evidence");
    const sourceSelect = within(detail).getByLabelText("Source label");
    const noteInput = within(detail).getByLabelText("Evidence note");

    await user.selectOptions(sourceSelect, "clinic-watch-group");
    await user.type(noteInput, note);
    vi.spyOn(db.evidence, "add").mockRejectedValueOnce(new Error("blocked"));
    await user.click(within(detail).getByRole("button", { name: "Add anonymous evidence" }));

    expect(await within(detail).findByRole("alert")).toHaveTextContent(
      "Could not save locally. Try again.",
    );
    expect(sourceSelect).toHaveValue("clinic-watch-group");
    expect(noteInput).toHaveValue(note);
    expect(await screen.findByText("1 queued")).toBeInTheDocument();
  });

  it("adds anonymous context to the selected promise and queues it for sync", async () => {
    const { user } = renderApp();

    const detail = screen.getByRole("region", {
      name: "Open three 24-hour maternal health clinics",
    });
    await openDetailTab(user, detail, "Context");
    const confidenceSelect = within(detail).getByLabelText("Confidence label");
    const noteInput = within(detail).getByLabelText("Context note");
    const contextNote = "Residents say night staffing depends on the next county budget hearing.";

    await user.selectOptions(confidenceSelect, "needs verification");
    await user.type(noteInput, contextNote);
    await user.click(within(detail).getByRole("button", { name: "Add anonymous context note" }));

    expect(await within(detail).findByText(contextNote)).toBeInTheDocument();
    expect(within(detail).getAllByText("Needs verification").length).toBeGreaterThan(0);
    expect(within(detail).getAllByText("Anonymous").length).toBeGreaterThan(0);
    expect(within(detail).getByText("Queued for sync")).toBeInTheDocument();
    expect(await screen.findByText("2 queued")).toBeInTheDocument();
    expect(confidenceSelect).toHaveValue("community report");
    expect(noteInput).toHaveValue("");
    expect(within(detail).getByRole("button", { name: "Add anonymous context note" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /manifesto browser/i }));

    const browser = screen.getByRole("region", { name: "Manifesto browser" });
    const browserDetail = within(browser).getByRole("region", {
      name: "Open three 24-hour maternal health clinics",
    });
    await openDetailTab(user, browserDetail, "Context");
    expect(within(browserDetail).getByText(contextNote)).toBeInTheDocument();
  });

  it("keeps context form values when local persistence fails", async () => {
    const { user } = renderApp();
    const contextNote = "Residents say the staffing budget is still unresolved.";

    const detail = screen.getByRole("region", {
      name: "Open three 24-hour maternal health clinics",
    });
    await openDetailTab(user, detail, "Context");
    const confidenceSelect = within(detail).getByLabelText("Confidence label");
    const noteInput = within(detail).getByLabelText("Context note");

    await user.selectOptions(confidenceSelect, "needs verification");
    await user.type(noteInput, contextNote);
    vi.spyOn(db.contextNotes, "add").mockRejectedValueOnce(new Error("blocked"));
    await user.click(within(detail).getByRole("button", { name: "Add anonymous context note" }));

    expect(await within(detail).findByRole("alert")).toHaveTextContent(
      "Could not save locally. Try again.",
    );
    expect(confidenceSelect).toHaveValue("needs verification");
    expect(noteInput).toHaveValue(contextNote);
    expect(await screen.findByText("1 queued")).toBeInTheDocument();
  });

  it("persists locally entered evidence after the app remounts", async () => {
    const { user, unmount } = renderApp();
    const evidenceNote = "County clinic gate has a posted night-shift roster.";

    const detail = screen.getByRole("region", {
      name: "Open three 24-hour maternal health clinics",
    });
    await openDetailTab(user, detail, "Evidence");
    await user.selectOptions(within(detail).getByLabelText("Source label"), "clinic-watch-group");
    await user.type(within(detail).getByLabelText("Evidence note"), evidenceNote);
    await user.click(within(detail).getByRole("button", { name: "Add anonymous evidence" }));

    expect(await within(detail).findByText(evidenceNote)).toBeInTheDocument();

    unmount();

    const nextRender = renderApp();
    const remountedDetail = screen.getByRole("region", {
      name: "Open three 24-hour maternal health clinics",
    });
    await openDetailTab(nextRender.user, remountedDetail, "Evidence");

    expect(await within(remountedDetail).findByText(evidenceNote)).toBeInTheDocument();
    expect(await screen.findByText("2 queued")).toBeInTheDocument();
  });

  it("keeps an intentionally empty sync queue instead of restoring seeded queue rows", async () => {
    renderApp();

    await waitFor(async () => {
      await expect(db.syncQueue.count()).resolves.toBe(1);
    });
    await act(async () => {
      await db.syncQueue.clear();
    });

    expect(await screen.findByText("0 queued")).toBeInTheDocument();
    expect(screen.queryByText("1 queued")).not.toBeInTheDocument();
  });
});
