import os

basedir = os.path.abspath(os.path.dirname(__file__))

DEBUG = False
SQLALCHEMY_ECHO = False


class Config:
    """ Configuration for SQLAlchemy """

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.environ.get('SQLALCHEMY_ECHO') == '1'
