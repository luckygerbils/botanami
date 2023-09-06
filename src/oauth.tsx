import { State, getAccessTokenSub, setOAuthAccessToken, validateGoogleOauthCsrfToken } from "./google-api";

void (async function() {
    console.log(new URLSearchParams(location.hash.slice(1)));
    const params = new URLSearchParams(location.hash.slice(1));
    const stateParam = params.get("state");
    if (stateParam == null) {
        throw new Error("Missing state parameter");
    }

    const state = JSON.parse(stateParam) as State;
    validateGoogleOauthCsrfToken(state.csrf_token);

    const accessToken = params.get("access_token")!;
    const accessTokenExpirySeconds = parseInt(params.get("expires_in")!, 10)
    const accessTokenExpiry = new Date(Number(new Date()) + accessTokenExpirySeconds*1000);
    const accessTokenSub = await getAccessTokenSub(accessToken);

    setOAuthAccessToken(accessTokenSub, accessToken, accessTokenExpiry);
    location.assign(state.target_uri);
})();