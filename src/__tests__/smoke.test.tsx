import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { I18nProvider, useT } from "../i18n";

function Label() {
  const t = useT();
  return <span>{t("hello")}</span>;
}

test("I18nProvider resolves TH/EN keys", () => {
  render(
    <I18nProvider
      lang="en"
      messages={{ en: { hello: "Hello" }, th: { hello: "สวัสดี" } }}
    >
      <Label />
    </I18nProvider>
  );
  expect(screen.getByText("Hello")).toBeInTheDocument();
});
