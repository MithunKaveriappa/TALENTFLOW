const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = {
  async post(path: string, body: unknown, token?: string) {
    const url = `${API_URL}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.detail || `Request failed with status ${response.status}`,
        );
      }

      return response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`API POST Error [${url}]:`, errorMessage);
      throw err;
    }
  },

  async patch(path: string, body: unknown, token?: string) {
    const url = `${API_URL}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.detail || `Request failed with status ${response.status}`,
        );
      }

      return response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`API PATCH Error [${url}]:`, errorMessage);
      throw err;
    }
  },

  async get(path: string, token?: string) {
    const url = `${API_URL}${path}`;
    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.detail || `Request failed with status ${response.status}`,
        );
      }

      return response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`API GET Error [${url}]:`, errorMessage);
      throw err;
    }
  },

  async delete(path: string, token?: string) {
    const url = `${API_URL}${path}`;
    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.detail || `Request failed with status ${response.status}`,
        );
      }

      return response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`API DELETE Error [${url}]:`, errorMessage);
      throw err;
    }
  },
};
