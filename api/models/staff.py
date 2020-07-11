from .base_model import BaseModel, db


class Staff(BaseModel):
    __tablename__ = 'staff'

    staff_id = db.Column(db.Integer, primary_key=True, server_default=db.text(
        "nextval('staff_staff_id_seq'::regclass)"))
    first_name = db.Column(db.String(45), nullable=False)
    last_name = db.Column(db.String(45), nullable=False)
    address_id = db.Column(db.ForeignKey(
        'address.address_id', ondelete='RESTRICT', onupdate='CASCADE'), nullable=False)
    email = db.Column(db.String(50))
    store_id = db.Column(db.SmallInteger, nullable=False)
    active = db.Column(db.Boolean, nullable=False,
                       server_default=db.text("true"))
    username = db.Column(db.String(16), nullable=False)
    password = db.Column(db.String(40))
    last_update = db.Column(db.DateTime, nullable=False,
                            server_default=db.text("now()"))
    picture = db.Column(db.LargeBinary)

    address = db.relationship('Address')

    def __repr__(self):
        return '<Staff {} {} {}>'.format(self.staff_id, self.first_name, self.last_name)

    def search_username_by_email(email):
        staff = Staff.query.filter(db.func.lower(
            Staff.email) == email.lower()).first()
        return staff
