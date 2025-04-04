from lib.db import db

class AddBioColoumnMigration:
  def migrate_sql():
    data = """
    ALTER TABLE public.users ADD COLUMN bio text;
    """
    return data
  def rollback_sql():
    data = """
    ALTER TABLE public.users DROP COLUMN bio;
    """
    return data

  def migrate():
    db.query_commit(AddBioColoumnMigration.migrate_sql(),{
    })

  def rollback():
    db.query_commit(AddBioColoumnMigration.rollback_sql(),{
    })

migration = AddBioColoumnMigration