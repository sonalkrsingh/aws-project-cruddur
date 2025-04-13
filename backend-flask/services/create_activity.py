from datetime import datetime, timedelta, timezone
from lib.db import db
import logging
from flask import current_app

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CreateActivity:
    @staticmethod
    def run(message, user_uuid, ttl):
        model = {
            'errors': [],
            'data': None
        }

        now = datetime.now(timezone.utc).astimezone()

        # TTL Mapping
        ttl_mapping = {
            '30-days': timedelta(days=30),
            '7-days': timedelta(days=7),
            '3-days': timedelta(days=3),
            '1-day': timedelta(days=1),
            '12-hours': timedelta(hours=12),
            '3-hours': timedelta(hours=3),
            '1-hour': timedelta(hours=1)
        }

        # Validate TTL
        ttl_offset = ttl_mapping.get(ttl)
        if ttl_offset is None:
            model['errors'].append('Invalid TTL value')

        # Validate user_uuid
        if not user_uuid or len(str(user_uuid).strip()) == 0:
            model['errors'].append('User handle cannot be empty')
    
        # Validate message
        if not message or len(message.strip()) == 0:
            model['errors'].append('Message cannot be empty')
        elif len(message) > 280:
            model['errors'].append('Message exceeds max length of 280 characters')

        if model['errors']:
            return model  # Return early if there are validation errors

        try:
            expires_at = now + ttl_offset
            current_app.logger.info(f'Creating activity for {user_uuid} with TTL {ttl}')
            uuid = CreateActivity.create_activity(user_uuid, message, expires_at)

            if not uuid:
                raise Exception("Activity creation failed, UUID not returned.")

            current_app.logger.info(f'Activity created successfully with UUID: {uuid}')
            object_json = CreateActivity.query_object_activity(uuid)

            if not object_json:
                raise Exception("Querying activity failed, no data returned.")

            model['data'] = object_json
        except Exception as e:
            current_app.logger.error(f'Error in CreateActivity: {str(e)}', exc_info=True)
            model['errors'].append(f'Database error: {str(e)}')

        return model

    @staticmethod
    def create_activity(user_uuid, message, expires_at):
        try:
            current_app.logger.info(f"Inserting activity for {user_uuid} into DB")

            sql = db.template('activities', 'create')
            query_params = {
                'user_uuid': user_uuid,
                'message': message,
                'expires_at': expires_at
            }

            current_app.logger.info(f"Executing SQL: {sql}")
            current_app.logger.info(f"Query Params: {query_params}")

            uuid = db.query_commit(sql, query_params)

            if not uuid:
                current_app.logger.error(f"Insert failed: No UUID returned for handle {user_uuid}")
                return None

            current_app.logger.info(f"Activity successfully inserted with UUID: {uuid}")
            return uuid
        except Exception as e:
            logger.error(f'Error inserting activity into DB: {str(e)}')
            return None

    @staticmethod
    def query_object_activity(uuid):
        sql = db.template('activities','object')
        current_app.logger.info(f"Generated SQL: {sql}")
        current_app.logger.info(f"Fetching activity with UUID: {uuid}")

        result = db.query_object_json(sql, {'uuid': uuid})

        if not result:
            current_app.logger.error(f"No activity found for UUID: {uuid}")
            return {}

        return result

    @staticmethod
    def query_object_json(sql, params={}):
        try:
            logger.info(f"Executing SQL: {sql}")
            logger.info(f"Query Params: {params}")

            wrapped_sql = db.query_wrap_object(sql)
            logger.info(f"Final Executed SQL: {wrapped_sql} with params {params}")

            with db.pool.connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(wrapped_sql, params)    
                    json = cur.fetchone()

                    if json is None or json[0] is None:
                        logger.error(f"No results for UUID: {params.get('uuid')}")
                        return {}

                    logger.info(f"Query Result: {json[0]}")
                    return json[0] if json and json[0] else {}

        except Exception as e:
            logger.error(f"Error in query_object_json: {str(e)}", exc_info=True) 
            return {}

