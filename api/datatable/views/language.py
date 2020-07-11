from flask import jsonify
from flask.views import MethodView

from models import Language


class LanguageAPI(MethodView):
    def get(self):
        rows = Language.query.order_by(
            Language.name.asc()).all()
        languages = list(map(lambda row: row.row2dict(), rows))
        return jsonify(languages)
