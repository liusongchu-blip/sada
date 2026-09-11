export type ApiErrorPayload = {
  code: string;
  message: string;
  requestId?: string;
};

type ApiEnvelope<T> = { data: T } | { error: ApiErrorPayload };

export class SadaApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly requestId?: string,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const hasBody = init.body !== undefined && init.body !== null;
  const response = await fetch(`/api/v1${path}`, {
    ...init,
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      ...(hasBody ? { "content-type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const payload = (await response.json().catch(() => ({
    error: { code: "INVALID_RESPONSE", message: "SADA returned an invalid response" },
  }))) as ApiEnvelope<T>;

  if (!response.ok || "error" in payload) {
    const error = "error" in payload
      ? payload.error
      : { code: "REQUEST_FAILED", message: `Request failed (${response.status})` };
    throw new SadaApiError(error.message, response.status, error.code, error.requestId);
  }
  return payload.data;
}

export type SessionUser = {
  id: string;
  displayName: string;
  phone?: string | null;
  email?: string | null;
  wallet?: { diamonds: number; boundDiamonds: number; gameCoins: number };
};

export type ApiPaymentMethod = {
  id: string;
  provider: "easypaisa" | "jazzcash" | "card";
  type: "mobile_wallet" | "card";
  displayLabel: string;
  isDefault: boolean;
};

export type ApiPaymentReceipt = {
  id: string;
  amountPkr: number;
  diamonds: number;
  bonusDiamonds: number;
  status: "requires_confirmation" | "processing" | "succeeded" | "failed";
  providerReference: string | null;
  methodLabel?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const sadaApi = {
  auth: {
    requestOtp: (phone: string) => apiRequest<{ challengeId: string; expiresIn: number; developmentCode?: string }>("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),
    verifyOtp: (challengeId: string, phone: string, code: string) => apiRequest<{ user: SessionUser }>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ challengeId, phone, code }),
    }),
    me: () => apiRequest<SessionUser>("/me"),
    updateMe: (input: { displayName?: string; city?: string; locale?: string }) => apiRequest<SessionUser>("/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  },
  payments: {
    methods: () => apiRequest<{ items: ApiPaymentMethod[] }>("/payments/methods"),
    createMethod: (input: { provider: ApiPaymentMethod["provider"]; tokenizedReference: string; displayLabel: string; makeDefault: boolean }) =>
      apiRequest<ApiPaymentMethod>("/payments/methods", { method: "POST", body: JSON.stringify(input) }),
    deleteMethod: (id: string) => apiRequest<void>(`/payments/methods/${encodeURIComponent(id)}`, { method: "DELETE" }),
    receipts: () => apiRequest<{ items: ApiPaymentReceipt[] }>("/payments/receipts"),
    createIntent: (input: { methodId: string; amountPkr: number; diamonds: number; bonusDiamonds: number; idempotencyKey: string }) =>
      apiRequest<{ id: string; status: ApiPaymentReceipt["status"] }>("/payments/intents", { method: "POST", body: JSON.stringify(input) }),
    confirm: (id: string, otp: string) => apiRequest<{ id: string; status: ApiPaymentReceipt["status"]; wallet?: SessionUser["wallet"] }>(`/payments/intents/${encodeURIComponent(id)}/confirm`, { method: "POST", body: JSON.stringify({ otp }) }),
    refund: (id: string, reason: string, note: string) => apiRequest<{ id: string; paymentId: string; status: string }>(`/payments/receipts/${encodeURIComponent(id)}/refunds`, { method: "POST", body: JSON.stringify({ reason, note }) }),
  },
};
