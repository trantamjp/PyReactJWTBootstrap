from . import db


class BaseModel(db.Model):
    __abstract__ = True

    def row2dict(self):
        d = {}
        for column in self.__table__.columns:
            val = getattr(self, column.name)
            d[column.name] = \
                None if (val is None) \
                else val.isoformat() if (isinstance(column.type, db.Date) or isinstance(column.type, db.DateTime)) \
                else str(round(val, 2)) if (isinstance(column.type, db.Numeric)) \
                else val

        return d

    @staticmethod
    def search_like_escape(value):
        return '%' + value \
            .replace('\\', '\\\\') \
            .replace('_', '\\_') \
            .replace('%', '\\%') + '%'
