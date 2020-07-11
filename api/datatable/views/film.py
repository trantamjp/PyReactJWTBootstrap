
from flask import current_app, request
from flask.views import MethodView
from flask_jwt_extended import jwt_required

from models import Film


class FilmDatatableAPI(MethodView):
    @jwt_required
    def post(self):
        args = request.json if request.is_json else {}
        current_app.logger.debug("Input args: %s", args)

        data = Film.datatable_search(args)

        films = []
        for film in data['films']:
            film_dict = film.row2dict()
            film_dict['language'] = film.language.row2dict()
            film_dict['categories'] = [category.row2dict()
                                       for category in film.categories]
            film_dict['actors'] = [actor.row2dict() for actor in film.actors]
            films.append(film_dict)

        response = {
            'fetch_id':  args.get('fetch_id'),
            'records_total': data['records_total'],
            'records_filtered': data['records_filtered'],
            'data': films,
        }
        return response
