import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

import {
  api,
  getToken,
  setToken as saveToken,
  clearToken,
} from "./api";

const AuthContext = createContext(null);

function getTokenPayload(token) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];

    if (!payload) return null;

    return JSON.parse(
      atob(
        payload
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const savedToken = getToken();
  const payload = getTokenPayload(savedToken);

  const [token, setTokenState] = useState(
    savedToken
  );

  const [userId, setUserId] = useState(
    payload?.sub ? Number(payload.sub) : null
  );

  const [username, setUsername] = useState(
    payload?.username || null
  );

  const [role, setRole] = useState(
    payload?.role || null
  );

  // ============================================================
  // LOGIN
  // ============================================================

  const login = useCallback(
    async (usernameInput, password) => {
      const data = await api.post("/auth/login", {
        username: usernameInput,
        password,
      });

      saveToken(data.token);
      setTokenState(data.token);

      const loginPayload =
        getTokenPayload(data.token);

      setUserId(
        loginPayload?.sub
          ? Number(loginPayload.sub)
          : null
      );

      setUsername(data.username);
      setRole(data.role);

      return data;
    },
    []
  );

  // ============================================================
  // REGISTER
  // ============================================================

  const register = useCallback(
    async ({
      username: u,
      password,
      phone,
      email,
    }) => {
      const data = await api.post(
        "/auth/register",
        {
          username: u,
          password,
          phone,
          email,
        }
      );

      saveToken(data.token);
      setTokenState(data.token);

      const registerPayload =
        getTokenPayload(data.token);

      setUserId(
        registerPayload?.sub
          ? Number(registerPayload.sub)
          : null
      );

      setUsername(data.username);
      setRole(data.role);

      return data;
    },
    []
  );

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = useCallback(() => {
    clearToken();

    setTokenState(null);
    setUserId(null);
    setUsername(null);
    setRole(null);
  }, []);

  // ============================================================
  // AUTH CONTEXT
  // ============================================================

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        username,
        role,
        isAuthenticated: !!token,
        isAdmin: role === "ADMIN",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}