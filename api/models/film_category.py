from .base_model import BaseModel, db


class FilmCategory(BaseModel):
    __tablename__ = 'film_category'

    film_id = db.Column(db.ForeignKey('film.film_id', ondelete='RESTRICT',
                                      onupdate='CASCADE'), primary_key=True, nullable=False)
    category_id = db.Column(db.ForeignKey('category.category_id', ondelete='RESTRICT',
                                          onupdate='CASCADE'), primary_key=True, nullable=False)
    last_update = db.Column(db.DateTime, nullable=False,
                            server_default=db.text("now()"))

    category = db.relationship('Category', backref='film_categories')
    film = db.relationship('Film', backref='film_categories')

    def __repr__(self):
        return '<FilmCategory film_id={} category_id={}>'.format(self.film_id, self.category_id)
