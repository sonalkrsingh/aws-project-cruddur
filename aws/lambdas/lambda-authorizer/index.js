"use strict";
const { CognitoJwtVerifier } = require("aws-jwt-verify");

let accessTokenVerifier, idTokenVerifier;

try {
  accessTokenVerifier = CognitoJwtVerifier.create({
    userPoolId: process.env.USER_POOL_ID,
    tokenUse: "access",
    clientId: process.env.CLIENT_ID
  });
  
  idTokenVerifier = CognitoJwtVerifier.create({
    userPoolId: process.env.USER_POOL_ID,
    tokenUse: "id",
    clientId: process.env.CLIENT_ID
  });
} catch (err) {
  console.error("Verifier initialization failed:", err);
  throw err;
}

function generatePolicy(principalId, effect, resource) {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [{
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource
      }]
    },
    context: { userId: principalId },
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date",
      "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET",
      "Access-Control-Allow-Credentials": "true"
    }
  };
}

exports.handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event, null, 2));

  try {
    const authHeader = event.identitySource?.[0] || 
                     event.headers?.authorization || 
                     event.headers?.Authorization;
    
    if (!authHeader) {
      console.error("No authorization header found");
      return generatePolicy('anonymous', 'Deny', event.routeArn);
    }

    const token = authHeader.startsWith('Bearer ') ? 
                 authHeader.split(' ')[1].trim() : 
                 authHeader.trim();

    if (!token || token.split('.').length !== 3) {
      console.error("Malformed token");
      return generatePolicy('anonymous', 'Deny', event.routeArn);
    }

    // Try verifying as both token types
    try {
      const payload = await accessTokenVerifier.verify(token);
      console.log("Verified as access token");
      return generatePolicy(payload.sub, 'Allow', event.routeArn);
    } catch (accessErr) {
      console.log("Not an access token, trying as ID token");
      const payload = await idTokenVerifier.verify(token);
      console.log("Verified as ID token");
      return generatePolicy(payload.sub, 'Allow', event.routeArn);
    }

  } catch (err) {
    console.error("Authorization failed:", err);
    return generatePolicy('anonymous', 'Deny', event.routeArn);
  }
};