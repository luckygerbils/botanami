export interface State {
    csrf_token: string,
    target_uri: string,
}

export function getGoogleOAuthUrl() {
    const accessToken = getOAuthAccessToken();
    const csrfToken = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16)).join("");
    localStorage.setItem("google_oauth_csrf_token", csrfToken);
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_API_CLIENT_ID!,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        redirect_uri: `https://${process.env.ENDPOINT!}" : ""}/oauth.html`,
        scope: [
            "https://www.googleapis.com/auth/drive.appdata",
            "openid",
            "profile",
        ].join(" "),
        response_type: "token",
        state: JSON.stringify({
            csrf_token: csrfToken,
            target_uri: "/#/backup",
        } as State),
        ...(accessToken != null ? { login_hint: accessToken.sub } : {}),
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export function validateGoogleOauthCsrfToken(csrfToken: string) {
    if (csrfToken !== localStorage.getItem("google_oauth_csrf_token")) {
        throw new Error(`Invalid CSRF token`);
    }
}

export function setOAuthAccessToken(accessTokenSub: string, accessToken: string, accessTokenExpiry: Date) {
    localStorage.setItem("googleOAuthAccessTokenSub", accessTokenSub);
    localStorage.setItem("googleOAuthAccessToken", accessToken);
    localStorage.setItem("googleOAuthAccessExpiry", String(Number(accessTokenExpiry)));
}

interface AccessToken {
    sub: string,
    token: string,
    expires: Date,
}

export function getOAuthAccessToken(): AccessToken|null {
    const sub = localStorage.getItem("googleOAuthAccessTokenSub");
    const token = localStorage.getItem("googleOAuthAccessToken");
    const expiryValue = localStorage.getItem("googleOAuthAccessExpiry");
    if (sub == null || token == null || expiryValue == null) {
        return null;
    }
    return {
        sub,
        token,
        expires: new Date(parseInt(expiryValue, 10)),
    };
}

export function getValidOAuthAccessToken(): AccessToken {
    const accessToken = getOAuthAccessToken();
    if (accessToken == null) {
        throw new Error("No access token found");
    }
    return accessToken;
}

export async function getOAuthAccessTokenOrRedirect(): Promise<AccessToken> {
    const accessToken = getValidOAuthAccessToken();
    if (accessToken.expires < new Date()) {
        location.assign(getGoogleOAuthUrl());
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return new Promise<AccessToken>(() => {});
    }
    return accessToken;
}

async function throwIfNotSuccess(response: Response) {
    if (response.status !== 200) {
        if (response.headers.get("Content-Type")?.match(/^application\/json/)) {
            const responseJson = (await response.json()) as unknown;
            throw new Error((typeof responseJson === "object" && responseJson != null && "error" in responseJson && typeof responseJson.error === "string") 
                ? responseJson.error : JSON.stringify(responseJson));
        }
    }
}

async function gapiFetch(input: URL|RequestInfo, init?: RequestInit): Promise<Response> {
    const { token } = await getOAuthAccessTokenOrRedirect();
    const actualRequest = new Request(input, init);
    actualRequest.headers.append("Authorization", `Bearer ${token}`);
    const response = await fetch(actualRequest);
    await throwIfNotSuccess(response);
    return response;
 }

async function gapiFetchJson(input: URL|RequestInfo, init?: RequestInit): Promise<unknown> {
    const response = await gapiFetch(input, init);
    if (response.headers.get("Content-Type")?.match(/^application\/json/)) {
        return (await response.json()) as unknown;
    } else {
        throw new Error(await response.text());
    }
}

export async function getAccessTokenSub(accessToken: string): Promise<string> {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`);
    await throwIfNotSuccess(response);
    const json = await response.json() as object;
    if (json != null && "sub" in json && typeof json.sub === "string") {
        return json.sub;
    } else {
        throw new Error(JSON.stringify(json));
    }
}

export async function listFiles(): Promise<DriveListFilesResponse> {
    return await gapiFetchJson(`https://www.googleapis.com/drive/v3/files?${new URLSearchParams({
        spaces: "appDataFolder",
        // fields: `files(${["name","id","webContentLink"].join(",")})`,
    }).toString()}`) as DriveListFilesResponse;
}

export async function putFile(name: string, file: string|Blob) {
    const boundary = crypto.randomUUID();
    const contentType = typeof file === "string" ? "text/plain" : file.type;
    const body = new Blob([
        `--${boundary}\n`,
        `Content-Type: application/json; charset=utf-8\n`,
        `\n`,
        `${JSON.stringify({
            name,
            parents: ["appDataFolder"]
        })}\n`,
        `--${boundary}\n`,
        `Content-Type: ${contentType}\n`,
        `\n`,
        file,
        `\n`,
        `--${boundary}--`
    ], {
        type: `multipart/related; boundary=${boundary}`
    });

    return await gapiFetchJson(`https://www.googleapis.com/upload/drive/v3/files?${new URLSearchParams({
        uploadType: "multipart",
    }).toString()}`, {
        method: "POST",
        headers: {
            "Content-Type": body.type
        },
        body,
    }) as DriveFile;
}

export async function getFileData(fileId: string): Promise<Blob> {
    const response = await gapiFetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
    return await response.blob();
}

export async function deleteFile(fileId: string): Promise<void> {
    await gapiFetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: "DELETE",
    });
}