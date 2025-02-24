import time
import requests
from jose import jwk, jwt
from jose.exceptions import JOSEError
from jose.utils import base64url_decode

class FlaskAWSCognitoError(Exception):
  pass

class TokenVerifyError(Exception):
  pass

def extract_access_token(request_headers : dict) -> str | None:
    access_token = None
    auth_header = request_headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        _, access_token = auth_header.split()
    return access_token

class CognitoJwtToken:
    def __init__(self, user_pool_id, user_pool_client_id, region, request_client=None):
        self.region = region
        if not self.region:
            raise FlaskAWSCognitoError("No AWS region provided")
        self.user_pool_id = user_pool_id
        self.user_pool_client_id = user_pool_client_id
        self.claims = None
        if not request_client:
            self.request_client = requests.get
        else:
            self.request_client = request_client
        self._load_jwk_keys()


    def _load_jwk_keys(self) -> None:
        keys_url = f"https://cognito-idp.{self.region}.amazonaws.com/{self.user_pool_id}/.well-known/jwks.json"
        try:
            response = self.request_client(keys_url)
            response.raise_for_status()
            self.jwk_keys = response.json().get("keys", [])
            if not self.jwk_keys:
                raise FlaskAWSCognitoError("No keys found in JWKS response")
        except (requests.exceptions.RequestException, ValueError, KeyError) as e:
            raise FlaskAWSCognitoError(f"Failed to fetch JWKS keys: {e}") from e

    @staticmethod
    def _extract_headers(token):
        try:
            headers = jwt.get_unverified_headers(token)
            return headers
        except JOSEError as e:
            raise TokenVerifyError(str(e)) from e

    def _find_pkey(self, headers):
        kid = headers.get("kid")
        # search for the kid in the downloaded public keys
        pkey_data = next((key for key in self.jwk_keys if key["kid"] == kid), None)
        if not pkey_data:
            raise TokenVerifyError("Public key not found in jwks.json")
        return pkey_data

    @staticmethod
    def _verify_signature(token, pkey_data):
        try:
            # construct the public key
            public_key = jwk.construct(pkey_data)
        except JOSEError as e:
            raise TokenVerifyError(str(e)) from e
        # get the last two sections of the token,
        # message and signature (encoded in base64)
        message, encoded_signature = str(token).rsplit(".", 1)
        # decode the signature
        try:
            decoded_signature = base64url_decode(encoded_signature.encode("utf-8"))
        except Exception as e:
            raise TokenVerifyError(f"Failed to decode signature: {e}")
        # verify the signature
        if not public_key.verify(message.encode("utf8"), decoded_signature):
            raise TokenVerifyError("Signature verification failed")

    @staticmethod
    def _extract_claims(token):
        try:
            claims = jwt.get_unverified_claims(token)
            return claims
        except JOSEError as e:
            raise TokenVerifyError(str(e)) from e

    @staticmethod
    def _check_expiration(claims, current_time):
        if "exp" not in claims:
            raise TokenVerifyError("Missing expiration claim")
        current_time = current_time or time.time()
        if current_time > claims["exp"]:
            raise TokenVerifyError("Token is expired")  # probably another exception

    def _check_audience(self, claims: dict) -> None:
        # and the Audience  (use claims['client_id'] if verifying an access token)
        audience = claims.get("aud", claims.get("client_id"))
        if not audience:
            raise TokenVerifyError("Token is missing audience claim")
        if audience != self.user_pool_client_id:
            raise TokenVerifyError(
                f"Token was not issued for this audience. "
                f"Expected {self.user_pool_client_id}, got {audience}"
        )

    def get_user_id(self, claims: dict) -> str:
        """
        Extract the user identifier from token claims.
        Cognito tokens can have the username in different fields depending on the token type.
        """
        username = claims.get('cognito:username')
        if username:
            return username
            
        # Check other possible fields
        username = claims.get('username') or claims.get('sub') or claims.get('email')
        if not username:
            raise TokenVerifyError("No username found in token claims")
        return username

    def verify(self, token, current_time= None):
        """ https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.py """
        if not token or not isinstance(token, str):
            raise TokenVerifyError("Invalid token provided")    

        headers = self._extract_headers(token)
        pkey_data = self._find_pkey(headers)
        self._verify_signature(token, pkey_data)

        claims = self._extract_claims(token)
        self._check_expiration(claims, current_time)
        self._check_audience(claims)

        # Add username to claims in a standardized way
        claims['username'] = self.get_user_id(claims)

        self.claims = claims 
        return claims