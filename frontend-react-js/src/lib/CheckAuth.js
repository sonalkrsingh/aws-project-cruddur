import {fetchUserAttributes, getCurrentUser, fetchAuthSession} from 'aws-amplify/auth';

const getAccessToken = async () => {
  try {
    let session = await fetchAuthSession();
    let accessToken = session.tokens?.accessToken?.toString();

    if (!accessToken || isTokenExpired(accessToken)) {
      console.log("Token expired or invalid. Refreshing...");
      session = await fetchAuthSession({ forceRefresh: true });
      accessToken = session.tokens?.accessToken?.toString();

      if (!accessToken) {
        throw new Error("Failed to refresh access token.");
      }
    }

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
    }

    return accessToken;
  } catch (err) {
    console.error("Error getting access token: ", err);
    throw err;
  }
};

const checkAuth = async (setUser) => {
  try {
    const cognito_user = await getCurrentUser();
    console.log("Full Cognito User Object:", JSON.stringify(cognito_user, null, 2));

    // Add null checks for cognito_user
    if (!cognito_user) {
      throw new Error("No authenticated user");
    }

    const userAttributes = await fetchUserAttributes();
    console.log("User Attributes:", userAttributes);

    let session = await fetchAuthSession();
    let accessToken = session.tokens?.accessToken?.toString(); // Extract the access token

    if (!accessToken || isTokenExpired(accessToken)) {
      console.log("Token expired or invalid. Refreshing...");
      session = await fetchAuthSession({ forceRefresh: true });
      accessToken = session.tokens?.accessToken?.toString();
      if (!accessToken) {
        throw new Error("Failed to refresh access token.");
      }
    }

    console.log("Access Token:", accessToken);

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
    }

    // Get user ID from different possible sources
    const userId = cognito_user.userId || 
                  cognito_user.attributes?.sub || 
                  userAttributes.sub;

    setUser({
      cognito_user_uuid: userId,
      display_name: userAttributes.preferred_username || userAttributes.name || cognito_user.signInDetails?.loginId || "My Name",
      handle: userAttributes.preferred_username || cognito_user.username || "handle"
    });
  } catch (err) {
    console.error("Error fetching user: ", err);
  }
};

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token payload
    return payload.exp * 1000 < Date.now(); // Check if token is expired
  } catch (e) {
    console.error("Error decoding token:", e);
    return true; // Assume token is expired if there's an error
  }
};

export default checkAuth;
export { getAccessToken };
