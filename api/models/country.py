from .base_model import BaseModel, db


class Country(BaseModel):
    __tablename__ = 'country'

    country_id = db.Column(db.Integer, primary_key=True, server_default=db.text(
        "nextval('country_country_id_seq'::regclass)"))
    country = db.Column(db.String(50), nullable=False)
    last_update = db.Column(db.DateTime, nullable=False,
                            server_default=db.text("now()"))

    def __repr__(self):
        return '<Country {} {}>'.format(self.country_id, self.country)
