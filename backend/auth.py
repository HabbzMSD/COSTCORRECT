import os
import jwt
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
import functools

security = HTTPBearer(auto_error=False)

# Cache the JWKS clients so we don't refetch on every request
_jwks_clients = {}

@functools.lru_cache()
def get_supabase() -> Client:
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_KEY")
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Supabase credentials missing")
    return create_client(supabase_url, supabase_key)

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> str | None:
    """
    Decodes the Clerk JWT to extract the user ID (`sub`).
    Returns the user ID if valid, else None.
    """
    if not credentials:
        return None
        
    token = credentials.credentials
    try:
        # 1. Decode header to find unverified claims for Issuer (iss)
        unverified_claims = jwt.decode(token, options={"verify_signature": False})
        
        issuer = unverified_claims.get("iss")
        if not issuer:
            raise ValueError("No issuer found in JWT")
            
        # 2. Get or create JWK client for this issuer
        if issuer not in _jwks_clients:
            jwks_url = f"{issuer.rstrip('/')}/.well-known/jwks.json"
            _jwks_clients[issuer] = jwt.PyJWKClient(jwks_url)
            
        jwks_client = _jwks_clients[issuer]
        
        # 3. Get the signing key
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # 4. Verify the token signature and claims
        decoded = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=issuer,
            options={"verify_aud": False}  # Ignore audience for simpler integration
        )
        return decoded.get("sub")
        
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None

def get_current_user_tier(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Extracts user ID from token and fetches their subscription tier from Supabase.
    Defaults to 'free' if no token or user not found.
    """
    user_id = verify_token(credentials)
    if not user_id:
        return "free"
        
    try:
        supabase = get_supabase()
        response = supabase.table("profiles").select("tier").eq("id", user_id).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0].get("tier", "free")
            
        return "free"
    except Exception as e:
        print(f"Failed to fetch user tier: {e}")
        return "free"
