import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { resetManifestoDatabase } from "../db";

afterEach(async () => {
  cleanup();
  await resetManifestoDatabase();
});
