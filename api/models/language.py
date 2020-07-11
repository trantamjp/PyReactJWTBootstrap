from .base_model import BaseModel, db


class Language(BaseModel):
    __tablename__ = 'language'

    language_id = db.Column(db.Integer, primary_key=True, server_default=db.text(
        "nextval('language_language_id_seq'::regclass)"))
    name = db.Column(db.CHAR(20), nullable=False)
    last_update = db.Column(db.DateTime, nullable=False,
                            server_default=db.text("now()"))

    def __repr__(self):
        return '<Language {} {}>'.format(self.language_id, self.name)
