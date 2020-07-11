from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import safe_str_cmp

from config import Config

app = Flask(__name__, instance_relative_config=True)
CORS(app)
app.jinja_env.add_extension('pypugjs.ext.jinja.PyPugJSExtension')
app.config.from_object(Config)
db = SQLAlchemy(app)
migrate = Migrate(app, db)
