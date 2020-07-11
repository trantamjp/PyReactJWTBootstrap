from . import app
# from . import auth

from .datatable.routes import api_blueprint, auth_blueprint

app.register_blueprint(api_blueprint)
app.register_blueprint(auth_blueprint)