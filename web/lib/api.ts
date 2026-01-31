const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function api<T>(
    path: string,
    options?: RequestInit & { token?: string }
): Promise<T> {
    const { token, ...init } = options ?? {};
    const headers: HeadersInit = {
        ...(init.headers as Record<string, string>),
    };
    if(token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
    if(!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `Request failed: ${res.status}`);
    }

    return res.json() as Promise<T>;
}