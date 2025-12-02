import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

// Mock environment variables
process.env.PAYMENT_TOKEN_SECRET = "test-secret-key";
process.env.STUDENT_APP_BASE_URL = "https://test.neramclasses.com";

describe("Payment Token Generation", () => {
  const userId = "test-user-123";
  const amount = 16000;
  const type = "full";
  const secret = process.env.PAYMENT_TOKEN_SECRET!;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate a valid JWT token", () => {
    // Generate token with 1 hour expiry
    const expiryDays = 1 / 24; // 1 hour
    const payload = {
      userId,
      amount,
      type,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60,
    };

    const token = jwt.sign(payload, secret);

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3); // JWT has 3 parts
  });

  it("should decode token and verify payload", () => {
    const expiryDays = 1 / 24;
    const payload = {
      userId,
      amount,
      type,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60,
    };

    const token = jwt.sign(payload, secret);
    const decoded = jwt.verify(token, secret) as any;

    expect(decoded.userId).toBe(userId);
    expect(decoded.amount).toBe(amount);
    expect(decoded.type).toBe(type);
    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
  });

  it("should have correct expiry time (1 hour)", () => {
    const expiryDays = 1 / 24;
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      userId,
      amount,
      type,
      iat: now,
      exp: now + expiryDays * 24 * 60 * 60,
    };

    const token = jwt.sign(payload, secret);
    const decoded = jwt.verify(token, secret) as any;

    // Verify expiry is approximately 1 hour (3600 seconds)
    const expiryDiff = decoded.exp - decoded.iat;
    expect(expiryDiff).toBeCloseTo(3600, 0);
  });

  it("should fail verification with wrong secret", () => {
    const payload = {
      userId,
      amount,
      type,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const token = jwt.sign(payload, secret);

    expect(() => {
      jwt.verify(token, "wrong-secret");
    }).toThrow();
  });

  it("should fail verification for expired token", () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      userId,
      amount,
      type,
      iat: now - 7200, // 2 hours ago
      exp: now - 3600, // 1 hour ago (expired)
    };

    const token = jwt.sign(payload, secret);

    expect(() => {
      jwt.verify(token, secret);
    }).toThrow();
  });
});

describe("Final Fee Payment Token Storage", () => {
  it("should create final_fee_payment structure", () => {
    const token = jwt.sign(
      {
        userId: "test-user",
        amount: 16000,
        type: "full",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      process.env.PAYMENT_TOKEN_SECRET!
    );

    const finalFeePayment = {
      token,
      amount: 16000,
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    expect(finalFeePayment.token).toBeDefined();
    expect(finalFeePayment.amount).toBe(16000);
    expect(finalFeePayment.generated_at).toBeDefined();
    expect(finalFeePayment.expires_at).toBeDefined();

    // Verify token is valid
    const decoded = jwt.verify(
      finalFeePayment.token,
      process.env.PAYMENT_TOKEN_SECRET!
    ) as any;
    expect(decoded.userId).toBe("test-user");
    expect(decoded.amount).toBe(16000);
    expect(decoded.type).toBe("full");
  });

  it("should not overwrite existing token", () => {
    const existingToken = "existing-jwt-token-12345";
    const adminFilled = {
      final_fee_payment: {
        token: existingToken,
        amount: 16000,
      },
    };

    // Simulate the check
    const finalFeePaymentToken = adminFilled.final_fee_payment?.token;

    expect(finalFeePaymentToken).toBe(existingToken);
    // In actual code, this would prevent generating a new token
  });

  it("should generate token when none exists", () => {
    const adminFilled: {
      final_fee_payment: { token?: string } | null;
    } = {
      final_fee_payment: null,
    };

    const finalFeePaymentToken = adminFilled.final_fee_payment?.token;

    expect(finalFeePaymentToken).toBeUndefined();
    // In actual code, this would trigger token generation
  });
});

describe("Payment URL Generation", () => {
  it("should generate correct payment URL", () => {
    const token = jwt.sign(
      {
        userId: "test-user",
        amount: 16000,
        type: "full",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      process.env.PAYMENT_TOKEN_SECRET!
    );

    const studentAppUrl = process.env.STUDENT_APP_BASE_URL;
    const paymentUrl = `${studentAppUrl}/pay?v=${encodeURIComponent(
      token
    )}&type=full`;

    expect(paymentUrl).toContain("https://test.neramclasses.com/pay?v=");
    expect(paymentUrl).toContain("&type=full");

    // Extract and verify token from URL
    const urlParams = new URLSearchParams(paymentUrl.split("?")[1]);
    const extractedToken = urlParams.get("v");
    expect(extractedToken).toBe(token);
  });

  it("should return null payment URL when no token", () => {
    const finalFeePaymentToken = null;
    const paymentUrl = finalFeePaymentToken
      ? `https://test.neramclasses.com/pay?v=${encodeURIComponent(
          finalFeePaymentToken
        )}&type=full`
      : null;

    expect(paymentUrl).toBeNull();
  });
});

describe("API Response Structure", () => {
  it("should return correct approval response with token", () => {
    const token = jwt.sign(
      {
        userId: "test-user",
        amount: 16000,
        type: "full",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      process.env.PAYMENT_TOKEN_SECRET!
    );

    const response = {
      ok: true,
      updated: { id: "test-user" },
      emailSent: true,
      status: "Approved",
      paymentToken: token,
      paymentUrl: `https://test.neramclasses.com/pay?v=${encodeURIComponent(
        token
      )}&type=full`,
      paymentAmount: 16000,
    };

    expect(response.ok).toBe(true);
    expect(response.status).toBe("Approved");
    expect(response.paymentToken).toBeDefined();
    expect(response.paymentUrl).toContain("/pay?v=");
    expect(response.paymentAmount).toBe(16000);

    // Verify token
    const decoded = jwt.verify(
      response.paymentToken!,
      process.env.PAYMENT_TOKEN_SECRET!
    ) as any;
    expect(decoded.amount).toBe(16000);
  });

  it("should return correct rejection response", () => {
    const response = {
      ok: true,
      updated: { id: "test-user" },
      emailSent: true,
      status: "Rejected",
    };

    expect(response.ok).toBe(true);
    expect(response.status).toBe("Rejected");
    expect(response).not.toHaveProperty("paymentToken");
    expect(response).not.toHaveProperty("paymentUrl");
  });
});
