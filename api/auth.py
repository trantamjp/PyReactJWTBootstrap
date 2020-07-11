import hashlib

from flask import jsonify, make_response
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity, get_jwt_claims
)

from models.staff import Staff

from . import app


class User():
    def __init__(self, id, user_info):
        self.id = id
        self.user_info = {
            'username': user_info['username'],
            'first_name': user_info['first_name'],
            'last_name': user_info['last_name'],
        }

    def __str__(self):
        return "User(id='%s')" % self.id


def authenticate(username, password):
    username = username.strip()
    user = Staff.search_username_by_email(username)

    if user and hashlib.sha1(password.encode('utf-8')).hexdigest() == user.password:
        return User(id=user.staff_id,
                    user_info={
                        'username': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    })

    return None


def identity(payload):
    user = User(id=payload['identity'], user_info=payload['user_info'])
    return user


def make_payload(identity):
    payload = default_payload_handler(identity)
    payload = {**payload, 'user_info': identity.user_info}
    return payload


jwt = JWT(app, authenticate, identity)
default_payload_handler = jwt.jwt_payload_callback

jwt.jwt_payload_handler(make_payload)
