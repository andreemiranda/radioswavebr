// Verifica se o usuário consentiu antes de salvar dados opcionais
export function getConsent(): { accepted: boolean } | null {
  try {
    const raw = localStorage.getItem('RadioWaveBR_cookieConsent');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function safeSetItem(key: string, value: string, requiresConsent = false): void {
  const consent = getConsent();
  if (requiresConsent && (!consent || !consent.accepted)) return;
  try { localStorage.setItem(key, value); } catch {}
}
