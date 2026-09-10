import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GlossaryExplorer } from "@/components/vocabulary/glossary-explorer";

describe("GlossaryExplorer", () => {
  it("finds Pull Request by its Chinese meaning", () => {
    render(<GlossaryExplorer />);
    fireEvent.change(screen.getByPlaceholderText(/搜索 Pull Request/), { target: { value: "合并变更提案" } });
    expect(screen.getByRole("heading", { name: "Pull Request" })).toBeInTheDocument();
  });
});
