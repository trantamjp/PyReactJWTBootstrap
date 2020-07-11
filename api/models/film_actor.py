from .base_model import BaseModel, db


class FilmActor(BaseModel):
    __tablename__ = 'film_actor'

    actor_id = db.Column(db.ForeignKey('actor.actor_id', ondelete='RESTRICT',
                                       onupdate='CASCADE'), primary_key=True, nullable=False)
    film_id = db.Column(db.ForeignKey('film.film_id', ondelete='RESTRICT',
                                      onupdate='CASCADE'), primary_key=True, nullable=False, index=True)
    last_update = db.Column(db.DateTime, nullable=False,
                            server_default=db.text("now()"))

    actor = db.relationship('Actor', backref='film_actors')
    film = db.relationship('Film', backref='film_actors')

    def __repr__(self):
        return '<FilmActor film_id={} actor_id={}>'.format(self.film_id, self.actor_id)
