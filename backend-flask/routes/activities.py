## flask
from flask import request, g

## decorators
from aws_xray_sdk.core import xray_recorder
from lib.cognito_jwt_token import jwt_required
from flask_cors import cross_origin

## services
from services.home_activities import *
from services.notifications_activities import *
from services.create_activity import *
from services.search_activities import *
from services.create_reply import *

## helpers
from lib.helpers import model_json

def load(app):
  def default_home_feed(e):
    app.logger.debug(e)
    app.logger.debug("unauthenicated")
    data = HomeActivities.run()
    return data, 200

  @app.route("/api/activities/home", methods=['GET','OPTIONS'])
  @cross_origin()
  #@xray_recorder.capture('activities_home')
  @jwt_required(on_error=default_home_feed)
  def data_home():
    data = HomeActivities.run(cognito_user_id=g.cognito_user_id)
    return data, 200

  @app.route("/api/activities/notifications", methods=['GET','OPTIONS'])
  @cross_origin()
  def data_notifications():
    data = NotificationsActivities.run()
    return data, 200

  @app.route("/api/activities/search", methods=['GET','OPTIONS'])
  @cross_origin()
  def data_search():
    term = request.args.get('term')
    model = SearchActivities.run(term)
    return model_json(model)

  @app.route("/api/activities", methods=['POST','OPTIONS'])
  @cross_origin()
  @jwt_required()
  def data_activities():
    try:
        # Validate required fields
        if not request.json or 'message' not in request.json:
            return {'errors': ['Message is required']}, 422
            
        message = request.json['message']
        ttl = request.json.get('ttl', '7-days')  # Default to 7-days if not provided
        
        # Run activity creation
        model = CreateActivity.run(message, g.cognito_user_id, ttl)
        
        # Handle response
        if isinstance(model, dict):
            if model.get('errors'):
                return {'errors': model['errors']}, 422
            if model.get('data'):
                return model['data'], 201  # 201 Created for successful POST
            return model, 200
        elif isinstance(model, tuple):
            # Handle case where CreateActivity.run returns a tuple
            return model
        else:
            return {'errors': ['Unexpected response format']}, 500
        
    except Exception as e:
        app.logger.error(f"Error creating activity: {str(e)}")
        return {'errors': [str(e)]}, 422
    
  @app.route("/api/activities/<string:activity_uuid>/reply", methods=['POST','OPTIONS'])
  @cross_origin()
  @jwt_required()
  def data_activities_reply(activity_uuid):
    message = request.json['message']
    model = CreateReply.run(message, g.cognito_user_id, activity_uuid)
    return model_json(model)