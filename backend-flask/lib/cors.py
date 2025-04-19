from flask_cors import CORS
import os

def init_cors(app):
  frontend = os.getenv('FRONTEND_URL')
  backend = os.getenv('BACKEND_URL')
  origins = [frontend, backend]

  app.config['CORS_SUPPORTS_CREDENTIALS'] = True
  app.config['CORS_EXPOSE_HEADERS'] = ['Authorization', 'location', 'link']
  
  CORS(
        app,
        resources={
            r"/api/*": {
                "origins": origins,
                "methods": ["OPTIONS", "GET", "POST", "PUT", "DELETE", "HEAD"],
                "allow_headers": [
                    "Content-Type", 
                    "Authorization", 
                    "x-requested-with",
                    "If-Modified-Since"
                ],
                "supports_credentials": True
            }
        }
    )