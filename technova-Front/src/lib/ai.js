import { getToken } from "./api";

const API_BASE_URL = "http://localhost:8080";

// ============================================================
// AI CHAT
// ============================================================

export async function sendAIMessage(
  message,
  history = []
) {
  const response = await fetch(
    `${API_BASE_URL}/api/ai/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        message,
        history,
      }),
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "AI assistant request failed."
    );
  }

  return data;
}

// ============================================================
// AI PRODUCT COMPARISON
// ============================================================

export async function compareProducts(
  productIds
) {
  const response = await fetch(
    `${API_BASE_URL}/api/ai/compare`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productIds,
      }),
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "AI comparison request failed."
    );
  }

  return data;
}