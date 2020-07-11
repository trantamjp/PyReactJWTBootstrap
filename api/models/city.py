from .base_model import BaseModel, db


class City(BaseModel):
    __tablename__ = 'city'

    city_id = db.Column(db.Integer, primary_key=True, server_default=db.text(
        "nextval('city_city_id_seq'::regclass)"))
    city = db.Column(db.String(50), nullable=False)
    country_id = db.Column(db.ForeignKey('country.country_id'),
                           nullable=False, index=True)
    last_update = db.Column(db.DateTime, nullable=False,
                            server_default=db.text("now()"))

    country = db.relationship('Country', backref='cities')

    def __repr__(self):
        return '<City {} {} -> country_id {}>'.format(self.city_id, self.city, self.country_id)
