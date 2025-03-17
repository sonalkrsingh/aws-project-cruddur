import json
import psycopg2
import os

def lambda_handler(event, context):
    user = event.get('request', {}).get('userAttributes', {})
    print('userAttributes',user)

    user_display_name = user.get('name')
    user_email = user.get('email')
    user_handle = user.get('preferred_username')
    user_cognito_id = user.get('sub')

    conn = None  # Initialize connection before try block

    try:
        print('entered-try')
        conn = psycopg2.connect(os.getenv('CONNECTION_URL'))
        cur = conn.cursor()
        sql = """
            INSERT INTO public.users (display_name, handle, email, cognito_user_id)
            VALUES (%s, %s, %s, %s)
        """
        cur.execute(sql, (user_display_name, user_handle, user_email, user_cognito_id))
        conn.commit()
        print("User inserted successfully")

    except (Exception, psycopg2.DatabaseError) as error:
        print("Database error:",error)
        return {
        "statusCode": 500,
        "body": json.dumps({"error": str(error)})
    }
        
    finally:
        if conn is not None:
            cur.close()
            conn.close()
            print('Database connection closed.')

    return event