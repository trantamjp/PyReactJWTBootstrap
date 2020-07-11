from flask import Flask, jsonify, request
from flask_jwt_extended import (JWTManager, create_access_token,
                                create_refresh_token, fresh_jwt_required,
                                get_jwt_identity, jwt_refresh_token_required,
                                jwt_required, set_access_cookies,
                                set_refresh_cookies, unset_jwt_cookies)

from api import app
from models import Staff

app.config['JWT_SECRET_KEY'] = 'super-secret'  # Change this!
# app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 10

jwt = JWTManager(app)


@jwt.user_claims_loader
def add_claims_to_access_token(identity):
    return {
        'given_name': 'Mike',
        'family_name': 'Hillyer',
    }


class AuthAPI():
    def login():
        req = request
        username = 'Mike.Hillyer@sakilastaff.com' or request.json.get('username', None)
        password = request.json.get('password', None)
        app.logger.debug('username {}, password {}'.format(username, password))
        if username != 'Mike.Hillyer@sakilastaff.com' or password != '12345':
            return jsonify({"msg": "Bad username or password"}), 401

        # Create the tokens we will be sending back to the user
        access_token = create_access_token(identity=username)
        refresh_token = create_refresh_token(identity=username)

        ret = {
            'access_token': access_token,
            'refresh_token': refresh_token
        }
        return jsonify(ret), 200

    @jwt_refresh_token_required
    def refresh():
        current_user = get_jwt_identity()
        access_token = create_access_token(identity=current_user)
        ret = {
            'access_token': access_token
        }
        return jsonify(ret), 200

    def logout():
        return {}, 204
