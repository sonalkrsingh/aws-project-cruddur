INSERT INTO public.activities (
  user_uuid,
  message,
  expires_at
)
VALUES (
  %(user_uuid)s,
  %(message)s,
  %(expires_at)s
)
RETURNING uuid;