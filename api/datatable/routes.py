from flask import Blueprint

from .views import (AuthAPI, CategoryAPI, CountryAPI, CustomerDatatableAPI,
                    FilmDatatableAPI, LanguageAPI)

api_blueprint = Blueprint('dvdrental', __name__, url_prefix='/api')

api_blueprint.add_url_rule(
    '/countries',
    view_func=CountryAPI.as_view("CountryAPI"),
)

api_blueprint.add_url_rule(
    '/categories',
    view_func=CategoryAPI.as_view("CategoryAPI"),
)

api_blueprint.add_url_rule(
    '/languages',
    view_func=LanguageAPI.as_view("LanguageAPI"),
)

api_blueprint.add_url_rule(
    '/datatable/customers',
    view_func=CustomerDatatableAPI.as_view("CustomerDatatableAPI"),
)

api_blueprint.add_url_rule(
    '/datatable/films',
    view_func=FilmDatatableAPI.as_view("FilmDatatableAPI"),
)

auth_blueprint = Blueprint('auth', __name__, url_prefix='/auth')

auth_blueprint.add_url_rule(
    '/login', methods=['POST'],
    view_func=AuthAPI.login,
)

auth_blueprint.add_url_rule(
    '/logout', methods=['POST'],
    view_func=AuthAPI.logout,
)

auth_blueprint.add_url_rule(
    '/refresh', methods=['POST'],
    view_func=AuthAPI.refresh,
)
