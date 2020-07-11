from flask import jsonify
from flask.views import MethodView

from models import Category

class CategoryAPI(MethodView):
    def get(self):
        rows = Category.query.order_by(
            Category.name.asc()).all()
        categories = tuple(map(lambda row: row.row2dict(), rows))
        return jsonify(categories)
