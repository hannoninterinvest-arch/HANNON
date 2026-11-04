"use client";

import { useLocale } from "./LocaleProvider";

export default function LocalizedText({ id }: { id: string }) {
  const { t } = useLocale();
  return <>{t(id)}</>;
}
