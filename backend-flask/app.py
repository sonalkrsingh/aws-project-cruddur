from flask import Flask,jsonify
from flask import request, g
from flask_cors import CORS, cross_origin
#from flask_aws_cognito import FlaskAWSCognito
import os
import sys
import time
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'services')))

from services.home_activities import *
from services.notifications_activities import *
from services.user_activities import *
from services.create_activity import CreateActivity
from services.create_reply import *
from services.search_activities import *
from services.message_groups import *
from services.messages import *
from services.create_message import *
from services.show_activity import *
from services.users_short import *
from services.update_profile import *

from lib.rollbar import init_rollbar
from lib.xray import init_xray
from lib.cors import init_cors
from lib.cloudwatch import init_cloudwatch
from lib.honeycomb import init_honeycomb
from lib.cognito_jwt_token import jwt_required

#Rollbar
import rollbar
import rollbar.contrib.flask
from flask import Flask
from flask.signals import got_request_exception

load_dotenv()

os.environ['OTEL_SDK_DISABLED'] = 'true'

app = Flask(__name__)


## initalization --------
init_xray(app)
with app.app_context():
  rollbar = init_rollbar(app)
init_honeycomb(app)
init_cors(app)

# After init_cors(app) in app.py
frontend = os.getenv('FRONTEND_URL')
backend = os.getenv('BACKEND_URL')
origins = [frontend, backend]

# Configure Cognito
app.config['AWS_COGNITO_USER_POOL_ID'] = os.getenv('AWS_COGNITO_USER_POOL_ID')
app.config['AWS_COGNITO_USER_POOL_CLIENT_ID'] = os.getenv('AWS_COGNITO_USER_POOL_CLIENT_ID')
app.config['AWS_DEFAULT_REGION'] = os.getenv('AWS_DEFAULT_REGION')

def model_json(model):
   if model['errors'] is not None:
     return model['errors'], 422
   else:
     return model['data'], 200

@app.route('/api/health-check', methods=['GET'])
def health_check():
  return {'success': True}, 200

@app.route("/api/message_groups", methods=['GET','OPTIONS'])
@cross_origin()
@jwt_required()
def data_message_groups():
  model = MessageGroups.run(cognito_user_id=g.cognito_user_id)
  return model_json(model)

@app.route("/api/messages/<string:message_group_uuid>", methods=['GET','OPTIONS'])
@cross_origin()
@jwt_required()
def data_messages(message_group_uuid):
  if request.method == 'OPTIONS':
        # Allow preflight requests without authentication
        return '', 200
  
  model = Messages.run(
       cognito_user_id=g.cognito_user_id,
       message_group_uuid=message_group_uuid
     )
  
  return model_json(model)
 

@app.route("/api/messages", methods=['POST','OPTIONS'])
@cross_origin()
@jwt_required()
def data_create_message():
  message_group_uuid   = request.json.get('message_group_uuid',None)
  user_receiver_handle = request.json.get('handle',None)
  message = request.json.get('message')

  if message is None:
        return {"error": "Message content is required"}, 400
  
  if message_group_uuid == None:
     # Create for the first time
     model = CreateMessage.run(
       mode="create",
       message=message,
       cognito_user_id=g.cognito_user_id,
       user_receiver_handle=user_receiver_handle
     )
  else:
    # Push onto existing Message Group
    model = CreateMessage.run(
      mode="update",
      message=message,
      message_group_uuid=message_group_uuid,
      cognito_user_id=g.cognito_user_id
    )
  return model_json(model)


def default_home_feed(e):
  # unauthenicatied request
  app.logger.debug(e)
  app.logger.debug("unauthenicated")
  data = HomeActivities.run()
  return data, 200

@app.route("/api/activities/home", methods=['GET'])
#@xray_recorder.capture('activities_home')
@jwt_required(on_error=default_home_feed)
@cross_origin()
def data_home():
    data = HomeActivities.run(cognito_user_id=g.cognito_user_id)  
    return data, 200

@app.route("/api/activities/home", methods=['OPTIONS'])
@cross_origin()  
def options_home():
    response = jsonify({"message": "CORS Preflight Passed"})
    response.headers.add("Access-Control-Allow-Origin", origins)
    response.headers.add("Access-Control-Allow-Headers", "Authorization, Content-Type")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response, 204  

@app.route("/api/activities", methods=['OPTIONS'])
@cross_origin()
def options_activities():
    return '', 204  # Correct CORS preflight response
 
@app.route("/api/activities/notifications", methods=['GET'])
@cross_origin()
def data_notifications():
  data = NotificationsActivities.run()
  return data, 200

@app.route("/api/activities/<string:handle>", methods=['GET'])
@cross_origin()
#@xray_recorder.capture('activities_users')
def data_handle(handle):
  model = UserActivities.run(handle)
  return model_json(model)

@app.route("/api/activities/<string:handle>", methods=['OPTIONS'])
@cross_origin()
def options_user_activities(handle):
    return '', 204

@app.route("/api/activities/search", methods=['GET'])
@cross_origin()
def data_search():
  term = request.args.get('term')
  model = SearchActivities.run(term)
  return model_json(model)

@app.route("/api/activities", methods=['POST','OPTIONS']) 
@cross_origin()
@jwt_required()
def data_activities():
    message = request.json['message']
    ttl = request.json['ttl']
    model = CreateActivity.run(message, g.cognito_user_id, ttl)
    return model_json(model)

@app.route("/api/activities/<string:activity_uuid>", methods=['GET'])
@cross_origin()
#@xray_recorder.capture('activities_show')
def data_show_activity(activity_uuid):
  data = ShowActivity.run(activity_uuid=activity_uuid)
  return data, 200

@app.route("/api/activities/<string:activity_uuid>/reply", methods=['POST','OPTIONS'])
@cross_origin()
def data_activities_reply(activity_uuid):
  user_handle  = 'andrewbrown'
  message = request.json['message']
  model = CreateReply.run(message, user_handle, activity_uuid)
  return model_json(model)

@app.route("/api/users/@<string:handle>/short", methods=['GET'])
@cross_origin() 
def data_users_short(handle):
  data = UsersShort.run(handle)
  return data, 200

@app.route("/api/profile/update", methods=['POST','OPTIONS'])
@cross_origin()
@jwt_required()
def data_update_profile():
  bio          = request.json.get('bio',None)
  display_name = request.json.get('display_name',None)
  model = UpdateProfile.run(
    cognito_user_id=g.cognito_user_id,
    bio=bio,
    display_name=display_name
  )
  return model_json(model)
 
if __name__ == "__main__":
  app.run(debug=True)