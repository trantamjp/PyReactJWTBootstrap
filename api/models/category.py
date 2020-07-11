from .base_model import BaseModel, db


class Category(BaseModel):
    __tablename__ = 'category'

    category_id = db.Column(db.Integer, primary_key=True, server_default=db.text(
        "nextval('category_category_id_seq'::regclass)"))
    name = db.Column(db.String(25), nullable=False)
    last_update = db.Column(db.DateTime, nullable=False,
                            server_default=db.text("now()"))

    films = db.relationship('Film', secondary='film_category',
                            back_populates="categories")

    def __repr__(self):
        return '<Category {} {}>'.format(self.category_id, self.name)
