from dotenv import load_dotenv
from psycopg_pool import ConnectionPool
import os
import re
import sys
from flask import current_app as app

load_dotenv()  # Load environment variables from .env file

class Db:
  def __init__(self):
    self.pool = None  # Initialize as None
    self.init_pool()

  def init_pool(self):
        if self.pool is None:
            connection_url = os.getenv("CONNECTION_URL")
            print("🔍 CONNECTION_URL:", connection_url)

            if not connection_url:
              raise ValueError("❌ CONNECTION_URL is not set!")
            
            try:
                print("🛠️ Attempting to create connection pool...")
                self.pool = ConnectionPool(connection_url, min_size=1, max_size=10)
                print("✅ Connection pool initialized successfully!")
            except Exception as e:
                print(f"🔥 Failed to initialize DB pool: {e}")
                self.pool = None

  def template(self,*args):
    pathing = list((app.root_path,'db','sql',) + args)
    pathing[-1] = pathing[-1] + ".sql"

    template_path = os.path.join(*pathing)

    green = '\033[92m'
    no_color = '\033[0m'
    print("\n")
    print(f'{green} Load SQL Template: {template_path} {no_color}')

    with open(template_path, 'r') as f:
      template_content = f.read()
    return template_content
  
  # we want to commit data such as an insert
  # be sure to check for RETURNING in all uppercases
  def print_params(self,params):
    blue = '\033[94m'
    no_color = '\033[0m'
    print(f'{blue} SQL Params:{no_color}')
    for key, value in params.items():
      print(key, ":", value)

  def print_sql(self,title,sql,params={}):
    cyan = '\033[96m'
    no_color = '\033[0m'
    print(f'{cyan} SQL STATEMENT-[{title}]------{no_color}')
    print(sql,params)

  def query_commit(self, sql, params):
    try:
        with self.pool.connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, params)
                conn.commit()
                returning_id = cur.fetchone()  # Fetch data before the cursor is closed
        return returning_id[0] if returning_id else None  # Return outside the with-block
    except Exception as err:
        app.logger.error(f"Database error: {err}")
        return None


  # when we want to return a json object
  def query_array_json(self,sql,params={}):
    self.print_sql('array',sql,params)

    wrapped_sql = self.query_wrap_array(sql)
    with self.pool.connection() as conn:
      with conn.cursor() as cur:
        cur.execute(wrapped_sql,params)
        json = cur.fetchone()
        return json[0]
  # When we want to return an array of json objects
  def query_object_json(self,sql,params={}):

    self.print_sql('json',sql,params)
    self.print_params(params)
    wrapped_sql = self.query_wrap_object(sql)

    with self.pool.connection() as conn:
      with conn.cursor() as cur:
        cur.execute(wrapped_sql,params)
        json = cur.fetchone()
        if json == None:
          "{}"
        else:
          return json[0]
  
  def query_value(self,sql,params={}):
     self.print_sql('value',sql,params)
     with self.pool.connection() as conn:
       with conn.cursor() as cur:
         cur.execute(sql,params)
         json = cur.fetchone()
         return json[0]

  def query_wrap_object(self,template):
    sql = f"""
    (SELECT COALESCE(row_to_json(object_row),'{{}}'::json) FROM (
    {template}
    ) object_row);
    """
    return sql

  def query_wrap_array(self,template):
    sql = f"""
    (SELECT COALESCE(array_to_json(array_agg(row_to_json(array_row))),'[]'::json) FROM (
    {template}
    ) array_row);
    """
    return sql

  def print_sql_err(self, err):
      import traceback
      err_type, err_obj, tb = sys.exc_info()
      line_num = tb.tb_lineno

      print("\n🔥 psycopg ERROR:", err, "on line:", line_num)
      print("🛠️ psycopg traceback:", traceback.format_exc(), "-- type:", err_type)

      if hasattr(err, 'pgcode'):
          print("📌 pgcode:", err.pgcode)

  def close_pool(self):
    if self.pool:
        self.pool.close()
        self.pool = None

db = Db()