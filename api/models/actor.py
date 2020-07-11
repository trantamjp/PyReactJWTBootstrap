from .base_model import BaseModel, db


class Actor(BaseModel):
    __tablename__ = 'actor'

    actor_id = db.Column(db.Integer, primary_key=True, server_default=db.text(
        "nextval('actor_actor_id_seq'::regclass)"))
    first_name = db.Column(db.String(45), nullable=False)
    last_name = db.Column(db.String(45), nullable=False, index=True)
    last_update = db.Column(db.DateTime, nullable=False,
                            server_default=db.text("now()"))

    full_name = db.column_property(first_name + " " + last_name)

    films = db.relationship('Film', secondary='film_actor',
                            back_populates="actors")

    # Add additional columns into dict which are not in cls.__table__.columns
    # e.g. hybrid_property, column_property
    def row2dict(self):
        d = super().row2dict()
        for c in ['full_name']:
            d[c] = getattr(self, c)
        return d

    def __repr__(self):
        return '<Actor {} {} {}>'.format(self.actor_id, self.first_name, self.last_name)
