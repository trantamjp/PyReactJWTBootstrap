from .base_model import BaseModel, db


class Address(BaseModel):
    __tablename__ = 'address'

    address_id = db.Column(db.Integer, primary_key=True, server_default=db.text(
        "nextval('address_address_id_seq'::regclass)"))
    address = db.Column(db.String(50), nullable=False)
    address2 = db.Column(db.String(50))
    district = db.Column(db.String(20), nullable=False)
    city_id = db.Column(db.ForeignKey('city.city_id'),
                        nullable=False, index=True)
    postal_code = db.Column(db.String(10))
    phone = db.Column(db.String(20), nullable=False)
    last_update = db.Column(db.DateTime, nullable=False,
                            server_default=db.text("now()"))

    city = db.relationship('City', backref='addresses')

    def __repr__(self):
        return '<Address {} {} {} -> city_id {}>'.format(self.address_id, self.address, self.address2, self.city_id)
