from sqlalchemy.dialects.postgresql import TSVECTOR

from .actor import Actor
from .base_model import BaseModel, db
from .category import Category
from .film_actor import FilmActor
from .film_category import FilmCategory
from .language import Language

search_like_escape = BaseModel.search_like_escape


class Film(BaseModel):
    __tablename__ = 'film'

    film_id = db.Column(db.Integer, primary_key=True, server_default=db.text(
        "nextval('film_film_id_seq'::regclass)"))
    title = db.Column(db.String(255), nullable=False, index=True)
    description = db.Column(db.Text)
    release_year = db.Column(db.Integer)
    language_id = db.Column(db.ForeignKey('language.language_id',
                                          ondelete='RESTRICT', onupdate='CASCADE'), nullable=False, index=True)
    rental_duration = db.Column(
        db.SmallInteger, nullable=False, server_default=db.text("3"))
    rental_rate = db.Column(db.Numeric(4, 2), nullable=False,
                            server_default=db.text("4.99"))
    length = db.Column(db.SmallInteger)
    replacement_cost = db.Column(
        db.Numeric(5, 2), nullable=False, server_default=db.text("19.99"))
    rating = db.Column(db.Enum('G', 'PG', 'PG-13', 'R', 'NC-17',
                               name='mpaa_rating'), server_default=db.text("'G'::mpaa_rating"))
    last_update = db.Column(db.DateTime, nullable=False,
                            server_default=db.text("now()"))
    special_features = db.Column(db.ARRAY(db.Text()))
    fulltext = db.Column(TSVECTOR, nullable=False, index=True)

    language = db.relationship('Language')

    categories = db.relationship('Category', secondary="film_category",
                                 back_populates="films")
    actors = db.relationship('Actor', secondary="film_actor",
                             back_populates="films")

    def __repr__(self):
        return '<Film {} {}>'.format(self.film_id, self.title)

    @classmethod
    def datatable_search(cls, args):

        offset = args.get('offset') or 0
        limit = args.get('limit') or 10
        filters = args.get('filters') or {}
        orders = args.get('orders') or []

        records_total = Film.query.count()

        rs_filters = []
        for filter in filters:
            filter_id = filter.get('id')

            search_value = filter.get('value') or ''
            if search_value == '':
                continue

            if filter_id == 'title':
                rs_filters.append(Film.title.ilike(
                    search_like_escape(search_value)))
                continue

            if filter_id == 'categories.category':
                rs_filters.append(Film.categories.any(
                    Category.name.ilike(search_like_escape(search_value))
                ))
                continue

            if filter_id == 'actors.full_name':
                rs_filters.append(
                    Film.actors.any(
                        Actor.full_name.ilike(
                            search_like_escape(search_value)),
                    )
                )
                continue

            if filter_id == 'length':
                rs_filters.append(db.cast(Film.length, db.Text).ilike(
                    search_like_escape(search_value)))
                continue

            if filter_id == 'rating':
                rs_filters.append(db.cast(Film.rating, db.Text).ilike(
                    search_like_escape(search_value)))
                continue

            if filter_id == 'language.name':
                rs_filters.append(Language.name.ilike(
                    search_like_escape(search_value)))
                continue

            if filter_id == 'rental_rate':
                rs_filters.append(db.cast(Film.rental_rate, db.Text).ilike(
                    search_like_escape(search_value)))
                continue

        rs_filtered = Film.query.join(Language).filter(db.and_(*rs_filters))

        # Count without limit
        records_filtered = rs_filtered.with_entities(
            db.func.count(db.distinct(Film.film_id))).scalar()

        order_columns = []
        for order in orders:
            order_id = order.get('id')
            order_desc = order.get('desc')

            if order_id == 'title':
                order_columns.append([Film.title, order_desc])
                continue

            if order_id == 'length':
                order_columns.append([Film.length, order_desc])
                continue

            if order_id == 'rating':
                order_columns.append(
                    [db.cast(Film.rating, db.Text), order_desc])
                continue

            if order_id == 'language.name':
                order_columns.append([Language.name, order_desc])
                continue

            if order_id == 'rental_rate':
                order_columns.append([Film.rental_rate, order_desc])
                continue

            raise NameError('Unknown sort column {}'.format(order_id))

        rs_orders = list(map(lambda order: order[0].desc() if order[1] else order[0].asc(),
                             order_columns))
        select_columns = list(map(lambda order: order[0], order_columns))

        # Only interested on film_id AFTER order and limit
        filtered_with_limit_subq = rs_filtered \
            .with_entities(Film.film_id).order_by(*rs_orders) \
            .limit(limit).offset(offset).subquery()

        final_query = Film.query \
            .join(filtered_with_limit_subq, Film.film_id == filtered_with_limit_subq.c.film_id) \
            .join(Language).outerjoin(Category, Film.categories).outerjoin(Actor, Film.actors) \
            .options(db.contains_eager(Film.language), db.contains_eager(Film.categories), db.contains_eager(Film.actors)) \
            .order_by(*rs_orders)   # Apply order again for eager loading

        # Force order on actor and category
        final_query = final_query.order_by(
            Actor.full_name.asc(), Category.name.asc())

        films = final_query.all()

        film_list = {
            'records_total': records_total,
            'records_filtered': records_filtered,
            'films': films,
        }

        return film_list
