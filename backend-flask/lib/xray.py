import os
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.ext.flask.middleware import XRayMiddleware

def init_xray(app):
  if os.getenv("AWS_XRAY_SDK_ENABLED", "false").lower() == "true":
    xray_url = os.getenv("AWS_XRAY_URL")
    xray_recorder.configure(service='backend-flask', dynamic_naming=xray_url)
    XRayMiddleware(app, xray_recorder)