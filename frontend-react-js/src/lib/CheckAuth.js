import {fetchUserAttributes, getCurrentUser, fetchAuthSession} from 'aws-amplify/auth';

const checkAuth = async (setUser) => {
  try {
    const cognito_user = await getCurrentUser();
    console.log("Cognito User:", cognito_user);

    const userAttributes = await fetchUserAttributes();
    console.log("User Attributes:", userAttributes);

    const session = await fetchAuthSession();
    const accessToken = session.tokens?.accessToken?.toString(); // Extract the access token

    console.log("Access Token:", accessToken);

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
    }

    setUser({
      uuid: userAttributes.sub,
      display_name: userAttributes.preferred_username || userAttributes.name || cognito_user.signInDetails?.loginId || "My Name",
      handle: userAttributes.preferred_username || cognito_user.username || "handle"
    });
  } catch (err) {
    console.error("Error fetching user: ", err);
  }
};

export default checkAuth;
