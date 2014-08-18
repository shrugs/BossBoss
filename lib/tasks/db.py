from sqlalchemy import create_engine
import info

engine = create_engine('mysql://%s:%s@%s/%s' % (info.db_user, info.db_pass, info.db_host, info.db_name), echo=True)
